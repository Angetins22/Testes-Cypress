// Ignora exceções não tratadas do front-end da aplicação
Cypress.on('uncaught:exception', () => false)

describe('UC11 - CE01: Campos Obrigatórios Não Preenchidos', () => {

  // Campos obrigatórios que começam vazios (Cidade/Estado/País já vêm preenchidos)
  const obrigatoriosVazios = [
    '#cadNome', '#cadDescricao', '#cadHistoria',
    '#cadCep', '#cadRua', '#cadNumero', '#cadBairro'
  ]

  const caminhos = [
    {
      nome: 'Caminho 1: Deve impedir o cadastro com campos obrigatórios vazios a partir da Listagem (modal)',
      urlEsperada: '/pontos',
      abrir: () => {
        cy.contains('Pontos Turísticos').click()
        cy.contains('Listar Pontos').click()
        cy.url().should('include', '/pontos')
        cy.get('button, a')
          .filter((i, el) => /Cadastrar Ponto/i.test(el.innerText) && !el.classList.contains('submenu-item'))
          .filter(':visible')
          .first()
          .click()
        cy.contains('Cadastrar Ponto Turístico').should('be.visible')
      }
    },
    {
      nome: 'Caminho 2: Deve impedir o cadastro com campos obrigatórios vazios a partir do menu lateral (página)',
      urlEsperada: '/cadastrar/ponto',
      abrir: () => {
        cy.contains('Pontos Turísticos').click()
        cy.contains('a, button', /Cadastrar Ponto/i).should('be.visible').click()
        cy.url().should('include', '/cadastrar/ponto')
        cy.contains('Cadastrar Ponto Turístico').should('be.visible')
      }
    }
  ]

  caminhos.forEach((caminho) => {

    it(caminho.nome, () => {
      // Login
      cy.visit('https://boavisita.esw.dev.br/')
      cy.contains('a, button', 'Login').click({ force: true })
      cy.get('#login-email').should('be.visible').type('margot@email.com')
      cy.get('#login-password').should('be.visible').type('Aluno2026!', { log: false })
      cy.get('button[type="submit"], input[type="submit"]').first().click()
      cy.url({ timeout: 15000 }).should('include', '/dashboard')

      caminho.abrir()

      // Garante que os campos estão mesmo vazios antes de salvar
      obrigatoriosVazios.forEach((sel) => {
        cy.get(`input${sel}, textarea${sel}`).should('have.value', '')
      })

      // Tenta salvar com o formulário vazio
      cy.contains('button:visible', /Salvar/i).scrollIntoView().should('be.visible').click()

      // 1. O envio foi bloqueado: continua na mesma tela e o formulário segue visível
      cy.url().should('include', caminho.urlEsperada)
      cy.contains('Cadastrar Ponto Turístico').should('be.visible')

      // 2. Cada campo obrigatório vazio é sinalizado como inválido pelo navegador
      obrigatoriosVazios.forEach((sel) => {
        cy.get(`input${sel}, textarea${sel}`).should(($el) => {
          expect($el[0].validity.valueMissing, `campo ${sel} deveria estar inválido (obrigatório vazio)`).to.be.true
        })
      })

      // 3. O navegador está exibindo o aviso de campo obrigatório (primeiro campo inválido)
      cy.get('input#cadNome').should(($el) => {
        expect($el[0].validationMessage, 'mensagem de validação do Nome').not.to.eq('')
      })
    })

  })

})