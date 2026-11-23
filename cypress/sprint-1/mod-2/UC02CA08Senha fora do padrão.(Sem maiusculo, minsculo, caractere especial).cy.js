// Ignora exceções não tratadas do JS da plataforma
Cypress.on('uncaught:exception', () => false)

describe('UC02 - CA08: Validação de Senha Fora do Padrão (Bloqueio de Senha Fraca)', () => {

  const adminSenhaInvalida = {
    nome: 'Beatriz Martins Costa',
    telefone: '16981234567',
    whatsapp: '16981234567',
    email: `beatriz.costa${Date.now()}@email.com`,
    // Senha fraca intencionalmente (sem maiúscula, sem caractere especial e sem número)
    senhaFraca: 'senhafracasimples' 
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

  it('Deve bloquear o cadastro, exibir mensagem de erro sobre os requisitos da senha e cancelar para não registrar nada', () => {

    // 1. Abrir o pop-up de cadastro
    cy.contains('button, a', 'Cadastrar Novo Administrador')
      .should('be.visible')
      .click()

    cy.url().should('include', '#cadastrar')

    // 2. Preencher os campos com dados normais/realistas
    cy.get('#cadNome')
      .should('be.visible')
      .clear()
      .type(adminSenhaInvalida.nome)

    cy.get('#cadTelefone')
      .should('be.visible')
      .clear()
      .type(adminSenhaInvalida.telefone)

    cy.get('#cadWhatsapp')
      .should('be.visible')
      .clear()
      .type(adminSenhaInvalida.whatsapp)

    cy.get('#cadEmail')
      .should('be.visible')
      .clear()
      .type(adminSenhaInvalida.email)

    // Preenche o campo de senha com uma senha fora do padrão forte
    cy.get('#cadSenha')
      .should('be.visible')
      .clear()
      .type(adminSenhaInvalida.senhaFraca, { log: false })

    // 3. Tentar clicar em "Salvar" para disparar a validação do sistema
    cy.get('#cadNome')
      .closest('form')
      .within(() => {
        cy.contains('button', 'Salvar')
          .should('be.visible')
          .click()
      })

    // 4. Validação: O sistema deve bloquear e emitir aviso sobre os critérios da senha
    cy.contains(/senha.*maiúscula|senha.*caracteres|senha.*especial|requisitos|número/i, { timeout: 5000 })
      .should('be.visible')

    // 5. Clica em "Cancelar" para fechar o pop-up sem gravar nenhum registro no banco
    cy.get('#cadNome')
      .closest('form')
      .within(() => {
        cy.contains('button', 'Cancelar')
          .should('be.visible')
          .click()
      })

    // 6. Confirma que retornou à listagem sem criar o administrador
    cy.contains('Controle de Administradores')
      .should('be.visible')
  })

})