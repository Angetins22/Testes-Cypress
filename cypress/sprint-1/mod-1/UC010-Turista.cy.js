describe('UC010: Realizar Logout - Turista', () => {
  const loginUrl = 'https://boavisita.esw.dev.br/entrar'
  const emailTurista = 'vic@email.com'
  const senhaTurista = 'senha123'

  beforeEach(() => {
    cy.visit(loginUrl)
  })

  it('deve realizar login como Turista, acionar o encerramento de sessão e redirecionar para a Landing Page', () => {
    // 1. Pré-condição: Login com Turista
    cy.get('input[type="email"], input[placeholder*="email" i], input[name*="email" i]')
      .first()
      .clear()
      .type(emailTurista)

    cy.get('input[type="password"], input[placeholder*="senha" i], input[name*="senha" i]')
      .first()
      .clear()
      .type(senhaTurista)

    cy.contains('button, input[type="submit"]', 'Entrar').click()

    // Confirmação de entrada no painel
    cy.url().should('include', '/dashboard')
    cy.contains(/usuário/i).should('be.visible')

    // 2. Passo do UC: Selecionar a opção de encerramento de sessão no rodapé do menu
    cy.get('button.btn-logout, [title*="sair" i], [aria-label*="sair" i]')
      .should('be.visible')
      .click({ force: true })

    // 3. Validação: Redirecionamento automático para a Landing Page (raiz do sistema)
    cy.url().should('eq', 'https://boavisita.esw.dev.br/')
  })
})