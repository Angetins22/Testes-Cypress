// Ignora exceções não tratadas do JS da plataforma
Cypress.on('uncaught:exception', () => false)

describe('UC02 - CA01: Valores nulos nos campos obrigatórios', () => {

  const cenariosIndividuais = [
    {
      campoOmitido: 'Nome',
      mensagemEsperada: 'O nome é obrigatório.',
      dados: {
        nome: '',
        whatsapp: '16999998888',
        email: `adm.teste${Date.now()}1@email.com`,
        senha: 'SenhaA2026!'
      }
    },
    {
      campoOmitido: 'WhatsApp',
      mensagemEsperada: 'O WhatsApp é obrigatório.',
      dados: {
        nome: 'Admin Teste Cypress',
        whatsapp: '',
        email: `adm.teste${Date.now()}2@email.com`,
        senha: 'SenhaA2026!'
      }
    },
    {
      campoOmitido: 'E-mail',
      mensagemEsperada: 'O e-mail é obrigatório.',
      dados: {
        nome: 'Admin Teste Cypress',
        whatsapp: '16999998888',
        email: '',
        senha: 'SenhaA2026!'
      }
    },
    {
      campoOmitido: 'Senha',
      mensagemEsperada: 'A senha é obrigatória.',
      dados: {
        nome: 'Admin Teste Cypress',
        whatsapp: '16999998888',
        email: `adm.teste${Date.now()}3@email.com`,
        senha: ''
      }
    }
  ]

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

  // --------------------------------------------------------------------------
  // CENÁRIO 1: TODOS OS CAMPOS EM BRANCO
  // --------------------------------------------------------------------------
  it('Deve bloquear o cadastro e exibir todas as 4 mensagens de erro ao salvar com formulário completamente em branco', () => {
    cy.contains('button, a', 'Cadastrar Novo Administrador', { timeout: 10000 })
      .click({ force: true })

    cy.contains('Cadastrar Administrador')
      .parent()
      .parent()
      .within(() => {

        // Limpa todos os campos
        cy.get('input[placeholder="Nome completo"]').first().clear({ force: true })
        cy.get('input[placeholder="(99) 9999-9999"]').first().clear({ force: true })
        cy.get('input[placeholder="(99) 9999-9999"]').last().clear({ force: true })
        cy.get('input[placeholder="admin@email.com"]').first().clear({ force: true })
        cy.get('input[placeholder="Mínimo 6 caracteres"]').first().clear({ force: true })

        cy.contains('button', 'Salvar').click({ force: true })

        // Validação das mensagens
        cy.contains('O nome é obrigatório.').should('be.visible')
        cy.contains('O WhatsApp é obrigatório.').should('be.visible')
        cy.contains('O e-mail é obrigatório.').should('be.visible')
        cy.contains('A senha é obrigatória.').should('be.visible')
      })
  })

  // --------------------------------------------------------------------------
  // CENÁRIO 2: VALIDAÇÃO CAMPO POR CAMPO
  // --------------------------------------------------------------------------
  cenariosIndividuais.forEach((cenario) => {
    it(`Deve bloquear o cadastro ao deixar apenas o campo [${cenario.campoOmitido}] em branco`, () => {
      cy.contains('button, a', 'Cadastrar Novo Administrador', { timeout: 10000 })
        .click({ force: true })

      cy.contains('Cadastrar Administrador')
        .parent()
        .parent()
        .within(() => {

          // Nome
          const $nome = cy.get('input[placeholder="Nome completo"]').first().click({ force: true }).clear({ force: true })
          if (cenario.dados.nome) {
            $nome.type(cenario.dados.nome, { force: true })
          }

          // Telefone (opcional - limpo)
          cy.get('input[placeholder="(99) 9999-9999"]').first().click({ force: true }).clear({ force: true })

          // WhatsApp (segundo campo com máscara)
          const $whats = cy.get('input[placeholder="(99) 9999-9999"]').last().click({ force: true }).clear({ force: true })
          if (cenario.dados.whatsapp) {
            $whats.type(cenario.dados.whatsapp, { force: true })
          }

          // E-mail
          const $email = cy.get('input[placeholder="admin@email.com"]').first().click({ force: true }).clear({ force: true })
          if (cenario.dados.email) {
            $email.type(cenario.dados.email, { force: true })
          }

          // Senha
          const $senha = cy.get('input[placeholder="Mínimo 6 caracteres"]').first().click({ force: true }).clear({ force: true })
          if (cenario.dados.senha) {
            $senha.type(cenario.dados.senha, { force: true })
          }

          // Submeter formulário
          cy.contains('button', 'Salvar').click({ force: true })

          // Validar a mensagem de erro esperada
          cy.contains(cenario.mensagemEsperada).should('be.visible')
        })
    })
  })

})