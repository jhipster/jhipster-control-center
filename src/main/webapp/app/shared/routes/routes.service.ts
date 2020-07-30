import { Store } from 'vuex';
import { Observable, Subject } from 'rxjs';
import axios from 'axios';

export interface Route {
  path: string;
  predicate: string;
  filters: Array<string>;
  serviceId: string;
  instanceId: string;
  instanceUri: string;
  order: number;
}

export default class RoutesService {
  private store: Store<{}>;

  // Observable sources
  private routeChangedSource = new Subject<Route>();
  private routesChangedSource = new Subject<Route[]>();
  private routeDownSource = new Subject<Route>();
  private routeReloadSource = new Subject<boolean>();
  routeChanged$: Observable<Route>;
  routesChanged$: Observable<Route[]>;
  routeDown$: Observable<Route>;
  routeReload$: Observable<boolean>;

  /** get default route of control center */
  /* istanbul next ignore */
  private static getRouteOfControlCenter(): Route {
    const route = new (class implements Route {
      path: string;
      predicate: string;
      filters: Array<string>;
      serviceId: string;
      instanceId: string;
      instanceUri: string;
      order: number;
    })();
    route.path = '';
    route.predicate = '';
    route.filters = [];
    route.serviceId = 'JHIPSTER-CONTROL-CENTER';
    route.instanceId = 'JHIPSTER-CONTROL-CENTER';
    route.instanceUri = '';
    route.order = 0;
    return route;
  }

  constructor(store: Store<{}>) {
    this.store = store;
    this.routeChanged$ = this.routeChangedSource.asObservable();
    this.routesChanged$ = this.routesChangedSource.asObservable();
    this.routeDown$ = this.routeDownSource.asObservable();
    this.routeReload$ = this.routeReloadSource.asObservable();
  }

  /** Return Spring Cloud Gateway routes */
  public findAllRoutes(): Observable<Route[]> {
    return Observable.create(observer => {
      axios
        .get('management/gateway/routes')
        .then(res => {
          const routes = this.parseJsonArrayOfRoutesToArray(res.data);
          observer.next(routes);
          observer.complete();
        })
        .catch(error => {
          observer.error(error);
        });
    });
  }

  public routeChange(route: Route | undefined): void {
    this.routeChangedSource.next(route);
  }

  public routesChange(routes: Route[]): void {
    this.routesChangedSource.next(routes);
  }

  public reloadRoutes(): void {
    this.routeReloadSource.next(true);
  }

  public routeDown(route: Route | undefined): void {
    this.routeDownSource.next(route);
  }

  public getSelectedRoute(): Route {
    return this.store.getters.route;
  }

  public storeSelectedRoute(route: Route | undefined): void {
    this.store.commit('setRoute', route);
  }

  /** transform json array of routes to an array */
  /* istanbul next ignore */
  private parseJsonArrayOfRoutesToArray(data: any): Array<Route> {
    const routes: Array<Route> = [];
    routes.push(RoutesService.getRouteOfControlCenter());
    data.map(r => {
      if (r.route_id.split('/')[0].toLowerCase() !== 'consul' && r.route_id !== null) {
        const route = new (class implements Route {
          path: string;
          predicate: string;
          filters: Array<string>;
          serviceId: string;
          instanceId: string;
          instanceUri: string;
          order: number;
        })();

        route.path = r.route_id;
        route.predicate = r.predicate;
        route.filters = r.filters;
        route.serviceId = r.route_id.split('/')[0];
        route.instanceId = r.route_id.split('/')[1];
        route.instanceUri = r.uri;
        route.order = r.order;
        routes.push(route);
      }
    });
    return routes;
  }
}
