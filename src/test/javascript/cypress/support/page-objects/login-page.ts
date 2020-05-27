export const loginModalSelector = '[data-e2e-container=login-modal]';
export const loginTitleSelector = '[data-e2e-element=title]';
export const loginUsernameSelector = '[data-e2e-element=username]';
export const loginPasswordSelector = '[data-e2e-element=password]';
export const loginSubmitSelector = '[data-e2e-element=submit]';
export const loginAlertSelector = '[data-e2e-element=alert-authentication-error]';

export const loginWith = (username: string, password: string) => {
  cy.get(loginModalSelector).find(loginUsernameSelector).type(username);
  cy.get(loginModalSelector).find(loginPasswordSelector).type(password);
  cy.get(loginModalSelector).find(loginSubmitSelector).click();
};
