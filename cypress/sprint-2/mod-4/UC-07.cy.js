describe('UC-07: Favoritar Evento', () => {

  const loginUrl = 'https://boavisita.esw.dev.br/entrar'
  const emailTurista = 'vic@email.com'
  const senhaTurista = 'Senha@123'

  function logarVisitante(){
  //Pré-requisito: Loga como visitante
    cy.get('input[type="email"], input[placeholder*="email" i], input[name*="email" i]')
      .first()
      .clear()
      .type(emailTurista)

    cy.get('input[type="password"], input[placeholder*="senha" i], input[name*="senha" i]')
      .first()
      .clear()
      .type(senhaTurista)

    cy.contains('button, input[type="submit"]', 'Entrar').click()
    cy.url().should('not.include', '/entrar')

  }

  function removerFavoritos() {
    cy.get('body').then(($body) => {
      const seletor = '[aria-label="Remover evento dos favoritos"]';

      if ($body.find(seletor).length > 0) {
        cy.get(seletor).first().click();
        removerFavoritos();
      }
    });
  }

  beforeEach(() => {
    cy.visit(loginUrl)
    logarVisitante();
  })

  it('deve permitir que o visitante favorite o evento', () => {

    removerFavoritos();

    cy.get('[aria-label="Favoritar evento"]')
      .first()
      .click();
  });

});
