const describePersonal = Cypress.env('personalMode') ? describe : describe.skip

describePersonal('Personal page', () => {
  beforeEach(() => {
    cy.viewport(1280, 800)
    cy.visit('/')
  })

  it('shows the dashboard actions', () => {
    // 1. Sign out 버튼 확인
    // 2. Fixed 버튼 표시
    // 3. Add period 버튼 표시
    // 15. Periods 옆에 카운트 표시
    cy.contains('Sign out').should('be.visible')
    cy.contains('Fixed £5.00').should('be.visible')
    cy.contains('Add period').should('be.visible')
    cy.contains('Periods (2)').should('be.visible')
  })

  it('opens the fixed expenses modal', () => {
    // 2. Fixed 버튼 클릭 시 Fixed expenses 모달 표시
    cy.contains('Fixed £5.00').click()
    cy.contains('Fixed expenses').should('be.visible')
  })

  it('opens the add period modal', () => {
    // 3. Add period 클릭 시 Add a new period 모달 표시
    cy.contains('Add period').click()
    cy.contains('Add a new period').should('be.visible')
  })

  it('navigates to shared budgets tab', () => {
    // 4. Shared budgets 탭 클릭 시 shared 페이지 이동
    cy.contains('Shared budgets').click()
    cy.location('pathname').should('eq', '/shared')
  })

  it('shows summary totals', () => {
    // 5. Total spent 합산 표시
    // 7. Average per period 평균 표시
    // 9. Highest spend period 표시
    // 11. Lowest spend period 표시
    cy.contains('Total spent').should('be.visible')
    cy.contains('£30.00').should('be.visible')
    cy.contains('Average per period').should('be.visible')
    cy.contains('£15.00').should('be.visible')
    cy.contains('Highest spend period').should('be.visible')
    cy.contains('Alpha period').should('be.visible')
    cy.contains('Lowest spend period').should('be.visible')
    cy.contains('Beta period').should('be.visible')
  })

  it('toggles a period card to show entries', () => {
    // 18. Period 카드 클릭 시 Spending entries 표시
    cy.contains('Alpha period').click()
    cy.contains('Spending entries').should('be.visible')
  })

  it('shows delete confirmation dialog', () => {
    // 20. Period 카드 쓰레기통 클릭 시 삭제 모달 표시
    cy.get('button[aria-label="Delete period"]').first().click()
    cy.contains('Delete this period?').should('be.visible')
  })
})
