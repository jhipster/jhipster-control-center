/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-use-before-define */
/// <reference types="cypress" />

import {
  sidebarSelector,
  metricsMenuSelector,
  healthMenuSelector,
  logsMenuSelector,
  logsFileMenuSelector,
  configurationMenuSelector,
  swaggerMenuSelector,
} from './commands';

Cypress.Commands.add('clickOnMetricItem', () => {
  return cy.get(sidebarSelector).find(metricsMenuSelector).click();
});

Cypress.Commands.add('clickOnHealthItem', () => {
  return cy.get(sidebarSelector).find(healthMenuSelector).click();
});

Cypress.Commands.add('clickOnLogsItem', () => {
  return cy.get(sidebarSelector).find(logsMenuSelector).click();
});

Cypress.Commands.add('clickOnLogsfileItem', () => {
  return cy.get(sidebarSelector).find(logsFileMenuSelector).click();
});

Cypress.Commands.add('clickOnConfigurationItem', () => {
  return cy.get(sidebarSelector).find(configurationMenuSelector).click();
});

Cypress.Commands.add('clickOnSwaggerItem', () => {
  return cy.get(sidebarSelector).find(swaggerMenuSelector).click();
});

declare global {
  namespace Cypress {
    interface Chainable<Subject> {
      clickOnMetricItem(): Cypress.Chainable;
      clickOnHealthItem(): Cypress.Chainable;
      clickOnLogsItem(): Cypress.Chainable;
      clickOnLogsfileItem(): Cypress.Chainable;
      clickOnConfigurationItem(): Cypress.Chainable;
      clickOnSwaggerItem(): Cypress.Chainable;
    }
  }
}

// Convert this to a module instead of script (allows import/export)
export {};
