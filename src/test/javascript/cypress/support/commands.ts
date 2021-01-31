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
export const accountMenuSelector = '[data-cy="accountMenu"]';
export const loginItemSelector = '[data-cy="login"]';
export const logoutItemSelector = '[data-cy="logout"]';

// jhcc-custom begin

// Login
export const titleLoginSelector = '[data-cy="loginTitle"]';
export const errorLoginSelector = '[data-cy="loginError"]';
export const usernameLoginSelector = '[data-cy="username"]';
export const passwordLoginSelector = '[data-cy="password"]';
export const submitLoginSelector = '[data-cy="submit"]';

// Sidebar
export const sidebarSelector = '[data-cy="sidebar"]';
export const metricsMenuSelector = '[data-cy="metricsMenu"]';
export const cachesMenuSelector = '[data-cy="cachesMenu"]';
export const healthMenuSelector = '[data-cy="healthMenu"]';
export const liquibaseMenuSelector = '[data-cy="liquibaseMenu"]';
export const logsMenuSelector = '[data-cy="logsMenu"]';
export const logsFileMenuSelector = '[data-cy="logsfileMenu"]';
export const configurationMenuSelector = '[data-cy="configurationMenu"]';
export const openAPIMenuSelector = '[data-cy="openAPIMenu"]';

export const metricsPageHeadingSelector = '[data-cy="metricsPageHeading"]';
export const cachesPageHeadingSelector = '[data-cy="cachesPageHeading"]';
export const healthPageHeadingSelector = '[data-cy="healthPageHeading"]';
export const liquibasePageHeadingSelector = '[data-cy="liquibasePageHeading"]';
export const logsPageHeadingSelector = '[data-cy="logsPageHeading"]';
export const logsFilePageHeadingSelector = '[data-cy="logsfilePageHeading"]';
export const configurationPageHeadingSelector = '[data-cy="configurationPageHeading"]';
export const openAPIPageHeadingSelector = '[data-cy="openAPIPageHeading"]';

// ***********************************************
// End Specific Selector Attributes for Cypress
// ***********************************************

export const classInvalid = 'invalid';
export const classValid = 'valid';

Cypress.Commands.add('login', (username: string, password: string) => {
  cy.clickOnLoginItem();
  cy.get(usernameLoginSelector).type(username);
  cy.get(passwordLoginSelector).type(password);
  cy.get(submitLoginSelector).click();
});

Cypress.Commands.add('getProfiles', () => {
  cy.window().its('app.$store.getters.activeProfiles');
});

Cypress.Commands.add('skipSpec', () => {
  const getMochaContext = () => (cy as any).state('runnable').ctx;
  const context = getMochaContext();
  context.skip();
});

declare global {
  namespace Cypress {
    interface Chainable<Subject> {
      login(username: string, password: string): Cypress.Chainable;
      getProfiles(): Cypress.Chainable;
      skipSpec(): Cypress.Chainable;
    }
  }
}

// Convert this to a module instead of script (allows import/export)
export {};

// jhcc-custom end
