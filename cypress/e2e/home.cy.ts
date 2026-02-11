describe('Home page', () => {
  it('shows the landing content when signed out', () => {
    cy.visit('/')
    cy.contains('Budget Plan').should('be.visible')
    cy.contains('Plan every period in one place').should('be.visible')
    cy.contains('Personal and shared views').should('be.visible')
    cy.contains('Invite by link').should('be.visible')
    cy.contains('Spending analytics').should('be.visible')
  })

  it('navigates to login when clicking Sign in', () => {
    cy.visit('/')
    cy.contains('Sign in').click()
    cy.location('pathname').should('eq', '/login')
  })

  it('navigates to login when clicking Continue with Google', () => {
    cy.visit('/')
    cy.contains('Continue with Google').click()
    cy.location('pathname').should('eq', '/login')
  })
})
