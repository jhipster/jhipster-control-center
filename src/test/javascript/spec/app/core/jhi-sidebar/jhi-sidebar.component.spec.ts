import { createLocalVue, shallowMount, Wrapper } from '@vue/test-utils';
import JhiSidebar from '@/core/jhi-sidebar/jhi-sidebar.vue';
import JhiSidebarClass from '@/core/jhi-sidebar/jhi-sidebar.component';
import * as config from '@/shared/config/config';
import router from '@/router';

const localVue = createLocalVue();
config.initVueApp(localVue);
const store = config.initVueXStore(localVue);
localVue.component('b-sidebar', {});
localVue.component('b-nav', {});
localVue.component('b-nav-item', {});

describe('JhiSidebar', () => {
  let jhiSidebar: JhiSidebarClass;
  let wrapper: Wrapper<JhiSidebarClass>;
  const accountService = { hasAnyAuthorityAndCheckAuth: jest.fn() };

  beforeEach(() => {
    wrapper = shallowMount<JhiSidebarClass>(JhiSidebar, {
      store,
      router,
      localVue,
      provide: {
        accountService: () => accountService,
      },
    });
    jhiSidebar = wrapper.vm;
  });

  it('should not have user data set', () => {
    expect(jhiSidebar.swaggerEnabled).toBeFalsy();
  });

  it('should have profile info set after info retrieved', () => {
    store.commit('setActiveProfiles', ['prod', 'swagger']);

    expect(jhiSidebar.swaggerEnabled).toBeTruthy();
  });

  it('should use account service', () => {
    jhiSidebar.hasAnyAuthority('auth');

    expect(accountService.hasAnyAuthorityAndCheckAuth).toHaveBeenCalled();
  });
});
