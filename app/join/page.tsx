import { Suspense } from "react"
import JoinClient from "./join-client"

export default function JoinPage() {
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
      <JoinClient />
    </Suspense>
  )
}
