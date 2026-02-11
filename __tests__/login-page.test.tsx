import { fireEvent, render, screen } from '@testing-library/react'
import LoginPage from '@/app/login/login-client'
import { signInWithPopup, signInWithRedirect } from 'firebase/auth'

const replaceMock = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: replaceMock }),
  useSearchParams: () => ({
    get: () => null,
  }),
}))

jest.mock('@/lib/firebase', () => ({
  auth: {},
  googleProvider: {},
}))

jest.mock('firebase/auth', () => ({
  onAuthStateChanged: (_auth: unknown, callback: (user: null) => void) => {
    callback(null)
    return () => {}
  },
  signInWithPopup: jest.fn(() => Promise.resolve()),
  signInWithRedirect: jest.fn(() => Promise.resolve()),
}))

describe('Login page', () => {
  beforeEach(() => {
    replaceMock.mockClear()
    ;(signInWithPopup as jest.Mock).mockClear()
    ;(signInWithRedirect as jest.Mock).mockClear()
  })

  it('renders the login UI', () => {
    render(<LoginPage />)
    expect(screen.getByText('Sign in to continue')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /continue with google/i }),
    ).toBeInTheDocument()
  })

  it('back link points to home', () => {
    render(<LoginPage />)
    const link = screen.getByRole('link', { name: /back to home/i })
    expect(link).toHaveAttribute('href', '/')
  })

  it('starts Google sign-in on button click', async () => {
    render(<LoginPage />)
    const button = screen.getByRole('button', { name: /continue with google/i })
    fireEvent.click(button)
    expect(signInWithPopup).toHaveBeenCalled()
  })
})
