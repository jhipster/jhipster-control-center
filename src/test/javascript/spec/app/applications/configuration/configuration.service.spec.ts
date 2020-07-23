import { shallowMount, createLocalVue, Wrapper } from '@vue/test-utils';
import ConfigurationService, { Bean, Beans } from '@/applications/configuration/configuration.service';
import ConfigurationClass from '@/applications/configuration/configuration.component';
import Configuration from '@/applications/configuration/configuration.vue';
import * as config from '@/shared/config/config';
import axios from 'axios';
import RoutesService, { Route } from '@/shared/routes/routes.service';

const localVue = createLocalVue();
const mockedAxios: any = axios;
config.initVueApp(localVue);
const store = config.initVueXStore(localVue);
jest.mock('axios', () => ({
  get: jest.fn(),
  post: jest.fn(),
}));
const jhcc_route = {
  path: '',
  predicate: '',
  filters: [],
  serviceId: 'JHIPSTER-CONTROL-CENTER',
  instanceId: 'JHIPSTER-CONTROL-CENTER',
  instanceUri: '',
  order: 0,
} as Route;
const service_test_route = {
  path: 'service-test/service-test:number',
  predicate: '',
  filters: [],
  serviceId: 'service-test',
  instanceId: 'service-test-instance',
  instanceUri: '',
  order: 0,
} as Route;
const routes: Route[] = [jhcc_route, service_test_route];

const jhcc_beans = [
  {
    prefix: 'prefix-a',
    properties: {},
  },
  {
    prefix: 'prefix-b',
    properties: {},
  },
] as Bean[];

const service_test_beans = [
  {
    prefix: 'prefix-c',
    properties: {},
  },
  {
    prefix: 'prefix-d',
    properties: {},
  },
] as Bean[];

describe('Configuration Component', () => {
  let wrapper: Wrapper<ConfigurationClass>;
  let configuration: ConfigurationClass;

  beforeEach(() => {
    mockedAxios.get.mockReturnValue(Promise.resolve({}));
    wrapper = shallowMount<ConfigurationClass>(Configuration, {
      store,
      localVue,
      provide: {
        instanceConfigurationService: () => new ConfigurationService(),
        routesService: () => new RoutesService(store),
      },
    });
    configuration = wrapper.vm;
  });

  describe('when component is mounted', () => {
    it('should set all default values correctly', () => {
      expect(configuration.beansFilter).toBe('');
      expect(configuration.orderProp).toBe('name');
      expect(configuration.beansAscending).toBe(true);
    });

    it('should refresh active route beans if it is jhcc', async () => {
      // WHEN
      configuration.activeRoute = jhcc_route;
      configuration.refreshActiveRouteBeans();
      await configuration.$nextTick();

      // THEN
      expect(mockedAxios.get).toHaveBeenCalledWith('/management/configprops/');
      expect(mockedAxios.get).toHaveBeenCalledWith('/management/env/');
    });

    it('should refresh active route beans if it is a service', async () => {
      // WHEN
      configuration.activeRoute = service_test_route;
      configuration.refreshActiveRouteBeans();
      await configuration.$nextTick();

      // THEN
      expect(mockedAxios.get).toHaveBeenCalledWith('gateway/' + service_test_route.path + '/management/configprops/');
      expect(mockedAxios.get).toHaveBeenCalledWith('gateway/' + service_test_route.path + '/management/env/');
    });
  });

  it('should change order and invert reverse', () => {
    // WHEN
    configuration.changeOrder('test-order');

    // THEN
    expect(configuration.orderProp).toEqual('test-order');
    expect(configuration.beansAscending).toBe(false);
  });

  it('should change filter and sort beans correctly of jhcc beans', () => {
    configuration.allBeans = jhcc_beans;
    configuration.routes = routes;
    configuration.activeRoute = jhcc_route;
    configuration.beansFilter = 'prefix-a';

    // WHEN
    configuration.filterAndSortBeans();

    // THEN
    expect(configuration.beans).toEqual([
      {
        prefix: 'prefix-a',
        properties: {},
      },
    ] as Bean[]);
  });

  it('should change filter and sort beans correctly of a service', () => {
    configuration.allBeans = service_test_beans;
    configuration.routes = routes;
    configuration.activeRoute = service_test_route;
    configuration.beansFilter = 'prefix-d';

    // WHEN
    configuration.filterAndSortBeans();

    // THEN
    expect(configuration.beans).toEqual([
      {
        prefix: 'prefix-d',
        properties: {},
      },
    ] as Bean[]);
  });
});
