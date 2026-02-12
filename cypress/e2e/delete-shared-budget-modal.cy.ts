export {}

const describeShared = Cypress.env('personalMode') ? describe : describe.skip

describeShared('Delete shared budget modal', () => {
  beforeEach(() => {
    cy.viewport(1280, 800)
    cy.visit('/shared')
  })

  it('opens the delete confirmation modal', () => {
    // 1. delete 클릭 시 삭제 확인 모달 표시
    cy.get('button[aria-label="Delete budget"]').click()
    cy.contains('Delete this shared budget?').should('be.visible')
  })

  it('cancels deletion when clicking Cancel', () => {
    // 2. Cancel 클릭 시 삭제 취소 확인
    cy.get('button[aria-label="Delete budget"]').click()
    cy.get('[data-slot="alert-dialog-content"]').within(() => {
      cy.contains('Cancel').click()
    })
    cy.contains('Delete this shared budget?').should('not.exist')
    cy.contains('Shared budgets').should('be.visible')
  })
})
