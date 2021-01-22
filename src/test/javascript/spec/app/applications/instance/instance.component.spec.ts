import axios from 'axios';
import { Observable } from 'rxjs';
import { BootstrapVue } from 'bootstrap-vue';
import * as config from '@/shared/config/config';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import InstanceVue from '@/applications/instance/instance.vue';
import { RefreshService } from '@/shared/refresh/refresh.service';
import { faEye, faPowerOff } from '@fortawesome/free-solid-svg-icons';
import InstanceModal from '@/applications/instance/instance-modal.vue';
import InstanceClass from '@/applications/instance/instance.component';
import InstanceService from '@/applications/instance/instance.service';
import { createLocalVue, Wrapper, shallowMount } from '@vue/test-utils';
import { inst, instanceList, instancesRoute, stubbedModal } from '../../../fixtures/jhcc.fixtures';

const localVue = createLocalVue();
const mockedAxios: any = axios;
library.add(faEye);
library.add(faPowerOff);
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
    wrapper = shallowMount<InstanceClass>(InstanceVue, {
      store,
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
        hide: jest.fn(),
        $store: {
          getters: {
            activeProfiles: ['static'],
          },
        },
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
      store,
      localVue,
      stubs: {
        bModal: stubbedModal,
      },
      provide: {
        instanceService: () => instanceService,
        refreshService: () => refreshService,
      },
      mocks: {
        $store: {
          getters: {
            activeProfiles: ['static'],
          },
        },
      },
    });
    expect(subscribeRefreshReload).toHaveBeenCalled();
  });

  it('should refresh instances list', async () => {
    mockedAxios.get.mockImplementationOnce(() => Promise.resolve({ data: instanceList }));
    const spy = jest.spyOn(instanceService, 'findAllInstance');

    instance.refreshInstancesData();
    await instance.$nextTick();

    expect(spy).toHaveBeenCalled();
    expect(instance.instances).toHaveLength(1);
    spy.mockRestore();
  });

  it('should refresh instancesRoute list', async () => {
    mockedAxios.get.mockImplementationOnce(() => Promise.resolve({ data: instancesRoute }));
    const spy = jest.spyOn(instanceService, 'findAllGatewayRoute');

    instance.refreshInstancesRoute();
    await instance.$nextTick();

    expect(spy).toHaveBeenCalled();
    expect(instance.instancesRoute).toHaveLength(2);
    spy.mockRestore();
  });

  it('should handle error on refreshing instance route data', async () => {
    console.warn = jest.fn();
    mockedAxios.get.mockReturnValueOnce(Promise.reject('error'));

    instance.refreshInstancesRoute();
    await instance.$nextTick();

    expect(console.warn).toHaveBeenCalledWith('error');
  });

  it('should call show from instanceModal when showInstance is called', async () => {
    const spy = jest.spyOn(<any>instance.$refs.instanceModal, 'show');
    const uri = 'http://127.0.0.01:8080';
    instance.instancesRoute = instancesRoute;

    instance.showInstance(inst, uri);
    await instance.$nextTick();

    expect(instance.instanceModal).not.toBeNull();
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('should call shutdownInstance when msgBoxConfirm is true', async () => {
    const spyShutdownInstance = jest.spyOn(instance, 'shutdownInstance');
    const spyMsgBoxConfirm = jest.spyOn(instance.$bvModal, 'msgBoxConfirm').mockReturnValueOnce(Promise.resolve(true));
    instance.instancesRoute = instancesRoute;

    instance.confirmShutdown(inst);
    await instance.$nextTick();

    expect(spyMsgBoxConfirm).toHaveBeenCalled();
    expect(spyShutdownInstance).toBeCalledWith(inst);
    spyMsgBoxConfirm.mockRestore();
    spyShutdownInstance.mockRestore();
  });

  it('should not call shutdownInstance when msgBoxConfirm is false', async () => {
    const spyShutdownInstance = jest.spyOn(instance, 'shutdownInstance');
    const spyMsgBoxConfirm = jest.spyOn(instance.$bvModal, 'msgBoxConfirm').mockReturnValueOnce(Promise.reject());
    instance.instancesRoute = instancesRoute;

    instance.confirmShutdown(inst);
    await instance.$nextTick();

    expect(spyMsgBoxConfirm).toHaveBeenCalled();
    expect(spyShutdownInstance).not.toHaveBeenCalled();
    spyMsgBoxConfirm.mockRestore();
    spyShutdownInstance.mockRestore();
  });

  it('should fire a post request with success toast', async () => {
    const spySuccess = jest.spyOn(instance, 'successToast');
    mockedAxios.post.mockReturnValueOnce(Promise.resolve());
    instance.instancesRoute = instancesRoute;

    instance.shutdownInstance(inst);
    await instance.$nextTick();

    expect(mockedAxios.post).toHaveBeenCalledWith('/gateway/app1/app1/management/shutdown');
    expect(spySuccess).toHaveBeenCalled();
    spySuccess.mockRestore();
  });

  it('should fire a post request with error toast', async () => {
    const spyError = jest.spyOn(instance, 'errorToast');
    mockedAxios.post.mockReturnValueOnce(Promise.reject());
    instance.instancesRoute = instancesRoute;

    instance.shutdownInstance(inst);
    await instance.$nextTick();

    expect(mockedAxios.post).toHaveBeenCalledWith('/gateway/app1/app1/management/shutdown');
    expect(spyError).toHaveBeenCalled();
    spyError.mockRestore();
  });

  it('should call addStaticInstance when call onSubmitAddStaticInstance', async () => {
    const expected = { serviceId: 'static-service', url: 'http://localhost:8082' };
    const spy = jest.spyOn(instance, 'addStaticInstance');
    const spySuccess = jest.spyOn(instance, 'successToast');
    mockedAxios.post.mockReturnValueOnce(Promise.resolve({ status: 201 }));
    instance.isStaticProfile = true;
    instance.inputServiceName = expected.serviceId;
    instance.inputURL = expected.url;
    await instance.$nextTick();

    instance.onSubmitAddStaticInstance();
    await instance.$nextTick();

    expect(spy).toHaveBeenCalled();
    expect(spySuccess).toHaveBeenCalled();
    expect(mockedAxios.post).toHaveBeenCalledWith('api/services/instances', expected);
    spy.mockRestore();
    spySuccess.mockRestore();
  });

  it('should call addStaticInstance with error when call onSubmitAddStaticInstance', async () => {
    const expected = { serviceId: 'static-service', url: 'wrong-url' };
    const spy = jest.spyOn(instance, 'addStaticInstance');
    const spyError = jest.spyOn(instance, 'errorToast');
    mockedAxios.post.mockReturnValueOnce(Promise.resolve({ status: 400 }));
    instance.isStaticProfile = true;
    instance.inputServiceName = expected.serviceId;
    instance.inputURL = expected.url;
    await instance.$nextTick();

    instance.onSubmitAddStaticInstance();
    await instance.$nextTick();

    expect(spy).toHaveBeenCalled();
    expect(spyError).toHaveBeenCalled();
    expect(mockedAxios.post).toHaveBeenCalledWith('api/services/instances', expected);
    spy.mockRestore();
    spyError.mockRestore();
  });

  it('should hide newStaticInstanceModal when call onHiddenAddStaticInstance', async () => {
    const spy = jest.spyOn(instance.$bvModal, 'hide');

    instance.onHiddenAddStaticInstance();
    await instance.$nextTick();

    expect(spy).toHaveBeenCalled();
    expect(instance.inputServiceName).toEqual('');
    expect(instance.inputURL).toEqual('');
    spy.mockRestore();
  });
});
