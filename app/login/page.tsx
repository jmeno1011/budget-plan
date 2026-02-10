import { Suspense } from "react"
import LoginClient from "./login-client"

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-background">
          <div className="mx-auto flex min-h-screen max-w-md items-center justify-center px-4 text-sm text-muted-foreground">
            Loading...
          </div>
        </main>
      }
    >
      <LoginClient />
    </Suspense>
  )
}
