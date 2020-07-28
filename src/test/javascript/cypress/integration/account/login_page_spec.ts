import { errorLoginSelector, usernameLoginSelector, passwordLoginSelector, submitLoginSelector } from '../../support/commands';

describe('login modal', () => {
  before(() => {
    cy.visit('');
    cy.clickOnLoginItem();
  });

  after(() => {
    cy.clickOnLogoutItem();
  });

  it('requires username', () => {
    cy.get(submitLoginSelector).click();
    // login page should stay open when login fails
    cy.get(usernameLoginSelector).type('admin');
  });

  it('requires password', () => {
    cy.get(submitLoginSelector).click();
    cy.get(errorLoginSelector).should('be.visible');
  });

  it('errors when password is incorrect', () => {
    cy.get(passwordLoginSelector).type('bad-password');
    cy.get(submitLoginSelector).click();
    cy.get(errorLoginSelector).should('be.visible');
  });

  it('go to login page when successfully logs in', () => {
    cy.get(passwordLoginSelector).clear();
    cy.get(passwordLoginSelector).type('admin');
    cy.get(submitLoginSelector).click();
    cy.hash().should('eq', '');
  });
});
