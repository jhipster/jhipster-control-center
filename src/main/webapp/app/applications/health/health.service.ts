import axios, { AxiosInstance } from 'axios';
import { Observable } from 'rxjs';
import { SERVER_API_URL } from '@/constants';

interface Route {
  path: string;
  predicate: string;
  filters: Array<string>;
  serviceId: string;
  instanceId: string;
  instanceUri: string;
  order: number;
}

export default class InstanceHealthService {
  public separator: string;
  private axios: AxiosInstance;

  constructor() {
    this.separator = '.';
    this.axios = axios;
  }

  public checkHealth(route: Route): Observable<any> {
    return Observable.create(observer => {
      const healthControlCenter = (SERVER_API_URL !== undefined ? SERVER_API_URL : '') + '/management/health';
      const healthOfAnInstance = 'gateway/' + route.path + '/management/health';
      const url = route && route.path && route.path.length > 0 ? healthOfAnInstance : healthControlCenter;

      axios
        .get(url)
        .then(res => {
          observer.next(res.data);
          observer.complete();
        })
        .catch(err => {
          observer.error(err);
        });
    });
  }

  public transformHealthData(data: any): any {
    const response = [];
    this.flattenHealthData(response, null, data.components);
    return response;
  }

  public getBaseName(name: string): string {
    if (name) {
      const split = name.split('.');
      return split[0];
    }
  }

  public getSubSystemName(name: string): string {
    if (name) {
      const split = name.split('.');
      split.splice(0, 1);
      const remainder = split.join('.');
      return remainder ? ' - ' + remainder : '';
    }
  }

  public addHealthObject(result: any, isLeaf: boolean, healthObject: any, name: string) {
    const healthData = {
      name,
      details: undefined,
      error: undefined
    };

    const details = {};
    let hasDetails = false;

    for (const key in healthObject) {
      if (healthObject.hasOwnProperty(key)) {
        const value = healthObject[key];
        if (key === 'status' || key === 'error') {
          healthData[key] = value;
        } else {
          if (!this.isHealthObject(value)) {
            details[key] = value;
            hasDetails = true;
          }
        }
      }
    }

    // Add the details
    if (hasDetails) {
      healthData.details = details;
    }

    // Only add nodes if they provide additional information
    if (isLeaf || hasDetails || healthData.error) {
      result.push(healthData);
    }
    return healthData;
  }

  public flattenHealthData(result: any, path: any, data: any): any {
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        const value = data[key];
        if (this.isHealthObject(value)) {
          if (this.hasSubSystem(value)) {
            this.addHealthObject(result, false, value, this.getModuleName(path, key));
            this.flattenHealthData(result, this.getModuleName(path, key), value);
          } else {
            this.addHealthObject(result, true, value, this.getModuleName(path, key));
          }
        }
      }
    }
    return result;
  }

  public getModuleName(path: any, name: string) {
    let result;
    if (path && name) {
      result = path + this.separator + name;
    } else if (path) {
      result = path;
    } else if (name) {
      result = name;
    } else {
      result = '';
    }
    return result;
  }

  public hasSubSystem(healthObject: any): any {
    let result = false;

    for (const key in healthObject) {
      if (healthObject.hasOwnProperty(key)) {
        const value = healthObject[key];
        if (value && value.status) {
          result = true;
        }
      }
    }
    return result;
  }

  public isHealthObject(healthObject: any): any {
    let result = false;

    for (const key in healthObject) {
      if (healthObject.hasOwnProperty(key)) {
        if (key === 'status') {
          result = true;
        }
      }
    }
    return result;
  }
}
