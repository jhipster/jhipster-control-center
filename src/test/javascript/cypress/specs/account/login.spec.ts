import {
  loginModalSelector,
  loginTitleSelector,
  loginUsernameSelector,
  loginPasswordSelector,
  loginAlertSelector,
  loginWith,
} from '../../support/page-objects/login-page';

describe('Log In', () => {
  const loginPageTitle = 'login-title';

  beforeEach(() => {
    cy.logout();
    cy.visit('/');
    cy.clickOnLoginItem();
  });

  it('should display login modal', () => {
    cy.get(loginModalSelector).find(loginTitleSelector);
    cy.get(loginModalSelector).find(loginUsernameSelector);
    cy.get(loginModalSelector).find(loginPasswordSelector);
    loginWith;
    // TODO: test checkbox and alert warnings
  });

  it('should fail to login with bad password', () => {
    // WHEN
    loginWith('admin', 'wrong');

    // THEN
    cy.get(loginModalSelector).find('[id="login-page"]').should('exist');

    cy.get(loginModalSelector).find(loginAlertSelector).should('have.class', 'alert-danger');
  });

  it('should login with admin account', () => {
    // WHEN
    loginWith('admin', 'admin');

    // THEN
    cy.get(loginModalSelector).find(loginTitleSelector).should('not.exist');
  });
});
