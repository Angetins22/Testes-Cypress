describe('UC009 - VL01: Valores Nulos ao Editar Perfil - Turistainistrador', () => {
  const loginUrl = 'https://boavisita.esw.dev.br/entrar'
  const emailTurista = 'vic@email.com'
  const senhaTurista = 'senha123'
  const avisoCampoObrigatorio = /campo obrigatório|preencha este campo|não pode ser vazio/i

  beforeEach(() => {
    // 1. Pré-condição: Login com Turista
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

  it('deve impedir a gravação e indicar erro ao limpar campos obrigatórios para valores nulos/vazios', () => {
    // 3. Esvazia todos os campos editáveis do perfil (atribui valor "")
    cy.get('input[name*="nome" i], input[placeholder*="nome" i]').clear()
    cy.get('input[name*="telefone" i], input[placeholder*="telefone" i]').clear()
    cy.get('input[name*="cep" i], input[placeholder*="cep" i]').clear()
    cy.get('input[name*="rua" i], input[placeholder*="rua" i], input[name*="logradouro" i]').clear()
    cy.get('input[name*="numero" i], input[placeholder*="numero" i]').clear()

    // 4. Tenta submeter o formulário com dados vazios
    cy.contains('button, input[type="submit"]', /salvar|atualizar|gravar/i)
      .should('be.visible')
      .click()

    // 5. Validação: O sistema não deve exibir sucesso e deve alertar sobre obrigatoriedade
    cy.contains(/perfil atualizado com sucesso!/i).should('not.exist')

    // Valida mensagem textual da aplicação ou validação nativa de HTML5 (required)
    cy.get('body').then(($body) => {
      if ($body.find('input:invalid').length > 0) {
        cy.get('input:invalid').should('exist')
      } else {
        cy.contains(avisoCampoObrigatorio, { timeout: 4000 }).should('be.visible')
      }
    })
  })
})