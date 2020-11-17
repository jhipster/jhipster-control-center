import { Route } from '@/shared/routes/routes.service';
import AbstractService from '../abstract.service';
import { Observable } from 'rxjs';
import axios, { AxiosPromise } from 'axios';

export interface Cache {
  target: string;
  name: string;
  cacheManager: string;
}

export default class CachesService extends AbstractService {
  /** return all caches of a route */
  findAll(route: Route): Observable<any> {
    return Observable.create(observer => {
      const url = this.generateUri(route, '/management/caches/');

      axios
        .get(url)
        .then(res => {
          const caches = res.data;
          observer.next(caches);
          observer.complete();
        })
        .catch(error => {
          observer.error(error);
        });
    });
  }

  /** return a cache by its name from a route */
  findCacheByName(route: Route, cacheName: String): Observable<Cache> {
    // TODO add cacheManager parameter in case of cacheName is not unique
    return Observable.create(observer => {
      const url = this.generateUri(route, '/management/caches/' + cacheName);

      axios.get(url).then(res => {
        const cache: Cache = res.data;
        observer.next(cache);
        observer.complete();
      });
    });
  }

  /** delete all caches of a route */
  public deleteAllCaches(route: Route): AxiosPromise<any> {
    const url = this.generateUri(route, '/management/caches/');
    return axios.delete(url);
  }

  /** delete a cache by its name from a route */
  public deleteSelectedCache(route: Route, cacheName: String): AxiosPromise<any> {
    // TODO add cacheManager parameter in case of cacheName is not unique
    const url = this.generateUri(route, '/management/caches/' + cacheName);
    return axios.delete(url);
  }
}
