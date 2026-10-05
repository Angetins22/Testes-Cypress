describe('UC009 - CA: Editar Perfil - Validação de Formatos Inválidos', () => {
  const loginUrl = 'https://boavisita.esw.dev.br/entrar'
  const emailTurista = 'vic@email.com'
  const senhaTurista = 'senha123'
  const mensagemErroEsperada = /formato inválido\. por favor, verifique os dados inseridos\./i

  beforeEach(() => {
    // 1. Pré-condição: Login com Turistainistrador e acesso à área autenticada
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

    // 2. Acesso à funcionalidade Editar Perfil (ponto onde falha acusando bloqueio)
    cy.contains(/editar perfil|meu perfil|perfil/i, { timeout: 4000 })
      .should('be.visible')
      .click()
  })

  it('CA#01: Deve interromper gravação e exibir erro com Telefone diferente de 11 dígitos', () => {
    // Insere telefone com quantidade incorreta de dígitos (ex: 9 dígitos)
    cy.get('input[name*="telefone" i], input[placeholder*="telefone" i]')
      .clear()
      .type('119888877')

    // Tenta salvar
    cy.contains('button, input[type="submit"]', /salvar|atualizar|gravar/i)
      .should('be.visible')
      .click()

    // Validação da mensagem de erro esperada
    cy.contains(mensagemErroEsperada, { timeout: 4000 })
      .should('be.visible')
  })

  it('CA#02: Deve interromper gravação e exibir erro com CEP fora do padrão de 8 dígitos', () => {
    // Insere CEP com quantidade incorreta de dígitos (ex: 6 dígitos)
    cy.get('input[name*="cep" i], input[placeholder*="cep" i]')
      .clear()
      .type('138700')

    // Tenta salvar
    cy.contains('button, input[type="submit"]', /salvar|atualizar|gravar/i)
      .should('be.visible')
      .click()

    // Validação da mensagem de erro esperada
    cy.contains(mensagemErroEsperada, { timeout: 4000 })
      .should('be.visible')
  })
})