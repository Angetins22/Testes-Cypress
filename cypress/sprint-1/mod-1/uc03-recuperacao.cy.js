describe('UC03 - Recuperar Senha', () => {
  // MUITO IMPORTANTE:
  // Antes de fazer os testes da redefinição de senha, tem que requisitar um novo e-mail de recuperação
  // e colar aqui embaixo SÓ o token do link
  // Por exemplo: http://localhost:8000/redefinir-senha/SEU_TOKEN

  const RECOVERY_TOKEN = 'COLE_UM_TOKEN_VALIDO_AQUI'

  const obterToken = () => {
    if (
      !RECOVERY_TOKEN ||
      RECOVERY_TOKEN === 'COLE_UM_TOKEN_VALIDO_AQUI'
    ) {
      throw new Error(
        'Antes de executar a UC03, substitua RECOVERY_TOKEN por um token de recuperação válido e recém-gerado.'
      )
    }

    return RECOVERY_TOKEN
  }

  it('Cenário alternativo 01 - não deve revelar se o e-mail não está cadastrado', () => {
    cy.visit('/recuperar-conta')

    cy.get('#recover-email')
      .should('be.visible')
      .and('be.enabled')
      .type('naoexiste@boavisita.com')

    cy.get('#btnEnviar')
      .click()

    cy.location('pathname')
      .should('eq', '/recuperar-conta')

    cy.location('search')
      .should('include', 'status=sucesso')

    cy.contains(
      'E-mail de recuperação enviado com sucesso! Verifique sua caixa de entrada ou spam.'
    ).should('be.visible')
  })

  it('Cenário alternativo 02 - deve impedir envio com e-mail em formato inválido', () => {
    cy.visit('/recuperar-conta')

    cy.get('#recover-email')
      .should('be.visible')
      .and('be.enabled')
      .type('email-invalido')

    cy.get('#btnEnviar')
      .click()

    // O navegador deve impedir o envio por causa do type="email".
    cy.get('#recover-email')
      .should('match', ':invalid')

    cy.location('pathname')
      .should('eq', '/recuperar-conta')

    cy.location('search')
      .should('eq', '')
  })

  it('Cenário alternativo 03 - deve informar quando as novas senhas não coincidem', () => {
    const token = obterToken()

    cy.visit(`/redefinir-senha/${token}`)

    cy.get('#senha')
      .should('be.visible')
      .and('be.enabled')
      .type('TesteNova123!')

    cy.get('#confirma_senha')
      .should('be.visible')
      .and('be.enabled')
      .type('OutraSenha123!')

    cy.contains('button', 'Alterar Senha')
      .click()

    cy.location('pathname')
      .should('eq', `/redefinir-senha/${token}`)

    cy.location('search')
      .should('include', 'status=senhas_nao_conferem')

    cy.contains(
      'As senhas não coincidem. Por favor, verifique os campos e tente novamente.'
    ).should('be.visible')
  })

  it('Cenário principal - deve redefinir a senha utilizando um token válido', () => {
    const token = obterToken()

    cy.visit(`/redefinir-senha/${token}`)

    cy.get('#senha')
      .should('be.visible')
      .and('be.enabled')
      .type('TesteNova123!')

    cy.get('#confirma_senha')
      .should('be.visible')
      .and('be.enabled')
      .type('TesteNova123!')

    cy.contains('button', 'Alterar Senha')
      .click()

    cy.location('pathname')
      .should('eq', '/entrar')

    cy.location('search')
      .should('include', 'status=senha_atualizada')
  })
})