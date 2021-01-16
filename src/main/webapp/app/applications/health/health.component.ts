import JhiHealthModal from './health-modal.vue';
import { Component, Inject } from 'vue-property-decorator';
import RoutesSelectorVue from '@/shared/routes/routes-selector.vue';
import RoutesService, { Route } from '@/shared/routes/routes.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import InstanceHealthService from './health.service';
import AbstractComponent from '@/applications/abstract.component';

@Component({
  components: {
    'health-modal': JhiHealthModal,
    'routes-selector': RoutesSelectorVue,
  },
})
export default class JhiInstanceHealth extends AbstractComponent {
  public healthData: any = null;
  public currentHealth: any = null;

  activeRoute: Route;
  routes: Route[];
  unsubscribe$ = new Subject();

  @Inject('instanceHealthService') private instanceHealthService: () => InstanceHealthService;
  @Inject('routesService') private routesService: () => RoutesService;

  public mounted(): void {
    this.routesService()
      .routeChanged$.pipe(takeUntil(this.unsubscribe$))
      .subscribe(route => {
        this.activeRoute = route;
        this.refreshActiveRouteHealth();
      });

    this.routesService()
      .routesChanged$.pipe(takeUntil(this.unsubscribe$))
      .subscribe(routes => (this.routes = routes));
  }

  public refreshActiveRouteHealth(): void {
    this.instanceHealthService()
      .checkHealth(this.activeRoute)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        health => {
          this.healthData = this.instanceHealthService().transformHealthData(health);
          this.resetError();
        },
        error => this.setError(error)
      );
  }

  public baseName(name: any): any {
    return this.instanceHealthService().getBaseName(name);
  }

  public getBadgeClass(statusState: any): string {
    if (statusState === 'UP') {
      return 'badge-success';
    } else {
      return 'badge-danger';
    }
  }

  public showHealth(health: any): void {
    this.currentHealth = health;
    (<any>this.$refs.healthModal).show();
  }

  public subSystemName(name: string): string {
    return this.instanceHealthService().getSubSystemName(name);
  }

  /* istanbul ignore next */
  beforeDestroy(): void {
    // prevent memory leak when component destroyed
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
