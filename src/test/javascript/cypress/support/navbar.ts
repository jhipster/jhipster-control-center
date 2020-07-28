/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-use-before-define */

import { navbarSelector, accountMenuSelector, loginItemSelector, logoutItemSelector } from './commands';

Cypress.Commands.add('clickOnLoginItem', () => {
  return cy.get(navbarSelector).find(accountMenuSelector).click().get(loginItemSelector).click();
});

Cypress.Commands.add('clickOnLogoutItem', () => {
  return cy.get(navbarSelector).find(accountMenuSelector).click().get(logoutItemSelector).click();
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
