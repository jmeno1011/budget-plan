"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { WalletIcon } from "@/components/wallet-icon"
import { GoogleIcon } from "@/components/google-icon"
import { auth, googleProvider } from "@/lib/firebase"
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  type User,
} from "firebase/auth"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get("redirect") || "/"
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      if (currentUser) {
        router.replace(redirectTo)
      }
    })
    return () => unsub()
  }, [router, redirectTo])

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    try {
      await signInWithPopup(auth, googleProvider)
      router.replace(redirectTo)
    } catch (e) {
      try {
        await signInWithRedirect(auth, googleProvider)
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="px-4 py-4 md:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <path d="m12 19-7-7 7-7" />
            <path d="M19 12H5" />
          </svg>
          Back to home
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 pb-16">
        <div className="w-full max-w-sm">
          <div className="flex flex-col items-center text-center">
            <WalletIcon className="h-16 w-16" />

            <h1 className="mt-6 text-2xl font-bold tracking-tight text-foreground">
              Sign in to continue
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Keep your budget plan synced across devices and share instantly.
            </p>
          </div>

          <div className="mt-10">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading || !!user}
              className="flex h-14 w-full items-center justify-center gap-3 rounded-xl border border-border bg-card text-base font-semibold text-foreground shadow-sm transition-colors hover:bg-primary/10 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
            >
              <GoogleIcon className="h-5 w-5" />
              Continue with Google
            </button>
          </div>

          <p className="mt-8 text-center text-sm leading-relaxed text-muted-foreground">
            Invite housemates with a link, track refunds, and keep everyone on
            the same totals.
          </p>
        </div>
      </main>
    </div>
  )
}
