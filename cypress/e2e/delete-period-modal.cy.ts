export {}

const describePersonal = Cypress.env('personalMode') ? describe : describe.skip

describePersonal('Delete period modal', () => {
  beforeEach(() => {
    cy.viewport(1280, 800)
    cy.visit('/')
    cy.contains('Periods (2)').should('be.visible')
  })

  it('shows the delete confirmation modal', () => {
    // 1. delete 클릭 시 삭제 확인 모달 표시
    cy.get('button[aria-label="Delete period"]').first().click()
    cy.contains('Delete this period?').should('be.visible')
  })

  it('cancels deletion when clicking Cancel', () => {
    // 2. Cancel 클릭 시 삭제 취소 확인
    cy.get('button[aria-label="Delete period"]').first().click()
    cy.get('[data-slot="alert-dialog-content"]').within(() => {
      cy.contains('Cancel').click()
    })
    cy.contains('Delete this period?').should('not.exist')
    cy.contains('Periods (2)').should('be.visible')
  })

  it('deletes the period when confirmed', () => {
    // 1. delete 클릭 시 삭제 확인
    cy.get('button[aria-label="Delete period"]').first().click()
    cy.get('[data-slot="alert-dialog-content"]').within(() => {
      cy.contains('button', 'Delete').click()
    })
    cy.get('[data-testid="period-card"]').should('have.length', 1)
    cy.contains('Periods (1)').should('be.visible')
  })
})
