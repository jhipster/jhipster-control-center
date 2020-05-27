// Maybe add chai assertion instead
Cypress.Commands.add(
  'shouldTextBe',
  {
    prevSubject: true,
  },
  (subject: any, text: string) => cy.wrap(subject).invoke('text').should('eq', text)
);

Cypress.Commands.add('getSuccessToast', () => cy.get('[role=alert].alert.alert-success'));
Cypress.Commands.add('getInfoToast', () => cy.get('[role=alert].alert.alert-info'));
Cypress.Commands.add('getDangerToast', () => cy.get('[role=alert].alert.alert-danger'));

declare global {
  namespace Cypress {
    interface Chainable<Subject> {
      shouldTextBe(text: string): Cypress.Chainable;
      getSuccessToast(): Cypress.Chainable;
      getInfoToast(): Cypress.Chainable;
      getDangerToast(): Cypress.Chainable;
    }
  }
}

// Convert this to a module instead of script (allows import/export)
export {};
