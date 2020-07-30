import { shallowMount, createLocalVue, Wrapper } from '@vue/test-utils';
import { RefreshService } from '@/shared/refresh/refresh.service';
import LoggersService, { Log } from '@/applications/loggers/loggers.service';
import LoggersClass from '@/applications/loggers/loggers.component';
import Loggers from '@/applications/loggers/loggers.vue';
import * as config from '@/shared/config/config';
import axios from 'axios';
import RoutesService from '@/shared/routes/routes.service';
import { Observable } from 'rxjs';
import { jhcc_logs, jhcc_route, routes } from '../../../fixtures/jhcc.fixtures';

const localVue = createLocalVue();
const mockedAxios: any = axios;
config.initVueApp(localVue);
const store = config.initVueXStore(localVue);

const loggersService = new LoggersService();
const refreshService = new RefreshService(store);
const routesService = new RoutesService(store);
routesService.routeChanged$ = new Observable(subscriber => {
  subscriber.next(jhcc_route);
});
routesService.routesChanged$ = new Observable(subscriber => {
  subscriber.next(routes);
});

jest.mock('axios', () => ({
  get: jest.fn(),
  post: jest.fn(),
}));

const resetError = jest.fn();

describe('Loggers Component', () => {
  let wrapper: Wrapper<LoggersClass>;
  let loggers: LoggersClass;

  beforeEach(() => {
    mockedAxios.get.mockReturnValue(Promise.resolve({}));
    wrapper = shallowMount<LoggersClass>(Loggers, {
      store,
      localVue,
      provide: {
        loggersService: () => loggersService,
        refreshService: () => refreshService,
        routesService: () => routesService,
      },
      mocks: {
        resetError,
      },
    });
    loggers = wrapper.vm;
  });

  it('when component is mounted', () => {
    mockedAxios.get.mockReturnValue(Promise.resolve({}));
    const subscribeRouteChanged = jest.spyOn(routesService.routeChanged$, 'subscribe');
    const subscribeRoutesChanged = jest.spyOn(routesService.routesChanged$, 'subscribe');
    const wrapperToTestMounted = shallowMount<LoggersClass>(Loggers, {
      store,
      localVue,
      provide: {
        loggersService: () => loggersService,
        refreshService: () => refreshService,
        routesService: () => routesService,
      },
    });
    const loggersToTestMounted = wrapperToTestMounted.vm;

    expect(subscribeRouteChanged).toHaveBeenCalled();
    expect(subscribeRoutesChanged).toHaveBeenCalled();
    expect(loggersToTestMounted.filtered).toBe('');
    expect(loggersToTestMounted.orderProp).toBe('name');
    expect(loggersToTestMounted.reverse).toBe(false);
    subscribeRouteChanged.mockRestore();
    subscribeRoutesChanged.mockRestore();
  });

  it('should change order and invert reverse', () => {
    loggers.changeOrder('test-order');
    expect(loggers.orderProp).toEqual('test-order');
    expect(loggers.reverse).toBe(true);
  });

  it('should change log level', async () => {
    loggers.routes = routes;
    loggers.activeRoute = jhcc_route;
    mockedAxios.post.mockReturnValue(Promise.resolve({}));
    const changeLoggersLevel = jest.spyOn(loggersService, 'changeLoggersLevel');
    const refreshReload = jest.spyOn(refreshService, 'refreshReload');
    loggers.changeLevel('main', 'ERROR');
    await loggers.$nextTick();
    expect(changeLoggersLevel).toHaveBeenCalled();
    expect(mockedAxios.post).toHaveBeenCalledWith('/management/loggers/main', { configuredLevel: 'ERROR' });
    expect(mockedAxios.get).toHaveBeenCalledWith('/management/loggers/');
    expect(refreshReload).toHaveBeenCalled();
    refreshReload.mockRestore();
    changeLoggersLevel.mockRestore();
  });

  it('should refresh logs of active route', async () => {
    mockedAxios.get.mockReturnValue(Promise.resolve({}));
    loggers.activeRoute = jhcc_route;
    const spy = jest.spyOn(loggersService, 'findAllLoggers').mockReturnValue(
      new Observable<Log[]>(subscriber => {
        subscriber.next(jhcc_logs);
      })
    );
    loggers.refreshActiveRouteLogs();
    await loggers.$nextTick();
    expect(spy).toHaveBeenCalled();
    expect(loggers.loggers).toStrictEqual(jhcc_logs);
    expect(mockedAxios.get).toHaveBeenCalledWith('/management/loggers/');
    spy.mockRestore();
  });
});
