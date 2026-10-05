describe('UC008 - Acessar Painel de Usuário - Adm', () => {
  const loginUrl = 'https://boavisita.esw.dev.br/entrar'
  const emailAdm = 'tony@email.com'
  const senhaAdm = 'senha123'

  beforeEach(() => {
    cy.visit(loginUrl)
  })

  it('deve realizar login como Adm para acessar o menu do painel', () => {

    cy.get('input[type="email"], input[placeholder*="email" i], input[name*="email" i]')
      .first()
      .clear()
      .type(emailAdm)

    cy.get('input[type="password"], input[placeholder*="senha" i], input[name*="senha" i]')
      .first()
      .clear()
      .type(senhaAdm)

    cy.contains('button, input[type="submit"]', 'Entrar').click()

    cy.url().should('not.include', '/entrar')

    cy.contains('h1, h2, span, div', /dashboard/i).should('be.visible')
    cy.contains('nav, aside, div', /usuários|configurações/i).should('be.visible')

    cy.contains(/usuário/i).should('be.visible')
  })
})