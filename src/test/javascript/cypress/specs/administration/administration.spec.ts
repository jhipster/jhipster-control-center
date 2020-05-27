describe('Administration', () => {
  const navbarSelector = '[data-e2e-container=navbar]';
  const metricsPageHeadingSelector = '[data-e2e-element=metrics-title]';
  const healthPageHeadingSelector = '[data-e2e-element=health-title]';
  const configurationPageHeadingSelector = '[data-e2e-element=configuration-title]';
  const logsPageHeadingSelector = '[data-e2e-element=logs-title]';
  const apiPageHeadingSelector = '[data-e2e-element=api]';

  beforeEach(() => {
    cy.logout();
    cy.loginWithAdmin();
    cy.visit('/');
    cy.wait('@accountRequest');
  });

  it('should list administration items', () => {
    cy.get(navbarSelector).find('.dropdown-item');
  });

  it('should load metrics', () => {
    cy.clickOnAdminMenuItem('jhi-metrics');
    cy.get(metricsPageHeadingSelector).shouldTextBe('Metrics');
  });

  it('should load health', () => {
    cy.clickOnAdminMenuItem('jhi-health');
    cy.get(healthPageHeadingSelector).shouldTextBe('Health');
  });

  it('should load configuration', () => {
    cy.clickOnAdminMenuItem('jhi-configuration');
    cy.get(configurationPageHeadingSelector).shouldTextBe('Configuration');
  });

  it('should load logs', () => {
    cy.clickOnAdminMenuItem('logs');
    cy.get(logsPageHeadingSelector).shouldTextBe('Logs');
  });

  // TODO conditional add this
  it('should load Swagger API (Docs)', () => {
    cy.clickOnAdminMenuItem('docs');
    cy.get(apiPageHeadingSelector);
  });
});
