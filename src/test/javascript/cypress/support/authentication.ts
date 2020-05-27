Cypress.Commands.add('loginUsing', (username: string, password: string) => {
  cy.server();
  cy.route('GET', '/api/account').as('accountRequest');

  return cy
    .request({
      method: 'POST',
      url: '/api/authenticate',
      body: {
        username,
        password,
        rememberMe: null,
      },
    })
    .then((result: any) => {
      const bearerToken = result.headers.authorization;
      if (bearerToken && bearerToken.slice(0, 7) === 'Bearer ') {
        window.sessionStorage.setItem('jhi-authenticationToken', bearerToken.slice(7, bearerToken.length));
      }
    });
});

Cypress.Commands.add('loginWithAdmin', () => {
  return cy.loginUsing('admin', 'admin');
});

Cypress.Commands.add('logout', () => {
  window.sessionStorage.removeItem('jhi-authenticationToken');
  window.localStorage.removeItem('jhi-authenticationToken');
});
declare global {
  namespace Cypress {
    interface Chainable<Subject> {
      logout(): void;
      loginUsing(username: string, password: string): Cypress.Chainable;
      loginWithAdmin(): Cypress.Chainable;
    }
  }
}

// Convert this to a module instead of script (allows import/export)
export {};
