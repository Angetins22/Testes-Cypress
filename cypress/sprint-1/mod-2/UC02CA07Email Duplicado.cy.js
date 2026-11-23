// Ignora exceções não tratadas do JS da plataforma
Cypress.on('uncaught:exception', () => false)

describe('UC02 - CA07: E-mail Duplicado (Classe de Equivalência - Sem Salvar/Criar)', () => {

  const adminEmailDuplicado = {
    nome: 'Admin Teste Duplicado',
    telefone: '16999998888',
    whatsapp: '16999998888',
    // Usamos um e-mail que já existe na base (ex: o próprio e-mail do admin logado ou outro já cadastrado)
    emailExistente: 'margot@email.com', 
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

  it('Deve tentar cadastrar com e-mail duplicado, validar a mensagem e cancelar para não registrar nada', () => {

    // 1. Abrir o pop-up de cadastro
    cy.contains('button, a', 'Cadastrar Novo Administrador')
      .should('be.visible')
      .click()

    cy.url().should('include', '#cadastrar')

    // 2. Preencher o formulário com um e-mail que já está cadastrado
    cy.get('#cadNome')
      .should('be.visible')
      .clear()
      .type(adminEmailDuplicado.nome)

    cy.get('#cadTelefone')
      .should('be.visible')
      .clear()
      .type(adminEmailDuplicado.telefone)

    cy.get('#cadWhatsapp')
      .should('be.visible')
      .clear()
      .type(adminEmailDuplicado.whatsapp)

    // Insere o e-mail duplicado/existente
    cy.get('#cadEmail')
      .should('be.visible')
      .clear()
      .type(adminEmailDuplicado.emailExistente)

    cy.get('#cadSenha')
      .should('be.visible')
      .clear()
      .type(adminEmailDuplicado.senha, { log: false })

    // 3. Tenta clicar em "Salvar" para acionar a validação de e-mail já existente
    cy.get('#cadNome')
      .closest('form')
      .within(() => {
        cy.contains('button', 'Salvar')
          .should('be.visible')
          .click()
      })

    // 4. Validação: Verifica se o sistema exibe mensagem informando que o e-mail já está em uso
    cy.contains(/e-mail.*já.*cadastrado|e-mail.*já.*existe|e-mail.*em uso|já cadastrado/i, { timeout: 5000 })
      .should('be.visible')

    // 5. Clica em "Cancelar" para fechar o modal e garantir que nenhum admin novo foi criado
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