import axios, { AxiosPromise } from 'axios';
import Vue from 'vue';
import Component from 'vue-class-component';
import { Observable } from 'rxjs';

export interface Instance {
  serviceId: string;
  instanceId: string;
  uri: string;
  host: string;
  port: number;
  secure: boolean;
  metadata: Metadata;
}

export type Metadata = { [key in MetadataKey]?: any };

export type MetadataKey = 'profile' | 'version' | 'git-version' | 'git-commit' | 'git-branch';

@Component
export default class InstanceService extends Vue {
  /** get all instances */
  public findAll(): Observable<Array<Instance>> {
    return Observable.create(observer => {
      axios
        .get('api/services/instances')
        .then(res => {
          // generate instance list from http request
          const applications = this.parseJsonArrayInstancesToArray(res.data);
          observer.next(applications);
          observer.complete();
        })
        .catch(error => {
          observer.error(error);
        });
    });
  }

  /** get all gateway routes of instances */
  public findAllGatewayRoute(): AxiosPromise<any> {
    return axios.get('management/gateway/routes');
  }

  /** get active profiles of an instance */
  public findActiveProfiles(gatewayRoute: string): AxiosPromise<any> {
    return axios.get('gateway/' + String(gatewayRoute) + '/management/info');
  }

  /** convert json array of instances to array of instances */
  parseJsonArrayInstancesToArray(data: any): Array<Instance> {
    const instances: Array<Instance> = [];
    data.map(instance => {
      const inst = new class implements Instance {
        serviceId: string;
        instanceId: string;
        uri: string;
        host: string;
        port: number;
        secure: boolean;
        metadata: Metadata;
      }();
      inst.serviceId = instance.serviceId;
      inst.instanceId = instance.instanceId;
      inst.uri = instance.uri;
      inst.host = instance.host;
      inst.port = instance.port;
      inst.secure = instance.secure;
      inst.metadata = instance.metadata;
      instances.push(inst);
    });
    return instances;
  }
}
