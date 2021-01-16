import { Route } from '@/shared/routes/routes.service';
import AbstractService from '../abstract.service';
import { Observable } from 'rxjs';
import axios, { AxiosPromise } from 'axios';

export class Cache {
  constructor(public target: string, public name: string, public cacheManager: string) {}
}

export class CacheMetrics {
  constructor(
    public name: string,
    public miss: number,
    public puts: number,
    public hit: number,
    public removals: number,
    public evictions: number,
    public gets: number,
    public hitPercent: number,
    public missPercent: number
  ) {}
}

export default class CachesService extends AbstractService {
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

  public static parseJsonToArrayOfCacheMetrics(data: any): CacheMetrics[] {
    const cachesMetrics: CacheMetrics[] = [];
    Object.keys(data).forEach(cacheName => {
      const metrics = data[cacheName];
      cachesMetrics.push(
        new CacheMetrics(
          cacheName,
          metrics['cache.gets.miss'],
          metrics['cache.puts'],
          metrics['cache.gets.hit'],
          metrics['cache.removals'],
          metrics['cache.evictions'],
          metrics['cache.gets.hit'] + metrics['cache.gets.miss'],
          this.formatNumber2(this.filterNaN((100 * metrics['cache.gets.hit']) / (metrics['cache.gets.hit'] + metrics['cache.gets.miss']))),
          this.formatNumber2(this.filterNaN((100 * metrics['cache.gets.miss']) / (metrics['cache.gets.hit'] + metrics['cache.gets.miss'])))
        )
      );
    });
    return cachesMetrics;
  }

  public static filterNaN(input: any): number {
    if (isNaN(input)) {
      return 0;
    }
    return input;
  }

  public static formatNumber2(value: any): number {
    return Number(parseFloat(value).toFixed(2));
  }

  /** return all caches of a route */
  findAll(route: Route): Observable<Cache[]> {
    return new Observable(observer => {
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
    return new Observable(observer => {
      const url = this.generateUri(route, '/management/jhimetrics/');

      axios
        .get(url)
        .then(res => {
          const metrics: CacheMetrics[] = CachesService.parseJsonToArrayOfCacheMetrics(res.data['cache']);
          observer.next(metrics);
          observer.complete();
        })
        .catch(error => {
          observer.error(error);
        });
    });
  }
}
