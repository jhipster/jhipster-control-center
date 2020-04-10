import { shallowMount, createLocalVue, Wrapper, mount } from '@vue/test-utils';
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
localVue.component('font-awesome-icon', FontAwesomeIcon);
localVue.component('applications-modal', ApplicationsModal);
localVue.directive('b-modal', {});

jest.mock('axios', () => ({
  get: jest.fn()
}));

const stubbedModal = {
  template: '<div></div>',
  methods: {
    show() {}
  }
};

describe('Applications Component', () => {
  let wrapper: Wrapper<ApplicationsClass>;
  let applications: ApplicationsClass;

  beforeEach(() => {
    mockedAxios.get.mockReturnValue(Promise.resolve({}));
    wrapper = mount<ApplicationsClass>(Applications, {
      localVue,
      stubs: {
        bModal: stubbedModal
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

  describe('should refresh list of applications data', () => {
    it('should call refreshApplicationsData on init', async () => {
      // GIVEN
      mockedAxios.get.mockReturnValue(Promise.resolve({}));

      // WHEN
      applications.refreshApplicationsData();
      await applications.$nextTick();

      // THEN
      expect(mockedAxios.get).toHaveBeenCalledWith('api/services/instances');
    });
    it('should handle error on refreshing applications data', async () => {
      // GIVEN
      mockedAxios.get.mockReturnValue(Promise.reject({}));

      // WHEN
      applications.refreshApplicationsData();
      await applications.$nextTick();

      // THEN
      expect(mockedAxios.get).toHaveBeenCalledWith('api/services/instances');
    });
  });

  describe('should refresh list of applications route data', () => {
    it('should call refreshApplicationsRoute on init', async () => {
      // GIVEN
      mockedAxios.get.mockReturnValue(Promise.resolve({}));

      // WHEN
      applications.refreshApplicationsRoute();
      await applications.$nextTick();

      // THEN
      expect(mockedAxios.get).toHaveBeenCalledWith('management/gateway/routes');
    });
    it('should handle error on refreshing applications route data', async () => {
      // GIVEN
      mockedAxios.get.mockReturnValue(Promise.reject({}));

      // WHEN
      applications.refreshApplicationsRoute();
      await applications.$nextTick();

      // THEN
      expect(mockedAxios.get).toHaveBeenCalledWith('management/gateway/routes');
    });
  });

  // TODO fix test for method showApplication
  describe('should call showApplication', () => {
    it('should show selected application', async () => {
      // GIVEN
      const spy = jest.spyOn(applications, 'showApplication');
      const app = {
        app1: [
          {
            instanceId: 'app1-id',
            serviceId: 'app1',
            host: '127.0.0.1',
            port: 8080,
            secure: false,
            metadata: { someData: 'test' },
            uri: 'http://127.0.0.01:8080',
            scheme: null
          }
        ]
      };
      const uri = 'http://127.0.0.01:8080';
      applications.applicationsRoute = [
        { uri: 'http://127.0.0.01:8081', route_id: 'test2/test2-id' },
        { uri: 'http://127.0.0.01:8080', route_id: 'test/test-id' }
      ];

      // WHEN
      applications.showApplication(app, uri);
      await applications.$nextTick();
      // THEN
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });
  });
});
