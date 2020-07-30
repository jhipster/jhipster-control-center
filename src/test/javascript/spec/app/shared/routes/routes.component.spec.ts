import { createLocalVue, Wrapper, shallowMount } from '@vue/test-utils';
import * as config from '@/shared/config/config';
import { BootstrapVue } from 'bootstrap-vue';
import RoutesSelectorVue from '@/shared/routes/routes-selector.vue';
import RoutesSelectorClass from '@/shared/routes/routes-selector.component';
import RoutesService from '@/shared/routes/routes.service';
import { RefreshService } from '@/shared/refresh/refresh.service.ts';
import { Observable } from 'rxjs';
import { jhcc_route, routes, service_test_route } from '../../../fixtures/jhcc.fixtures';

const localVue = createLocalVue();
localVue.use(BootstrapVue);
config.initVueApp(localVue);
const store = config.initVueXStore(localVue);

const routesService = new RoutesService(store);
const refreshService = new RefreshService(store);
routesService.routeChanged$ = new Observable(subscriber => {
  subscriber.next(jhcc_route);
});
routesService.routeReload$ = new Observable(subscriber => {
  subscriber.next();
});
refreshService.refreshReload$ = new Observable(subscriber => {
  subscriber.next();
});

describe('Routes Component', () => {
  let wrapper: Wrapper<RoutesSelectorClass>;
  let routesSelector: RoutesSelectorClass;

  beforeEach(() => {
    wrapper = shallowMount<RoutesSelectorClass>(RoutesSelectorVue, {
      store,
      localVue,
      provide: {
        routesService: () => routesService,
        refreshService: () => refreshService,
      },
    });
    routesSelector = wrapper.vm;
  });

  it('when component is mounted', async () => {
    const subscribeRouteReload = jest.spyOn(routesService.routeReload$, 'subscribe');
    const subscribeRefreshReload = jest.spyOn(refreshService.refreshReload$, 'subscribe');
    const wrapperToTestMounted = shallowMount<RoutesSelectorClass>(RoutesSelectorVue, {
      store,
      localVue,
      provide: {
        routesService: () => routesService,
        refreshService: () => refreshService,
      },
    });
    const routesSelectorToTestMounted = wrapperToTestMounted.vm;
    await routesSelectorToTestMounted.$nextTick();
    expect(routesSelectorToTestMounted.activeRoute).toStrictEqual(jhcc_route);
    expect(subscribeRouteReload).toHaveBeenCalled();
    expect(subscribeRefreshReload).toHaveBeenCalled();
    subscribeRefreshReload.mockRestore();
    subscribeRouteReload.mockRestore();
  });

  it('should update routes', () => {
    const routesChange = jest.spyOn(routesService, 'routesChange');
    const findAllRoutes = jest.spyOn(routesService, 'findAllRoutes').mockReturnValue(
      new Observable(subscriber => {
        subscriber.next(routes);
      })
    );
    routesSelector.updateRoute();
    expect(findAllRoutes).toHaveBeenCalled();
    expect(routesSelector.savedRoutes).toBe(routes);
    expect(routesSelector.routes).toBe(routes);
    expect(routesSelector.searchedInstance).toBe('');
    expect(routesSelector.updatingRoutes).toBeFalsy();
    expect(routesChange).toHaveBeenCalledWith(routes);
    routesChange.mockRestore();
    findAllRoutes.mockRestore();
  });

  it('should reset activeRoute when we call updateRoute with 404 error', () => {
    const setActiveRoute = jest.spyOn(routesSelector, 'setActiveRoute');
    const findAllRoutes = jest.spyOn(routesService, 'findAllRoutes').mockReturnValue(Observable.throw({ status: 404 }));
    routesSelector.updateRoute();
    expect(findAllRoutes).toHaveBeenCalled();
    expect(setActiveRoute).toHaveBeenCalledWith(null);
    expect(routesSelector.updatingRoutes).toBeFalsy();
    setActiveRoute.mockRestore();
    findAllRoutes.mockRestore();
  });

  it('should set active route', () => {
    routesSelector.routes = routes;

    // an active route already exist
    routesSelector.setActiveRoute(service_test_route);
    expect(routesSelector.activeRoute).toEqual(service_test_route);

    // no active route
    routesSelector.setActiveRoute(null);
    expect(routesSelector.activeRoute).toEqual(jhcc_route);
  });

  it('should get active route', () => {
    routesSelector.activeRoute = service_test_route;
    const activeRoute = routesSelector.getActiveRoute();
    expect(activeRoute).toEqual(service_test_route.instanceId.toUpperCase());
  });

  it('should get all routes matches string searchedInstance', () => {
    // searchedInstance is empty
    routesSelector.searchedInstance = '';
    routesSelector.savedRoutes = routes;
    routesSelector.searchByAppName();
    expect(routesSelector.routes).toEqual(routesSelector.savedRoutes);

    // searchedInstance is not empty
    routesSelector.searchedInstance = 'JHIPSTER';
    routesSelector.savedRoutes = routes;
    routesSelector.searchByAppName();
    const expectedRoutes = [jhcc_route];
    expect(routesSelector.routes).toEqual(expectedRoutes);
  });

  it('should set state of active route', () => {
    // route is active
    routesSelector.activeRoute = service_test_route;
    let result = routesSelector.state(service_test_route);
    expect(result).toBe('active');

    // route is not active
    routesSelector.activeRoute = jhcc_route;
    result = routesSelector.state(service_test_route);
    expect(result).toBe('');
  });
});
