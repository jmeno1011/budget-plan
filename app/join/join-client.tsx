"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { auth, db, googleProvider } from "@/lib/firebase"
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  type User,
} from "firebase/auth"
import {
  arrayUnion,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore"

export default function JoinClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const rawCode = searchParams.get("code") || ""
  const code = useMemo(() => rawCode.trim().toUpperCase(), [rawCode])
  const [user, setUser] = useState<User | null>(null)
  const [status, setStatus] = useState<"idle" | "joining" | "error" | "done">(
    "idle",
  )
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
    })
    return () => unsub()
  }, [])

  useEffect(() => {
    if (!user || !code || status !== "idle") return
    const join = async () => {
      setStatus("joining")
      setError(null)
      try {
        const inviteSnap = await getDoc(doc(db, "shared_budget_invites", code))
        if (!inviteSnap.exists()) {
          setStatus("error")
          setError("Invalid or expired invite link.")
          return
        }
        const data = inviteSnap.data()
        const budgetId = data?.budgetId as string | undefined
        if (!budgetId) {
          setStatus("error")
          setError("Invite is missing budget information.")
          return
        }
        await setDoc(
          doc(db, "shared_budgets", budgetId),
          {
            memberUids: arrayUnion(user.uid),
            members: arrayUnion({
              uid: user.uid,
              email: user.email || "",
              name: user.displayName || "",
            }),
            updatedAt: serverTimestamp(),
          },
          { merge: true },
        )
        await setDoc(
          doc(db, "shared_budget_invites", code),
          { usedBy: arrayUnion(user.uid) },
          { merge: true },
        )
        setStatus("done")
        router.replace(`/shared?budgetId=${budgetId}`)
      } catch (e) {
        setStatus("error")
        setError("Failed to join. Please try again.")
      }
    }

    join()
  }, [user, code, status, router])

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (e) {
      await signInWithRedirect(auth, googleProvider)
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
          <Wallet className="h-6 w-6 text-primary-foreground" />
        </div>
        <h1 className="text-lg font-semibold text-foreground">
          Join shared budget
        </h1>
        {!code && (
          <p className="text-sm text-muted-foreground">
            Invite code is missing from the link.
          </p>
        )}
        {!user && code && (
          <>
            <p className="text-sm text-muted-foreground">
              Sign in to accept the invite.
            </p>
            <Button onClick={handleLogin} className="w-full">
              Continue with Google
            </Button>
          </>
        )}
        {user && status === "joining" && (
          <p className="text-sm text-muted-foreground">Joining...</p>
        )}
        {status === "error" && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>
    </main>
  )
}
