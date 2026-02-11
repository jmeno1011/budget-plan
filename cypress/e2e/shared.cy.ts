export {}

const describeShared = Cypress.env('personalMode') ? describe : describe.skip

describeShared('Shared page', () => {
  beforeEach(() => {
    cy.viewport(1280, 800)
    cy.visit('/shared')
  })

  it('navigates to personal page', () => {
    // 1. Personal 버튼 클릭 시 Personal 페이지로 이동
    cy.contains('Personal').click()
    cy.location('pathname').should('eq', '/')
  })

  it('signs out and returns home', () => {
    // 2. Sign Out 버튼 클릭 시 로그아웃, 홈 화면 이동
    cy.contains('Sign out').click()
    cy.location('pathname', { timeout: 2000 }).should('eq', '/')
  })

  it('opens create shared budget modal', () => {
    // 3. New shared budget 버튼 클릭 시 Create shared budget 모달 표시
    cy.contains('New shared budget').click()
    cy.contains('Create shared budget').should('be.visible')
  })

  it('opens fixed expenses modal', () => {
    // 4. Fixed 버튼 클릭 시 Fixed expenses 모달 표시
    cy.contains('Fixed £5.00').click()
    cy.contains('Fixed expenses').should('be.visible')
  })

  it('opens share link modal', () => {
    // 5. Share link 버튼 클릭 시 Share this budget 모달 표시
    cy.get('button[aria-label="Share link"]').click()
    cy.contains('Share this budget').should('be.visible')
  })

  it('opens delete budget confirmation', () => {
    // 6. Delete budget 버튼 클릭 시 확인 모달 표시
    cy.get('button[aria-label="Delete budget"]').click()
    cy.contains('Delete this shared budget?').should('be.visible')
  })

  it('selects a shared budget from the list', () => {
    // 7. Shared budgets 중 하나 선택 시 해당 버짓으로 표시
    cy.contains('Shared Empty').click()
    cy.contains('Periods (0)').should('be.visible')
    cy.contains('No periods yet').should('be.visible')
  })

  it('shows shared members', () => {
    // 8. Shared budget에 속한 멤버 표시
    cy.contains('Members').should('be.visible')
    cy.contains('E2E User').should('be.visible')
    cy.contains('Alex').should('be.visible')
  })

  it('shows summary totals and stats', () => {
    // 10. Total spent 합산 표시
    // 12. Average per period 평균 표시
    // 14. Highest spend period 표시
    // 16. Lowest spend period 표시
    cy.contains('Total spent').should('be.visible')
    cy.contains('£28.00').should('be.visible')
    cy.contains('Average per period').should('be.visible')
    cy.contains('£14.00').should('be.visible')
    cy.contains('Highest spend period').should('be.visible')
    cy.contains('Shared Alpha').should('be.visible')
    cy.contains('Lowest spend period').should('be.visible')
    cy.contains('Shared Beta').should('be.visible')
  })

  it('toggles a period card to show entries', () => {
    // 23. Period 카드 클릭 시 Spending entries 표시
    cy.contains('Shared Alpha').click()
    cy.contains('Spending entries').should('be.visible')
  })

  it('shows delete confirmation for period', () => {
    // 25. Period 카드의 쓰레기통 버튼 클릭 시 삭제 모달 표시
    cy.get('button[aria-label="Delete period"]').first().click()
    cy.contains('Delete this period?').should('be.visible')
  })

  it('renders edit link for shared periods', () => {
    // 24. Period 카드 edit 버튼 클릭 시 shared/[budgetId]/periods/[id] 링크 확인
    cy.get('a[href="/shared/sb-1/periods/sp-1"]').should('exist')
  })
})
