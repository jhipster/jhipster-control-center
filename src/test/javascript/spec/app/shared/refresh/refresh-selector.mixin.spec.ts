import { createLocalVue, shallowMount, Wrapper } from '@vue/test-utils';
import RefreshSelectorMixinClass from '@/shared/refresh/refresh-selector.mixin.ts';
import RefreshSelectorMixinVue from '@/shared/refresh/refresh-selector.mixin.vue';
import { RefreshService } from '@/shared/refresh/refresh.service.ts';
import * as config from '@/shared/config/config';
import { BootstrapVue } from 'bootstrap-vue';

const localVue = createLocalVue();
localVue.use(BootstrapVue);
config.initVueApp(localVue);
const store = config.initVueXStore(localVue);

describe('Refresh', () => {
  let refreshSelectorMixin: RefreshSelectorMixinClass;
  let wrapper: Wrapper<RefreshSelectorMixinClass>;

  beforeEach(() => {
    wrapper = shallowMount<RefreshSelectorMixinClass>(RefreshSelectorMixinVue, {
      store,
      localVue,
      provide: {
        refreshService: () => new RefreshService(store)
      }
    });
    refreshSelectorMixin = wrapper.vm;
  });

  it('should be a Vue instance', () => {
    expect(wrapper.isVueInstance()).toBeTruthy();
  });

  it('should refresh manually refresh subject', async () => {
    const spy = jest.spyOn(refreshSelectorMixin, 'manualRefresh');
    refreshSelectorMixin.manualRefresh();
    await refreshSelectorMixin.$nextTick();
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('should set active refresh time', async () => {
    const spy = jest.spyOn(refreshSelectorMixin, 'setActiveRefreshTime');
    const time = 5;
    refreshSelectorMixin.setActiveRefreshTime(time);
    await refreshSelectorMixin.$nextTick();
    expect(spy).toHaveBeenCalled();
    expect(refreshSelectorMixin.activeRefreshTime).toBe(time);

    const wrongTime = -1;
    refreshSelectorMixin.setActiveRefreshTime(wrongTime);
    await refreshSelectorMixin.$nextTick();
    expect(spy).toHaveBeenCalled();
    expect(refreshSelectorMixin.activeRefreshTime).toBe(refreshSelectorMixin.refreshTimes[0]);
    spy.mockRestore();
  });

  it('should init the timer', async () => {
    const spy = jest.spyOn(refreshSelectorMixin, 'subscribe');
    refreshSelectorMixin.activeRefreshTime = 5;
    refreshSelectorMixin.subscribe();
    await refreshSelectorMixin.$nextTick();
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('should launch (or relaunch if true) the timer', async () => {
    const spy = jest.spyOn(refreshSelectorMixin, 'launchTimer');
    refreshSelectorMixin.activeRefreshTime = 5;
    refreshSelectorMixin.subscribe();
    await refreshSelectorMixin.$nextTick();
    const relaunch = true;
    refreshSelectorMixin.launchTimer(relaunch);
    await refreshSelectorMixin.$nextTick();
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('classTime should return the correct class for refresh button', () => {
    refreshSelectorMixin.activeRefreshTime = 5;
    expect(refreshSelectorMixin.classTime()).toBe('fa fa-repeat');

    refreshSelectorMixin.activeRefreshTime = 0;
    expect(refreshSelectorMixin.classTime()).toBe('fa fa-pause');

    refreshSelectorMixin.activeRefreshTime = -1;
    expect(refreshSelectorMixin.classTime()).toBe('fa fa-pause');
  });

  it('should set state of time', () => {
    const time = 5;
    refreshSelectorMixin.activeRefreshTime = time;
    expect(refreshSelectorMixin.stateTime(time)).toBe('active');
  });

  it('should get active refresh time', () => {
    const time = 5;
    refreshSelectorMixin.activeRefreshTime = time;
    expect(refreshSelectorMixin.getActiveRefreshTime()).toBe(String(time) + ' sec.');

    refreshSelectorMixin.activeRefreshTime = 0;
    expect(refreshSelectorMixin.getActiveRefreshTime()).toBe('disabled');

    refreshSelectorMixin.activeRefreshTime = -1;
    expect(refreshSelectorMixin.getActiveRefreshTime()).toBe('disabled');
  });
});
