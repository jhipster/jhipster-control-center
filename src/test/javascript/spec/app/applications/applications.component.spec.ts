import { shallowMount, createLocalVue, Wrapper } from '@vue/test-utils';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

import * as config from '@/shared/config/config';
import Applications from '@/applications/applications.vue';
import ApplicationsModal from '@/applications/applications-modal.vue';
import ApplicationsClass from '@/applications/applications.component';
import ApplicationsService from '@/applications/applications.service';

const localVue = createLocalVue();
const mockedAxios: any = axios;

config.initVueApp(localVue);
const store = config.initVueXStore(localVue);
localVue.component('font-awesome-icon', FontAwesomeIcon);
localVue.component('applications-modal', ApplicationsModal);
localVue.directive('b-modal', {});

jest.mock('axios', () => ({
  get: jest.fn()
}));

describe('Applications Component', () => {
  let wrapper: Wrapper<ApplicationsClass>;
  let applications: ApplicationsClass;

  beforeEach(() => {
    mockedAxios.get.mockReturnValue(Promise.resolve({}));
    wrapper = shallowMount<ApplicationsClass>(Applications, {
      store,

      localVue,
      stubs: {
        bModal: true
      },
      provide: {
        applicationsService: () => new ApplicationsService()
      }
    });
    applications = wrapper.vm;
  });

  it('should be a Vue instance', () => {
    expect(wrapper.isVueInstance()).toBeTruthy();
  });

  describe('getListApplications', () => {
    it('should call getListApplications on init', async () => {
      // GIVEN
      mockedAxios.get.mockReturnValue(Promise.resolve({}));

      // WHEN
      applications.getListApplications();
      await applications.$nextTick();

      // THEN
      expect(mockedAxios.get).toHaveBeenCalledWith('api/services/instances');
    });
    it('should handle error on refreshing applications data', async () => {
      // GIVEN
      mockedAxios.get.mockReturnValue(Promise.reject({}));

      // WHEN
      applications.getListApplications();
      await applications.$nextTick();

      // THEN
      expect(mockedAxios.get).toHaveBeenCalledWith('api/services/instances');
    });
  });
});
