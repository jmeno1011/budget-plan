import { act, fireEvent, render, screen } from '@testing-library/react'
import PeriodEditPage from '@/app/periods/[id]/page'
import { onAuthStateChanged } from 'firebase/auth'
import { onSnapshot, setDoc } from 'firebase/firestore'

const pushMock = jest.fn()
const replaceMock = jest.fn()
const routerMock = { push: pushMock, replace: replaceMock }

jest.mock('next/navigation', () => ({
  useParams: () => ({ id: 'p-1' }),
  useRouter: () => routerMock,
}))

jest.mock('@/lib/firebase', () => ({
  auth: {},
  db: {},
}))

jest.mock('@/components/date-expense-group', () => ({
  DateExpenseGroup: ({ date }: { date: string }) => (
    <div data-testid={`expense-group-${date}`} />
  ),
}))

jest.mock('@/components/ui/checkbox', () => ({
  Checkbox: ({
    id,
    checked,
    onCheckedChange,
  }: {
    id?: string
    checked?: boolean
    onCheckedChange?: (value: boolean) => void
  }) => (
    <input
      id={id}
      type="checkbox"
      checked={Boolean(checked)}
      onChange={(event) => onCheckedChange?.(event.target.checked)}
    />
  ),
}))

jest.mock('firebase/auth', () => ({
  onAuthStateChanged: jest.fn(),
}))

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  onSnapshot: jest.fn(),
  serverTimestamp: jest.fn(),
  setDoc: jest.fn(() => Promise.resolve()),
}))

describe('Period edit page', () => {
  beforeEach(() => {
    pushMock.mockClear()
    replaceMock.mockClear()
    ;(setDoc as jest.Mock).mockClear()
    ;(onAuthStateChanged as jest.Mock).mockImplementation(
      (_auth: unknown, callback: (user: { uid: string }) => void) => {
        callback({ uid: 'user-1' })
        return () => {}
      },
    )
    ;(onSnapshot as jest.Mock).mockImplementation(
      (_ref: unknown, callback: (snap: { data: () => unknown }) => void) => {
        callback({
          data: () => ({
            periods: [
              {
                id: 'p-1',
                name: 'Alpha period',
                startDate: '2026-01-01',
                endDate: '2026-01-02',
                includeFixedExpenses: true,
                expenses: [
                  { id: 'e-1', date: '2026-01-01', amount: 10, memo: 'asda' },
                  {
                    id: 'e-2',
                    date: '2026-01-02',
                    amount: 5,
                    memo: 'bus',
                    category: 'transport',
                    categorySource: 'manual',
                  },
                ],
              },
            ],
            fixedExpenses: [{ id: 'fx-1', name: 'Netflix', amount: 5 }],
          }),
        })
        return () => {}
      },
    )
  })

  afterEach(() => {
    ;(global.fetch as jest.Mock | undefined)?.mockRestore?.()
  })

  it('shows the period title and total spent', async () => {
    render(<PeriodEditPage />)
    expect(await screen.findByText('Edit Alpha period')).toBeInTheDocument()
    expect(screen.getByText('Total spent £20.00')).toBeInTheDocument()
  })

  it('toggles fixed expenses inclusion', async () => {
    render(<PeriodEditPage />)
    const checkbox = await screen.findByLabelText('Include')
    fireEvent.click(checkbox)
    expect(await screen.findByText('Total spent £15.00')).toBeInTheDocument()
  })

  it('navigates home on save', async () => {
    render(<PeriodEditPage />)
    const saveButton = await screen.findByRole('button', { name: /save/i })
    await act(async () => {
      fireEvent.click(saveButton)
    })
    expect(setDoc).toHaveBeenCalled()
    expect(pushMock).toHaveBeenCalledWith('/')
  })

  it('saves period title changes', async () => {
    render(<PeriodEditPage />)
    const titleInput = await screen.findByLabelText('Period title')
    fireEvent.change(titleInput, { target: { value: 'January reset' } })

    const saveButton = screen.getByRole('button', { name: /save/i })
    await act(async () => {
      fireEvent.click(saveButton)
    })

    const savedData = (setDoc as jest.Mock).mock.calls[0][1]
    expect(savedData.periods[0].name).toBe('January reset')
  })

  it('sorts missing categories with AI and saves the result', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            category: 'food',
            confidence: 'high',
          }),
      } as Response),
    )

    render(<PeriodEditPage />)
    const sortButton = await screen.findByRole('button', {
      name: /ai sort missing categories/i,
    })

    await act(async () => {
      fireEvent.click(sortButton)
    })

    expect(global.fetch).toHaveBeenCalledWith('/api/categorize-expense', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memo: 'asda', amount: 10 }),
    })

    const saveButton = screen.getByRole('button', { name: /save/i })
    await act(async () => {
      fireEvent.click(saveButton)
    })

    const savedData = (setDoc as jest.Mock).mock.calls[0][1]
    expect(savedData.periods[0].expenses).toEqual([
      expect.objectContaining({
        id: 'e-1',
        category: 'food',
        categorySource: 'ai',
      }),
      expect.objectContaining({
        id: 'e-2',
        category: 'transport',
        categorySource: 'manual',
      }),
    ])
  })
})
