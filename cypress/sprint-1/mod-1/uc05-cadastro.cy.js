describe('UC05 - Cadastrar Conta - Turista', () => {
  // Idealmente, substituir futuramente por um e-mail exclusivo de testes da equipe.
  const EMAIL_BASE = 'nicholas.destefano01@gmail.com'

  const gerarEmailUnico = () => {
    const [usuario, dominio] = EMAIL_BASE.split('@')

    const identificador =
      `${Date.now()}-${Math.floor(Math.random() * 100000)}`

    return `${usuario}+cypress-${identificador}@${dominio}`
  }

  const preencherEnderecoValido = () => {
    cy.get('#cadastro-cep')
      .clear()
      .type('13870000')
      .blur()

    cy.wait('@viaCep')

    cy.get('#cadastro-rua')
      .should('have.value', 'Rua de Teste')

    cy.get('#cadastro-numero')
      .clear()
      .type('123')
  }

  beforeEach(() => {
    // Simula a resposta da ViaCEP para evitar dependência
    // de um serviço externo durante o teste.
    cy.intercept(
      'GET',
      'https://viacep.com.br/ws/*/json/',
      {
        statusCode: 200,
        body: {
          cep: '13870-000',
          logradouro: 'Rua de Teste',
          erro: false,
        },
      }
    ).as('viaCep')

    cy.visit('/cadastro')

    cy.get('#cadastro-nome')
      .should('be.visible')
      .and('be.enabled')

    cy.get('#cadastro-email')
      .should('be.visible')
      .and('be.enabled')
  })

  it('Cenário principal - deve cadastrar uma nova conta de Turista com dados válidos', () => {
    const emailNovo = gerarEmailUnico()

    cy.get('#cadastro-nome')
      .type('Turista Cypress')

    cy.get('#cadastro-email')
      .type(emailNovo)

    cy.get('#cadastro-telefone')
      .type('19999999999')

    preencherEnderecoValido()

    cy.get('#cadastro-senha')
      .type('Teste123!')

    cy.get('#cadastro-confirmar-senha')
      .type('Teste123!')

    cy.contains('button', 'Criar conta')
      .click()

    cy.url()
      .should('include', '/entrar')
      .and('include', 'status=email_enviado')

    cy.get('#login-email')
      .should('be.visible')
  })

  it('Cenário alternativo 01 - deve impedir cadastro com e-mail já existente', () => {
    cy.get('#cadastro-nome')
      .type('Turista Cypress')

    cy.get('#cadastro-email')
      .type('admin@boavisita.com')

    cy.get('#cadastro-telefone')
      .type('19999999999')

    preencherEnderecoValido()

    cy.get('#cadastro-senha')
      .type('Teste123!')

    cy.get('#cadastro-confirmar-senha')
      .type('Teste123!')

    cy.contains('button', 'Criar conta')
      .click()

    cy.url()
      .should('include', '/cadastro')

    cy.get('.alert-danger')
      .should('be.visible')
      .and(
        'contain',
        'Este e-mail já está cadastrado no sistema.'
      )
  })

  it('Cenário alternativo 02 - deve impedir cadastro com campo obrigatório não preenchido', () => {
    const emailNovo = gerarEmailUnico()

    // Nome propositalmente deixado vazio.
    cy.get('#cadastro-email')
      .type(emailNovo)

    cy.get('#cadastro-telefone')
      .type('19999999999')

    preencherEnderecoValido()

    cy.get('#cadastro-senha')
      .type('Teste123!')

    cy.get('#cadastro-confirmar-senha')
      .type('Teste123!')

    cy.contains('button', 'Criar conta')
      .click()

    // O navegador deve impedir o envio porque o campo
    // possui o atributo HTML "required".
    cy.get('#cadastro-nome')
      .should('match', ':invalid')

    cy.url()
      .should('include', '/cadastro')
  })

  it('Cenário alternativo 03 - deve impedir cadastro com telefone e CEP em formato inválido', () => {
    const emailNovo = gerarEmailUnico()

    cy.get('#cadastro-nome')
      .type('Turista Cypress')

    cy.get('#cadastro-email')
      .type(emailNovo)

    // Telefone inválido: somente 10 dígitos.
    cy.get('#cadastro-telefone')
      .type('1999999999')

    // CEP inválido: somente 7 dígitos.
    cy.get('#cadastro-cep')
      .type('1387000')

    cy.get('#cadastro-rua')
      .type('Rua de Teste')

    cy.get('#cadastro-numero')
      .type('123')

    cy.get('#cadastro-senha')
      .type('Teste123!')

    cy.get('#cadastro-confirmar-senha')
      .type('Teste123!')

    cy.contains('button', 'Criar conta')
      .click()

    cy.get('.alert-danger')
      .should('be.visible')
      .and(
        'contain',
        'Formato inválido. Por favor, verifique os dados inseridos.'
      )

    cy.location('pathname')
      .should('eq', '/cadastro')
  })
})