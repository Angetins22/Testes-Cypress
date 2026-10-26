describe('UC-06: Filtro de eventos favoritos', () => {

  const loginUrl = 'https://boavisita.esw.dev.br/entrar'
  const emailTurista = 'vic@email.com'
  const senhaTurista = 'Senha@123'

  function logarVisitante(){
  //Pré-requisito: Loga como visitante (fazer função pra isso depois)
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

  it('deve exibir somente os eventos favoritados pelo visitante', () => {

    removerFavoritos();

    cy.get('[aria-label="Favoritar evento"]')
      .first()
      .click();

    cy.contains('button, input[type="submit"]', 'Favoritos')
      .click();
  });

  it('CA-01: não há eventos favoritos', () =>  {

    removerFavoritos();

    cy.contains('button, input[type="submit"]', 'Favoritos')
      .click();
    
    cy.contains('Você ainda não possui eventos salvos em sua lista de favoritos. Explore os eventos e clique na estrela para adicioná-los aqui.')
    .should('be.visible');
    cy.contains('Selecione um evento para ver os detalhes')
    .should('be.visible');
    cy.get('#listagemVazio').should('exist');
    cy.get('#detailEmpty').should('exist');


  });

});
