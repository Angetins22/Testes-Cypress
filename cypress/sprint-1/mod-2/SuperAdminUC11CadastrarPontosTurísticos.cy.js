// Ignora exceções não tratadas do front-end da aplicação
Cypress.on('uncaught:exception', () => false)

describe('UC11: Cadastrar Pontos Turísticos - São João da Boa Vista', () => {

  const pontoTuristico = (token) => ({
    nome: `Theatro Municipal de São João da Boa Vista ${token}`,
    status: 'Aberto',
    descricao: 'Um dos mais belos patrimônios históricos e arquitetônicos da cidade de São João da Boa Vista.',
    historia: 'Inaugurado em 1914, o Theatro Municipal é um marco cultural da região, abrigando apresentações teatrais, concertos e eventos artísticos de grande relevância.',
    video: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    cep: '13870000',
    rua: 'Praça Governador Armando de Salles Oliveira',
    numero: 'S/N',
    bairro: 'Centro',
    complemento: 'Próximo à fonte luminosa',
    cidade: 'São João da Boa Vista',
    estado: 'SP',
    pais: 'Brasil'
  })

  // Digita só quando o campo está visível e habilitado
  const digitar = (seletor, valor, limpar = true) => {
    let c = cy.get(seletor, { timeout: 10000 })
      .should('be.visible')
      .and('not.be.disabled')
      .scrollIntoView()
    if (limpar) c = c.clear()
    c.type(valor, { parseSpecialCharSequences: false })
  }

  const preencherFormularioCadastro = (p) => {
    // CEP primeiro: o ViaCEP preenche Rua/Bairro/Cidade/Estado, então esperamos antes de sobrescrever
    digitar('input#cadCep', p.cep)
    cy.get('input#cadCep').blur()
    cy.wait(1500)

    // 1. Informações Gerais
    digitar('input#cadNome', p.nome, false)
    cy.get('select:visible').first().select(p.status)
    digitar('textarea#cadDescricao', p.descricao, false)
    digitar('textarea#cadHistoria', p.historia, false)
    digitar('input#cadVideo', p.video, false)

    // 2. Endereço
    digitar('input#cadRua', p.rua)
    digitar('input#cadNumero', p.numero)
    digitar('input#cadBairro', p.bairro)
    digitar('input#cadComplemento', p.complemento)
    digitar('input#cadCidade', p.cidade)
    digitar('input#cadEstado', p.estado)
    digitar('input#cadPais', p.pais)

    // 3. Salva
    cy.contains('button:visible', /Salvar/i)
      .scrollIntoView()
      .should('be.visible')
      .click()
  }

  const caminhos = [
    {
      nome: 'Caminho 1: Deve cadastrar um novo ponto turístico a partir do botão "+ Cadastrar Ponto" da Listagem',
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
      nome: 'Caminho 2: Deve cadastrar um novo ponto turístico a partir do menu lateral (Cadastrar Ponto)',
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
      const token = String(Date.now())
      const p = pontoTuristico(token)

      // Login
      cy.visit('https://boavisita.esw.dev.br/')
      cy.contains('a, button', 'Login').click({ force: true })
      cy.get('#login-email').should('be.visible').type('margot@email.com  ')
      cy.get('#login-password').should('be.visible').type('Aluno2026!', { log: false })
      cy.get('button[type="submit"], input[type="submit"]').first().click()
      cy.url({ timeout: 15000 }).should('include', '/dashboard')

      caminho.abrir()
      preencherFormularioCadastro(p)

      // Validação: o ponto (nome único) aparece na listagem
      cy.wait(2000)
      cy.visit('https://boavisita.esw.dev.br/dashboard/pontos')
      cy.contains('Controle de Pontos Turísticos').should('be.visible')
      cy.contains(p.nome, { timeout: 10000 }).should('be.visible')
    })

  })

})