import axios from 'axios';
import { Route } from '@/shared/routes/routes.service';
import { Observable } from 'rxjs';
import AbstractService from '@/applications/abstract.service';

export default class LogfileService extends AbstractService {
  public findLogfile(route: Route): Observable<string> {
    return Observable.create(observer => {
      const url = this.generateUri(route, '/management/logfile/');

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
