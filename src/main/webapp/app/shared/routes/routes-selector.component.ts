import { Component, Inject, Vue } from 'vue-property-decorator';
import { RefreshService } from '@/shared/refresh/refresh.service';
import RefreshSelectorVue from '@/shared/refresh/refresh-selector.mixin.vue';
import RoutesService, { Route } from './routes.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import Vue2Filters from 'vue2-filters';

@Component({
  components: {
    'refresh-selector': RefreshSelectorVue,
  },
  mixins: [Vue2Filters.mixin],
})
export default class RoutesSelectorComponent extends Vue {
  // htmlActiveRoute allow us to update dynamically route button content html
  htmlActiveRoute = '';
  activeRoute?: Route;
  routes?: Route[] = [];
  savedRoutes?: Route[];
  updatingRoutes = false;
  searchedInstance = '';

  unSubscribe$ = new Subject();

  @Inject('refreshService') private refreshService: () => RefreshService;
  @Inject('routesService') private routesService: () => RoutesService;

  public mounted(): void {
    this.activeRoute = this.routesService().getSelectedRoute();
    this.htmlActiveRoute = this.getActiveRoute();

    this.updateRoute();
    this.refreshService()
      .refreshReload$.pipe(takeUntil(this.unSubscribe$))
      .subscribe(() => this.updateRoute());
    this.routesService()
      .routeReload$.pipe(takeUntil(this.unSubscribe$))
      .subscribe(() => this.updateRoute());
  }

  /** Change active route only if exists, else choose Control Center */
  setActiveRoute(route: Route | null): void {
    if (route && this.routes && this.routes.findIndex(r => r.serviceId === route.serviceId) !== -1) {
      this.activeRoute = route;
    } else if (this.routes && this.routes.length > 0) {
      this.activeRoute = this.routes[0];
    }
    this.routesService().storeSelectedRoute(this.activeRoute);
    this.routesService().routeChange(this.activeRoute);
  }

  public updateRoute(): void {
    this.updatingRoutes = true;
    this.routesService()
      .findAllRoutes()
      .pipe(takeUntil(this.unSubscribe$))
      .subscribe(
        routes => {
          this.savedRoutes = routes;
          this.routes = routes;
          this.searchedInstance = '';

          if (this.activeRoute) {
            /** in case of new refresh call **/
            this.setActiveRoute(this.activeRoute);
          } else if (routes.length > 0) {
            this.setActiveRoute(routes[0]);
          }
          this.updatingRoutes = false;
          this.routesService().routesChange(routes);
        },
        error => {
          if (error.status === 503 || error.status === 500 || error.status === 404) {
            if (error.status === 500 || error.status === 404) {
              this.setActiveRoute(null);
            }
            this.updatingRoutes = false;
          }
        }
      );
  }

  /* istanbul ignore next */
  beforeDestroy(): void {
    /** prevent memory leak when component destroyed **/
    this.unSubscribe$.next();
    this.unSubscribe$.complete();
  }

  getActiveRoute(): string {
    return this.activeRoute!.instanceId.toUpperCase();
  }

  searchByAppName(): void {
    if (this.searchedInstance === '') {
      this.routes = this.savedRoutes;
    } else {
      this.routes = this.savedRoutes!.filter(route => {
        return route.serviceId.toLowerCase().includes(this.searchedInstance.toLowerCase());
      });
    }
  }

  state(route: Route): string {
    if (route && route.serviceId === this.activeRoute!.serviceId) {
      return 'active';
    }
    return '';
  }
}
