describe('UC009 - CA: Editar Perfil - Descarte de Alterações ao Cancelar', () => {
  const loginUrl = 'https://boavisita.esw.dev.br/entrar'
  const emailGestor = 'spike@email.com'
  const senhaGestor = 'senha123'

  beforeEach(() => {
    // 1. Pré-condição: Login com Gestorinistrador
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
    cy.url().should('not.include', '/entrar')

    // 2. Acesso à funcionalidade Editar Perfil (ponto que falha acusando bloqueio pela ausência do botão)
    cy.contains(/editar perfil|meu perfil|perfil/i, { timeout: 4000 })
      .should('be.visible')
      .click()
  })

  it('deve descartar as alterações nos campos ao acionar o botão de cancelar', () => {
    // Captura o valor inicial antes de editar (exemplo: campo Nome)
    cy.get('input[name*="nome" i], input[placeholder*="nome" i]')
      .invoke('val')
      .then((valorOriginal) => {
        // Altera temporariamente os campos com novos dados
        cy.get('input[name*="nome" i], input[placeholder*="nome" i]')
          .clear()
          .type('Nome Provisorio Descartavel')

        cy.get('input[name*="telefone" i], input[placeholder*="telefone" i]')
          .clear()
          .type('11999990000')

        // Clica no botão de cancelar a operação
        cy.contains('button, a', /cancelar|voltar|descartar/i)
          .should('be.visible')
          .click()

        // Validação: Confirma que retornou à tela/visualização e o dado temporário foi descartado
        cy.contains('Nome Provisorio Descartavel').should('not.exist')
        if (valorOriginal) {
          cy.contains(valorOriginal).should('be.visible')
        }
      })
  })
})