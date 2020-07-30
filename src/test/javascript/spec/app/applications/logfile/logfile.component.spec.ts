import { shallowMount, createLocalVue, Wrapper, mount } from '@vue/test-utils';
import * as config from '@/shared/config/config';
import axios from 'axios';
import RoutesService from '@/shared/routes/routes.service';
import { RefreshService } from '@/shared/refresh/refresh.service';
import LogfileService from '@/applications/logfile/logfile.service';
import LogfileClass from '@/applications/logfile/logfile.component';
import Logfile from '@/applications/logfile/logfile.vue';
import { jhcc_logfile, jhcc_logfile_error, jhcc_route, routes } from '../../../fixtures/jhcc.fixtures';
import { Observable } from 'rxjs';

const localVue = createLocalVue();
const mockedAxios: any = axios;
config.initVueApp(localVue);
const store = config.initVueXStore(localVue);

const logfileService = new LogfileService();
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

describe('Logfile Component', () => {
  let wrapper: Wrapper<LogfileClass>;
  let logfile: LogfileClass;

  beforeEach(() => {
    mockedAxios.get.mockReturnValue(Promise.resolve({}));
    wrapper = shallowMount<LogfileClass>(Logfile, {
      store,
      localVue,
      provide: {
        logfileService: () => logfileService,
        refreshService: () => refreshService,
        routesService: () => routesService,
      },
      mocks: {
        resetError,
      },
    });
    logfile = wrapper.vm;
  });

  afterAll(() => {
    logfile.beforeDestroy();
  });

  it('when component is mounted', async () => {
    mockedAxios.get.mockReturnValue(Promise.resolve({}));
    const subscribeRouteChanged = jest.spyOn(routesService.routeChanged$, 'subscribe');
    const subscribeRoutesChanged = jest.spyOn(routesService.routesChanged$, 'subscribe');
    const wrapperToTestMounted = shallowMount<LogfileClass>(Logfile, {
      store,
      localVue,
      provide: {
        logfileService: () => logfileService,
        refreshService: () => refreshService,
        routesService: () => routesService,
      },
    });
    const logfileToTestMounted = wrapperToTestMounted.vm;
    await logfileToTestMounted.$nextTick();

    expect(subscribeRouteChanged).toHaveBeenCalled();
    expect(subscribeRoutesChanged).toHaveBeenCalled();
    expect(logfileToTestMounted.activeRoute).toBe(jhcc_route);
    expect(logfileToTestMounted.routes).toBe(routes);
    subscribeRouteChanged.mockRestore();
    subscribeRoutesChanged.mockRestore();
  });

  it('should refresh logFileContent of selected route', async () => {
    logfile.activeRoute = jhcc_route;
    const spy = jest.spyOn(logfileService, 'findLogfile').mockReturnValue(
      new Observable<any>(subscriber => {
        subscriber.next(jhcc_logfile);
      })
    );
    logfile.refreshActiveRouteLog();
    await logfile.$nextTick();
    expect(spy).toHaveBeenCalled();
    expect(logfile.logFileContent).toStrictEqual(jhcc_logfile);
    spy.mockRestore();
  });

  it('should refresh logFileContent with a custom error 404 of selected route', async () => {
    logfile.activeRoute = jhcc_route;
    const spy = jest
      .spyOn(logfileService, 'findLogfile')
      .mockReturnValue(Observable.throw({ response: { status: 404 }, message: 'Not Found' }));
    logfile.refreshActiveRouteLog();
    await logfile.$nextTick();
    expect(spy).toHaveBeenCalled();
    expect(logfile.logFileContent).toStrictEqual(jhcc_logfile_error);
    spy.mockRestore();
  });

  it('should refresh error with a random error of selected route', async () => {
    logfile.activeRoute = jhcc_route;
    const spy = jest
      .spyOn(logfileService, 'findLogfile')
      .mockReturnValue(Observable.throw({ response: { status: 400 }, message: 'Bad Request' }));
    logfile.refreshActiveRouteLog();
    await logfile.$nextTick();
    expect(spy).toHaveBeenCalled();
    expect(logfile.error).toStrictEqual({ response: { status: 400 }, message: 'Bad Request' });
    spy.mockRestore();
  });

  it('should scroll to bottom', () => {
    logfile.scrollToBottom();
    expect(logfile.$el.querySelector('#logfile').scrollTop).toBe(logfile.$el.querySelector('#logfile').scrollHeight);
  });

  it('should scroll to top', () => {
    logfile.scrollToTop();
    expect(logfile.$el.querySelector('#logfile').scrollTop).toBe(0);
  });
});
