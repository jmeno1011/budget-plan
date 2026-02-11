export {}

const describePersonal = Cypress.env('personalMode') ? describe : describe.skip

describePersonal('Fixed expenses modal', () => {
  beforeEach(() => {
    cy.viewport(1280, 800)
    cy.visit('/')
    cy.contains('Fixed £5.00').click()
    cy.contains('Fixed expenses').should('be.visible')
  })

  it('closes when clicking the overlay', () => {
    // 1. 모달 밖(오버레이) 클릭 시 모달 닫힘
    cy.get('[data-slot="dialog-overlay"]').click({ force: true })
    cy.contains('Fixed expenses').should('not.exist')
  })

  it('closes when clicking the X button', () => {
    // 2. X 버튼 클릭 시 모달 닫힘
    cy.get('[data-slot="dialog-close"]').click()
    cy.contains('Fixed expenses').should('not.exist')
  })

  it('allows typing into name and amount inputs', () => {
    // 3. id:fixed-expenses-name 입력 확인
    // 4. id:fixed-expenses-amount 숫자 입력 확인
    cy.get('[data-slot="dialog-content"]').within(() => {
      cy.get('#fixed-expenses-name').type('Spotify')
      cy.get('#fixed-expenses-amount').type('9.99')
      cy.get('#fixed-expenses-name').should('have.value', 'Spotify')
      cy.get('#fixed-expenses-amount').should('have.value', '9.99')
    })
  })

  it('adds a fixed expense when both inputs are provided', () => {
    // 5. name/amount 모두 있을 때 Add 클릭 시 추가 확인
    cy.get('[data-slot="dialog-content"]').within(() => {
      cy.get('#fixed-expenses-name').type('Spotify')
      cy.get('#fixed-expenses-amount').type('9.99')
      cy.get('[data-testid="fixed-expenses-add"]').click()
      cy.contains('Spotify').should('be.visible')
      cy.contains('£9.99').should('be.visible')
    })
  })

  it('shows validation when fields are missing', () => {
    // 6. Add 클릭 시 값이 없으면 에러 표시
    cy.get('[data-slot="dialog-content"]').within(() => {
      cy.get('[data-testid="fixed-expenses-add"]').click()
      cy.contains('Please enter a name.').should('be.visible')
      cy.contains('Please enter an amount.').should('be.visible')
    })
  })

  it('shows delete confirmation for a fixed expense', () => {
    // 7. 쓰레기통 버튼 클릭 시 삭제 알림 표시
    cy.get('[data-testid^="fixed-expense-item-"]')
      .first()
      .within(() => {
        cy.get('button[aria-label="Delete fixed expense"]').click()
      })
    cy.contains('Delete this fixed expense?').should('be.visible')
  })

  it('deletes a fixed expense after confirmation', () => {
    // 8. 삭제 확인 후 Fixed expense 삭제 확인
    cy.get('[data-testid^="fixed-expense-item-"]')
      .first()
      .within(() => {
        cy.get('button[aria-label="Delete fixed expense"]').click()
      })
    cy.get('[data-slot="alert-dialog-content"]').within(() => {
      cy.contains('button', 'Delete').click()
    })
    cy.get('[data-testid^="fixed-expense-item-"]').should('not.exist')
    cy.contains('No fixed expenses yet.').should('be.visible')
  })
})
