import axios from 'axios';
import { Route } from '@/shared/routes/routes.service';
import { Observable } from 'rxjs';
import { SERVER_API_URL } from '@/constants';

export type MetricsKey = 'jvm' | 'http.server.requests' | 'cache' | 'services' | 'databases' | 'garbageCollector' | 'processMetrics';
export type Metrics = { [key in MetricsKey]: any };
export type Thread = any;
export type ThreadDump = { threads: Thread[] };

export default class MetricService {
  /** return all metrics of a route */
  findAll(route: Route): Observable<Metrics> {
    return Observable.create(observer => {
      const metricsControlCenter = (SERVER_API_URL !== undefined ? SERVER_API_URL : '') + '/management/jhimetrics/';
      const metricsOfAnInstance = 'gateway/' + route.path + '/management/jhimetrics/';
      const url = route && route.path && route.path.length > 0 ? metricsOfAnInstance : metricsControlCenter;

      axios.get(url).then(res => {
        const metrics: Metrics = res.data;
        observer.next(metrics);
        observer.complete();
      });
    });
  }

  /** return all threaddump of a route */
  findAllThreadDump(route: Route | undefined): Observable<ThreadDump> {
    return Observable.create(observer => {
      const threaddumpControlCenter = (SERVER_API_URL !== undefined ? SERVER_API_URL : '') + '/management/threaddump/';
      const threaddumpOfAnInstance = 'gateway/' + route.path + '/management/threaddump/';
      const url = route && route.path && route.path.length > 0 ? threaddumpOfAnInstance : threaddumpControlCenter;

      axios.get(url).then(res => {
        const threaddump: ThreadDump = res.data;
        observer.next(threaddump);
        observer.complete();
      });
    });
  }
}
