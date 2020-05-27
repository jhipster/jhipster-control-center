export const navbarSelector = '[data-e2e-container=navbar]';
export const adminMenuSelector = '[data-e2e-element=admin-menu]';
export const accountMenuSelector = '[data-e2e-element=account-menu]';
export const loginSelector = '[data-e2e-element=login]';

export const entityMenuSelector = '[data-e2e-element=entity-menu]';

Cypress.Commands.add('clickOnAdminMenuItem', (item: string) => {
  return cy.get(navbarSelector).find(adminMenuSelector).click().find(`.dropdown-item[href="/admin/${item}"]`).click();
});

Cypress.Commands.add('clickOnLoginItem', () => {
  return cy.get(navbarSelector).find(accountMenuSelector).click().find(loginSelector).click();
});

Cypress.Commands.add('clickOnEntityMenuItem', (entityName: string) => {
  return cy.get(navbarSelector).find(entityMenuSelector).click().find(`.dropdown-item[href="/entity/${entityName}"]`).click();
});

declare global {
  namespace Cypress {
    interface Chainable<Subject> {
      clickOnLoginItem(): Cypress.Chainable;
      clickOnAdminMenuItem(item: string): Cypress.Chainable;
      clickOnEntityMenuItem(item: string): Cypress.Chainable;
    }
  }
}

// Convert this to a module instead of script (allows import/export)
export {};
