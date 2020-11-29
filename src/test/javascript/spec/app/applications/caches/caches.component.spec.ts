import axios from 'axios';
import { Observable } from 'rxjs';
import { BootstrapVue } from 'bootstrap-vue';
import * as config from '@/shared/config/config';
import CachesVue from '@/applications/caches/caches.vue';
import RoutesService from '@/shared/routes/routes.service';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import CachesService from '@/applications/caches/caches.service';
import { RefreshService } from '@/shared/refresh/refresh.service';
import CachesComponent from '@/applications/caches/caches.component';
import { shallowMount, createLocalVue, Wrapper } from '@vue/test-utils';
import { jhcc_caches, jhcc_caches_json, jhcc_metrics, jhcc_metrics_caches, jhcc_route, routes } from '../../../fixtures/jhcc.fixtures';

const localVue = createLocalVue();
localVue.component('font-awesome-icon', FontAwesomeIcon);
localVue.use(BootstrapVue);
config.initVueApp(localVue);
const store = config.initVueXStore(localVue);

const cachesService = new CachesService();
const refreshService = new RefreshService(store);
const routesService = new RoutesService(store);
routesService.routeChanged$ = new Observable(subscriber => {
  subscriber.next(jhcc_route);
});
routesService.routesChanged$ = new Observable(subscriber => {
  subscriber.next(routes);
});

const mockedAxios: any = axios;
jest.mock('axios', () => ({
  get: jest.fn(),
  delete: jest.fn(),
}));

describe('Caches Component', () => {
  let wrapper: Wrapper<CachesComponent>;
  let cachesComponent: CachesComponent;

  beforeEach(() => {
    mockedAxios.get.mockReturnValue(Promise.resolve({}));
    wrapper = shallowMount<CachesComponent>(CachesVue, {
      store,
      localVue,
      provide: {
        cachesService: () => cachesService,
        routesService: () => routesService,
        refreshService: () => refreshService,
      },
    });
    cachesComponent = wrapper.vm;
  });

  it('when component is mounted', async () => {
    mockedAxios.get.mockReturnValueOnce(Promise.resolve({ data: jhcc_caches_json }));
    mockedAxios.get.mockReturnValueOnce(Promise.resolve({ data: jhcc_metrics }));
    const subscribeRouteChanged = jest.spyOn(routesService.routeChanged$, 'subscribe');
    const subscribeRoutesChanged = jest.spyOn(routesService.routesChanged$, 'subscribe');
    const wrapperToTestMounted = shallowMount<CachesComponent>(CachesVue, {
      store,
      localVue,
      provide: {
        cachesService: () => cachesService,
        routesService: () => routesService,
        refreshService: () => refreshService,
      },
    });
    const cachesToTestMounted = wrapperToTestMounted.vm;
    await cachesToTestMounted.$nextTick();
    expect(subscribeRouteChanged).toHaveBeenCalled();
    expect(subscribeRoutesChanged).toHaveBeenCalled();
    expect(cachesToTestMounted.activeRoute).toBe(jhcc_route);
    expect(mockedAxios.get).toHaveBeenCalledWith('/management/caches/');
    expect(mockedAxios.get).toHaveBeenCalledWith('/management/jhimetrics/');
    expect(cachesToTestMounted.cachesMetrics).toEqual(jhcc_metrics_caches);
    expect(cachesToTestMounted.caches).toEqual(jhcc_caches);
  });

  describe('should evict the selected cache', () => {
    it('should call confirmShutdown', async () => {
      mockedAxios.delete.mockReturnValue(Promise.resolve({}));
      const cacheName = 'usersByLogin';
      const cacheManager = 'org.redisson.jcache.JCache';
      const spy = jest.spyOn(cachesComponent, 'confirmEviction');
      const evict = jest.spyOn(cachesComponent, 'evict');
      jest.spyOn(cachesComponent.$bvModal, 'msgBoxConfirm').mockImplementation(() => Promise.resolve({}));
      cachesComponent.routes = routes;
      cachesComponent.activeRoute = jhcc_route;

      cachesComponent.confirmEviction(cacheName, cacheManager);
      await cachesComponent.$nextTick();

      expect(spy).toBeCalledWith(cacheName, cacheManager);
      expect(evict).toBeCalledWith(cacheName, cacheManager);
      spy.mockRestore();
    });

    it('should fire a delete request ', async () => {
      mockedAxios.delete.mockReturnValue(Promise.resolve({}));
      const cacheName = 'usersByLogin';
      const cacheManager = 'org.redisson.jcache.JCache';
      cachesComponent.routes = routes;
      cachesComponent.activeRoute = jhcc_route;

      cachesComponent.evict(cacheName, cacheManager);
      await cachesComponent.$nextTick();

      expect(mockedAxios.delete).toHaveBeenCalledWith(`/management/caches/${cacheName}?cacheManager=${cacheManager}`);
    });
  });

  it('should change order and invert reverse', () => {
    cachesComponent.changeOrder('test-order');
    expect(cachesComponent.orderProp).toEqual('test-order');
    expect(cachesComponent.reverse).toBe(true);
  });

  it('should change order statistics and invert reverse', () => {
    cachesComponent.changeOrderMetrics('test-order');
    expect(cachesComponent.orderPropMetrics).toEqual('test-order');
    expect(cachesComponent.reverseMetrics).toBe(true);
  });

  it('should load page if we change page from pagination caches list', () => {
    cachesComponent.page = 1;
    cachesComponent.previousPage = 1;
    const paginate = jest.spyOn(cachesComponent, 'paginate');

    cachesComponent.loadPage(2);

    expect(cachesComponent.previousPage).toEqual(2);
    expect(paginate).toHaveBeenCalledWith(2);
  });

  it('should load page if we change page from pagination statistics', () => {
    cachesComponent.pageMetrics = 1;
    cachesComponent.previousPageMetrics = 1;
    const paginateMetrics = jest.spyOn(cachesComponent, 'paginateMetrics');

    cachesComponent.loadPageMetrics(2);

    expect(cachesComponent.previousPageMetrics).toEqual(2);
    expect(paginateMetrics).toHaveBeenCalledWith(2);
  });

  it('should clear pagination and go to first page of pagination caches list', () => {
    cachesComponent.page = 3;
    const paginate = jest.spyOn(cachesComponent, 'paginate');

    cachesComponent.clearPagination();

    expect(cachesComponent.page).toEqual(1);
    expect(cachesComponent.previousPage).toEqual(1);
    expect(paginate).toHaveBeenCalledWith(1);
  });

  it('should clear pagination and go to first page of pagination statistics', () => {
    cachesComponent.pageMetrics = 3;
    const paginateMetrics = jest.spyOn(cachesComponent, 'paginateMetrics');

    cachesComponent.clearPaginationMetrics();

    expect(cachesComponent.pageMetrics).toEqual(1);
    expect(cachesComponent.previousPageMetrics).toEqual(1);
    expect(paginateMetrics).toHaveBeenCalledWith(1);
  });

  it('should return 0 if a variable is NaN', () => {
    cachesComponent.activeRoute = jhcc_route;
    expect(CachesService.filterNaN(1)).toBe(1);
    expect(CachesService.filterNaN('test')).toBe(0);
  });
});
