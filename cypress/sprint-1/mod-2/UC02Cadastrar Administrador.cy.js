
describe('UC02: Cadastrar Administrador - Cenário Principal', () => {

  const novoAdmin = {
    nome: 'Admin Teste Cypress',
    telefone: '16999998888',
    whatsapp: '16999998888',
    email: `adm.cypresstestando@email.com`,
    senha: 'SenhaA2026!'
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

  it('Deve preencher o formulário no pop-up, salvar e verificar o novo administrador na listagem', () => {

    // 1. Abrir o pop-up de cadastro
    cy.contains('button, a', 'Cadastrar Novo Administrador')
      .should('be.visible')
      .click()

    cy.url().should('include', '#cadastrar')

    // 2. Preencher o nome
    cy.get('#cadNome')
      .should('be.visible')
      .clear()
      .type(novoAdmin.nome)

    // 3. Preencher o telefone
    cy.get('#cadTelefone')
      .should('be.visible')
      .clear()
      .type(novoAdmin.telefone)

    // 4. Preencher o WhatsApp
    cy.get('#cadWhatsapp')
      .should('be.visible')
      .clear()
      .type(novoAdmin.whatsapp)

    // 5. Preencher o e-mail
    cy.get('#cadEmail')
      .should('be.visible')
      .clear()
      .type(novoAdmin.email)

    // 6. Preencher a senha
    cy.get('#cadSenha')
      .should('be.visible')
      .clear()
      .type(novoAdmin.senha, { log: false })

    // 7. Verificar se os campos foram preenchidos
    cy.get('#cadNome').should('have.value', novoAdmin.nome)
    cy.get('#cadEmail').should('have.value', novoAdmin.email)
    cy.get('#cadTelefone').should('not.have.value', '')
    cy.get('#cadWhatsapp').should('not.have.value', '')
    cy.get('#cadSenha').should('have.value', novoAdmin.senha)

    // 8. Clicar no botão Salvar do formulário
    cy.get('#cadNome')
      .closest('form')
      .within(() => {
        cy.contains('button', 'Salvar')
          .should('be.visible')
          .click()
      })

    // 9. Verificar se existe algum erro de validação
    cy.get('#cadEmail').then(($email) => {
      const email = $email[0]

      if (!email.checkValidity()) {
        throw new Error(
          'O campo e-mail está inválido: ' + email.validationMessage
        )
      }
    })

    // 10. Voltar à listagem para verificar o cadastro
    cy.visit('https://boavisita.esw.dev.br/dashboard/administradores')

    cy.contains('Controle de Administradores')
      .should('be.visible')

    // 11. Verificar se o administrador foi cadastrado
    cy.contains(novoAdmin.email, { timeout: 15000 })
      .should('be.visible')

  })

})
