import { fireEvent, render, screen, within } from '@testing-library/react'
import SharedPage from '@/app/shared/page'

const replaceMock = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: replaceMock }),
  useSearchParams: () => new URLSearchParams(),
}))

describe('Shared page (E2E fixtures)', () => {
  const originalEnv = process.env.NEXT_PUBLIC_E2E_TEST_MODE

  beforeAll(() => {
    process.env.NEXT_PUBLIC_E2E_TEST_MODE = 'true'
  })

  afterAll(() => {
    process.env.NEXT_PUBLIC_E2E_TEST_MODE = originalEnv
  })

  it('renders shared budget dashboard', async () => {
    render(<SharedPage />)

    expect((await screen.findAllByText('Shared budgets')).length).toBeGreaterThan(0)
    expect(screen.getByText('New shared budget')).toBeInTheDocument()
    expect(screen.getByText('Fixed £5.00')).toBeInTheDocument()
    expect(screen.getByText('Share link')).toBeInTheDocument()
    expect(screen.getByText('Delete budget')).toBeInTheDocument()
    expect(screen.getByText('Periods (2)')).toBeInTheDocument()
  })

  it('opens the share link modal', async () => {
    render(<SharedPage />)
    const button = await screen.findByRole('button', { name: /share link/i })
    fireEvent.click(button)
    expect(await screen.findByText('Share this budget')).toBeInTheDocument()
  })

  it('opens the fixed expenses modal', async () => {
    render(<SharedPage />)
    const button = await screen.findByText('Fixed £5.00')
    fireEvent.click(button)
    expect((await screen.findAllByText('Fixed expenses')).length).toBeGreaterThan(0)
  })

  it('switches to a different shared budget', async () => {
    render(<SharedPage />)
    const budget = await screen.findByText('Shared Empty')
    fireEvent.click(budget)
    expect(await screen.findByText('Periods (0)')).toBeInTheDocument()
  })

  it('opens shared budget settings and reorders budgets', async () => {
    render(<SharedPage />)

    const settings = await screen.findByRole('button', { name: /settings/i })
    fireEvent.click(settings)
    expect(await screen.findByText('Shared budget settings')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /move shared empty up/i }))

    const sidebar = screen.getByTestId('shared-budget-sidebar-list')
    const budgetButtons = within(sidebar).getAllByRole('button', { hidden: true })
    expect(budgetButtons[0]).toHaveTextContent('Shared Empty')
    expect(budgetButtons[1]).toHaveTextContent('Shared Alpha')
  })
})
