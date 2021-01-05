import { Component, Inject } from 'vue-property-decorator';
import Vue2Filters from 'vue2-filters';
import LoggersService, { Level, Log } from './loggers.service';
import RoutesSelectorVue from '@/shared/routes/routes-selector.vue';
import RoutesService, { Route } from '@/shared/routes/routes.service';
import { RefreshService } from '@/shared/refresh/refresh.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import AbstractComponent from '@/applications/abstract.component';

@Component({
  components: {
    'routes-selector': RoutesSelectorVue,
  },
  mixins: [Vue2Filters.mixin],
})
export default class JhiLoggers extends AbstractComponent {
  public loggers: Log[] = [];
  public filtered = '';
  public orderProp = 'name';
  public reverse = false;

  activeRoute: Route;
  routes: Route[];
  unsubscribe$ = new Subject();

  @Inject('loggersService') private loggersService: () => LoggersService;
  @Inject('routesService') private routesService: () => RoutesService;
  @Inject('refreshService') private refreshService: () => RefreshService;

  public mounted(): void {
    this.routesService()
      .routeChanged$.pipe(takeUntil(this.unsubscribe$))
      .subscribe(route => {
        this.activeRoute = route;
        this.refreshActiveRouteLogs();
      });

    this.routesService()
      .routesChanged$.pipe(takeUntil(this.unsubscribe$))
      .subscribe(routes => (this.routes = routes));
  }

  public changeOrder(orderProp): void {
    this.orderProp = orderProp;
    this.reverse = !this.reverse;
  }

  changeLevel(name: string, level: Level): void {
    this.loggersService()
      .changeLoggersLevel(this.searchByAppName(), name, level)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => this.refreshActiveRouteLogs());
    this.refreshService().refreshReload();
  }

  searchByAppName(): Route[] {
    return this.routes?.filter(route => route.serviceId === this.activeRoute?.serviceId);
  }

  refreshActiveRouteLogs(): void {
    this.loggersService()
      .findAllLoggers(this.activeRoute)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        res => {
          this.loggers = res;
          this.resetError();
        },
        error => this.setError(error)
      );
  }

  /* istanbul ignore next */
  beforeDestroy(): void {
    // prevent memory leak when component destroyed
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
