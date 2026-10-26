// Ignora exceções não tratadas do front-end da aplicação
Cypress.on('uncaught:exception', () => false)

describe('UC11 - Cadastro com dados inválidos: o sistema NÃO deve aceitar', () => {

  // Todos os dados inválidos de uma vez (CEP válido, para o formulário poder ser enviado)
  const invalidos = (token) => ({
    nome: `Parque @ Central #1 $2026* ${token}`,
    descricao: 'Descrição de teste',
    historia: 'História de teste',
    video: 'https://www.google.com/noticias/materia.pdf', // não é YouTube nem Drive
    cep: '13870000',
    rua: 'Rua das Flores @ N°10 #$',
    numero: '@#$%*',
    bairro: 'Centro #Bairro$ %*',
    complemento: 'Perto @#$ %*',
    cidade: 'São João @#$ 123',
    estado: 'SP12 @#$',
    pais: 'Brasil123 @#$'
  })

  // Regex do que NÃO deveria ser aceito em cada campo
  const proibido = {
    nome: /[@#$%*=+]/,
    rua: /[@#$]/,
    numero: /[@#$%*]/,
    bairro: /[#$%*]/,
    complemento: /[@#$%*]/,
    cidade: /[@#$%*\d]/,
    estado: /[@#$\d]/,
    pais: /[@#$\d]/
  }

  // Vídeo só é válido se for YouTube ou Google Drive
  const urlPermitida = /^https?:\/\/(www\.)?(youtube\.com|youtu\.be|drive\.google\.com)\//i

  const CAMPOS = {
    nome:        { sel: 'input#cadNome' },
    descricao:   { sel: 'textarea#cadDescricao' },
    historia:    { sel: 'textarea#cadHistoria' },
    video:       { sel: 'input#cadVideo' },
    cep:         { sel: 'input#cadCep' },
    rua:         { sel: 'input#cadRua' },
    numero:      { sel: 'input#cadNumero' },
    bairro:      { sel: 'input#cadBairro' },
    complemento: { label: /^\s*Complemento/i },
    cidade:      { sel: 'input#cadCidade' },
    estado:      { sel: 'input#cadEstado' },
    pais:        { label: /^\s*Pa[ií]s/i }
  }

  const obterCampo = (chave) => {
    const c = CAMPOS[chave]
    if (c.sel) return cy.get(c.sel, { timeout: 10000 })
    return cy.contains('label:visible', c.label).then(($l) => {
      const id = $l.attr('for')
      return id ? cy.get(`#${id}`) : cy.wrap($l).parent().find('input:visible').first()
    })
  }

  const digitar = (chave, valor) => {
    obterCampo(chave)
      .should('be.visible')
      .and('not.be.disabled')
      .scrollIntoView()
      .clear()
      .type(valor, { parseSpecialCharSequences: false })
  }

  const caminhos = [
    {
      nome: 'Caminho 1 (botão "+ Cadastrar Ponto" da Listagem / modal)',
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
      nome: 'Caminho 2 (menu lateral > Cadastrar Ponto / página)',
      abrir: () => {
        cy.contains('Pontos Turísticos').click()
        cy.contains('a, button', /Cadastrar Ponto/i).should('be.visible').click()
        cy.url().should('include', '/cadastrar/ponto')
        cy.contains('Cadastrar Ponto Turístico').should('be.visible')
      }
    }
  ]

  // Um teste por caminho = 2 logins no total
  caminhos.forEach((caminho) => {

    it(`${caminho.nome}: não deve permitir cadastrar com dados inválidos`, () => {
      const token = String(Date.now())
      const dados = invalidos(token)
      const aceitos = []

      // Login
      cy.visit('https://boavisita.esw.dev.br/')
      cy.contains('a, button', 'Login').click({ force: true })
      cy.get('#login-email').should('be.visible').type('alfredo@email.com')
      cy.get('#login-password').should('be.visible').type('Teste@456', { log: false })
      cy.get('button[type="submit"], input[type="submit"]').first().click()
      cy.url({ timeout: 15000 }).should('include', '/dashboard')

      caminho.abrir()

      // Preenche tudo (CEP primeiro, espera o ViaCEP autopreencher antes de sobrescrever)
      digitar('cep', dados.cep)
      cy.get('input#cadCep').blur()
      cy.wait(1500)

      digitar('nome', dados.nome)
      cy.get('select:visible').first().select('Aberto')
      digitar('descricao', dados.descricao)
      digitar('historia', dados.historia)
      digitar('video', dados.video)
      digitar('rua', dados.rua)
      digitar('numero', dados.numero)
      digitar('bairro', dados.bairro)
      digitar('complemento', dados.complemento)
      digitar('cidade', dados.cidade)
      digitar('estado', dados.estado)
      digitar('pais', dados.pais)

      // Registra quais campos aceitaram dado inválido na digitação
      Object.keys(proibido).forEach((campo) => {
        obterCampo(campo).invoke('val').then((valor) => {
          if (proibido[campo].test(valor)) aceitos.push(`${campo}="${valor}"`)
        })
      })

      // URL fora de YouTube/Drive
      obterCampo('video').invoke('val').then((valor) => {
        if (!urlPermitida.test(valor)) aceitos.push(`video="${valor}" (URL fora de YouTube/Drive)`)
      })

      // Anti falso positivo: o navegador precisa deixar enviar o formulário
      cy.get('form:visible').first().then(($form) => {
        const barrando = Array.from($form[0].elements)
          .filter((el) => el.willValidate && !el.checkValidity())
          .map((el) => `${el.id || el.name} (${el.validationMessage})`)

        expect(
          barrando,
          `O navegador barraria o envio por: ${barrando.join(' | ')}. Corrija o script, o teste não é confiável assim.`
        ).to.have.length(0)
      })

      cy.then(() => {
        cy.log('Campos que aceitaram dado inválido: ' + (aceitos.join(' | ') || 'nenhum'))
      })

      // Salva
      cy.contains('button:visible', /Salvar/i).scrollIntoView().should('be.visible').click()

      // Confere na listagem se o ponto foi cadastrado
      cy.wait(2000)
      cy.visit('https://boavisita.esw.dev.br/dashboard/pontos')
      cy.contains('Controle de Pontos Turísticos').should('be.visible')
      cy.contains('Pedra Balão').should('be.visible')

      cy.get('#ptoList').should(($lista) => {
        const cadastrou = $lista.text().includes(token)
        expect(
          cadastrou,
          `O sistema PERMITIU cadastrar com dados inválidos. Campos aceitos: ${aceitos.join(' | ') || 'nenhum'}`
        ).to.be.false
      })
    })

  })

})