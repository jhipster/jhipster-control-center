import axios from 'axios';
import { Route } from '@/shared/routes/routes.service';
import { Observable } from 'rxjs';
import { forkJoin } from 'rxjs/observable/forkJoin';
import AbstractService from '@/applications/abstract.service';

export type Level = 'TRACE' | 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'OFF';

export interface Logger {
  configuredLevel: Level | null;
  effectiveLevel: Level;
}

export class Log {
  constructor(public name: string, public level: Level) {}
}

export default class LoggersService extends AbstractService {
  /** convert json array of loggers to loggersResponse */
  /* istanbul ignore next */
  private static parseJsonToArrayOfLog(data: any): Log[] {
    const logs: Log[] = [];
    for (const key of Object.keys(data.loggers)) {
      const log = data.loggers[key];
      logs.push(new Log(key, log.effectiveLevel));
    }
    return logs;
  }

  public changeLoggersLevel(routes: Route[], name: string, configuredLevel: Level): Observable<{}> {
    const changeLoggersLevelResponses: Observable<{}>[] = [];
    for (let i = 0; i < routes.length; i++) {
      const loggersLevelResponses = Observable.create(observer => {
        const url = this.generateUri(routes[i], '/management/loggers/', name);

        axios
          .post(url, { configuredLevel })
          .then(observer.complete())
          .catch(error => {
            observer.error(error);
          });
      });
      changeLoggersLevelResponses.push(loggersLevelResponses);
    }
    return forkJoin(changeLoggersLevelResponses);
  }

  /** return all log of a route */
  public findAllLoggers(route: Route): Observable<Log[]> {
    return Observable.create(observer => {
      const url = this.generateUri(route, '/management/loggers/');

      axios
        .get(url)
        .then(res => {
          const logs = LoggersService.parseJsonToArrayOfLog(res.data);
          observer.next(logs);
          observer.complete();
        })
        .catch(error => {
          observer.error(error);
        });
    });
  }
}
