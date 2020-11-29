import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import Vue2Filters from 'vue2-filters';
import CachesService, { Cache, CacheMetrics } from './caches.service';
import { Component, Inject } from 'vue-property-decorator';
import AbstractComponent from '@/applications/abstract.component';
import RoutesSelectorVue from '@/shared/routes/routes-selector.vue';
import RoutesService, { Route } from '@/shared/routes/routes.service';
import RefreshSelectorVue from '@/shared/refresh/refresh-selector.mixin.vue';

@Component({
  components: {
    'refresh-selector': RefreshSelectorVue,
    'routes-selector': RoutesSelectorVue,
  },
  mixins: [Vue2Filters.mixin],
})
export default class JhiCaches extends AbstractComponent {
  public activeRoute: Route;
  public routes: Route[];

  /** statistics attributes */
  public cachesMetrics: CacheMetrics[] = [];
  public cachesMetricsFiltered: CacheMetrics[] = [];
  public cachesMetricsPaginate: CacheMetrics[] = [];
  public filteredMetrics = '';
  public orderPropMetrics = 'name';
  public reverseMetrics = false;
  public itemsPerPageMetrics = 5;
  public pageMetrics = 1;
  public previousPageMetrics = 1;

  /** caches list attributes */
  public caches: Cache[] = [];
  public cachesFiltered: Cache[] = [];
  public cachesPaginate: Cache[] = [];
  public filtered = '';
  public orderProp = 'name';
  public reverse = false;
  public itemsPerPage = 5;
  public page = 1;
  public previousPage = 1;

  private unsubscribe$ = new Subject();
  @Inject('cachesService') private cachesService: () => CachesService;
  @Inject('routesService') private routesService: () => RoutesService;

  public mounted(): void {
    this.routesService()
      .routeChanged$.pipe(takeUntil(this.unsubscribe$))
      .subscribe(route => {
        this.activeRoute = route;
        this.refreshActiveRouteCaches();
        this.refreshActiveRouteCachesMetrics();
      });

    this.routesService()
      .routesChanged$.pipe(takeUntil(this.unsubscribe$))
      .subscribe(routes => (this.routes = routes));
  }

  public refreshActiveRouteCaches(): void {
    this.cachesService()
      .findAll(this.activeRoute)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        res => {
          this.caches = res;
          this.paginate(this.page);
          this.resetError();
        },
        error => (this.error = error)
      );
  }

  public refreshActiveRouteCachesMetrics(): void {
    this.cachesService()
      .findAllMetrics(this.activeRoute)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        res => {
          this.cachesMetrics = res;
          this.paginateMetrics(this.pageMetrics);
          this.resetError();
        },
        error => (this.error = error)
      );
  }

  public confirmEviction(cacheName: string, cacheManager: string): void {
    const config = {
      title: 'Please Confirm',
      size: 'md',
      buttonSize: 'md',
      okVariant: 'danger',
      okTitle: 'YES',
      cancelTitle: 'NO',
      bodyClass: 'text-center',
      footerClass: 'p-2',
      hideHeaderClose: false,
      centered: true,
    };
    const message = `Are you sure you want to evict ${cacheManager} : ${cacheName} ?`;
    this.$bvModal
      .msgBoxConfirm(message, config)
      .then(res => {
        if (res) {
          this.evict(cacheName, cacheManager);
        }
      })
      .catch(error => console.warn(error));
  }

  public evict(cacheName: string, cacheManager: string): void {
    this.cachesService()
      .evictSelectedCache(this.activeRoute, cacheName, cacheManager)
      .then(() => {
        return this.$bvToast.toast(`${cacheManager} : ${cacheName} evicted`, {
          title: 'Success',
          variant: 'success',
          solid: true,
          autoHideDelay: 5000,
        });
      })
      .catch(error => {
        return this.$bvToast.toast(`${error}`, {
          title: `Error`,
          variant: 'danger',
          solid: true,
          autoHideDelay: 5000,
        });
      });
  }

  public changeOrder(orderProp): void {
    this.orderProp = orderProp;
    this.reverse = !this.reverse;
  }

  public changeOrderMetrics(orderProp): void {
    this.orderPropMetrics = orderProp;
    this.reverseMetrics = !this.reverseMetrics;
  }

  public loadPage(page: number): void {
    if (page !== this.previousPage) {
      this.previousPage = page;
      this.paginate(page);
    }
  }

  public loadPageMetrics(pageMetrics: number): void {
    if (pageMetrics !== this.previousPageMetrics) {
      this.previousPageMetrics = pageMetrics;
      this.paginateMetrics(pageMetrics);
    }
  }

  public paginate(page: number): void {
    const cachesFilterBy = Vue2Filters.mixin.methods.filterBy(this.caches, this.filtered);
    const cachesOrderBy = Vue2Filters.mixin.methods.orderBy(cachesFilterBy, this.orderProp, this.reverse === true ? 1 : -1);
    this.cachesFiltered = cachesOrderBy;
    this.cachesPaginate = this.cachesFiltered.slice((page - 1) * this.itemsPerPage, page * this.itemsPerPage);
  }

  public paginateMetrics(page: number): void {
    const cachesMetricsFilterBy = Vue2Filters.mixin.methods.filterBy(this.cachesMetrics, this.filteredMetrics);
    const cachesMetricsOrderBy = Vue2Filters.mixin.methods.orderBy(
      cachesMetricsFilterBy,
      this.orderPropMetrics,
      this.reverseMetrics === true ? 1 : -1
    );
    this.cachesMetricsFiltered = cachesMetricsOrderBy;
    this.cachesMetricsPaginate = this.cachesMetricsFiltered.slice(
      (this.pageMetrics - 1) * this.itemsPerPageMetrics,
      this.pageMetrics * this.itemsPerPageMetrics
    );
  }

  public clearPagination(): void {
    this.page = 1;
    this.previousPage = 1;
    this.paginate(this.page);
  }

  public clearPaginationMetrics(): void {
    this.pageMetrics = 1;
    this.previousPageMetrics = 1;
    this.paginateMetrics(this.pageMetrics);
  }

  /* istanbul ignore next */
  beforeDestroy(): void {
    // prevent memory leak when component destroyed
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
