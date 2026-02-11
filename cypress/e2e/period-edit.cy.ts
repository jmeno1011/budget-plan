export {}

const describePersonal = Cypress.env('personalMode') ? describe : describe.skip

describePersonal('Period edit page', () => {
  beforeEach(() => {
    cy.viewport(1280, 800)
    cy.visit('/periods/p-1')
  })

  it('shows the period name', () => {
    // 1. 기간 이름 보여줌
    cy.contains('Edit Alpha period').should('be.visible')
  })

  it('back arrow navigates home', () => {
    // 2. 뒤로가기 화살표 누르면 홈화면으로 이동
    cy.get('a[aria-label="Back"]').click()
    cy.location('pathname').should('eq', '/')
  })

  it('cancel navigates home', () => {
    // 3. cancel 누르면 홈화면으로 이동
    cy.contains('Cancel').click()
    cy.location('pathname').should('eq', '/')
  })

  it('save navigates home', () => {
    // 4. save 누르면 홈화면으로 이동
    cy.contains('Save').click()
    cy.location('pathname').should('eq', '/')
  })

  it('shows budget input', () => {
    // 5. budget 입력 확인
    cy.get('#period-budget').should('be.visible')
  })

  it('shows inputs for each date', () => {
    // 6. 각 날짜마다 amount, category, notes 입력 확인
    cy.get('input[placeholder="0.00"]').should('have.length', 2)
    cy.get('[data-slot="select-trigger"]').should('have.length', 2)
    cy.get('[data-slot="select-trigger"]').first().click()
    cy.contains('No category').should('be.visible')
    cy.get('body').type('{esc}')
    cy.get('input[placeholder="Notes (optional)"]').should('have.length', 2)
  })

  it('updates total spent when fixed expenses are included', () => {
    // 7. Fixed expenses 체크시 총합 spent 변경, 고정 지출 추가
    cy.contains('Total spent £20.00').should('be.visible')
    cy.contains('Include').click()
    cy.contains('Total spent £15.00').should('be.visible')
  })
})
