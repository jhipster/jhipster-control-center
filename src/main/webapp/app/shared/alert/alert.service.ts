import Vue from 'vue';

export default class AlertService {
  public showError(instance: Vue, message: string, params?: any) {
    instance.$root.$bvToast.toast(message.toString(), {
      toaster: 'b-toaster-top-center',
      title: 'Error',
      variant: 'danger',
      solid: true,
      autoHideDelay: 5000,
    });
  }

  public showHttpError(instance: Vue, httpErrorResponse: any) {
    switch (httpErrorResponse.status) {
      case 0:
        this.showError(instance, 'Server not reachable');
        break;

      case 400: {
        const arr = Object.keys(httpErrorResponse.headers);
        let errorHeader: string | null = null;
        for (const entry of arr) {
          if (entry.toLowerCase().endsWith('app-error')) {
            errorHeader = httpErrorResponse.headers[entry];
          }
        }
        if (errorHeader) {
          this.showError(instance, errorHeader);
        } else if (httpErrorResponse.data !== '' && httpErrorResponse.data.fieldErrors) {
          this.showError(instance, 'Validation error');
        } else {
          this.showError(instance, httpErrorResponse.data.message);
        }
        break;
      }

      case 404:
        this.showError(instance, 'Not found');
        break;

      default:
        this.showError(instance, httpErrorResponse.data.message);
    }
  }
}
