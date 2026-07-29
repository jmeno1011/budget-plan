import { Spinner } from "@/components/ui/spinner"

interface PageLoadingProps {
  message?: string
}

export function PageLoading({ message = "Loading budget data" }: PageLoadingProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div
        role="status"
        aria-live="polite"
        aria-label={message}
        className="flex flex-col items-center gap-4 text-center"
      >
        <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-card shadow-sm">
          <div className="absolute inset-1 rounded-xl bg-primary/10 animate-pulse" />
          <Spinner
            role="presentation"
            aria-hidden="true"
            className="relative h-6 w-6 text-primary"
          />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">{message}</p>
          <div className="mt-2 flex justify-center gap-1" aria-hidden="true">
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.2s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.1s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary" />
          </div>
        </div>
      </div>
    </div>
  )
}
