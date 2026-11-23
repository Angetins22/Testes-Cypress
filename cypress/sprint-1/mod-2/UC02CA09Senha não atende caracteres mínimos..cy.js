// Ignora exceções não tratadas do JS da plataforma
Cypress.on('uncaught:exception', () => false)

describe('UC02 - CA09: Senha com Menos de 6 Caracteres (Análise do Valor Limite - Sem Salvar)', () => {

  const adminSenhaCurta = {
    nome: 'Juliana Ribeiro Alves',
    telefone: '16981234567',
    whatsapp: '16981234567',
    email: `juliana.alves${Date.now()}@email.com`,
    // Senha com menos de 6 caracteres (ex: 4 caracteres)
    senhaCurta: 'Ab1!' 
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

  it('Deve bloquear o cadastro ao inserir senha com menos de 6 caracteres, exibir aviso e cancelar', () => {

    // 1. Abrir o pop-up de cadastro
    cy.contains('button, a', 'Cadastrar Novo Administrador')
      .should('be.visible')
      .click()

    cy.url().should('include', '#cadastrar')

    // 2. Preencher os campos com dados realistas
    cy.get('#cadNome')
      .should('be.visible')
      .clear()
      .type(adminSenhaCurta.nome)

    cy.get('#cadTelefone')
      .should('be.visible')
      .clear()
      .type(adminSenhaCurta.telefone)

    cy.get('#cadWhatsapp')
      .should('be.visible')
      .clear()
      .type(adminSenhaCurta.whatsapp)

    cy.get('#cadEmail')
      .should('be.visible')
      .clear()
      .type(adminSenhaCurta.email)

    // Preenche o campo de senha com menos de 6 caracteres (<6)
    cy.get('#cadSenha')
      .should('be.visible')
      .clear()
      .type(adminSenhaCurta.senhaCurta, { log: false })

    // 3. Tentar clicar em "Salvar" para disparar a validação de limite mínimo de caracteres
    cy.get('#cadNome')
      .closest('form')
      .within(() => {
        cy.contains('button', 'Salvar')
          .should('be.visible')
          .click()
      })

    // 4. Validação: Verifica se o sistema bloqueia e emite mensagem informando que a senha exige mais caracteres
    cy.contains(/mínimo.*caracteres|6 caracteres|senha curta|quantidade de caracteres/i, { timeout: 5000 })
      .should('be.visible')

    // 5. Clica em "Cancelar" para fechar o pop-up e garantir que nenhum admin foi criado
    cy.get('#cadNome')
      .closest('form')
      .within(() => {
        cy.contains('button', 'Cancelar')
          .should('be.visible')
          .click()
      })

    // 6. Confirma que retornou à listagem sem alterar ou criar registros novos
    cy.contains('Controle de Administradores')
      .should('be.visible')
  })

})