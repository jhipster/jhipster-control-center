import { Vue } from 'vue-property-decorator';
import { RequestError } from '@/shared/model/request.error.model';

export default class AbstractComponent extends Vue {
  private internalError: RequestError = null;

  renderErrorMessage(): string {
    return (
      '<div class="alert alert-info col-md-8">' +
      `<p><strong>Unable to reach this point for instance at the path: ${this.internalError.path}</strong></p>` +
      '<p>Please, be sure:</p>' +
      '<ul>' +
      '<li>the application is available</li>' +
      '<li>if the path is a spring boot actuator endpoint, verify if the endpoint is available in application.yml' +
      '<br><i>see property <code>management.endpoints.web.exposure.include</code></i></li>' +
      '</ul>' +
      '</div>' +
      `<div class="alert alert-danger col-md-8">
         <i>Error message: ${this.internalError.message}</i>
       </div>`
    );
  }

  set error(error: any) {
    const data = error.response?.data;
    this.internalError = {
      message: data?.message,
      path: data?.path,
    } as RequestError;
  }

  get isError(): boolean {
    return !!this.internalError;
  }

  public resetError() {
    this.internalError = null;
  }
}
