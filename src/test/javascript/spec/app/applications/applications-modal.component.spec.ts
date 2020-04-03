import { shallowMount, createLocalVue, Wrapper } from '@vue/test-utils';
import * as config from '@/shared/config/config';
import ApplicationsModal from '@/applications/applications-modal.vue';
import ApplicationsModalClass from '@/applications/applications-modal.component';

const localVue = createLocalVue();
config.initVueApp(localVue);
const store = config.initVueXStore(localVue);
localVue.component('font-awesome-icon', {});
const applicationsService = {};

describe('Applications Modal Component', () => {
  let wrapper: Wrapper<ApplicationsModalClass>;
  let applicationsModal: ApplicationsModalClass;

  beforeEach(() => {
    wrapper = shallowMount<ApplicationsModalClass>(ApplicationsModal, {
      propsData: {
        currentApplication: {}
      },
      localVue,
      provide: {
        applicationsService: () => applicationsService
      }
    });
    applicationsModal = wrapper.vm;
  });

  it('should be a Vue instance', () => {
    expect(wrapper.isVueInstance()).toBeTruthy();
  });
});
