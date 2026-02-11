describe('Home page', () => {
  it('shows the landing content when signed out', () => {
    // 로그인 전 랜딩페이지: 화면 주요 텍스트가 표시되는지 확인
    cy.visit('/')
    cy.contains('Budget Plan').should('be.visible')
    cy.contains('Plan every period in one place').should('be.visible')
    cy.contains('Personal and shared views').should('be.visible')
    cy.contains('Invite by link').should('be.visible')
    cy.contains('Spending analytics').should('be.visible')
  })

  it('navigates to login when clicking Sign in', () => {
    // sign in 버튼 클릭 시 로그인 페이지로 이동
    cy.visit('/')
    cy.contains('Sign in').click()
    cy.location('pathname').should('eq', '/login')
  })

  it('navigates to login when clicking Continue with Google', () => {
    // continue with google 버튼 클릭 시 로그인 페이지로 이동
    cy.visit('/')
    cy.contains('Continue with Google').click()
    cy.location('pathname').should('eq', '/login')
  })
})
