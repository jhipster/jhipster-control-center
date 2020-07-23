import { shallowMount, createLocalVue, Wrapper } from '@vue/test-utils';
import { RefreshService } from '@/shared/refresh/refresh.service';
import * as config from '@/shared/config/config';
import axios from 'axios';
import RoutesService, { Route } from '@/shared/routes/routes.service';
import LogfileService from '@/applications/logfile/logfile.service';
import LogfileClass from '@/applications/logfile/logfile.component';
import Logfile from '@/applications/logfile/logfile.vue';

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

describe('Logfile Component', () => {
  let wrapper: Wrapper<LogfileClass>;
  let logfile: LogfileClass;

  beforeEach(() => {
    mockedAxios.get.mockReturnValue(Promise.resolve({}));
    wrapper = shallowMount<LogfileClass>(Logfile, {
      store,
      localVue,
      provide: {
        logfileService: () => new LogfileService(),
        refreshService: () => new RefreshService(store),
        routesService: () => new RoutesService(store),
      },
    });
    logfile = wrapper.vm;
  });

  describe('when component is mounted', () => {
    it('should refresh active route logfile if it is jhcc', async () => {
      // WHEN
      logfile.activeRoute = jhcc_route;
      logfile.displayActiveRouteLog();
      await logfile.$nextTick();

      // THEN
      expect(mockedAxios.get).toHaveBeenCalledWith('/management/logfile/');
    });

    it('should refresh active route logfile if it is a service', async () => {
      // WHEN
      logfile.activeRoute = service_test_route;
      logfile.displayActiveRouteLog();
      await logfile.$nextTick();

      // THEN
      expect(mockedAxios.get).toHaveBeenCalledWith('gateway/' + service_test_route.path + '/management/logfile/');
    });
  });
});
