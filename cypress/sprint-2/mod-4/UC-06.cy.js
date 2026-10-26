describe('Teste da aplicação', () => {
  it('deve abrir o site corretamente', () => {
    cy.visit('https://boavisita.esw.dev.br');

    cy.url().should(
      'include',
      'boavisita.esw.dev.br'
    );
  });
});