import { errorLoginSelector, usernameLoginSelector, passwordLoginSelector, submitLoginSelector } from '../../support/commands';

// jhcc-custom begin

describe('login modal', () => {
  before(() => {
    cy.visit('');
    cy.getProfiles().then((activeProfiles: Array<string>) => {
      if (activeProfiles.includes('oauth2')) {
        cy.skipSpec();
      } else {
        cy.window().then(win => {
          win.sessionStorage.clear();
        });
        cy.clearCookies();
        cy.visit('');
        cy.clickOnLoginItem();
      }
    });
  });

  beforeEach(() => {
    cy.server();
    cy.route('POST', '/api/authenticate').as('authenticate');
  });

  it('requires username', () => {
    cy.get(passwordLoginSelector).type('a-password');
    cy.get(submitLoginSelector).click();
    cy.wait('@authenticate').its('status').should('equal', 400);
    // login page should stay open when login fails
    cy.get(passwordLoginSelector).clear();
  });

  it('requires password', () => {
    cy.get(usernameLoginSelector).type('a-login');
    cy.get(submitLoginSelector).click();
    cy.wait('@authenticate').its('status').should('equal', 400);
    cy.get(errorLoginSelector).should('be.visible');
    cy.get(usernameLoginSelector).clear();
  });

  it('errors when password is incorrect', () => {
    cy.get(usernameLoginSelector).type('admin');
    cy.get(passwordLoginSelector).type('bad-password');
    cy.get(submitLoginSelector).click();
    cy.wait('@authenticate').its('status').should('equal', 401);
    cy.get(errorLoginSelector).should('be.visible');
    cy.get(usernameLoginSelector).clear();
    cy.get(passwordLoginSelector).clear();
  });

  it('go to login page when successfully logs in', () => {
    cy.get(usernameLoginSelector).type('admin');
    cy.get(passwordLoginSelector).type('admin');
    cy.get(submitLoginSelector).click();
    cy.wait('@authenticate').its('status').should('equal', 200);
    cy.hash().should('eq', '');
  });
});

// jhcc-custom end
