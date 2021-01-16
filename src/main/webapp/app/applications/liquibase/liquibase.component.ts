import { Subject } from 'rxjs';
import Vue2Filters from 'vue2-filters';
import { takeUntil } from 'rxjs/operators';
import { Component, Inject } from 'vue-property-decorator';
import AbstractComponent from '@/applications/abstract.component';
import RoutesSelectorVue from '@/shared/routes/routes-selector.vue';
import RoutesService, { Route } from '@/shared/routes/routes.service';
import RefreshSelectorVue from '@/shared/refresh/refresh-selector.mixin.vue';
import LiquibaseService, { ChangeSet } from '@/applications/liquibase/liquibase.service';

@Component({
  components: {
    'refresh-selector': RefreshSelectorVue,
    'routes-selector': RoutesSelectorVue,
  },
  mixins: [Vue2Filters.mixin],
})
export default class JhiLiquibase extends AbstractComponent {
  public routes: Route[];
  public activeRoute: Route;
  public selectedChangeSet: ChangeSet = null;
  public detailModal: any = null;

  public changeSets: ChangeSet[] = [];
  public changeSetsFiltered: ChangeSet[] = [];
  public changeSetsPaginate: ChangeSet[] = [];
  public filtered = '';
  public orderProp = 'name';
  public reverse = false;
  public itemsPerPage = 10;
  public page = 1;
  public previousPage = 1;

  private unsubscribe$ = new Subject();
  @Inject('routesService') private routesService: () => RoutesService;
  @Inject('liquibaseService') private liquibaseService: () => LiquibaseService;

  public mounted(): void {
    this.routesService()
      .routeChanged$.pipe(takeUntil(this.unsubscribe$))
      .subscribe(route => {
        this.activeRoute = route;
        this.refreshActiveRouteLiquibase();
      });

    this.routesService()
      .routesChanged$.pipe(takeUntil(this.unsubscribe$))
      .subscribe(routes => (this.routes = routes));
  }

  public refreshActiveRouteLiquibase(): void {
    this.liquibaseService()
      .findAll(this.activeRoute)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        res => {
          this.changeSets = res;
          this.paginate(this.page);
          this.resetError();
        },
        error => this.setError(error)
      );
  }

  public paginate(page: number): void {
    const changeSetsFilterBy = Vue2Filters.mixin.methods.filterBy(this.changeSets, this.filtered);
    const changeSetsOrderBy = Vue2Filters.mixin.methods.orderBy(changeSetsFilterBy, this.orderProp, this.reverse === true ? 1 : -1);
    this.changeSetsFiltered = changeSetsOrderBy;
    this.changeSetsPaginate = this.changeSetsFiltered.slice((page - 1) * this.itemsPerPage, page * this.itemsPerPage);
  }

  public changeOrder(orderProp): void {
    this.orderProp = orderProp;
    this.reverse = !this.reverse;
  }

  public loadPage(page: number): void {
    if (page !== this.previousPage) {
      this.previousPage = page;
      this.paginate(page);
    }
  }

  public clearPagination(): void {
    this.page = 1;
    this.previousPage = 1;
    this.paginate(this.page);
  }

  public async showDetail(changeSet: ChangeSet): Promise<void> {
    this.selectedChangeSet = changeSet;
    await this.$nextTick();
    this.detailModal = <any>this.$refs.detailModal;
    this.detailModal.show();
  }

  /* istanbul ignore next */
  beforeDestroy(): void {
    // prevent memory leak when component destroyed
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
