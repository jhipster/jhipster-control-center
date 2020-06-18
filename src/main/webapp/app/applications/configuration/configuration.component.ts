import { Component, Vue, Inject } from 'vue-property-decorator';
import Vue2Filters from 'vue2-filters';
import RoutesSelectorVue from '@/shared/routes/routes-selector.vue';
import RoutesService, { Route } from '@/shared/routes/routes.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import ConfigurationService, { Bean, PropertySource } from './configuration.service';

@Component({
  components: {
    'routes-selector': RoutesSelectorVue,
  },
  mixins: [Vue2Filters.mixin],
})
export default class JhiConfiguration extends Vue {
  allBeans: Bean[] = [];
  beans: Bean[] = [];
  propertySources: PropertySource[] = [];

  beansFilter = '';
  beansAscending = true;
  orderProp = 'name';

  activeRoute: Route;
  routes: Route[];
  unsubscribe$ = new Subject();

  @Inject('instanceConfigurationService') private instanceConfigurationService: () => ConfigurationService;
  @Inject('routesService') private routesService: () => RoutesService;

  /* istanbul ignore next */
  public mounted(): void {
    this.routesService()
      .routeChanged$.pipe(takeUntil(this.unsubscribe$))
      .subscribe(route => {
        this.activeRoute = route;
        this.refreshActiveRouteBeans();
      });

    this.routesService()
      .routesChanged$.pipe(takeUntil(this.unsubscribe$))
      .subscribe(routes => (this.routes = routes));
  }

  /** get beans and properties of active route */
  refreshActiveRouteBeans(): void {
    if (this.activeRoute) {
      /* istanbul ignore next */
      this.instanceConfigurationService()
        .findBeans(this.activeRoute)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe(
          beans => {
            this.allBeans = beans;
            this.filterAndSortBeans();
          },
          () => {
            this.routesService().routeDown(this.activeRoute);
          }
        );

      /* istanbul ignore next */
      this.instanceConfigurationService()
        .findPropertySources(this.activeRoute)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe(propertySources => (this.propertySources = propertySources));
    } else {
      this.routesService().routeDown(this.activeRoute);
    }
  }

  filterAndSortBeans(): void {
    /* istanbul ignore next */
    this.beans = this.allBeans
      .filter(bean => !this.beansFilter || bean.prefix.toLowerCase().includes(this.beansFilter.toLowerCase()))
      .sort((a, b) => (a.prefix < b.prefix ? (this.beansAscending ? -1 : 1) : this.beansAscending ? 1 : -1));
  }

  public changeOrder(prop): void {
    this.orderProp = prop;
    this.beansAscending = !this.beansAscending;
  }

  /* istanbul ignore next */
  beforeDestroy(): void {
    // prevent memory leak when component destroyed
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
