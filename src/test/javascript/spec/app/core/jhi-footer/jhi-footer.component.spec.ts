import { shallowMount, createLocalVue, Wrapper } from '@vue/test-utils';
import JhiFooter from '@/core/jhi-footer/jhi-footer.vue';
import JhiFooterClass from '@/core/jhi-footer/jhi-footer.component';

import * as config from '@/shared/config/config';

const localVue = createLocalVue();

config.initVueApp(localVue);

describe('JhiFooter', () => {
  let jhiFooter: JhiFooterClass;
  let wrapper: Wrapper<JhiFooterClass>;

  beforeEach(() => {
    wrapper = shallowMount<JhiFooterClass>(JhiFooter, {
      localVue
    });
    jhiFooter = wrapper.vm;
  });

  it('should be a Vue instance', async () => {
    expect(wrapper.isVueInstance()).toBeTruthy();
  });
});
