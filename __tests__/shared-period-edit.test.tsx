import { act, fireEvent, render, screen } from '@testing-library/react'
import SharedPeriodEditPage from '@/app/shared/[budgetId]/periods/[id]/page'
import { onAuthStateChanged } from 'firebase/auth'
import { onSnapshot, setDoc } from 'firebase/firestore'

const pushMock = jest.fn()
const replaceMock = jest.fn()
const routerMock = { push: pushMock, replace: replaceMock }

jest.mock('next/navigation', () => ({
  useParams: () => ({ budgetId: 'budget-1', id: 'p-1' }),
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

describe('Shared period edit page', () => {
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
                name: 'Shared period',
                startDate: '2026-01-01',
                endDate: '2026-01-02',
                includeFixedExpenses: false,
                expenses: [
                  { id: 'e-1', date: '2026-01-01', amount: 10 },
                ],
              },
            ],
            fixedExpenses: [],
          }),
        })
        return () => {}
      },
    )
  })

  it('saves shared period title changes', async () => {
    render(<SharedPeriodEditPage />)
    const titleInput = await screen.findByLabelText('Period title')
    fireEvent.change(titleInput, { target: { value: 'Shared reset' } })

    const saveButton = screen.getByRole('button', { name: /save/i })
    await act(async () => {
      fireEvent.click(saveButton)
    })

    const savedData = (setDoc as jest.Mock).mock.calls[0][1]
    expect(savedData.periods[0].name).toBe('Shared reset')
    expect(pushMock).toHaveBeenCalledWith('/shared?budgetId=budget-1')
  })
})
