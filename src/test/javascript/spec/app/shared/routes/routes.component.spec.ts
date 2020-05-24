import { createLocalVue, Wrapper, shallowMount } from '@vue/test-utils';
import RoutesSelectorVue from '@/shared/routes/routes-selector.vue';
import RoutesSelectorClass from '@/shared/routes/routes-selector.component';
import RoutesService, { Route } from '@/shared/routes/routes.service';
import * as config from '@/shared/config/config';
import { RefreshService } from '@/shared/refresh/refresh.service.ts';
import { BootstrapVue } from 'bootstrap-vue';

const localVue = createLocalVue();
localVue.use(BootstrapVue);
config.initVueApp(localVue);
const store = config.initVueXStore(localVue);

const jhcc_route = {
  path: '',
  predicate: '',
  filters: [],
  serviceId: 'JHIPSTER-CONTROL-CENTER',
  instanceId: 'JHIPSTER-CONTROL-CENTER',
  instanceUri: '',
  order: 0
} as Route;

const service_test_route = {
  path: 'service-test/service-test:number',
  predicate: '',
  filters: [],
  serviceId: 'service-test',
  instanceId: 'service-test-instance',
  instanceUri: '',
  order: 0
} as Route;

const routes: Route[] = [jhcc_route, service_test_route];

describe('Routes Component', () => {
  let wrapper: Wrapper<RoutesSelectorClass>;
  let routesSelectorComponent: RoutesSelectorClass;

  beforeEach(() => {
    wrapper = shallowMount<RoutesSelectorClass>(RoutesSelectorVue, {
      store,
      localVue,
      provide: {
        routesService: () => new RoutesService(store),
        refreshService: () => new RefreshService(store)
      }
    });
    routesSelectorComponent = wrapper.vm;
  });

  it('should set active route', () => {
    routesSelectorComponent.routes = routes;

    // an active route already exist
    routesSelectorComponent.setActiveRoute(service_test_route);
    expect(routesSelectorComponent.activeRoute).toEqual(service_test_route);

    // no active route
    routesSelectorComponent.setActiveRoute(null);
    expect(routesSelectorComponent.activeRoute).toEqual(jhcc_route);
  });

  it('should get active route', () => {
    routesSelectorComponent.activeRoute = service_test_route;
    const activeRoute = routesSelectorComponent.getActiveRoute();
    expect(activeRoute).toEqual(service_test_route.instanceId.toUpperCase());
  });

  it('should get all routes matches string searchedInstance', () => {
    // searchedInstance is empty
    routesSelectorComponent.searchedInstance = '';
    routesSelectorComponent.savedRoutes = routes;
    routesSelectorComponent.searchByAppName();
    expect(routesSelectorComponent.routes).toEqual(routesSelectorComponent.savedRoutes);

    // searchedInstance is not empty
    routesSelectorComponent.searchedInstance = 'JHIPSTER';
    routesSelectorComponent.savedRoutes = routes;
    routesSelectorComponent.searchByAppName();
    const expectedRoutes = [jhcc_route];
    expect(routesSelectorComponent.routes).toEqual(expectedRoutes);
  });

  it('should set state of active route', () => {
    // route is active
    routesSelectorComponent.activeRoute = service_test_route;
    let result = routesSelectorComponent.state(service_test_route);
    expect(result).toBe('active');

    // route is not active
    routesSelectorComponent.activeRoute = jhcc_route;
    result = routesSelectorComponent.state(service_test_route);
    expect(result).toBe('');
  });
});
