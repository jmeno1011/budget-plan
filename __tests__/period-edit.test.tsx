import { act, fireEvent, render, screen } from '@testing-library/react'
import PeriodEditPage from '@/app/periods/[id]/page'
import { onAuthStateChanged } from 'firebase/auth'
import { onSnapshot, setDoc } from 'firebase/firestore'

const pushMock = jest.fn()
const replaceMock = jest.fn()

jest.mock('next/navigation', () => ({
  useParams: () => ({ id: 'p-1' }),
  useRouter: () => ({ push: pushMock, replace: replaceMock }),
}))

jest.mock('@/lib/firebase', () => ({
  auth: {},
  db: {},
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
                  { id: 'e-1', date: '2026-01-01', amount: 10 },
                  { id: 'e-2', date: '2026-01-02', amount: 5 },
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
})
