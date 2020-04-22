import { createLocalVue, Wrapper, mount } from '@vue/test-utils';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import * as config from '@/shared/config/config';
import InstanceVue from '@/applications/instance/instance.vue';
import InstanceModal from '@/applications/instance/instance-modal.vue';
import InstanceClass from '@/applications/instance/instance.component';
import InstanceService, { Instance, Metadata } from '@/applications/instance/instance.service';
import { RefreshService } from '@/shared/refresh/refresh.service';
import { BootstrapVue } from 'bootstrap-vue';

const localVue = createLocalVue();
const mockedAxios: any = axios;

config.initVueApp(localVue);
localVue.component('font-awesome-icon', FontAwesomeIcon);
localVue.component('instance-modal', InstanceModal);
localVue.directive('b-modal', {});
localVue.use(BootstrapVue);

const store = config.initVueXStore(localVue);

jest.mock('axios', () => ({
  get: jest.fn()
}));

const stubbedModal = {
  template: '<div></div>',
  methods: {
    show() {}
  }
};

const RefreshSelectorMixin = {
  inject: ['refreshService']
};

describe('Instance Component', () => {
  let wrapper: Wrapper<InstanceClass>;
  let instance: InstanceClass;

  beforeEach(() => {
    mockedAxios.get.mockReturnValue(Promise.resolve({}));
    wrapper = mount<InstanceClass>(InstanceVue, {
      localVue,
      mixins: [RefreshSelectorMixin],
      stubs: {
        bModal: stubbedModal
      },
      provide: {
        instanceService: () => new InstanceService(),
        refreshService: () => new RefreshService(store)
      }
    });
    instance = wrapper.vm;
  });

  it('should be a Vue instance', () => {
    expect(wrapper.isVueInstance()).toBeTruthy();
  });

  describe('should refresh list of instance data', () => {
    it('should call refreshInstancesData on init', async () => {
      // GIVEN
      mockedAxios.get.mockReturnValue(Promise.resolve({}));

      // WHEN
      instance.refreshInstancesData();
      await instance.$nextTick();

      // THEN
      expect(mockedAxios.get).toHaveBeenCalledWith('api/services/instances');
    });
    it('should handle error on refreshing instance data', async () => {
      // GIVEN
      mockedAxios.get.mockReturnValue(Promise.reject({}));

      // WHEN
      instance.refreshInstancesData();
      await instance.$nextTick();

      // THEN
      expect(mockedAxios.get).toHaveBeenCalledWith('api/services/instances');
    });
  });

  describe('should refresh list of instance route data', () => {
    it('should call refreshInstancesRoute on init', async () => {
      // GIVEN
      mockedAxios.get.mockReturnValue(Promise.resolve({}));

      // WHEN
      instance.refreshInstancesRoute();
      await instance.$nextTick();

      // THEN
      expect(mockedAxios.get).toHaveBeenCalledWith('management/gateway/routes');
    });
    it('should handle error on refreshing instance route data', async () => {
      // GIVEN
      mockedAxios.get.mockReturnValue(Promise.reject({}));

      // WHEN
      instance.refreshInstancesRoute();
      await instance.$nextTick();

      // THEN
      expect(mockedAxios.get).toHaveBeenCalledWith('management/gateway/routes');
    });
  });

  describe('should call showInstance', () => {
    it('should show selected instance', async () => {
      // GIVEN
      const spy = jest.spyOn(instance, 'showInstance');
      const inst: Instance = new class implements Instance {
        serviceId: string;
        instanceId: string;
        uri: string;
        host: string;
        port: number;
        secure: boolean;
        metadata: Metadata;
      }();
      inst.serviceId = 'app1';
      inst.instanceId = 'app1-id';
      inst.uri = 'http://127.0.0.01:8080';
      inst.host = '127.0.0.1';
      inst.port = 8080;
      inst.secure = false;
      inst.metadata = {};
      const uri = 'http://127.0.0.01:8080';
      instance.instancesRoute = [
        { uri: 'http://127.0.0.01:8081', route_id: 'test2/test2-id' },
        { uri: 'http://127.0.0.01:8080', route_id: 'test/test-id' }
      ];

      // WHEN
      instance.showInstance(inst, uri);
      await instance.$nextTick();
      // THEN
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });
  });
});
