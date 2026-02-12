export {}

const describeShared = Cypress.env('personalMode') ? describe : describe.skip

describeShared('Create shared budget modal', () => {
  const openModal = () => {
    cy.viewport(1280, 800)
    cy.visit('/shared')
    cy.contains('New shared budget').click()
    cy.contains('Create shared budget').should('be.visible')
  }

  beforeEach(() => {
    openModal()
  })

  it('closes when clicking the overlay', () => {
    // 1. 모달 밖 클릭 시 모달 닫힘
    cy.get('[data-slot="dialog-overlay"]').click({ force: true })
    cy.contains('Create shared budget').should('not.exist')
  })

  it('allows typing budget name and description', () => {
    // 2. budget name, description 입력 확인
    cy.get('[data-testid="shared-budget-name"]').type('Shared Gamma')
    cy.get('[data-testid="shared-budget-description"]').type('Test description')
    cy.get('[data-testid="shared-budget-name"]').should('have.value', 'Shared Gamma')
    cy.get('[data-testid="shared-budget-description"]').should(
      'have.value',
      'Test description',
    )
  })

  it('enables create when budget name is provided', () => {
    // 3. budget name 입력 시 create 버튼 활성화 확인
    cy.get('[data-testid="shared-budget-create"]').should('be.disabled')
    cy.get('[data-testid="shared-budget-name"]').type('Shared Gamma')
    cy.get('[data-testid="shared-budget-create"]').should('not.be.disabled')
  })

  it('creates a shared budget when clicking create', () => {
    // 4. create 버튼 클릭 시 shared budget 생성 확인
    cy.get('[data-testid="shared-budget-name"]').type('Shared Gamma')
    cy.get('[data-testid="shared-budget-description"]').type('Test description')
    cy.get('[data-testid="shared-budget-create"]').click()
    cy.contains('Create shared budget').should('not.exist')
    cy.contains('Shared Gamma').should('be.visible')
  })
})
