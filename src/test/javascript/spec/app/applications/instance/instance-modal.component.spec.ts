import { createLocalVue, Wrapper, shallowMount } from '@vue/test-utils';
import * as config from '@/shared/config/config';
import axios from 'axios';
import InstanceModalClass from '@/applications/instance/instance-modal.component';
import InstanceModal from '@/applications/instance/instance-modal.vue';

const localVue = createLocalVue();
config.initVueApp(localVue);
localVue.component('font-awesome-icon', {});
const mockedInstanceService = { findActiveProfiles: jest.spyOn(axios, 'get') };
const app = {
  serviceId: 'app1',
  instanceId: 'app1-id',
  uri: 'http://127.0.0.1:8080',
  host: '127.0.0.1',
  port: 8080,
  secure: false,
  metadata: {}
};

describe('Instance Modal Component', () => {
  let wrapper: Wrapper<InstanceModalClass>;
  let instanceModal: InstanceModalClass;

  beforeEach(async () => {
    wrapper = shallowMount<InstanceModalClass>(InstanceModal, {
      propsData: {
        selectedInstance: app,
        selectedInstanceRoute: {}
      },
      localVue,
      provide: {
        instanceService: () => mockedInstanceService
      }
    });
    instanceModal = wrapper.vm;
  });

  it('should be a Vue instance', () => {
    expect(wrapper.isVueInstance()).toBeTruthy();
  });

  describe('active profiles', () => {
    it('should refresh profile', async () => {
      // GIVEN
      mockedInstanceService.findActiveProfiles.mockReturnValue(Promise.resolve({}));
      const route = mockedInstanceService.findActiveProfiles.mock.calls[0][0];

      // WHEN
      instanceModal.refreshProfile();
      await instanceModal.$nextTick();

      // THEN
      expect(mockedInstanceService.findActiveProfiles).toHaveBeenCalledWith(route);
    });

    it('should get an error when refresh profile', async () => {
      // GIVEN
      mockedInstanceService.findActiveProfiles.mockReturnValue(Promise.reject({}));
      const route = mockedInstanceService.findActiveProfiles.mock.calls[0][0];

      // WHEN
      instanceModal.refreshProfile();
      await instanceModal.$nextTick();

      // THEN
      expect(mockedInstanceService.findActiveProfiles).toHaveBeenCalledWith(route);
    });
  });
});
