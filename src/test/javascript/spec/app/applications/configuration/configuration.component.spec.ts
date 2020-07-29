import { createLocalVue, Wrapper, shallowMount } from '@vue/test-utils';
import ConfigurationService, { Bean, PropertySource } from '@/applications/configuration/configuration.service';
import ConfigurationClass from '@/applications/configuration/configuration.component';
import Configuration from '@/applications/configuration/configuration.vue';
import * as config from '@/shared/config/config';
import axios from 'axios';
import RoutesService from '@/shared/routes/routes.service';
import { RefreshService } from '@/shared/refresh/refresh.service';
import '../../../fixtures/jhcc.fixtures';
import { Observable } from 'rxjs';
import {
  bean_a,
  bean_d,
  jhcc_beans,
  jhcc_route,
  property_source,
  routes,
  service_test_beans,
  service_test_route,
} from '../../../fixtures/jhcc.fixtures';

const localVue = createLocalVue();
const mockedAxios: any = axios;
config.initVueApp(localVue);
const store = config.initVueXStore(localVue);

const refreshService = new RefreshService(store);
const instanceConfigurationService = new ConfigurationService();
const routesService = new RoutesService(store);
routesService.routeChanged$ = new Observable(subscriber => {
  subscriber.next();
});
routesService.routesChanged$ = new Observable(subscriber => {
  subscriber.next();
});

jest.mock('axios', () => ({
  get: jest.fn(),
  post: jest.fn(),
}));

describe('Configuration Component', () => {
  let wrapper: Wrapper<ConfigurationClass>;
  let configuration: ConfigurationClass;

  beforeAll(() => {
    mockedAxios.get.mockReturnValue(Promise.resolve({}));
    wrapper = shallowMount<ConfigurationClass>(Configuration, {
      store,
      localVue,
      provide: {
        refreshService: () => refreshService,
        instanceConfigurationService: () => instanceConfigurationService,
        routesService: () => routesService,
      },
      methods: {
        resetError: () => jest.fn(),
      },
    });
    configuration = wrapper.vm;
  });

  afterAll(() => {
    configuration.beforeDestroy();
  });

  it('when component is mounted', async () => {
    mockedAxios.get.mockReturnValue(Promise.resolve({ data: jhcc_route }));
    const refreshActiveRouteBeans = jest.fn();
    const wrapperToTestMounted = shallowMount<ConfigurationClass>(Configuration, {
      store,
      localVue,
      provide: {
        refreshService: () => refreshService,
        instanceConfigurationService: () => instanceConfigurationService,
        routesService: () => routesService,
      },
      methods: {
        refreshActiveRouteBeans,
      },
    });
    const configurationToTestMounted = wrapperToTestMounted.vm;
    await configurationToTestMounted.$nextTick();

    expect(configurationToTestMounted.beansFilter).toBe('');
    expect(configurationToTestMounted.orderProp).toBe('name');
    expect(configurationToTestMounted.beansAscending).toBe(true);
    expect(refreshActiveRouteBeans).toHaveBeenCalledTimes(1);
  });

  it('should refresh beans and property sources of active route', async () => {
    configuration.activeRoute = jhcc_route;
    mockedAxios.get.mockReturnValue(() => Promise.resolve({}));
    const findBeans = jest.spyOn(instanceConfigurationService, 'findBeans').mockReturnValueOnce(
      new Observable<Bean[]>(subscriber => {
        subscriber.next(jhcc_beans);
      })
    );
    const findPropertySources = jest.spyOn(instanceConfigurationService, 'findPropertySources').mockReturnValueOnce(
      new Observable<PropertySource[]>(subscriber => {
        subscriber.next(property_source);
      })
    );
    const filterAndSortBeans = jest.spyOn(configuration, 'filterAndSortBeans');
    configuration.refreshActiveRouteBeans();
    await configuration.$nextTick();

    expect(findBeans).toHaveBeenCalled();
    expect(configuration.allBeans).toHaveLength(2);
    expect(filterAndSortBeans).toHaveBeenCalled();
    expect(findPropertySources).toHaveBeenCalled();
    expect(configuration.propertySources).toHaveLength(2);
    findPropertySources.mockRestore();
    findBeans.mockRestore();
    filterAndSortBeans.mockRestore();
  });

  it('should call findBeans with the path of selected route', async () => {
    mockedAxios.get.mockClear();
    mockedAxios.get.mockImplementation(() => Promise.resolve({}));
    instanceConfigurationService.findBeans(service_test_route).subscribe(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith('gateway/' + service_test_route.path + '/management/configprops/');
    });
  });

  it('should call findPropertySources with the path of selected route', async () => {
    mockedAxios.get.mockClear();
    mockedAxios.get.mockImplementation(() => Promise.resolve({}));
    instanceConfigurationService.findPropertySources(service_test_route).subscribe(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith('gateway/' + service_test_route.path + '/management/env/');
    });
  });

  it('should change order and invert reverse', () => {
    configuration.changeOrder('test-order');
    expect(configuration.orderProp).toEqual('test-order');
    expect(configuration.beansAscending).toBe(false);
  });

  it('should change filter and sort beans correctly of jhcc beans', () => {
    configuration.allBeans = jhcc_beans;
    configuration.routes = routes;
    configuration.activeRoute = jhcc_route;
    configuration.beansFilter = 'prefix-a';
    configuration.filterAndSortBeans();
    expect(configuration.beans).toEqual([bean_a] as Bean[]);
  });

  it('should change filter and sort beans correctly of a service', () => {
    configuration.allBeans = service_test_beans;
    configuration.routes = routes;
    configuration.activeRoute = service_test_route;
    configuration.beansFilter = 'prefix-d';
    configuration.filterAndSortBeans();
    expect(configuration.beans).toEqual([bean_d] as Bean[]);
  });
});
