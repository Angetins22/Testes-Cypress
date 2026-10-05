describe('UC010 - CA02: Tentativa de Acesso Pós-Logout - Administrador', () => {
  const loginUrl = 'https://boavisita.esw.dev.br/entrar'
  const dashboardUrl = 'https://boavisita.esw.dev.br/dashboard'
  const emailAdm = 'tony@email.com'
  const senhaAdm = 'senha123'

  beforeEach(() => {
    cy.visit(loginUrl)
  })

  it('deve bloquear acesso e redirecionar para login ao tentar voltar ou acessar rota protegida pós-logout', () => {
    // 1. Pré-condição: Login com Administrador
    cy.get('input[type="email"], input[placeholder*="email" i], input[name*="email" i]')
      .first()
      .clear()
      .type(emailAdm)

    cy.get('input[type="password"], input[placeholder*="senha" i], input[name*="senha" i]')
      .first()
      .clear()
      .type(senhaAdm)

    cy.contains('button, input[type="submit"]', 'Entrar').click()
    cy.url().should('include', '/dashboard')

    // 2. Execução do logout
    cy.get('button.btn-logout, [title*="sair" i], [aria-label*="sair" i]')
      .should('be.visible')
      .click({ force: true })

    // Valida que saiu da área protegida (reprova aqui devido ao bug do botão sem ação)
    cy.url().should('not.include', '/dashboard')

    // 3. Tentativa 1: Acionar o botão "voltar" do navegador (histórico)
    cy.go('back')

    // Validação: Acesso bloqueado, garantindo que não reabre o dashboard autenticado
    cy.url().should('include', '/entrar')
    cy.contains('h1, h2, span, div', /dashboard/i).should('not.exist')

    // 4. Tentativa 2: Acesso direto à rota protegida via URL
    cy.visit(dashboardUrl, { failOnStatusCode: false })

    // Validação: Redirecionamento obrigatório para a tela de autenticação
    cy.url().should('include', '/entrar')
  })
})