describe('Home page', () => {
  it('shows the Budget Plan title', () => {
    cy.visit('/')
    cy.contains('Budget Plan').should('be.visible')
  })
})
