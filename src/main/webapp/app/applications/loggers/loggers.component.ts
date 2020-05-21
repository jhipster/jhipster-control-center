import { Component, Vue, Inject } from 'vue-property-decorator';
import Vue2Filters from 'vue2-filters';
import LoggersService, { Level, Log } from './loggers.service';
import RoutesSelectorVue from '@/shared/routes/routes-selector.vue';
import RoutesService, { Route } from '@/shared/routes/routes.service';
import { RefreshService } from '@/shared/refresh/refresh.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  components: {
    'routes-selector': RoutesSelectorVue,
  },
  mixins: [Vue2Filters.mixin],
})
export default class JhiLoggers extends Vue {
  private loggers: Log[] = [];
  public filtered = '';
  public orderProp = 'name';
  public reverse = false;

  activeRoute: Route;
  routes: Route[];
  unsubscribe$ = new Subject();

  @Inject('loggersService') private loggersService: () => LoggersService;
  @Inject('routesService') private routesService: () => RoutesService;
  @Inject('refreshService') private refreshService: () => RefreshService;

  /* istanbul ignore next */
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
    return this.routes!.filter(route => route.serviceId === this.activeRoute!.serviceId);
  }

  refreshActiveRouteLogs(): void {
    /* istanbul ignore next */
    this.loggersService()
      .findAll(this.activeRoute)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(res => (this.loggers = res));
  }

  /* istanbul ignore next */
  beforeDestroy(): void {
    // prevent memory leak when component destroyed
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
