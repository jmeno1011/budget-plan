import { fireEvent, render, screen } from '@testing-library/react'
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

    expect(await screen.findByText('Shared budgets')).toBeInTheDocument()
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
    expect(await screen.findByText('Fixed expenses')).toBeInTheDocument()
  })

  it('switches to a different shared budget', async () => {
    render(<SharedPage />)
    const budget = await screen.findByText('Shared Empty')
    fireEvent.click(budget)
    expect(await screen.findByText('Periods (0)')).toBeInTheDocument()
  })
})
