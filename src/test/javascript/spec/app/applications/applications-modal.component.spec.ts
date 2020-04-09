import { createLocalVue, Wrapper, shallowMount } from '@vue/test-utils';
import * as config from '@/shared/config/config';
import ApplicationsModal from '@/applications/applications-modal.vue';
import ApplicationsModalClass from '@/applications/applications-modal.component';
import axios from 'axios';

const localVue = createLocalVue();
config.initVueApp(localVue);
localVue.component('font-awesome-icon', {});
const mockedApplicationsService = { findActiveProfiles: jest.spyOn(axios, 'get') };

describe('Applications Modal Component', () => {
  let wrapper: Wrapper<ApplicationsModalClass>;
  let applicationsModal: ApplicationsModalClass;

  beforeEach(async () => {
    wrapper = shallowMount<ApplicationsModalClass>(ApplicationsModal, {
      propsData: {
        currentApplication: {},
        currentRoute: {}
      },
      localVue,
      provide: {
        applicationsService: () => mockedApplicationsService
      }
    });
    applicationsModal = wrapper.vm;
  });

  it('should be a Vue instance', () => {
    expect(wrapper.isVueInstance()).toBeTruthy();
  });

  describe('active profiles', () => {
    it('should refresh profile', async () => {
      // GIVEN
      mockedApplicationsService.findActiveProfiles.mockReturnValue(Promise.resolve({}));
      const route = mockedApplicationsService.findActiveProfiles.mock.calls[0][0];

      // WHEN
      applicationsModal.refreshProfile();
      await applicationsModal.$nextTick();

      // THEN
      expect(mockedApplicationsService.findActiveProfiles).toHaveBeenCalledWith(route);
    });

    it('should get an error when refresh profile', async () => {
      // GIVEN
      mockedApplicationsService.findActiveProfiles.mockReturnValue(Promise.reject({}));
      const route = mockedApplicationsService.findActiveProfiles.mock.calls[0][0];

      // WHEN
      applicationsModal.refreshProfile();
      await applicationsModal.$nextTick();

      // THEN
      expect(mockedApplicationsService.findActiveProfiles).toHaveBeenCalledWith(route);
    });
  });
});
