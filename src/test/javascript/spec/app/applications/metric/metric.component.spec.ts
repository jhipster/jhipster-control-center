import { shallowMount, createLocalVue, Wrapper } from '@vue/test-utils';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import * as config from '@/shared/config/config';
import Metric from '@/applications/metric/metric.vue';
import MetricModal from '@/applications/metric/metric-modal.vue';
import MetricClass from '@/applications/metric/metric.component';
import MetricService from '@/applications/metric/metric.service';
import RoutesService, { Route } from '@/shared/routes/routes.service';
import { RefreshService } from '@/shared/refresh/refresh.service';
import { BootstrapVue } from 'bootstrap-vue';
import { Observable } from 'rxjs';
import { jhcc_metrics, jhcc_route, service_test_route } from '../../../fixtures/jhcc.fixtures';

const localVue = createLocalVue();
localVue.component('font-awesome-icon', FontAwesomeIcon);
localVue.component('metrics-modal', MetricModal);
localVue.directive('b-modal', {});
localVue.directive('b-progress', {});
localVue.directive('b-progress-bar', {});
localVue.use(BootstrapVue);
config.initVueApp(localVue);
const store = config.initVueXStore(localVue);

const metricService = new MetricService();
const refreshService = new RefreshService(store);
const routesService = new RoutesService(store);
routesService.routeChanged$ = new Observable(subscriber => {
  subscriber.next(jhcc_route);
});

const mockedAxios: any = axios;
jest.mock('axios', () => ({
  get: jest.fn(),
}));

describe('Metrics Component', () => {
  let wrapper: Wrapper<MetricClass>;
  let metricComponent: MetricClass;

  beforeEach(() => {
    mockedAxios.get.mockReturnValue(Promise.resolve({ data: { timers: [], gauges: [] } }));
    wrapper = shallowMount<MetricClass>(Metric, {
      store,
      localVue,
      stubs: {
        bModal: true,
        bProgress: true,
        bProgressBar: true,
      },
      provide: {
        metricService: () => metricService,
        routesService: () => routesService,
        refreshService: () => refreshService,
      },
      mocks: {
        show: jest.fn(),
      },
    });
    metricComponent = wrapper.vm;
  });

  it('when component is mounted', async () => {
    mockedAxios.get.mockReturnValue(Promise.resolve({ data: jhcc_metrics }));
    const subscribeRouteChanged = jest.spyOn(routesService.routeChanged$, 'subscribe');
    const wrapperToTestMounted = shallowMount<MetricClass>(Metric, {
      store,
      localVue,
      stubs: {
        bModal: true,
        bProgress: true,
        bProgressBar: true,
      },
      provide: {
        metricService: () => metricService,
        routesService: () => routesService,
        refreshService: () => refreshService,
      },
    });
    const metricToTestMounted = wrapperToTestMounted.vm;
    await metricToTestMounted.$nextTick();
    expect(subscribeRouteChanged).toHaveBeenCalled();
    expect(metricToTestMounted.activeRoute).toBe(jhcc_route);
    expect(mockedAxios.get).toHaveBeenCalledWith('/management/jhimetrics/');
    expect(mockedAxios.get).toHaveBeenCalledWith('/management/threaddump/');
    expect(metricToTestMounted.metrics).toHaveProperty('jvm');
    expect(metricToTestMounted.metrics).toEqual(jhcc_metrics);
    expect(metricToTestMounted.threadStats).toEqual({
      threadDumpRunnable: 1,
      threadDumpWaiting: 1,
      threadDumpTimedWaiting: 1,
      threadDumpBlocked: 1,
      threadDumpAll: 4,
    });
  });

  describe('isNan', () => {
    it('should return 0 if a variable is NaN', () => {
      metricComponent.activeRoute = jhcc_route;
      expect(metricComponent.filterNaN(1)).toBe(1);
      expect(metricComponent.filterNaN('test')).toBe(0);
    });
  });

  describe('show threads data', () => {
    it('should show modal which contains threads data', () => {
      const spy = jest.spyOn(<any>metricComponent.$refs.metricsModal, 'show');
      metricComponent.activeRoute = jhcc_route;
      metricComponent.openModal();
      expect(spy).toHaveBeenCalled();
    });
  });
});
