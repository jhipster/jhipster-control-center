import Vue from 'vue';
import axios, { AxiosPromise } from 'axios';
import { SERVER_API_URL } from '@/constants';

export default class LoginService {
  public openLogin(instance: Vue): void {
    instance.$emit('bv::show::modal', 'login-page');
  }

  // jhcc-custom
  public login(loc = window.location) {
    let port = location.port ? ':' + location.port : '';
    if (port === ':9000') {
      port = ':7419';
    }

    let contextPath = location.pathname;
    if (contextPath.endsWith('accessdenied')) {
      contextPath = contextPath.substring(0, contextPath.indexOf('accessdenied'));
    }
    if (!contextPath.endsWith('/')) {
      contextPath = contextPath + '/';
    }
    // If you have configured multiple OIDC providers, then, you can update this URL to /login.
    // It will show a Spring Security generated login page with links to configured OIDC providers.
    loc.href = `//${loc.hostname}${port}${contextPath}oauth2/authorization/oidc`;
  }

  public logout(): AxiosPromise<any> {
    return axios.post('api/logout');
  }
}
