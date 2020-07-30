import { createLocalVue, shallowMount, Wrapper } from '@vue/test-utils';
import * as config from '@/shared/config/config';
import { BootstrapVue } from 'bootstrap-vue';
import RefreshSelectorMixinClass from '@/shared/refresh/refresh-selector.mixin.ts';
import RefreshSelectorMixinVue from '@/shared/refresh/refresh-selector.mixin.vue';
import { RefreshService } from '@/shared/refresh/refresh.service.ts';
import { Observable } from 'rxjs';

const localVue = createLocalVue();
localVue.use(BootstrapVue);
config.initVueApp(localVue);
const store = config.initVueXStore(localVue);

const refreshService = new RefreshService(store);
refreshService.refreshChanged$ = new Observable(subscriber => {
  subscriber.next();
});

describe('Refresh', () => {
  let refreshSelectorMixin: RefreshSelectorMixinClass;
  let wrapper: Wrapper<RefreshSelectorMixinClass>;

  beforeEach(() => {
    wrapper = shallowMount<RefreshSelectorMixinClass>(RefreshSelectorMixinVue, {
      store,
      localVue,
      provide: {
        refreshService: () => refreshService,
      },
    });
    refreshSelectorMixin = wrapper.vm;
  });

  it('when component is mounted', async () => {
    const subscribeRefreshChanged = jest.spyOn(refreshService.refreshChanged$, 'subscribe');
    const wrapperToTestMounted = shallowMount<RefreshSelectorMixinClass>(RefreshSelectorMixinVue, {
      store,
      localVue,
      provide: {
        refreshService: () => refreshService,
      },
    });
    const refreshToTestMounted = wrapperToTestMounted.vm;
    await refreshToTestMounted.$nextTick();

    expect(refreshToTestMounted.activeRefreshTime).toBe(0);
    expect(refreshToTestMounted.htmlActiveRefreshTime).toBe('disabled');
    expect(subscribeRefreshChanged).toHaveBeenCalled();
  });

  it('should refresh manually refresh subject', async () => {
    const spy = jest.spyOn(refreshService, 'refreshReload');
    refreshSelectorMixin.manualRefresh();
    await refreshSelectorMixin.$nextTick();
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('should set active refresh time', async () => {
    const refreshChanged = jest.spyOn(refreshService, 'refreshChanged');
    const storeSelectedRefreshTime = jest.spyOn(refreshService, 'storeSelectedRefreshTime');
    const time = 5;
    refreshSelectorMixin.setActiveRefreshTime(time);
    await refreshSelectorMixin.$nextTick();
    expect(refreshChanged).toHaveBeenCalled();
    expect(storeSelectedRefreshTime).toHaveBeenCalled();
    expect(refreshSelectorMixin.activeRefreshTime).toBe(time);

    const wrongTime = -1;
    refreshSelectorMixin.setActiveRefreshTime(wrongTime);
    await refreshSelectorMixin.$nextTick();
    expect(refreshChanged).toHaveBeenCalled();
    expect(storeSelectedRefreshTime).toHaveBeenCalled();
    expect(refreshSelectorMixin.activeRefreshTime).toBe(refreshSelectorMixin.refreshTimes[0]);
    refreshChanged.mockRestore();
  });

  it('should init the timer', async () => {
    const spy = jest.spyOn(refreshSelectorMixin, 'subscribe');
    refreshSelectorMixin.activeRefreshTime = 5;
    refreshSelectorMixin.subscribe();
    await refreshSelectorMixin.$nextTick();
    expect(refreshSelectorMixin.refreshTimer).not.toBeNull();
    spy.mockRestore();
  });

  it('should launch (or relaunch if true) the timer', async () => {
    refreshSelectorMixin.activeRefreshTime = 5;
    refreshSelectorMixin.subscribe();
    await refreshSelectorMixin.$nextTick();
    const relaunch = true;
    const spy = jest.spyOn(refreshSelectorMixin, 'subscribe');
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
