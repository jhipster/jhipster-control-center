import { shallowMount, createLocalVue, Wrapper } from '@vue/test-utils';
import * as config from '@/shared/config/config';
import HealthModal from '@/applications/health/health-modal.vue';
import HealthModalClass from '@/applications/health/health-modal.component';
import InstanceHealthService from '@/applications/health/health.service';

const localVue = createLocalVue();
localVue.component('font-awesome-icon', {});
config.initVueApp(localVue);
const healthsService = new InstanceHealthService();

describe('Health Modal Component', () => {
  let wrapper: Wrapper<HealthModalClass>;
  let healthModal: HealthModalClass;

  beforeEach(() => {
    wrapper = shallowMount<HealthModalClass>(HealthModal, {
      propsData: {
        currentHealth: {},
      },
      localVue,
      provide: {
        instanceHealthService: () => healthsService,
      },
    });
    healthModal = wrapper.vm;
  });

  describe('baseName and subSystemName', () => {
    it('should use getBaseName from healthService', () => {
      const spy = jest.spyOn(healthsService, 'getBaseName');
      healthModal.baseName('base');
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });

    it('should use getSubSystemName from healthService', () => {
      const spy = jest.spyOn(healthsService, 'getSubSystemName');
      healthModal.subSystemName('base');
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });
  });

  describe('readableValue should transform data', () => {
    it('to string when is an object', () => {
      const result = healthModal.readableValue({ data: 1000 });
      expect(result).toBe('{"data":1000}');
    });

    it('to string when is a string', () => {
      const result = healthModal.readableValue('data');
      expect(result).toBe('data');
    });
  });
});

describe('Health Modal Component for diskSpace', () => {
  let wrapper: Wrapper<HealthModalClass>;
  let healthModal: HealthModalClass;

  beforeEach(() => {
    wrapper = shallowMount<HealthModalClass>(HealthModal, {
      propsData: {
        currentHealth: { name: 'diskSpace' },
      },
      localVue,
      provide: {
        instanceHealthService: () => healthsService,
      },
    });
    healthModal = wrapper.vm;
  });

  describe('readableValue should transform data', () => {
    it('to GB when needed', () => {
      const result = healthModal.readableValue(2147483648);

      expect(result).toBe('2.00 GB');
    });

    it('to MB when needed', () => {
      const result = healthModal.readableValue(214748);

      expect(result).toBe('0.20 MB');
    });
  });
});
