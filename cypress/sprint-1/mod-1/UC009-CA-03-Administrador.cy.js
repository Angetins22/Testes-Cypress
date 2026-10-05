describe('UC009 - CA03: Erro de Tipo de Dado em Campos Numéricos - Administrador', () => {
  const loginUrl = 'https://boavisita.esw.dev.br/entrar'
  const emailAdm = 'tony@email.com'
  const senhaAdm = 'senha123'
  const avisoEsperado = /este campo aceita apenas números\./i

  beforeEach(() => {
    // 1. Pré-condição: Login com Administrador
    cy.visit(loginUrl)

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

    // 2. Acesso ao Editar Perfil (Falha aqui indicando bloqueio por ausência do botão)
    cy.contains(/editar perfil|meu perfil|perfil/i, { timeout: 4000 })
      .should('be.visible')
      .click()
  })

  it('deve impedir o envio e exibir aviso ao inserir letras no campo Número', () => {
    cy.get('input[name*="numero" i], input[placeholder*="numero" i]')
      .clear()
      .type('ABC')

    cy.contains('button, input[type="submit"]', /salvar|atualizar|gravar/i)
      .should('be.visible')
      .click()

    cy.contains(avisoEsperado, { timeout: 4000 })
      .should('be.visible')
  })

  it('deve impedir o envio e exibir aviso ao inserir letras no campo CEP', () => {
    cy.get('input[name*="cep" i], input[placeholder*="cep" i]')
      .clear()
      .type('ABCDEFGH')

    cy.contains('button, input[type="submit"]', /salvar|atualizar|gravar/i)
      .should('be.visible')
      .click()

    cy.contains(avisoEsperado, { timeout: 4000 })
      .should('be.visible')
  })

  it('deve impedir o envio e exibir aviso ao inserir letras no campo Telefone', () => {
    cy.get('input[name*="telefone" i], input[placeholder*="telefone" i]')
      .clear()
      .type('TELEFONEINV')

    cy.contains('button, input[type="submit"]', /salvar|atualizar|gravar/i)
      .should('be.visible')
      .click()

    cy.contains(avisoEsperado, { timeout: 4000 })
      .should('be.visible')
  })
})