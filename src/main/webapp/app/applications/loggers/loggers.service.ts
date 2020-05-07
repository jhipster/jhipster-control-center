import Vue from 'vue';
import axios from 'axios';
import Component from 'vue-class-component';
import { Route } from '@/shared/routes/routes.service';
import { Observable } from 'rxjs';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { SERVER_API_URL } from '@/constants';

export type Level = 'TRACE' | 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'OFF';

export interface Logger {
  configuredLevel: Level | null;
  effectiveLevel: Level;
}

export interface LoggersResponse {
  levels: Level[];
  loggers: { [key: string]: Logger };
}

export class Log {
  constructor(public name: string, public level: Level) {}
}

@Component
export default class LoggersService extends Vue {
  /** convert json array of loggers to loggersResponse */
  private static parseJsonToArrayOfLog(data: any): Log[] {
    const logs: Log[] = [];
    for (const key of Object.keys(data.loggers)) {
      const log = data.loggers[key];
      logs.push(new Log(key, log.effectiveLevel));
    }
    return logs;
  }

  /** change loggers level */
  public changeLoggersLevel(routes: Route[], name: string, configuredLevel: Level): Observable<{}> {
    const changeLoggersLevelResponses: Observable<{}>[] = [];
    for (let i = 0; i < routes.length; i++) {
      const loggersLevelResponses = Observable.create(observer => {
        const logsControlCenter = SERVER_API_URL + '/management/loggers/' + name;
        const logsOfAnInstance = 'gateway/' + routes[i].path + '/management/loggers/' + name;
        const url = routes[i] && routes[i].path && routes[i].path.length > 0 ? logsOfAnInstance : logsControlCenter;

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
  public findAll(route: Route): Observable<Log[]> {
    return Observable.create(observer => {
      const logsControlCenter = SERVER_API_URL + '/management/loggers';
      const logsOfAnInstance = 'gateway/' + route.path + '/management/loggers';
      const url = route && route.path && route.path.length > 0 ? logsOfAnInstance : logsControlCenter;

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
