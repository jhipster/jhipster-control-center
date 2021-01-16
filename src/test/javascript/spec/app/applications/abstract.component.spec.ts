import AbstractComponent from '@/applications/abstract.component';
import { createLocalVue, shallowMount, Wrapper } from '@vue/test-utils';
import { error_abstract_component } from '../../fixtures/jhcc.fixtures';

const localVue = createLocalVue();

describe('abstract component', () => {
  let wrapper: Wrapper<AbstractComponent>;
  let abstractComponent: AbstractComponent;

  beforeEach(async () => {
    wrapper = shallowMount<AbstractComponent>(AbstractComponent, {
      localVue,
    });
    abstractComponent = wrapper.vm;
    await abstractComponent.$nextTick();
  });

  it('should set error', async () => {
    abstractComponent.setError(error_abstract_component);
    const expectedPath = 'generic/path';
    const expectedMessage = 'generic message - generic detail';
    abstractComponent.setError(error_abstract_component);
    expect(abstractComponent.getError().path).toEqual(expectedPath);
    expect(abstractComponent.getError().message).toEqual(expectedMessage);
  });

  it('should reset error', async () => {
    abstractComponent.setError(error_abstract_component);
    expect(abstractComponent.isError).toBeTruthy();
    abstractComponent.resetError();
    expect(abstractComponent.isError).toBeFalsy();
  });

  it('should render error', async () => {
    abstractComponent.setError(error_abstract_component);
    const expectedPath = 'generic/path';
    const expectedMessage = 'generic message - generic detail';
    const expectedRender =
      '<div class="alert alert-info col-md-10">' +
      `<p><strong>Unable to reach this endpoint for instance at the path: ` +
      expectedPath +
      `</strong></p>` +
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
         <i>Error message: ` +
      expectedMessage +
      `</i>
       </div>`;
    const result: string = abstractComponent.renderErrorMessage();
    expect(result).toEqual(expectedRender);
  });
});
