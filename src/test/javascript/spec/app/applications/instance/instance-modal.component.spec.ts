import { createLocalVue, Wrapper, mount } from '@vue/test-utils';
import * as config from '@/shared/config/config';
import axios from 'axios';
import InstanceModalClass from '@/applications/instance/instance-modal.component';
import InstanceModal from '@/applications/instance/instance-modal.vue';
import InstanceService from '@/applications/instance/instance.service';
import { inst, jhcc_route, jhcc_profiles } from '../../../fixtures/jhcc.fixtures';

const localVue = createLocalVue();
config.initVueApp(localVue);
localVue.component('font-awesome-icon', {});
const instanceService = new InstanceService();
console.warn = jest.fn();
jest.mock('axios', () => ({
  get: jest.fn(),
  post: jest.fn(),
}));
const mockedAxios: any = axios;

describe('Instance Modal Component', () => {
  let wrapper: Wrapper<InstanceModalClass>;
  let instanceModal: InstanceModalClass;

  beforeAll(async () => {
    mockedAxios.get.mockReturnValue(Promise.resolve({}));
    wrapper = mount<InstanceModalClass>(InstanceModal, {
      propsData: {
        selectedInstance: inst,
        selectedInstanceRoute: jhcc_route,
      },
      localVue,
      provide: {
        instanceService: () => instanceService,
      },
    });
    instanceModal = wrapper.vm;
  });

  describe('active profiles', () => {
    it('should refresh profile', async () => {
      mockedAxios.get.mockReturnValue(Promise.resolve({ data: jhcc_profiles }));
      const spy = jest.spyOn(instanceService, 'findActiveProfiles');
      instanceModal.refreshProfile();
      await instanceModal.$nextTick();
      expect(spy).toHaveBeenCalled();
      expect(instanceModal.activeProfiles).not.toBeNull();
      spy.mockRestore();
    });

    it('should get an error when refresh profile', async () => {
      mockedAxios.get.mockReturnValue(Promise.reject('error'));
      const spy = jest.spyOn(instanceService, 'findActiveProfiles');
      instanceModal.refreshProfile();
      await instanceModal.$nextTick();
      expect(spy).toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalledWith('error');
      spy.mockRestore();
    });
  });
});
