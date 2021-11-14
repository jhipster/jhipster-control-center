import { createLocalVue, mount, shallowMount, Wrapper } from '@vue/test-utils';
import axios from 'axios';
import * as config from '@/shared/config/config';
import Health from '@/applications/health/health.vue';
import HealthClass from '@/applications/health/health.component';
import HealthModal from '@/applications/health/health-modal.vue';
import InstanceHealthService from '@/applications/health/health.service';
import RoutesService from '@/shared/routes/routes.service';
import { Observable } from 'rxjs';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { jhcc_route, routes, stubbedModal, jhcc_health, jhcc_health_element } from '../../../fixtures/jhcc.fixtures';

const localVue = createLocalVue();
localVue.component('font-awesome-icon', FontAwesomeIcon);
localVue.component('health-modal', HealthModal);
localVue.directive('b-modal', {});
const mockedAxios: any = axios;
const store = config.initVueXStore(localVue);
config.initVueApp(localVue);

const instanceHealthService = new InstanceHealthService();
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

describe('Health Component', () => {
  let wrapper: Wrapper<HealthClass>;
  let health: HealthClass;

  beforeAll(() => {
    mockedAxios.get.mockReturnValue(Promise.resolve({}));
    wrapper = shallowMount<HealthClass>(Health, {
      store,
      localVue,
      stubs: {
        bModal: stubbedModal,
      },
      provide: {
        instanceHealthService: () => instanceHealthService,
        routesService: () => routesService,
      },
      mocks: {
        resetError,
      },
    });
    health = wrapper.vm;
  });

  afterAll(() => {
    health.$destroy();
  });

  it('when component is mounted', async () => {
    mockedAxios.get.mockReturnValue(Promise.resolve({}));
    const subscribeRouteChanged = jest.spyOn(routesService.routeChanged$, 'subscribe');
    const subscribeRoutesChanged = jest.spyOn(routesService.routesChanged$, 'subscribe');
    const wrapperToTestMounted = shallowMount<HealthClass>(Health, {
      store,
      localVue,
      stubs: {
        bModal: stubbedModal,
      },
      provide: {
        instanceHealthService: () => instanceHealthService,
        routesService: () => routesService,
      },
    });
    const healthToTestMounted = wrapperToTestMounted.vm;
    await healthToTestMounted.$nextTick();

    expect(subscribeRouteChanged).toHaveBeenCalled();
    expect(subscribeRoutesChanged).toHaveBeenCalled();
    expect(healthToTestMounted.activeRoute).toBe(jhcc_route);
    expect(healthToTestMounted.routes).toBe(routes);
  });

  it('should refresh health data', async () => {
    health.activeRoute = jhcc_route;
    const spy = jest.spyOn(instanceHealthService, 'checkHealth').mockReturnValue(
      new Observable<any>(subscriber => {
        subscriber.next(jhcc_health);
      })
    );
    health.refreshActiveRouteHealth();
    await health.$nextTick();

    expect(spy).toHaveBeenCalled();
    expect(health.healthData).toStrictEqual(instanceHealthService.transformHealthData(jhcc_health));
    spy.mockRestore();
  });

  describe('baseName and subSystemName', () => {
    it('should return the basename when it has no sub system', () => {
      expect(health.baseName('base')).toBe('base');
    });

    it('should return the basename when it has sub systems', () => {
      expect(health.baseName('base.subsystem.system')).toBe('base');
    });

    it('should return the sub system name', () => {
      expect(health.subSystemName('subsystem')).toBe('');
    });

    it('should return the subsystem when it has multiple keys', () => {
      expect(health.subSystemName('subsystem.subsystem.system')).toBe(' - subsystem.system');
    });
  });

  describe('getBadgeClass', () => {
    it('should get badge class', () => {
      const upBadgeClass = health.getBadgeClass('UP');
      const downBadgeClass = health.getBadgeClass('DOWN');
      expect(upBadgeClass).toEqual('badge-success');
      expect(downBadgeClass).toEqual('badge-danger');
    });
  });

  describe('showHealth', () => {
    it('should set data of selected health element', () => {
      health.showHealth(jhcc_health_element);
      expect(health.currentHealth).toStrictEqual(jhcc_health_element);
    });
  });
});
