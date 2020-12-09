import { createLocalVue, shallowMount, Wrapper } from '@vue/test-utils';
import JhiNavbar from '@/core/jhi-navbar/jhi-navbar.vue';
import JhiNavbarClass from '@/core/jhi-navbar/jhi-navbar.component';
import * as config from '@/shared/config/config';
import router from '@/router';
import axios from 'axios';

const localVue = createLocalVue();
config.initVueApp(localVue);
const store = config.initVueXStore(localVue);
localVue.component('font-awesome-icon', {});
localVue.component('b-navbar', {});
localVue.component('b-navbar-nav', {});
localVue.component('b-dropdown-item', {});
localVue.component('b-collapse', {});
localVue.component('b-nav-item', {});
localVue.component('b-nav-item-dropdown', {});
localVue.component('b-navbar-toggle', {});
localVue.component('b-navbar-brand', {});

// jhcc-custom
localVue.directive('bToggle', {});
localVue.component('b-col', {});
localVue.component('b-row', {});
localVue.component('b-button', {});
const mockedAxios: any = axios;
jest.mock('axios', () => ({
  get: jest.fn(),
}));

describe('JhiNavbar', () => {
  let jhiNavbar: JhiNavbarClass;
  let wrapper: Wrapper<JhiNavbarClass>;
  const loginService = { openLogin: jest.fn(), login: jest.fn() };
  const accountService = { hasAnyAuthorityAndCheckAuth: jest.fn().mockImplementation(() => Promise.resolve(true)) };

  beforeEach(() => {
    wrapper = shallowMount<JhiNavbarClass>(JhiNavbar, {
      store,
      router,
      localVue,
      provide: {
        loginService: () => loginService,
        accountService: () => accountService,
      },
    });
    jhiNavbar = wrapper.vm;
  });

  it('should not have user data set', () => {
    expect(jhiNavbar.authenticated).toBeFalsy();
    expect(jhiNavbar.openAPIEnabled).toBeFalsy();
    expect(jhiNavbar.inProduction).toBeFalsy();
  });

  it('should have user data set after authentication', () => {
    store.commit('authenticated', { login: 'test' });

    expect(jhiNavbar.authenticated).toBeTruthy();
  });

  it('should have profile info set after info retrieved', () => {
    store.commit('setActiveProfiles', ['prod', 'api-docs']);

    expect(jhiNavbar.openAPIEnabled).toBeTruthy();
    expect(jhiNavbar.inProduction).toBeTruthy();
  });

  // jhcc-custom
  it('should use login service', async () => {
    const profileInfo = {
      'display-ribbon-on-profiles': 'dev',
      activeProfiles: ['dev', 'api-docs', 'consul'],
    };
    mockedAxios.get.mockReturnValue(Promise.resolve({ data: profileInfo }));
    const spy = jest.spyOn(jhiNavbar, 'openLogin');

    jhiNavbar.openLogin();
    await jhiNavbar.$nextTick();

    expect(spy).toHaveBeenCalled();
  });

  it('should use account service', () => {
    jhiNavbar.hasAnyAuthority('auth');

    expect(accountService.hasAnyAuthorityAndCheckAuth).toHaveBeenCalled();
  });

  // jhcc-custom
  it('logout should clear credentials', async () => {
    const profileInfo = {
      'display-ribbon-on-profiles': 'dev',
      activeProfiles: ['dev', 'api-docs', 'consul'],
    };
    const spy = jest.spyOn(jhiNavbar, 'logout');
    store.commit('authenticated', { login: 'test' });

    jhiNavbar.logout();
    await jhiNavbar.$nextTick;

    expect(spy).toHaveBeenCalled();
    expect(jhiNavbar.authenticated).toBeFalsy();
  });

  it('should determine active route', () => {
    router.push('/toto');

    expect(jhiNavbar.subIsActive('/titi')).toBeFalsy();
    expect(jhiNavbar.subIsActive('/toto')).toBeTruthy();
    expect(jhiNavbar.subIsActive(['/toto', 'toto'])).toBeTruthy();
  });
});
