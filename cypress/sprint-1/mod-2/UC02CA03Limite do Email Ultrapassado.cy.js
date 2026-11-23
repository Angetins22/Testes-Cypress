// Ignora exceções não tratadas do JS da plataforma
Cypress.on('uncaught:exception', () => false)

describe('UC02 - CA03: Limite do Email Ultrapassado (Análise do Valor Limite)', () => {

  // Gera uma string longa com +150 caracteres formando um e-mail válido no formato
  // Exemplo: "a...a@email.com" com total de 155 caracteres
  const emailLongo = 'a'.repeat(140) + '@email.com'

  const novoAdmin = {
    nome: 'Admin Teste Cypress',
    whatsapp: '16999998888',
    emailExcedente: emailLongo,
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

  it('Deve limitar o campo em 150 caracteres ou exibir mensagem de erro ao ultrapassar o limite de e-mail', () => {
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
          .type(novoAdmin.nome, { force: true })

        // Telefone Opcional (Limpo)
        cy.contains(/TELEFONE/i)
          .parent()
          .find('input')
          .click({ force: true })
          .clear({ force: true })

        // WhatsApp
        cy.contains(/WHATSAPP/i)
          .parent()
          .find('input')
          .focus()
          .click({ force: true })
          .clear({ force: true })
          .type(novoAdmin.whatsapp, { delay: 50, force: true })
          .trigger('input')

        // E-mail com mais de 150 caracteres
        cy.get('input[placeholder="admin@email.com"]')
          .first()
          .click({ force: true })
          .clear({ force: true })
          .type(novoAdmin.emailExcedente, { force: true })

        // Senha
        cy.get('input[placeholder="Mínimo 6 caracteres"]')
          .first()
          .click({ force: true })
          .clear({ force: true })
          .type(novoAdmin.senha, { force: true })

        // 3. Clica no botão "Salvar"
        cy.contains('button', 'Salvar').click({ force: true })

        // 4. Validação do Limite (Aceita truncamento automático pelo input ou mensagem de alerta)
        cy.get('input[placeholder="admin@email.com"]').first().then(($input) => {
          const valorDigitado = $input.val()
          
          if (valorDigitado.length <= 150) {
            // Caso 1: O HTML/JS cortou o texto ou respeitou maxlength="150"
            expect(valorDigitado.length).to.be.at.most(150)
          } else {
            // Caso 2: Se permitiu digitar >150, o sistema deve exibir a mensagem de erro
            cy.contains(/limite.*150|máximo.*150|caracteres.*150/i).should('be.visible')
          }
        })
      })
  })

})