describe('UC008 - Acessar Painel de Usuário - Gestor', () => {
  const loginUrl = 'https://boavisita.esw.dev.br/entrar'
  const emailGestor = 'spike@email.com'
  const senhaGestor = 'senha123'

  beforeEach(() => {
    cy.visit(loginUrl)
  })

  it('deve realizar login como Gestor para acessar o menu do painel', () => {

    cy.get('input[type="email"], input[placeholder*="email" i], input[name*="email" i]')
      .first()
      .clear()
      .type(emailGestor)

    cy.get('input[type="password"], input[placeholder*="senha" i], input[name*="senha" i]')
      .first()
      .clear()
      .type(senhaGestor)

    cy.contains('button, input[type="submit"]', 'Entrar').click()

    cy.url().should('not.include', '/entrar')

    cy.contains('h1, h2, span, div', /dashboard/i).should('be.visible')
    cy.contains('nav, aside, div', /usuários|configurações/i).should('be.visible')

    cy.contains(/usuário/i).should('be.visible')
  })
})