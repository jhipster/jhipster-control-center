import axios from 'axios';
import { Route } from '@/shared/routes/routes.service';
import { Observable } from 'rxjs';
import AbstractService from '@/applications/abstract.service';

export type MetricsKey = 'jvm' | 'http.server.requests' | 'cache' | 'services' | 'databases' | 'garbageCollector' | 'processMetrics';
export type Metrics = { [key in MetricsKey]: any };
export type Thread = any;
export type ThreadDump = { threads: Thread[] };

export default class MetricService extends AbstractService {
  /** return all metrics of a route */
  findAll(route: Route): Observable<Metrics> {
    return new Observable(observer => {
      const url = this.generateUri(route, '/management/jhimetrics/');

      axios
        .get(url)
        .then(res => {
          const metrics: Metrics = res.data;
          observer.next(metrics);
          observer.complete();
        })
        .catch(error => {
          observer.error(error);
        });
    });
  }

  /** return all threadDump of a route */
  findAllThreadDump(route: Route | undefined): Observable<ThreadDump> {
    return new Observable(observer => {
      const url = this.generateUri(route, '/management/threaddump/');

      axios.get(url).then(res => {
        const threadDump: ThreadDump = res.data;
        observer.next(threadDump);
        observer.complete();
      });
    });
  }
}
