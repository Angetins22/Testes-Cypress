// Ignora exceções não tratadas do front-end da aplicação
Cypress.on('uncaught:exception', () => false)

describe('UC11 - Cadastrar Pontos Turísticos: Análise do Valor Limite (VL01 a VL12)', () => {

  const gerar = (qtd, ch = 'a') => ch.repeat(qtd)

  // Dados válidos (base de todos os testes)
  const validos = (token) => ({
    nome: `Ponto VL ${token}`,
    descricao: 'Descrição válida do ponto turístico para teste.',
    historia: 'História e contexto cultural válidos para teste.',
    video: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    cep: '13870000',
    rua: 'Praça Governador Armando de Salles Oliveira',
    numero: '10',
    bairro: 'Centro',
    complemento: 'Perto da fonte',
    cidade: 'São João da Boa Vista',
    estado: 'SP',
    pais: 'Brasil'
  })

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
      .type(valor, { parseSpecialCharSequences: false, delay: 0 })
  }

  // CEP primeiro, por causa do autopreenchimento do ViaCEP
  const preencher = (valores) => {
    digitar('cep', valores.cep)
    cy.get('input#cadCep').blur()
    cy.wait(1500)

    digitar('nome', valores.nome)
    cy.get('select:visible').first().select('Aberto')
    digitar('descricao', valores.descricao)
    digitar('historia', valores.historia)
    digitar('video', valores.video)
    digitar('rua', valores.rua)
    digitar('numero', valores.numero)
    digitar('bairro', valores.bairro)
    digitar('complemento', valores.complemento)
    digitar('cidade', valores.cidade)
    digitar('estado', valores.estado)
    digitar('pais', valores.pais)
  }

  // Garante que o navegador não barraria o envio (evita falso positivo)
  const garantirFormularioValido = () => {
    cy.get('#cadNome').closest('form').then(($form) => {
      const barrando = Array.from($form[0].elements)
        .filter((el) => el.willValidate && !el.checkValidity())
        .map((el) => `${el.id || el.name} (${el.validationMessage})`)

      expect(
        barrando,
        `O navegador barraria o envio por: ${barrando.join(' | ')}. O teste não é confiável assim.`
      ).to.have.length(0)
    })
  }

  const salvar = () => {
    cy.contains('button:visible', /Salvar/i).scrollIntoView().should('be.visible').click()
  }

  // Confere na listagem que o ponto (token único) NÃO foi cadastrado
  const verificarQueNaoCadastrou = (token, detalhe) => {
    cy.wait(2000)
    cy.visit('https://boavisita.esw.dev.br/dashboard/pontos')
    cy.contains('Controle de Pontos Turísticos').should('be.visible')
    cy.contains('Pedra Balão').should('be.visible')
    cy.get('#ptoList').should(($lista) => {
      expect($lista.text().includes(token), `O sistema PERMITIU cadastrar acima do limite. ${detalhe}`).to.be.false
    })
  }

  // ---------- Os dois caminhos de acesso ----------
  const caminhos = [
    {
      nome: 'Caminho 1 (botão "+ Cadastrar Ponto" da Listagem / modal)',
      temVinculos: true,
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
      temVinculos: false, // a página /cadastrar/ponto não tem o campo Vínculos
      abrir: () => {
        cy.contains('Pontos Turísticos').click()
        cy.contains('a, button', /Cadastrar Ponto/i).should('be.visible').click()
        cy.url().should('include', '/cadastrar/ponto')
        cy.contains('Cadastrar Ponto Turístico').should('be.visible')
      }
    }
  ]

  // ---------- Campos de texto ----------
  // limite = máximo da especificação. O campo deve parar EXATAMENTE nele.
  // medir = como contar o tamanho (CEP conta só os dígitos, sem o hífen da máscara)
  const casos = [
    { id: 'VL01 - Exceder limite do Nome (151 caracteres)',           campo: 'nome',        limite: 150, valor: (t) => t + gerar(151 - t.length, 'N') },
    { id: 'VL02 - Exceder limite do Vídeo Promocional (251 caract.)', campo: 'video',       limite: 250, valor: () => 'https://www.youtube.com/watch?v=' + gerar(251 - 'https://www.youtube.com/watch?v='.length) },
    { id: 'VL04 - Exceder limite do CEP (9 dígitos)',                 campo: 'cep',         limite: 8,   valor: () => '138700001', medir: (v) => v.replace(/\D/g, '').length },
    { id: 'VL05 - Exceder limite da Rua (151 caracteres)',            campo: 'rua',         limite: 150, valor: () => gerar(151) },
    { id: 'VL06 - Exceder limite do Bairro (151 caracteres)',         campo: 'bairro',      limite: 150, valor: () => gerar(151) },
    { id: 'VL07 - Exceder limite da Cidade (151 caracteres)',         campo: 'cidade',      limite: 150, valor: () => gerar(151) },
    { id: 'VL08 - Exceder limite do Estado (3 caracteres)',           campo: 'estado',      limite: 2,   valor: () => 'SPX' },
    { id: 'VL09 - Exceder limite do País (151 caracteres)',           campo: 'pais',        limite: 150, valor: () => gerar(151) },
    { id: 'VL10 - Exceder limite do Número (6 caracteres)',           campo: 'numero',      limite: 5,   valor: () => '123456' },
    { id: 'VL11 - Exceder limite do Complemento (51 caracteres)',     campo: 'complemento', limite: 50,  valor: () => gerar(51) }
  ]

  // PNG 1x1 usado como foto de teste
  const PNG_B64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='

  caminhos.forEach((caminho) => {

    describe(caminho.nome, () => {

      beforeEach(() => {
        // Login feito 1 vez por caminho (2 no total); os demais testes só restauram a sessão
        cy.session(caminho.nome, () => {
          cy.visit('https://boavisita.esw.dev.br/')
          cy.contains('a, button', 'Login').click({ force: true })
          cy.get('#login-email').should('be.visible').type('alfredo@email.com')
          cy.get('#login-password').should('be.visible').type('Teste@456', { log: false })
          cy.get('button[type="submit"], input[type="submit"]').first().click()
          cy.url({ timeout: 15000 }).should('include', '/dashboard')
        })

        // Formulário sempre começa limpo em cada teste
        cy.visit('https://boavisita.esw.dev.br/dashboard')
        caminho.abrir()
      })

      // ----- VL01, VL02, VL04 a VL11 -----
      casos.forEach((caso) => {
        it(`UC11 - ${caso.id}`, () => {
          const token = String(Date.now())
          const dados = validos(token)
          dados[caso.campo] = caso.valor(token)

          preencher(dados)

          const medir = caso.medir || ((v) => v.length)

          obterCampo(caso.campo).invoke('val').then((valorFinal) => {
            const tamanho = medir(valorFinal)
            cy.log(`Campo "${caso.campo}": ${tamanho} caracteres (limite da especificação: ${caso.limite})`)

            // O campo precisa parar exatamente no limite da especificação
            expect(
              tamanho,
              tamanho > caso.limite
                ? `Campo "${caso.campo}" ACEITOU ${tamanho} caracteres (limite ${caso.limite})`
                : `Campo "${caso.campo}" bloqueou em ${tamanho} caracteres, mas o limite da especificação é ${caso.limite}`
            ).to.eq(caso.limite)
          })
        })
      })

      // ----- VL03: 11 fotos -----
      it('UC11 - VL03 - Exceder limite de mídias no campo Fotos (11 arquivos)', () => {
        const token = String(Date.now())
        preencher(validos(token))

        const arquivos = Array.from({ length: 11 }, (_, i) => ({
          contents: Cypress.Buffer.from(PNG_B64, 'base64'),
          fileName: `foto${i + 1}.png`,
          mimeType: 'image/png'
        }))

        cy.get('input[type="file"]').first().selectFile(arquivos, { force: true })

        cy.get('input[type="file"]').first().then(($input) => {
          const qtd = $input[0].files.length

          if (qtd > 10) {
            // Aceitou 11: tenta salvar e confere se o sistema bloqueia o cadastro
            cy.log(`Campo aceitou ${qtd} arquivos (limite 10)`)
            garantirFormularioValido()
            salvar()
            verificarQueNaoCadastrou(token, `Campo Fotos aceitou ${qtd} arquivos (limite 10).`)
          } else {
            expect(qtd, 'arquivos aceitos no campo Fotos').to.be.at.most(10)
          }
        })
      })

      // ----- VL12: 6 vínculos (só existe no Caminho 1 / modal) -----
      if (caminho.temVinculos) {
        it('UC11 - VL12 - Exceder limite de Vínculos (6 pontos relacionados)', () => {
          const token = String(Date.now())
          preencher(validos(token))

          cy.get('select[multiple]', { timeout: 10000 }).first().as('vinculos')

          // Precondição: precisa haver pelo menos 6 pontos cadastrados na base
          cy.get('@vinculos').scrollIntoView().find('option').then(($opts) => {
            expect(
              $opts.length,
              `Precondição não atendida: só há ${$opts.length} pontos cadastrados, são necessários pelo menos 6`
            ).to.be.gte(6)
          })

          // Seleciona 6 opções e dispara o evento change
          cy.get('@vinculos').then(($sel) => {
            const sel = $sel[0]
            Array.from(sel.options).slice(0, 6).forEach((o) => { o.selected = true })
            sel.dispatchEvent(new Event('change', { bubbles: true }))
          })

          // Tenta salvar: o sistema deve mostrar o erro de limite e não cadastrar
          salvar()
          cy.get('#cadErroVinculos').should('be.visible')
          verificarQueNaoCadastrou(token, 'Campo Vínculos aceitou 6 pontos (limite 5).')
        })
      }

    })
  })

})