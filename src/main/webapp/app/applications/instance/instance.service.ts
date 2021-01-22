import axios, { AxiosPromise } from 'axios';
import { Observable } from 'rxjs';
import AbstractService from '@/applications/abstract.service';

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

export default class InstanceService extends AbstractService {
  public findAllInstance(): Observable<Array<Instance>> {
    return new Observable(observer => {
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

  public addStaticInstance(serviceId: string, url: string): AxiosPromise<any> {
    return axios.post('api/services/instances', {
      serviceId: serviceId,
      url: url,
    });
  }

  public removeStaticInstance(serviceId: string): AxiosPromise<any> {
    return axios.delete(`api/services/${serviceId}`);
  }

  public findAllGatewayRoute(): AxiosPromise<any> {
    return axios.get('management/gateway/routes');
  }

  public findActiveProfiles(gatewayRoute: string): AxiosPromise<any> {
    return axios.get(`gateway/${String(gatewayRoute)}/management/info`);
  }

  public shutdownInstance({ serviceId, instanceId }): AxiosPromise<any> {
    return axios.post(`/gateway/${serviceId}/${instanceId}/management/shutdown`);
  }

  /** convert json array of instances to array of instances */
  parseJsonArrayInstancesToArray(data: any): Array<Instance> {
    const instances: Array<Instance> = [];
    data.map(instance => {
      const inst = new (class implements Instance {
        serviceId: string;
        instanceId: string;
        uri: string;
        host: string;
        port: number;
        secure: boolean;
        metadata: Metadata;
      })();
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
