describe('Login page', () => {
  it('shows the login content', () => {
    // 로그인 화면 텍스트/버튼 표시 확인
    cy.visit('/login')
    cy.contains('Sign in to continue').should('be.visible')
    cy.contains('Continue with Google').should('be.visible')
  })

  it('navigates back to home', () => {
    // Back to home 클릭 시 홈으로 이동
    cy.visit('/login')
    cy.contains('Back to home').click()
    cy.location('pathname').should('eq', '/')
  })
})
