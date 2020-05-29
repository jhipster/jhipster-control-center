import { shallowMount, createLocalVue, Wrapper } from '@vue/test-utils';

import * as config from '@/shared/config/config';
import MetricModal from '@/applications/metric/metric-modal.vue';
import MetricModalClass from '@/applications/metric/metric-modal.component';

const localVue = createLocalVue();

config.initVueApp(localVue);
const store = config.initVueXStore(localVue);

describe('Metric Component', () => {
  let wrapper: Wrapper<MetricModalClass>;
  let metricModal: MetricModalClass;

  beforeEach(() => {
    wrapper = shallowMount<MetricModalClass>(MetricModal, { store, localVue });
    metricModal = wrapper.vm;
  });

  describe('init', () => {
    it('should count the numbers of each thread type', () => {
      wrapper.setProps({
        threadDump: [
          { name: 'test1', threadState: 'RUNNABLE' },
          { name: 'test2', threadState: 'WAITING' },
          { name: 'test3', threadState: 'TIMED_WAITING' },
          { name: 'test4', threadState: 'BLOCKED' },
          { name: 'test5', threadState: 'BLOCKED' },
          { name: 'test5', threadState: 'NONE' },
        ],
      });

      expect(metricModal.threadDumpData.threadDumpRunnable).toBe(1);
      expect(metricModal.threadDumpData.threadDumpWaiting).toBe(1);
      expect(metricModal.threadDumpData.threadDumpTimedWaiting).toBe(1);
      expect(metricModal.threadDumpData.threadDumpBlocked).toBe(2);
      expect(metricModal.threadDumpData.threadDumpAll).toBe(5);
    });
  });

  describe('getBadgeClass', () => {
    it('should return badge-success for RUNNABLE', () => {
      expect(metricModal.getBadgeClass('RUNNABLE')).toBe('badge-success');
    });

    it('should return badge-info for WAITING', () => {
      expect(metricModal.getBadgeClass('WAITING')).toBe('badge-info');
    });

    it('should return badge-warning for TIMED_WAITING', () => {
      expect(metricModal.getBadgeClass('TIMED_WAITING')).toBe('badge-warning');
    });

    it('should return badge-danger for BLOCKED', () => {
      expect(metricModal.getBadgeClass('BLOCKED')).toBe('badge-danger');
    });

    it('should return undefined for anything else', () => {
      expect(metricModal.getBadgeClass('')).toBe(undefined);
    });
  });
});
