// Ignora exceções não tratadas do JS da plataforma
Cypress.on('uncaught:exception', () => false)

describe('UC02 - CA04: Telefone e WhatsApp com Caracteres Inválidos (Sem Salvar)', () => {

  const dadosInvalidos = {
    nome: 'Admin Teste Cypress',
    telefoneInvalido: 'abc!@#$%', // Letras e símbolos inválidos
    whatsappInvalido: 'xyz*&(%$#'  // Letras e símbolos inválidos
  }

  beforeEach(() => {
    // 1. Acessar o sistema
    cy.visit('https://boavisita.esw.dev.br/')

    // 2. Acessar a tela de login
    cy.contains('a', 'Login').click({ force: true })

    // 3. Preencher as credenciais
    cy.get('#login-email')
      .should('be.visible')
      .type('margot@email.com')

    cy.get('#login-password')
      .should('be.visible')
      .type('Aluno2026!', { log: false })

    // 4. Realizar login
    cy.get('button[type="submit"], input[type="submit"]')
      .first()
      .click()

    // 5. Confirmar login
    cy.url({ timeout: 15000 })
      .should('include', '/dashboard')
      .and('not.include', '/entrar')

    // 6. Navegar até Administradores
    cy.contains('Usuários')
      .should('be.visible')
      .click()

    cy.contains('Administradores')
      .should('be.visible')
      .click()

    cy.contains('Listar Administradores')
      .should('be.visible')
      .click()

    // 7. Confirmar acesso à listagem
    cy.url().should('include', '/dashboard/administradores')

    cy.contains('Controle de Administradores')
      .should('be.visible')
  })

  it('Deve preencher os campos com caracteres inválidos e cancelar para não registrar nada', () => {

    // 1. Abrir o pop-up de cadastro
    cy.contains('button, a', 'Cadastrar Novo Administrador')
      .should('be.visible')
      .click()

    cy.url().should('include', '#cadastrar')

    // 2. Preencher os campos do modal com dados inválidos nos telefones
    cy.get('#cadNome')
      .should('be.visible')
      .clear()
      .type(dadosInvalidos.nome)

    cy.get('#cadTelefone')
      .should('be.visible')
      .clear()
      .type(dadosInvalidos.telefoneInvalido, { force: true })

    cy.get('#cadWhatsapp')
      .should('be.visible')
      .clear()
      .type(dadosInvalidos.whatsappInvalido, { force: true })

    // 3. Em vez de salvar, clica em "Cancelar" para fechar sem enviar nada ao banco
    cy.get('#cadNome')
      .closest('form')
      .within(() => {
        cy.contains('button', 'Cancelar')
          .should('be.visible')
          .click()
      })

    // 4. Validação: Confirma que o modal foi fechado e retornou para a listagem sem alterações
    cy.contains('Controle de Administradores')
      .should('be.visible')
  })

})