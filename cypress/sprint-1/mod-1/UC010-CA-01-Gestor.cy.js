describe('UC010 - CA01: Confirmação de Saída - Gestor', () => {
  const loginUrl = 'https://boavisita.esw.dev.br/entrar'
  const emailGestor = 'tony@email.com'
  const senhaGestor = 'senha123'
  const mensagemConfirmacao = /deseja realmente encerrar sua sessão\?/i

  beforeEach(() => {
    // 1. Pré-condição: Login com Gestor
    cy.visit(loginUrl)

    cy.get('input[type="email"], input[placeholder*="email" i], input[name*="email" i]')
      .first()
      .clear()
      .type(emailGestor)

    cy.get('input[type="password"], input[placeholder*="senha" i], input[name*="senha" i]')
      .first()
      .clear()
      .type(senhaGestor)

    cy.contains('button, input[type="submit"]', 'Entrar').click()
    cy.url().should('include', '/dashboard')
    cy.contains(/usuário/i).should('be.visible')
  })

  it('deve exibir caixa de confirmação ao clicar em Logout e manter a sessão ativa caso o usuário cancele', () => {
    // 2. Ação: Clica no botão de Logout na barra lateral
    cy.get('button.btn-logout, [title*="sair" i], [aria-label*="sair" i]')
      .should('be.visible')
      .click({ force: true })

    // 3. Validação da Caixa de Diálogo (falha aqui devido ao botão sem ação)
    cy.contains(mensagemConfirmacao, { timeout: 4000 })
      .should('be.visible')

    // 4. Fluxo Alternativo: Usuário opta por cancelar o encerramento da sessão
    cy.contains('button', /cancelar|não|voltar/i)
      .should('be.visible')
      .click()

    // 5. Validação: A caixa fecha e o usuário permanece na sessão ativa no dashboard
    cy.contains(mensagemConfirmacao).should('not.exist')
    cy.url().should('include', '/dashboard')
  })

  it('deve exibir caixa de confirmação ao clicar em Logout e invalidar a sessão caso o usuário confirme', () => {
    // 2. Ação: Clica no botão de Logout
    cy.get('button.btn-logout, [title*="sair" i], [aria-label*="sair" i]')
      .should('be.visible')
      .click({ force: true })

    // 3. Validação da Caixa de Diálogo (falha aqui devido ao botão sem ação)
    cy.contains(mensagemConfirmacao, { timeout: 4000 })
      .should('be.visible')

    // 4. Fluxo de Confirmação: Usuário confirma a saída
    cy.contains('button', /confirmar|sim|sair/i)
      .should('be.visible')
      .click()

    // 5. Validação: Sessão encerrada e redirecionamento para fora da área restrita
    cy.url().should('not.include', '/dashboard')
  })
})