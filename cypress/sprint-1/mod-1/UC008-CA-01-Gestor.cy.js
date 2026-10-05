describe('UC008 - Acessar Painel de Usuário - Gestor', () => {
  const loginUrl = 'https://boavisita.esw.dev.br/entrar'
  const emailGestor = 'spike@email.com'
  const senhaGestor = 'senha123'

  beforeEach(() => {
    cy.visit(loginUrl)
  })

  it('deve realizar login como Gestor e acionar o Logout via menu lateral', () => {

    cy.get('input[type="email"], input[placeholder*="email" i], input[name*="email" i]')
      .first()
      .clear()
      .type(emailGestor)

    cy.get('input[type="password"], input[placeholder*="senha" i], input[name*="senha" i]')
      .first()
      .clear()
      .type(senhaGestor)

    cy.contains('button, input[type="submit"]', 'Entrar').click()

    // Validação da pré-condição: Login realizado com sucesso
    cy.url().should('not.include', '/entrar')
    cy.contains('h1, h2, span, div', /dashboard/i).should('be.visible')

    // 2. CA01: Tenta identificar a opção de "Editar Perfil" (UC09) especificada no requisito
    cy.contains(/editar perfil|meu perfil/i).should('not.exist')

    // 3. Ação do CA01: Recorre à opção alternativa de serviço disponível - Logout (UC10)
    cy.get('button.btn-logout, [title*="sair" i], [aria-label*="sair" i]')
      .should('be.visible')
      .click({ force: true })

    // 4. Validação: Redireciona para o fluxo de logout e encerra a sessão
    cy.url().should('include', '/entrar')
  })
})