// Ignora exceções não tratadas do JS da plataforma
Cypress.on('uncaught:exception', () => false)

describe('UC02 - CA10: Limite da Senha Ultrapassado (Análise do Valor Limite - Sem Salvar Nenhum Adm)', () => {

  const adminSenhaLonga = {
    nome: 'Fernanda Lima Correia',
    telefone: '16981234567',
    whatsapp: '16981234567',
    email: `fernanda.correia${Date.now()}@email.com`,
    // String com mais de 50 caracteres para exceder o VARCHAR(50) da senha
    senhaExcedente: 'SenhaMuitoLongaComMaisDeCinquentaCaracteresParaTestarOlimiteMaximoDoCampo2026!@#' 
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

  it('Deve preencher a senha com mais de 50 caracteres e apenas cancelar, sem criar nenhum admin', () => {

    // 1. Abrir o pop-up de cadastro
    cy.contains('button, a', 'Cadastrar Novo Administrador')
      .should('be.visible')
      .click()

    cy.url().should('include', '#cadastrar')

    // 2. Preencher os campos com dados realistas
    cy.get('#cadNome')
      .should('be.visible')
      .clear()
      .type(adminSenhaLonga.nome)

    cy.get('#cadTelefone')
      .should('be.visible')
      .clear()
      .type(adminSenhaLonga.telefone)

    cy.get('#cadWhatsapp')
      .should('be.visible')
      .clear()
      .type(adminSenhaLonga.whatsapp)

    cy.get('#cadEmail')
      .should('be.visible')
      .clear()
      .type(adminSenhaLonga.email)

    // Preenche o campo de senha com mais de 50 caracteres (>50)
    cy.get('#cadSenha')
      .should('be.visible')
      .clear()
      .type(adminSenhaLonga.senhaExcedente, { log: false, force: true })

    // 3. Em vez de clicar em salvar, cancela imediatamente para garantir que NADA será salvo
    cy.get('#cadNome')
      .closest('form')
      .within(() => {
        cy.contains('button', 'Cancelar')
          .should('be.visible')
          .click()
      })

    // 4. Confirma que retornou à listagem de administradores sem realizar nenhum cadastro
    cy.contains('Controle de Administradores')
      .should('be.visible')
  })

})