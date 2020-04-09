import axios, { AxiosPromise } from 'axios';
import Vue from 'vue';
import Component from 'vue-class-component';

@Component
export default class ApplicationsService extends Vue {
  /** get all applications instances */
  public findAll(): AxiosPromise<any> {
    return axios.get('api/services/instances');
  }

  /** get all gateway routes of applications instances */
  public findAllGatewayRoute(): AxiosPromise<any> {
    return axios.get('management/gateway/routes');
  }

  /** get active profiles of an application instance */
  public findActiveProfiles(gatewayRoute: string): AxiosPromise<any> {
    return axios.get('gateway/' + String(gatewayRoute) + '/management/info');
  }
}
