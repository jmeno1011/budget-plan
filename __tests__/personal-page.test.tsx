import { act, fireEvent, render, screen } from '@testing-library/react'
import Home from '@/app/page'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { onSnapshot } from 'firebase/firestore'

const mockUser = {
  uid: 'user-1',
  displayName: 'Test User',
  email: 'test@example.com',
}

const mockFixedExpenses = [
  { id: 'fx-1', name: 'Netflix', amount: 5 },
]

const mockPeriods = [
  {
    id: 'p-1',
    name: 'Alpha period',
    startDate: '2026-01-01',
    endDate: '2026-01-02',
    includeFixedExpenses: true,
    expenses: [
      { id: 'e-1', date: '2026-01-01', amount: 10 },
      { id: 'e-2', date: '2026-01-02', amount: 5 },
    ],
  },
  {
    id: 'p-2',
    name: 'Beta period',
    startDate: '2026-02-01',
    endDate: '2026-02-02',
    includeFixedExpenses: false,
    expenses: [{ id: 'e-3', date: '2026-02-01', amount: 10 }],
  },
]

jest.mock('@/lib/firebase', () => ({
  auth: {},
  db: {},
}))

jest.mock('firebase/auth', () => ({
  onAuthStateChanged: jest.fn(),
  signOut: jest.fn(() => Promise.resolve()),
}))

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  onSnapshot: jest.fn(),
  serverTimestamp: jest.fn(),
  setDoc: jest.fn(),
}))

describe('Personal page (signed in)', () => {
  beforeEach(() => {
    ;(onAuthStateChanged as jest.Mock).mockImplementation(
      (_auth: unknown, callback: (user: typeof mockUser) => void) => {
        callback(mockUser)
        return () => {}
      },
    )
    ;(onSnapshot as jest.Mock).mockImplementation(
      (_ref: unknown, callback: (snap: { data: () => unknown }) => void) => {
        callback({
          data: () => ({
            periods: mockPeriods,
            fixedExpenses: mockFixedExpenses,
          }),
        })
        return () => {}
      },
    )
  })

  it('renders the personal dashboard', async () => {
    render(<Home />)
    expect(await screen.findByText('Add period')).toBeInTheDocument()
    expect(screen.getByText('Fixed £5.00')).toBeInTheDocument()
    expect(screen.getByText('Periods (2)')).toBeInTheDocument()
  })

  it('opens the fixed expenses modal', async () => {
    render(<Home />)
    const fixedButton = await screen.findByText('Fixed £5.00')
    fireEvent.click(fixedButton)
    expect(
      await screen.findByText('Fixed expenses'),
    ).toBeInTheDocument()
  })

  it('opens the add period modal', async () => {
    render(<Home />)
    const addButton = await screen.findByText('Add period')
    fireEvent.click(addButton)
    expect(
      await screen.findByText('Add a new period'),
    ).toBeInTheDocument()
  })

  it('shows shared budgets tab link', async () => {
    render(<Home />)
    const link = await screen.findByRole('link', {
      name: /shared budgets/i,
    })
    expect(link).toHaveAttribute('href', '/shared')
  })

  it('toggles a period card to show entries', async () => {
    render(<Home />)
    const period = await screen.findByText('Alpha period')
    fireEvent.click(period)
    expect(
      await screen.findByText('Spending entries'),
    ).toBeInTheDocument()
  })

  it('shows the delete confirmation dialog', async () => {
    render(<Home />)
    const deleteButton = await screen.findAllByLabelText('Delete period')
    fireEvent.click(deleteButton[0])
    expect(
      await screen.findByText('Delete this period?'),
    ).toBeInTheDocument()
  })

  it('calls sign out when clicking the button', async () => {
    jest.useFakeTimers()
    render(<Home />)
    const signOutButton = await screen.findByRole('button', {
      name: /sign out/i,
    })
    fireEvent.click(signOutButton)
    act(() => {
      jest.advanceTimersByTime(200)
    })
    expect(signOut).toHaveBeenCalled()
    jest.useRealTimers()
  })
})
