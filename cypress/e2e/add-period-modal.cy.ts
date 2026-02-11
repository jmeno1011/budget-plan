export {}

const describePersonal = Cypress.env('personalMode') ? describe : describe.skip

describePersonal('Add a new period modal', () => {
  const openModal = () => {
    cy.viewport(1280, 800)
    cy.visit('/')
    cy.contains('Add period').first().click()
    cy.contains('Add a new period').should('be.visible')
  }

  beforeEach(() => {
    openModal()
  })

  it('closes when clicking the overlay', () => {
    // 1. 모달 밖 클릭 시 모달 닫힘
    cy.get('[data-slot="dialog-overlay"]').click({ force: true })
    cy.contains('Add a new period').should('not.exist')
  })

  it('allows typing the period name', () => {
    // 2. Period name 입력 확인
    cy.get('#period-name').type('March budget')
    cy.get('#period-name').should('have.value', 'March budget')
  })

  it('selects a start date', () => {
    // 3. Start date 입력 확인
    cy.contains('Start date')
      .parent()
      .find('button')
      .click()
    cy.get('[data-slot="calendar"] [data-day]:not([aria-disabled="true"])')
      .first()
      .click()
    cy.contains('Start date')
      .parent()
      .find('button')
      .should('not.contain', 'Select')
  })

  it('selects an end date', () => {
    // 4. End date 입력 확인
    cy.contains('Start date')
      .parent()
      .find('button')
      .click()
    cy.get('[data-slot="calendar"] [data-day]:not([aria-disabled="true"])')
      .first()
      .click()
    cy.contains('End date')
      .parent()
      .find('button')
      .click()
    cy.get('[data-slot="calendar"] [data-day]:not([aria-disabled="true"])')
      .first()
      .click()
    cy.contains('End date')
      .parent()
      .find('button')
      .should('not.contain', 'Select')
  })

  it('allows typing the budget amount', () => {
    // 5. Budget (optional) 입력 확인
    cy.get('#period-budget').type('500')
    cy.get('#period-budget').should('have.value', '500')
  })

  it('enables and creates a period with required fields', () => {
    // 6. 필수값 입력 후 Create period 활성 및 생성 확인
    cy.contains('Create period').should('be.disabled')
    cy.get('#period-name').type('New period')

    cy.contains('Start date')
      .parent()
      .find('button')
      .click()
    cy.get('[data-slot="calendar"] [data-day]:not([aria-disabled="true"])')
      .first()
      .click()

    cy.contains('End date')
      .parent()
      .find('button')
      .click()
    cy.get('[data-slot="calendar"] [data-day]:not([aria-disabled="true"])')
      .first()
      .click()

    cy.contains('Create period').should('not.be.disabled').click()
    cy.contains('Add a new period').should('not.exist')
    cy.contains('Periods (3)').should('be.visible')
  })
})
