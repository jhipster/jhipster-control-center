import {
  metricsPageHeadingSelector,
  healthPageHeadingSelector,
  logsPageHeadingSelector,
  configurationPageHeadingSelector,
  swaggerPageHeadingSelector,
  logsFilePageHeadingSelector,
} from '../../support/commands';

describe('/sidebar', () => {
  before(() => {
    cy.visit('');
    cy.login('admin', 'admin');
  });

  after(() => {
    cy.clickOnLogoutItem();
  });

  describe('/metrics', () => {
    it('should load the page', () => {
      cy.clickOnMetricItem();
      cy.get(metricsPageHeadingSelector).should('be.visible');
    });
  });

  describe('/health', () => {
    it('should load the page', () => {
      cy.clickOnHealthItem();
      cy.get(healthPageHeadingSelector).should('be.visible');
    });
  });

  describe('/logs', () => {
    it('should load the page', () => {
      cy.clickOnLogsItem();
      cy.get(logsPageHeadingSelector).should('be.visible');
    });
  });

  describe('/logsfile', () => {
    it('should load the page', () => {
      cy.clickOnLogsfileItem();
      cy.get(logsFilePageHeadingSelector).should('be.visible');
    });
  });

  describe('/configuration', () => {
    it('should load the page', () => {
      cy.clickOnConfigurationItem();
      cy.get(configurationPageHeadingSelector).should('be.visible');
    });
  });

  describe('/swagger', () => {
    it('should load the page', () => {
      cy.clickOnSwaggerItem();
      cy.get(swaggerPageHeadingSelector).should('be.visible');
    });
  });
});
