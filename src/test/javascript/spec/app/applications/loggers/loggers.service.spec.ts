import { shallowMount, createLocalVue, Wrapper } from '@vue/test-utils';
import { RefreshService } from '@/shared/refresh/refresh.service';
import LoggersService from '@/applications/loggers/loggers.service';
import LoggersClass from '@/applications/loggers/loggers.component';
import Loggers from '@/applications/loggers/loggers.vue';
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

describe('Loggers Component', () => {
  let wrapper: Wrapper<LoggersClass>;
  let loggers: LoggersClass;

  beforeEach(() => {
    mockedAxios.get.mockReturnValue(Promise.resolve({}));
    wrapper = shallowMount<LoggersClass>(Loggers, {
      store,
      localVue,
      provide: {
        loggersService: () => new LoggersService(),
        refreshService: () => new RefreshService(store),
        routesService: () => new RoutesService(store),
      },
    });
    loggers = wrapper.vm;
  });

  describe('when component is mounted', () => {
    it('should set all default values correctly', () => {
      expect(loggers.filtered).toBe('');
      expect(loggers.orderProp).toBe('name');
      expect(loggers.reverse).toBe(false);
    });

    it('should refresh active route logs if it is jhcc', async () => {
      // WHEN
      loggers.activeRoute = jhcc_route;
      loggers.refreshActiveRouteLogs();
      await loggers.$nextTick();

      // THEN
      expect(mockedAxios.get).toHaveBeenCalledWith('/management/loggers/');
    });

    it('should refresh active route logs if it is a service', async () => {
      // WHEN
      loggers.activeRoute = service_test_route;
      loggers.refreshActiveRouteLogs();
      await loggers.$nextTick();

      // THEN
      expect(mockedAxios.get).toHaveBeenCalledWith('gateway/' + service_test_route.path + '/management/loggers/');
    });
  });

  it('should change order and invert reverse', () => {
    // WHEN
    loggers.changeOrder('test-order');

    // THEN
    expect(loggers.orderProp).toEqual('test-order');
    expect(loggers.reverse).toBe(true);
  });

  it('should change log level correctly of jhcc logs', async () => {
    loggers.routes = routes;
    loggers.activeRoute = jhcc_route;
    mockedAxios.post.mockReturnValue(Promise.resolve({}));

    // WHEN
    loggers.changeLevel('main', 'ERROR');
    await loggers.$nextTick();

    // THEN
    expect(mockedAxios.post).toHaveBeenCalledWith('/management/loggers/main', { configuredLevel: 'ERROR' });
    expect(mockedAxios.get).toHaveBeenCalledWith('/management/loggers/');
  });

  it('should change log level correctly of a service', async () => {
    loggers.routes = routes;
    loggers.activeRoute = service_test_route;
    mockedAxios.post.mockReturnValue(Promise.resolve({}));

    // WHEN
    loggers.changeLevel('main', 'ERROR');
    await loggers.$nextTick();

    // THEN
    expect(mockedAxios.post).toHaveBeenCalledWith('gateway/' + service_test_route.path + '/management/loggers/main', {
      configuredLevel: 'ERROR',
    });
  });
});
