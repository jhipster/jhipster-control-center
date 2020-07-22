import { Vue } from 'vue-property-decorator';
import { RequestError } from '@/shared/model/request.error.model';

export default class AbstractComponent extends Vue {
  private internalError: RequestError = null;

  renderErrorMessage(): string {
    return (
      `<div><p>unable to reach the instance at ${this.internalError.path}</p>` +
      '<p>please be sure the application is available <p>' +
      `<p>error message: ${this.internalError.message}</p></div>`
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
