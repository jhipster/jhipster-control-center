import {
  metricsPageHeadingSelector,
  healthPageHeadingSelector,
  logsPageHeadingSelector,
  configurationPageHeadingSelector,
  openAPIPageHeadingSelector,
  logsFilePageHeadingSelector,
  cachesPageHeadingSelector,
  liquibasePageHeadingSelector,
} from '../../support/commands';

describe('/sidebar', () => {
  before(() => {
    cy.window().then(win => {
      win.sessionStorage.clear();
    });
    cy.clearCookies();
    cy.visit('');
    cy.getProfiles().then((activeProfiles: Array<string>) => {
      if (activeProfiles.includes('oauth2')) {
        Cypress.env('oauth2', true);
      } else {
        Cypress.env('oauth2', false);
        cy.login('admin', 'admin');
      }
    });
  });

  beforeEach(() => {
    if (Cypress.env('oauth2')) {
      cy.getOauth2Data();
      cy.get('@oauth2Data').then(oauth2Data => {
        cy.oauthLogout();
      });
      cy.clearCache();
      cy.get('@oauth2Data').then(oauth2Data => {
        cy.keycloackLogin(oauth2Data, 'user');
      });
    }
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

  describe('/caches', () => {
    it('should load the page', () => {
      cy.clickOnCachesItem();
      cy.get(cachesPageHeadingSelector).should('be.visible');
    });
  });

  describe('/health', () => {
    it('should load the page', () => {
      cy.clickOnHealthItem();
      cy.get(healthPageHeadingSelector).should('be.visible');
    });
  });

  describe('/liquibase', () => {
    it('should load the page', () => {
      cy.clickOnLiquibaseItem();
      cy.get(liquibasePageHeadingSelector).should('be.visible');
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
      cy.clickOnOpenApiItem();
      cy.get(openAPIPageHeadingSelector).should('be.visible');
    });
  });
});
