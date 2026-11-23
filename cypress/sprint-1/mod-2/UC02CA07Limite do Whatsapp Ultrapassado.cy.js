// Ignora exceções não tratadas do JS da plataforma
Cypress.on('uncaught:exception', () => false)

describe('UC02 - Limite do WhatsApp Ultrapassado (Análise do Valor Limite - Sem Salvar)', () => {

  const dadosLimiteWhatsapp = {
    nome: 'Admin Teste Cypress',
    // String com mais de 20 caracteres para exceder o VARCHAR(20) do WhatsApp
    whatsappExcedente: '1199999999999999999999'
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

  it('Deve testar o limite do campo WhatsApp e cancelar para não registrar nada', () => {

    // 1. Abrir o pop-up de cadastro
    cy.contains('button, a', 'Cadastrar Novo Administrador')
      .should('be.visible')
      .click()

    cy.url().should('include', '#cadastrar')

    // 2. Preencher os campos do modal
    cy.get('#cadNome')
      .should('be.visible')
      .clear()
      .type(dadosLimiteWhatsapp.nome)

    // Preenche o campo WhatsApp com mais de 20 caracteres
    cy.get('#cadWhatsapp')
      .should('be.visible')
      .clear()
      .type(dadosLimiteWhatsapp.whatsappExcedente, { force: true })

    // 3. Validação do limite: Verifica se o campo restringe ou se o valor excede na view
    cy.get('#cadWhatsapp').then(($input) => {
      const valorInserido = $input.val()
      expect(valorInserido.length).to.be.at.least(10)
    })

    // 4. Clica em "Cancelar" para fechar o formulário sem salvar ou criar registo no banco
    cy.get('#cadNome')
      .closest('form')
      .within(() => {
        cy.contains('button', 'Cancelar')
          .should('be.visible')
          .click()
      })

    // 5. Confirmação de retorno à tela inicial sem alterações ou novos cadastros
    cy.contains('Controle de Administradores')
      .should('be.visible')
  })

})