import { Vue, Component } from 'vue-property-decorator';
import { RequestError } from '@/shared/model/request.error.model';

@Component({
  template: '<div></div>',
})
export default class AbstractComponent extends Vue {
  private internalError: RequestError = null;

  renderErrorMessage(): string {
    return (
      '<div class="alert alert-info col-md-10">' +
      `<p><strong>Unable to reach this endpoint for instance at the path: ${this.internalError.path}</strong></p>` +
      '<p>Please, be sure:</p>' +
      '<ul>' +
      '<li>the application is available</li>' +
      '<br>' +
      '<li>the application has the same base64-secret as the JHipster Control Center base64-secret' +
      '<br><i>see property <code>jhipster.security.authentication.jwt.base64-secret</code> in application-*.yml files from src/main/resources/config</i></li>' +
      '<br>' +
      '<li>if you use Consul or Eureka from docker image, check if they have the same base64-secret as the JHipster Control Center base64-secret' +
      '<br><i>see property <code>jhipster.security.authentication.jwt.base64-secret</code> in application-*.yml files from src/main/docker/central-server-config</i></li>' +
      '<br>' +
      '<li>if the path is a spring boot actuator endpoint, verify if the endpoint is available in application.yml' +
      '<br><i>see property <code>management.endpoints.web.exposure.include</code></i></li>' +
      '</ul>' +
      '</div>' +
      `<div class="alert alert-danger col-md-10">
         <i>Error message: ${this.internalError.message}</i>
       </div>`
    );
  }

  public setError(error: any) {
    const data = error.response?.data;
    this.internalError = {
      message: data?.message + ' - ' + data?.detail,
      path: data?.path,
    } as RequestError;
  }

  public resetError() {
    this.internalError = null;
  }

  public getError() {
    return this.internalError;
  }

  get isError(): boolean {
    return !!this.internalError;
  }
}
