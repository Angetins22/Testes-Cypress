// Ignora exceções não tratadas do JS da plataforma
Cypress.on('uncaught:exception', () => false)

describe('UC02 - CA02: Email fora do padrão (Email sem @)', () => {

  const adminComEmailInvalido = {
    nome: 'Admin Teste Cypress',
    whatsapp: '16999998888',
    emailInvalido: 'adm.testecypress.com', // Formato sem @
    senha: 'SenhaA2026!'
  }

  beforeEach(() => {
    // 1. Acessa a Home do sistema
    cy.visit('https://boavisita.esw.dev.br/')

    // 2. Realiza o login como Adm Super
    cy.contains('a', 'Login').click({ force: true })

    cy.get('input[type="email"], input[id="email"], input[name="email"]')
      .first()
      .should('be.visible')
      .type('margot@email.com')

    cy.get('input[type="password"]')
      .first()
      .should('be.visible')
      .type('Aluno2026!')

    cy.get('button[type="submit"], input[type="submit"]').first().click()

    // Aguarda o redirecionamento pós-login
    cy.url({ timeout: 10000 }).should('not.include', '/entrar')

    // 3. Navegação até a listagem de administradores
    cy.contains('Usuários', { timeout: 10000 }).should('be.visible').click()
    cy.contains('Administradores', { timeout: 10000 }).should('be.visible').click()
    cy.contains('Listar Administradores', { timeout: 10000 }).should('be.visible').click()

    cy.contains('Controle de Administradores', { timeout: 10000 }).should('be.visible')
  })

  it('Deve bloquear o cadastro e exibir mensagem de erro ao informar um e-mail sem @', () => {
    // 1. Clica no botão "Cadastrar Novo Administrador"
    cy.contains('button, a', 'Cadastrar Novo Administrador', { timeout: 10000 })
      .click({ force: true })

    // 2. Preenche o formulário isolando as ações no modal de cadastro
    cy.contains('Cadastrar Administrador')
      .parent()
      .parent()
      .within(() => {

        // Nome
        cy.get('input[placeholder="Nome completo"]')
          .first()
          .click({ force: true })
          .clear({ force: true })
          .type(adminComEmailInvalido.nome, { force: true })

        // Telefone Opcional (Limpo)
        cy.contains(/TELEFONE/i)
          .parent()
          .find('input')
          .click({ force: true })
          .clear({ force: true })

        // WhatsApp: Mapeia estritamente o bloco com o rótulo "WHATSAPP *"
        cy.contains(/WHATSAPP/i)
          .parent()
          .find('input')
          .focus()
          .click({ force: true })
          .clear({ force: true })
          .type(adminComEmailInvalido.whatsapp, { delay: 50, force: true })
          .trigger('input')

        // E-mail inválido (sem @)
        cy.get('input[placeholder="admin@email.com"]')
          .first()
          .click({ force: true })
          .clear({ force: true })
          .type(adminComEmailInvalido.emailInvalido, { force: true })

        // Senha
        cy.get('input[placeholder="Mínimo 6 caracteres"]')
          .first()
          .click({ force: true })
          .clear({ force: true })
          .type(adminComEmailInvalido.senha, { force: true })

        // 3. Clica no botão "Salvar"
        cy.contains('button', 'Salvar').click({ force: true })

        // 4. Validação: Verifica a mensagem exata exibida na imagem
        cy.contains('E-mail inválido.').should('be.visible')
      })
  })

})