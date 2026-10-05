describe('UC009: Editar Perfil - Turista', () => {
  const loginUrl = 'https://boavisita.esw.dev.br/entrar'
  const emailTurista = 'vic@email.com'
  const senhaTurista = 'senha123'

  beforeEach(() => {
    cy.visit(loginUrl)
  })

  it('deve aceder à funcionalidade Editar Perfil, alterar dados e salvar com sucesso', () => {
    // 1. Pré-condição: Turista autenticado no sistema
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

    // 2. Passo 1 do UC: Aceder à funcionalidade Editar Perfil a partir do menu/painel
    // Se a opção não existir na interface, o teste reprova aqui demonstrando bloqueio
    cy.contains(/editar perfil|meu perfil|perfil/i, { timeout: 4000 })
      .should('be.visible')
      .click()

    // 3. Passo 2 do UC: Alterar os campos do formulário
    cy.get('input[name*="nome" i], input[placeholder*="nome" i]')
      .clear()
      .type('Tony Turistainistrador Atualizado')

    cy.get('input[name*="telefone" i], input[placeholder*="telefone" i]')
      .clear()
      .type('11988887777')

    cy.get('input[name*="cep" i], input[placeholder*="cep" i]')
      .clear()
      .type('13870000')

    cy.get('input[name*="rua" i], input[placeholder*="rua" i], input[name*="logradouro" i]')
      .clear()
      .type('Avenida Central')

    cy.get('input[name*="numero" i], input[placeholder*="numero" i]')
      .clear()
      .type('500')

    // 4. Passo 3 do UC: Clicar em "Salvar"
    cy.contains('button, input[type="submit"]', /salvar|atualizar|gravar/i)
      .should('be.visible')
      .click()

    // 5. Validação final: Confirmação da notificação esperada
    cy.contains(/perfil atualizado com sucesso!/i, { timeout: 6000 })
      .should('be.visible')
  })
})