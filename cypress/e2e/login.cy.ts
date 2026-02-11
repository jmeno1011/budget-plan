describe('Login page', () => {
  it('shows the login content', () => {
    cy.visit('/login')
    cy.contains('Sign in to continue').should('be.visible')
    cy.contains('Continue with Google').should('be.visible')
  })

  it('navigates back to home', () => {
    cy.visit('/login')
    cy.contains('Back to home').click()
    cy.location('pathname').should('eq', '/')
  })
})
