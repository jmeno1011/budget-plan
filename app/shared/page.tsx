import { Suspense } from "react"
import SharedClient from "./shared-client"

export default function SharedPage() {
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
      <SharedClient />
    </Suspense>
  )
}
