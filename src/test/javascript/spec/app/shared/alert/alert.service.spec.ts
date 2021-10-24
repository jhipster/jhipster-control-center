import sinon from 'sinon';

import AlertService from '@/shared/alert/alert.service';
import Vue from 'vue';
import { createLocalVue, mount, shallowMount } from '@vue/test-utils';
const toastStub = sinon.stub();

const vueInstance = {
  $root: {
    $bvToast: {
      toast: toastStub,
    },
  },
};

describe('Alert Service test suite', () => {
  let alertService: AlertService;

  beforeEach(() => {
    toastStub.reset();
    alertService = new AlertService();
  });

  it('should show error toast with translation/message', async () => {
    const message = 'translatedMessage';

    // WHEN
    alertService.showError((<any>vueInstance) as Vue, message);

    //THEN
    expect(
      toastStub.calledOnceWith(message, {
        toaster: 'b-toaster-top-center',
        title: 'Error',
        variant: 'danger',
        solid: true,
        autoHideDelay: 5000,
      })
    ).toBeTruthy();
  });

  it('should show not reachable toast when http status = 0', async () => {
    const message = 'Server not reachable';
    const httpErrorResponse = {
      status: 0,
    };

    // WHEN
    alertService.showHttpError((<any>vueInstance) as Vue, httpErrorResponse);

    //THEN
    expect(
      toastStub.calledOnceWith(message, {
        toaster: 'b-toaster-top-center',
        title: 'Error',
        variant: 'danger',
        solid: true,
        autoHideDelay: 5000,
      })
    ).toBeTruthy();
  });

  it('should show parameterized error toast when http status = 400 and entity headers', async () => {
    const message = 'Updation Error';
    const httpErrorResponse = {
      status: 400,
      headers: {
        'x-jhipsterapp-error': message,
        'x-jhipsterapp-params': 'dummyEntity',
      },
    };

    // WHEN
    alertService.showHttpError((<any>vueInstance) as Vue, httpErrorResponse);

    //THEN
    expect(
      toastStub.calledOnceWith(message, {
        toaster: 'b-toaster-top-center',
        title: 'Error',
        variant: 'danger',
        solid: true,
        autoHideDelay: 5000,
      })
    ).toBeTruthy();
  });
});
