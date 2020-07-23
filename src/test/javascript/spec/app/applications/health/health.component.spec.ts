import { createLocalVue, shallowMount, Wrapper } from '@vue/test-utils';
import axios from 'axios';
import * as config from '@/shared/config/config';
import HealthClass from '@/applications/health/health.component';
import RoutesService, { Route } from '@/shared/routes/routes.service';
import { RefreshService } from '@/shared/refresh/refresh.service';
import InstanceHealthService from '@/applications/health/health.service';
import Health from '@/applications/health/health.vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import HealthModal from '@/applications/health/health-modal.vue';

const localVue = createLocalVue();
const mockedAxios: any = axios;
config.initVueApp(localVue);
const store = config.initVueXStore(localVue);
localVue.component('font-awesome-icon', FontAwesomeIcon);
localVue.component('health-modal', HealthModal);
localVue.directive('b-modal', {});

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

describe('Health Component', () => {
  let wrapper: Wrapper<HealthClass>;
  let health: HealthClass;

  beforeEach(() => {
    mockedAxios.get.mockReturnValue(Promise.resolve({}));
    wrapper = shallowMount<HealthClass>(Health, {
      store,
      localVue,
      stubs: {
        bModal: true,
      },
      provide: {
        instanceHealthService: () => new InstanceHealthService(),
        refreshService: () => new RefreshService(store),
        routesService: () => new RoutesService(store),
      },
    });
    health = wrapper.vm;
  });

  it('should be a Vue instance', () => {
    expect(wrapper.isVueInstance()).toBeTruthy();
  });

  describe('when component is mounted', () => {
    it('should set all default values correctly', () => {
      expect(health.currentHealth).toBe(null);
      expect(health.healthData).toBe(null);
    });

    it('should refresh active route health if it is jhcc', async () => {
      health.activeRoute = jhcc_route;

      health.refreshActiveRouteHealth();
      await health.$nextTick();

      expect(mockedAxios.get).toHaveBeenCalledWith('/management/health/');
    });

    it('should refresh active route health if it is a service', async () => {
      health.activeRoute = service_test_route;

      health.refreshActiveRouteHealth();
      await health.$nextTick();

      expect(mockedAxios.get).toHaveBeenCalledWith('gateway/' + service_test_route.path + '/management/health/');
    });
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
});
