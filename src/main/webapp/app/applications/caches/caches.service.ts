import { Route } from '@/shared/routes/routes.service';
import AbstractService from '../abstract.service';
import { Observable } from 'rxjs';
import axios, { AxiosPromise } from 'axios';

export class Cache {
  constructor(public target: string, public name: string, public cacheManager: string) {}
}

export default class CachesService extends AbstractService {
  /** convert json object to array of cache */
  public static parseJsonToArrayOfCache(data: any): Cache[] {
    const caches: Cache[] = [];
    Object.keys(data.cacheManagers).forEach(cacheManagerName => {
      const cacheManager = data.cacheManagers[cacheManagerName];
      Object.keys(cacheManager.caches).forEach(cacheName => {
        const cache = cacheManager.caches[cacheName];
        caches.push(new Cache(cache.target, cacheName, cacheManagerName));
      });
    });
    return caches;
  }

  /** return all caches of a route */
  findAll(route: Route): Observable<Cache[]> {
    return Observable.create(observer => {
      const url = this.generateUri(route, '/management/caches/');

      axios
        .get(url)
        .then(res => {
          const caches: Cache[] = CachesService.parseJsonToArrayOfCache(res.data);
          observer.next(caches);
          observer.complete();
        })
        .catch(error => {
          observer.error(error);
        });
    });
  }

  /** evict a cache by its name from a route */
  public evictSelectedCache(route: Route, cacheName: string, cacheManager: string): AxiosPromise<any> {
    const url = this.generateUri(route, `/management/caches/${cacheName}?cacheManager=${cacheManager}`);
    return axios.delete(url);
  }

  /** return all caches metrics of a route */
  findAllMetrics(route: Route): Observable<any> {
    return Observable.create(observer => {
      const url = this.generateUri(route, '/management/jhimetrics/');

      axios
        .get(url)
        .then(res => {
          const metrics: any = res.data['cache'];
          observer.next(metrics);
          observer.complete();
        })
        .catch(error => {
          observer.error(error);
        });
    });
  }
}
