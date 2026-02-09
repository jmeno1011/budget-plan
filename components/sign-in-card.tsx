import Link from "next/link"
import { Wallet } from "lucide-react"

export function SignInCard() {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Wallet className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
            Welcome
          </p>
          <h2 className="text-base font-semibold text-foreground sm:text-lg">
            Sign in to continue
          </h2>
        </div>
      </div>
      <p className="mt-4 text-sm text-muted-foreground">
        Sync your budget plan across devices and keep shared totals aligned.
      </p>
      <Link
        href="/login?redirect=/"
        className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 cursor-pointer"
      >
        Continue with Google
      </Link>
      <p className="mt-4 text-sm text-muted-foreground">
        Invite housemates with a link and update spending together.
      </p>
    </div>
  )
}
