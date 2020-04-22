import { createLocalVue } from '@vue/test-utils';
import * as config from '@/shared/config/config';
import { RefreshService } from '@/shared/refresh/refresh.service';

const localVue = createLocalVue();
const store = config.initVueXStore(localVue);

describe('Refresh service', () => {
  let refreshService: RefreshService;

  it('should init service', () => {
    refreshService = new RefreshService(store);

    expect(store.getters.refreshTime).toBe(0);
  });

  it('should get selected refresh time from store', () => {
    refreshService = new RefreshService(store);
    const time = refreshService.getSelectedRefreshTime();

    expect(time).toBe(0);
  });

  it('should set refresh time in the store', () => {
    refreshService = new RefreshService(store);
    const time = 5;
    refreshService.storeSelectedRefreshTime(time);

    expect(store.getters.refreshTime).toBe(5);
  });
});
