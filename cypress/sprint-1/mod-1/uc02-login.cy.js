describe('UC02 - Realizar Login', () => {
  beforeEach(() => {
    cy.visit('/entrar')

    cy.get('#login-email')
      .should('be.visible')
      .and('be.enabled')

    cy.get('#login-password')
      .should('be.visible')
      .and('be.enabled')
  })

  it('Cenário principal - deve realizar login com credenciais válidas', () => {
    cy.get('#login-email').type('admin@boavisita.com')
    cy.get('#login-password').type('boavisita')

    cy.contains('button', 'Entrar').click()

    cy.url().should('include', '/dashboard')
  })

  it('Cenário alternativo 01 - deve negar login para e-mail não cadastrado', () => {
    cy.get('#login-email').type('naoexiste@boavisita.com')
    cy.get('#login-password').type('boavisita')

    cy.contains('button', 'Entrar').click()

    cy.url().should('include', '/entrar')

    cy.contains('E-mail ou senha inválidos.')
      .should('be.visible')
  })

  it('Cenário alternativo 02 - deve negar login para senha incorreta', () => {
    cy.get('#login-email').type('admin@boavisita.com')
    cy.get('#login-password').type('senha-incorreta')

    cy.contains('button', 'Entrar').click()

    cy.url().should('include', '/entrar')

    cy.contains('E-mail ou senha inválidos.')
      .should('be.visible')
  })

  it('Cenário alternativo 03 - deve redirecionar para recuperação de senha', () => {
    cy.contains('a', 'Esqueci minha Senha').click()

    cy.url().should('include', '/recuperar-conta')

    cy.get('#recover-email')
      .should('be.visible')
      .and('be.enabled')
  })
})