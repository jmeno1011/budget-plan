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
        name: /share a budget without sharing a bank/i,
      }),
    ).toBeInTheDocument()
    expect(screen.getByText(/one person uses monzo/i)).toBeInTheDocument()
    expect(screen.getByText('No bank migration')).toBeInTheDocument()
    expect(screen.getByText('Shared fixed costs')).toBeInTheDocument()
    expect(screen.getByText('Simple period view')).toBeInTheDocument()
  })
})
