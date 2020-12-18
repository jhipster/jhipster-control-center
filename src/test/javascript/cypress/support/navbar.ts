/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-use-before-define */

import { navbarSelector, accountMenuSelector, loginItemSelector, logoutItemSelector } from './commands';

Cypress.Commands.add('clickOnLoginItem', () => {
  return cy.get(navbarSelector).get(accountMenuSelector).click({ force: true }).get(loginItemSelector).click({ force: true });
});

Cypress.Commands.add('clickOnLogoutItem', () => {
  return cy.get(navbarSelector).get(accountMenuSelector).click({ force: true }).get(logoutItemSelector).click({ force: true });
});

declare global {
  namespace Cypress {
    interface Chainable<Subject> {
      clickOnLoginItem(): Cypress.Chainable;
      clickOnLogoutItem(): Cypress.Chainable;
    }
  }
}

// Convert this to a module instead of script (allows import/export)
export {};
