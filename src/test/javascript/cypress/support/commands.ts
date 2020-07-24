/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-use-before-define */
// eslint-disable-next-line spaced-comment
/// <reference types="cypress" />

// ***********************************************
// This commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// ***********************************************
// Begin Specific Selector Attributes for Cypress
// ***********************************************

// Navbar
export const navbarSelector = '[data-cy="navbar"]';
export const accountMenuSelector = '[data-cy="account-menu"]';
export const loginItemSelector = '[data-cy="login"]';
export const logoutItemSelector = '[data-cy="logout"]';

// Login
export const errorLoginSelector = '[data-cy="login-error"]';
export const usernameLoginSelector = '[data-cy="username"]';
export const passwordLoginSelector = '[data-cy="password"]';
export const submitLoginSelector = '[data-cy="submit"]';

// Sidebar
export const sidebarSelector = '[data-cy="sidebar"]';
export const metricsMenuSelector = '[data-cy="metrics-menu"]';
export const healthMenuSelector = '[data-cy="health-menu"]';
export const logsMenuSelector = '[data-cy="logs-menu"]';
export const logsFileMenuSelector = '[data-cy="logsfile-menu"]';
export const configurationMenuSelector = '[data-cy="configuration-menu"]';
export const swaggerMenuSelector = '[data-cy="swagger-menu"]';

export const metricsPageHeadingSelector = '[data-cy="metrics-page-heading"]';
export const healthPageHeadingSelector = '[data-cy="health-page-heading"]';
export const logsPageHeadingSelector = '[data-cy="logs-page-heading"]';
export const logsFilePageHeadingSelector = '[data-cy="logsfile-page-heading"]';
export const configurationPageHeadingSelector = '[data-cy="configuration-page-heading"]';
export const swaggerPageHeadingSelector = '[data-cy="swagger-page-heading"]';

// ***********************************************
// End Specific Selector Attributes for Cypress
// ***********************************************

Cypress.Commands.add('login', (username: string, password: string) => {
  cy.clickOnLoginItem();
  cy.get(usernameLoginSelector).type(username);
  cy.get(passwordLoginSelector).type(password);
  cy.get(submitLoginSelector).click();
});

declare global {
  namespace Cypress {
    interface Chainable<Subject> {
      login(username: string, password: string): Cypress.Chainable;
    }
  }
}

// Convert this to a module instead of script (allows import/export)
export {};
