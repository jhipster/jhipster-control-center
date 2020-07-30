import { createLocalVue, Wrapper, mount, shallowMount } from '@vue/test-utils';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import * as config from '@/shared/config/config';
import InstanceVue from '@/applications/instance/instance.vue';
import InstanceModal from '@/applications/instance/instance-modal.vue';
import InstanceClass from '@/applications/instance/instance.component';
import InstanceService from '@/applications/instance/instance.service';
import { RefreshService } from '@/shared/refresh/refresh.service';
import { BootstrapVue } from 'bootstrap-vue';
import { Observable } from 'rxjs';
import { inst, instanceList, instancesRoute, stubbedModal } from '../../../fixtures/jhcc.fixtures';

const localVue = createLocalVue();
const mockedAxios: any = axios;
localVue.component('font-awesome-icon', FontAwesomeIcon);
localVue.component('instance-modal', InstanceModal);
localVue.directive('b-modal', {});
localVue.use(BootstrapVue);
config.initVueApp(localVue);

const store = config.initVueXStore(localVue);
const instanceService = new InstanceService();
const refreshService = new RefreshService(store);
refreshService.refreshReload$ = new Observable(subscriber => {
  subscriber.next();
});

jest.mock('axios', () => ({
  get: jest.fn(),
  post: jest.fn(),
}));

describe('Instance Component', () => {
  let wrapper: Wrapper<InstanceClass>;
  let instance: InstanceClass;

  beforeAll(() => {
    mockedAxios.get.mockReturnValue(Promise.resolve({}));
    wrapper = mount<InstanceClass>(InstanceVue, {
      localVue,
      stubs: {
        bModal: stubbedModal,
      },
      provide: {
        instanceService: () => instanceService,
        refreshService: () => refreshService,
      },
      mocks: {
        show: jest.fn(),
      },
    });
    instance = wrapper.vm;
  });

  afterAll(() => {
    instance.beforeDestroy();
  });

  it('when component is mounted', async () => {
    const subscribeRefreshReload = jest.spyOn(refreshService.refreshReload$, 'subscribe');
    shallowMount<InstanceClass>(InstanceVue, {
      localVue,
      stubs: {
        bModal: stubbedModal,
      },
      provide: {
        instanceService: () => instanceService,
        refreshService: () => refreshService,
      },
    });
    expect(subscribeRefreshReload).toHaveBeenCalled();
  });

  it('should refresh instances list', async () => {
    mockedAxios.get.mockImplementation(() => Promise.resolve({ data: instanceList }));
    const spy = jest.spyOn(instanceService, 'findAllInstance');

    instance.refreshInstancesData();
    await instance.$nextTick();

    expect(spy).toHaveBeenCalled();
    expect(instance.instances).toHaveLength(1);
    spy.mockRestore();
  });

  it('should refresh instancesRoute list', async () => {
    mockedAxios.get.mockImplementation(() => Promise.resolve({ data: instancesRoute }));
    const spy = jest.spyOn(instanceService, 'findAllGatewayRoute');

    instance.refreshInstancesRoute();
    await instance.$nextTick();

    expect(spy).toHaveBeenCalled();
    expect(instance.instancesRoute).toHaveLength(2);
    spy.mockRestore();
  });

  it('should handle error on refreshing instance route data', async () => {
    console.warn = jest.fn();
    mockedAxios.get.mockReturnValue(Promise.reject('error'));
    instance.refreshInstancesRoute();
    await instance.$nextTick();
    expect(console.warn).toHaveBeenCalledWith('error');
  });

  it('should call showInstance', async () => {
    const spy = jest.spyOn(<any>instance.$refs.instanceModal, 'show');
    const uri = 'http://127.0.0.01:8080';
    instance.instancesRoute = instancesRoute;
    instance.showInstance(inst, uri);
    await instance.$nextTick();
    expect(instance.instanceModal).not.toBeNull();
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  describe('should kill the selected instance', () => {
    it('should call confirmShutdown', async () => {
      const spy = jest.spyOn(instance, 'confirmShutdown');
      instance.instancesRoute = instancesRoute;
      instance.confirmShutdown(inst);
      await instance.$nextTick();
      expect(spy).toBeCalledWith(inst);
      spy.mockRestore();
    });

    it('should fire a post request ', async () => {
      mockedAxios.post.mockReturnValue(Promise.resolve({}));
      instance.instancesRoute = instancesRoute;
      instance.shutdownInstance(inst);
      await instance.$nextTick();
      expect(mockedAxios.post).toHaveBeenCalledWith('/gateway/app1/app1-id/management/shutdown');
    });
  });
});
