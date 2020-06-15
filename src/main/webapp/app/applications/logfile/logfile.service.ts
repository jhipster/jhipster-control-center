import Vue from 'vue';
import axios from 'axios';
import Component from 'vue-class-component';
import { Route } from '@/shared/routes/routes.service';
import { Observable } from 'rxjs';
import { SERVER_API_URL } from '@/constants';

export default class LogfileService {
  /** return logfile of a route */
  public find(route: Route): Observable<string> {
    return Observable.create(observer => {
      const logfileControlCenter = (SERVER_API_URL !== undefined ? SERVER_API_URL : '') + '/management/logfile';
      const logfileOfAnInstance = 'gateway/' + route.path + '/management/logfile';
      const url = route && route.path && route.path.length > 0 ? logfileOfAnInstance : logfileControlCenter;

      axios
        .get(url)
        .then(res => {
          observer.next(res.data);
          observer.complete();
        })
        .catch(error => {
          observer.error(error);
        });
    });
  }
}
