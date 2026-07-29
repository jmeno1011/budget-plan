import { render, screen } from '@testing-library/react'
import Home from '@/app/page'
import { onAuthStateChanged } from 'firebase/auth'

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
  setDoc: jest.fn(),
}))

describe('Home page', () => {
  it('renders landing content when signed out', async () => {
    ;(onAuthStateChanged as jest.Mock).mockImplementation(
      (_auth: unknown, callback: (user: null) => void) => {
        callback(null)
        return () => {}
      },
    )

    render(<Home />)

    expect(await screen.findByText('Budget Plan')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', {
        name: /shared spending, without the bank switch/i,
      }),
    ).toBeInTheDocument()
    expect(screen.getByText(/one person uses monzo/i)).toBeInTheDocument()
    expect(screen.getAllByText('Shared budgets').length).toBeGreaterThan(0)
    expect(screen.getByText('AI cleanup')).toBeInTheDocument()
    expect(screen.getByText('Category visuals')).toBeInTheDocument()
  })
})
