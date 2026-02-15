export {}

const describeShared = Cypress.env('personalMode') ? describe : describe.skip

describeShared('Edit shared budget modal', () => {
  const openModal = () => {
    cy.viewport(1280, 800)
    cy.visit('/shared')
    cy.get('button[aria-label="Edit shared budget"]').click()
    cy.contains('Edit shared budget').should('be.visible')
  }

  beforeEach(() => {
    openModal()
  })

  it('allows editing name and description', () => {
    // 1. 제목/설명 입력 확인
    cy.get('[data-testid="shared-budget-edit-name"]').clear().type('Shared Updated')
    cy.get('[data-testid="shared-budget-edit-description"]').clear().type('Updated description')
    cy.get('[data-testid="shared-budget-edit-name"]').should('have.value', 'Shared Updated')
    cy.get('[data-testid="shared-budget-edit-description"]').should('have.value', 'Updated description')
  })

  it('saves the updated shared budget', () => {
    // 2. Save 클릭 시 리스트에 반영 확인
    cy.get('[data-testid="shared-budget-edit-name"]').clear().type('Shared Updated')
    cy.get('[data-testid="shared-budget-edit-save"]').click()
    cy.get('[data-slot="dialog-content"]').should('not.exist')
    cy.contains('Shared Updated').should('be.visible')
  })
})
