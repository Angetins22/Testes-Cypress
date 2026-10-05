describe('UC009 - CA: Editar Perfil - E-mail já vinculado a outra conta', () => {
  const loginUrl = 'https://boavisita.esw.dev.br/entrar'
  const emailTurista = 'vic@email.com'
  const senhaTurista = 'senha123'
  const emailExistente = 'tony@email.com'
  const alertaEsperado = /este e-mail já está em uso\. por favor, insira um endereço válido\./i

  beforeEach(() => {
    // 1. Pré-condição: Login com Turistainistrador
    cy.visit(loginUrl)

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

    // 2. Acesso à funcionalidade Editar Perfil (ponto onde falha acusando bloqueio pela ausência do botão)
    cy.contains(/editar perfil|meu perfil|perfil/i, { timeout: 4000 })
      .should('be.visible')
      .click()
  })

  it('deve bloquear a operação e exibir alerta ao tentar cadastrar e-mail já existente', () => {
    // 3. Tenta alterar o e-mail para um valor já registrado por outro usuário
    cy.get('input[type="email"], input[placeholder*="email" i], input[name*="email" i]')
      .first()
      .clear()
      .type(emailExistente)

    // 4. Clica em salvar
    cy.contains('button, input[type="submit"]', /salvar|atualizar|gravar/i)
      .should('be.visible')
      .click()

    // 5. Validação: Operação bloqueada e exibição do alerta de duplicidade
    cy.contains(alertaEsperado, { timeout: 4000 })
      .should('be.visible')

    // 6. Confirma que o formulário permanece aberto para correção (botão de salvar ainda presente)
    cy.contains('button, input[type="submit"]', /salvar|atualizar|gravar/i)
      .should('be.visible')
  })
})