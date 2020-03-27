import { shallowMount, createLocalVue, Wrapper } from '@vue/test-utils';
import JhiDocs from '@/admin/docs/docs.vue';
import JhiDocsClass from '@/admin/docs/docs.component';

import * as config from '@/shared/config/config';

const localVue = createLocalVue();

config.initVueApp(localVue);

describe('JhiDocs', () => {
  let jhiDocs: JhiDocsClass;
  let wrapper: Wrapper<JhiDocsClass>;

  beforeEach(() => {
    wrapper = shallowMount<JhiDocsClass>(JhiDocs, {
      localVue
    });
    jhiDocs = wrapper.vm;
  });

  it('should be a Vue instance', async () => {
    expect(wrapper.isVueInstance()).toBeTruthy();
  });
});
