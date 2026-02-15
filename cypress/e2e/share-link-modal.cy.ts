export {}

const describeShared = Cypress.env('personalMode') ? describe : describe.skip

describeShared('Share this budget modal', () => {
  const openModal = () => {
    cy.viewport(1280, 800)
    cy.visit('/shared')
    cy.get('button[aria-label="Share link"]').click()
    cy.contains('Share this budget').should('be.visible')
  }

  beforeEach(() => {
    openModal()
  })

  it('closes when clicking the overlay', () => {
    // 1. 모달 밖 클릭 시 모달 닫힘
    cy.get('[data-slot="dialog-overlay"]').click({ force: true })
    cy.contains('Share this budget').should('not.exist')
  })

  it('creates a join link', () => {
    // 2. Create link 클릭 시 링크 생성 확인
    cy.get('[data-testid="share-link-input"]').invoke('val').then((value) => {
      if (!value) {
        cy.get('[data-testid="share-create-link"]').click()
      }
      cy.get('[data-testid="share-link-input"]')
        .invoke('val')
        .should('match', /join\?code=/)
    })
  })

  it('copies the link', () => {
    // 3. copy 클릭 시 copy 확인
    cy.get('[data-testid="share-create-link"]').click()
    cy.get('[data-testid="share-copy-link"]').click()
    cy.contains('Copied').should('be.visible')
  })

  it('shares via native share sheet when available', () => {
    // 4. Share 버튼 클릭 시 native share 호출 확인
    cy.window().then((win) => {
      // @ts-expect-error - override for test
      win.navigator.share = cy.stub().resolves()
    })

    cy.get('[data-testid="share-link-input"]').invoke('val').then((value) => {
      if (!value) {
        cy.get('[data-testid="share-create-link"]').click()
      }
    })

    cy.get('[data-testid="share-native"]').click()

    cy.window().then((win) => {
      // @ts-expect-error - access test stub
      expect(win.navigator.share).to.have.been.calledOnce
    })
  })
})
