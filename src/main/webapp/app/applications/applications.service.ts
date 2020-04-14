import axios, { AxiosPromise } from 'axios';
import Vue from 'vue';
import Component from 'vue-class-component';
import { Observable } from 'rxjs';

export interface Application {
  constructor: Function;
  serviceId: string;
  instance: Instance;
}

export type Instance = { [key in InstanceKey]?: any };

export type InstanceKey = 'instanceId' | 'uri' | 'serviceId' | 'port' | 'secure' | 'metadata';

@Component
export default class ApplicationsService extends Vue {
  /** get all applications instances */
  public findAll(): Observable<Array<Application>> {
    return Observable.create(observer => {
      axios
        .get('api/services/instances')
        .then(res => {
          // generate application list from http request
          const applications = this.parseJsonArrayApplicationsToArray(res.data);
          observer.next(applications);
          observer.complete();
        })
        .catch(error => {
          observer.error(error);
        });
    });
  }

  /** get all gateway routes of applications instances */
  public findAllGatewayRoute(): AxiosPromise<any> {
    return axios.get('management/gateway/routes');
  }

  /** get active profiles of an application instance */
  public findActiveProfiles(gatewayRoute: string): AxiosPromise<any> {
    return axios.get('gateway/' + String(gatewayRoute) + '/management/info');
  }

  /** convert json array of applications to array of applications */
  parseJsonArrayApplicationsToArray(data: any): Array<Application> {
    const applications: Array<Application> = [];
    data.map(application => {
      const app = new class implements Application {
        serviceId: string;
        instance: Instance;
      }();
      app.serviceId = application.serviceId;
      app.instance = application;
      applications.push(app);
    });
    return applications;
  }
}
