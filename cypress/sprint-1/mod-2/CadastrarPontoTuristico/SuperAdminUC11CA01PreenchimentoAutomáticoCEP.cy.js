// Ignora exceções não tratadas do front-end da aplicação
Cypress.on('uncaught:exception', () => false)

describe('UC11 - CA01: Preenchimento Automático do Endereço via API de CEP', () => {

  const cepEspecifico = '13870060'

  const caminhos = [
    {
      nome: 'Caminho 1: formulário aberto pelo botão "+ Cadastrar Ponto" da Listagem (modal)',
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
      nome: 'Caminho 2: formulário aberto pelo menu lateral (página)',
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
      cy.intercept('GET', '**/viacep.com.br/ws/**').as('consultaViaCEP')

      // Login
      cy.visit('https://boavisita.esw.dev.br/')
      cy.contains('a, button', 'Login').click({ force: true })
      cy.get('#login-email').should('be.visible').type('margot@email.com ')
      cy.get('#login-password').should('be.visible').type('Aluno2026!', { log: false })
      cy.get('button[type="submit"], input[type="submit"]').first().click()
      cy.url({ timeout: 15000 }).should('include', '/dashboard')

      caminho.abrir()

      // Limpa os campos que o ViaCEP preenche (Cidade/Estado/País já vêm com valor padrão,
      // senão o teste passaria mesmo sem o autopreenchimento)
      cy.get('input#cadRua').should('be.visible').clear()
      cy.get('input#cadBairro').clear()
      cy.get('input#cadCidade').clear()
      cy.get('input#cadEstado').clear()

      // Digita o CEP e tira o foco para disparar a consulta
      cy.get('input#cadCep').should('be.visible').clear().type(cepEspecifico).blur()

      // Espera a resposta e guarda o que a API devolveu
      cy.wait('@consultaViaCEP', { timeout: 10000 }).then(({ response }) => {
        expect(response.statusCode).to.eq(200)
        const dados = response.body
        expect(dados.erro, 'CEP não encontrado pela API').to.be.undefined

        // Os campos precisam refletir exatamente o que a API devolveu
        cy.get('input#cadRua').should('have.value', dados.logradouro)
        cy.get('input#cadBairro').should('have.value', dados.bairro)
        cy.get('input#cadCidade').should('have.value', dados.localidade)
        cy.get('input#cadEstado').should('have.value', dados.uf)
      })

      // Nenhum dos campos pode ter ficado vazio
      ;['#cadRua', '#cadBairro', '#cadCidade', '#cadEstado'].forEach((sel) => {
        cy.get(`input${sel}`).should('not.have.value', '')
      })
    })

  })

})