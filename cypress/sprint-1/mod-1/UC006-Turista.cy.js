describe('UC006 - Enviar email de confirmação do cadastro - Turista', () => {

  it('deve cadastrar turista e enviar o e-mail de ativação', () => {

    cy.visit('https://boavisita.esw.dev.br/cadastro')

    cy.get('input[placeholder="Fulano de Tal"]').type('André Turista')
    cy.get('input[placeholder="usuario@email.com"]').type(`lyraandre16+${Date.now()}@gmail.com`)
    cy.get('input[placeholder="(11) 91234-5678"]').type('19999990010')

    cy.get('input[placeholder="12345-678"]').clear().type('13870-100').blur() // perca de foco
    cy.wait(2000)

    cy.get('input[placeholder="25"], input[type="number"]').first().clear().type('38')
    cy.get('input[placeholder="Senha"]').type('SenhaSegura@123')
    cy.get('input[placeholder="Repita a mesma senha"]').type('SenhaSegura@123')

    cy.contains('button', 'Criar conta').click()

    cy.wait(3000)

    cy.contains(/verifique seu e-mail|link de ativação|confirmar seu cadastro/i, { timeout: 6000 })
      .should('be.visible')
  })
})