import { createLocalVue, shallowMount, Wrapper } from '@vue/test-utils';
import Home from '@/core/home/home.vue';
import HomeClass from '@/core/home/home.component';
import * as config from '@/shared/config/config';
import axios from 'axios';

const localVue = createLocalVue();
config.initVueApp(localVue);
const store = config.initVueXStore(localVue);
localVue.component('router-link', {});

// jhcc-custom
const mockedAxios: any = axios;
jest.mock('axios', () => ({
  get: jest.fn(),
}));

describe('Home', () => {
  let home: HomeClass;
  let wrapper: Wrapper<HomeClass>;
  const loginService = { openLogin: jest.fn(), login: jest.fn() };

  beforeEach(() => {
    wrapper = shallowMount<HomeClass>(Home, {
      store,
      localVue,
      provide: {
        loginService: () => loginService,
      },
    });
    home = wrapper.vm;
  });

  it('should not have user data set', () => {
    expect(home.authenticated).toBeFalsy();
    expect(home.username).toBe('');
  });

  it('should have user data set after authentication', () => {
    store.commit('authenticated', { login: 'test' });

    expect(home.authenticated).toBeTruthy();
    expect(home.username).toBe('test');
  });

  // jhcc-custom
  it('should use login service', async () => {
    const profileInfo = {
      'display-ribbon-on-profiles': 'dev',
      activeProfiles: ['dev', 'api-docs', 'consul'],
    };
    mockedAxios.get.mockReturnValue(Promise.resolve({ data: profileInfo }));
    const spy = jest.spyOn(home, 'openLogin');

    home.openLogin();
    await home.$nextTick();

    expect(spy).toHaveBeenCalled();
  });
});
