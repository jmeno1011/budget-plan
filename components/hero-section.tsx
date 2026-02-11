import { Wallet } from "lucide-react"

export function HeroSection() {
  return (
    <section className="space-y-5">
      <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
        Budget plan
      </div>
      <div className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Plan every period in one place
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
          Track personal and shared budgets in real time. Stay aligned with
          housemates, monitor spending, and keep all shared expenses clear.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 sm:items-stretch">
        <div className="flex h-full flex-col rounded-xl border border-border bg-card p-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <Wallet className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-3 text-base font-semibold text-foreground">
            Personal and shared views
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Separate personal budgets from shared household ledgers.
          </p>
        </div>
        <div className="flex h-full flex-col rounded-xl border border-border bg-card p-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <Wallet className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-3 text-base font-semibold text-foreground">
            Invite by link
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Generate a join link and collaborate instantly.
          </p>
        </div>
      </div>
    </section>
  )
}
