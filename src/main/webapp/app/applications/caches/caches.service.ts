import { Route } from '@/shared/routes/routes.service';
import AbstractService from '../abstract.service';
import { Observable } from 'rxjs';
import axios, { AxiosPromise } from 'axios';
import { and } from 'vuelidate/lib/validators';

export class Cache {
  constructor(public target: string, public name: string, public cacheManager: string) {}
}

export default class CachesService extends AbstractService {
  /** convert json object to array of cache */
  /* istanbul ignore next */
  private static parseJsonToArrayOfCache(data: any): Cache[] {
    const caches: Cache[] = [];
    Object.keys(data.cacheManagers).map(cacheManagerName => {
      const cacheManager = data.cacheManagers[cacheManagerName];
      Object.keys(cacheManager.caches).map(cacheName => {
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

  /** return a cache by its name from a route */
  findCacheByName(route: Route, cacheName: String, cacheManager: String): Observable<Cache> {
    return Observable.create(observer => {
      const url = this.generateUri(route, `/management/caches/${cacheName}?cacheManager=${cacheManager}`);

      axios.get(url).then(res => {
        const cache: Cache = new Cache(res.data.target, res.data.name, res.data.cacheManagerName);
        observer.next(cache);
        observer.complete();
      });
    });
  }

  /** evict all caches of a route */
  public evictAllCaches(route: Route): AxiosPromise<any> {
    const url = this.generateUri(route, '/management/caches/');
    return axios.delete(url);
  }

  /** evict a cache by its name from a route */
  public evictSelectedCache(route: Route, cacheName: String, cacheManager: String): AxiosPromise<any> {
    const url = this.generateUri(route, `/management/caches/${cacheName}?cacheManager=${cacheManager}`);
    return axios.delete(url);
  }
}
