import Link from "next/link"
import { Plus, Users, Wallet } from "lucide-react"

export function HeroSection() {
  const activity = [
    "bg-primary",
    "bg-primary/30",
    "bg-muted",
    "bg-primary/50",
    "bg-muted",
    "bg-primary/70",
    "bg-primary/30",
    "bg-muted",
    "bg-primary/50",
    "bg-muted",
    "bg-primary/30",
    "bg-muted",
  ]

  return (
    <section className="grid items-center gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12">
      <div>
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-muted-foreground">
          Built for mixed-bank households
        </div>
        <h1 className="mt-5 max-w-2xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
          Share a budget without sharing a bank
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          One person uses Monzo. Another uses Revolut. Budget Plan gives you one
          shared place to track rent, bills, and period spending without moving
          accounts.
        </p>

        <div className="mt-5 rounded-xl border border-border bg-card p-4">
          <p className="text-sm font-semibold text-foreground">
            Why this exists
          </p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Switching everyone to the same finance app was not realistic, so
            this keeps only the shared budget in one simple place.
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Link
            href="/login?redirect=/shared"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Start shared budget
          </Link>
          <Link
            href="/login?redirect=/"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-card px-5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
          >
            Use personal budget
          </Link>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border p-3 sm:p-4">
          <div className="inline-flex rounded-full bg-secondary p-1 text-xs text-muted-foreground">
            <span className="rounded-full px-3 py-1.5">Personal</span>
            <span className="rounded-full bg-background px-3 py-1.5 font-medium text-foreground shadow-sm">
              Shared
            </span>
          </div>
          <button className="inline-flex h-9 items-center rounded-lg border border-border bg-background px-3 text-xs font-semibold text-foreground">
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Invite
          </button>
        </div>

        <div className="grid md:grid-cols-[210px_1fr]">
          <aside className="border-b border-border bg-background/60 p-4 md:border-b-0 md:border-r">
            <div className="flex items-center justify-between text-sm font-semibold text-foreground">
              <span>Shared budgets</span>
              <span className="text-muted-foreground">2</span>
            </div>
            <div className="mt-3 space-y-1">
              <div className="rounded-lg bg-secondary px-3 py-2 text-sm font-semibold text-foreground">
                Flat bills
              </div>
              <div className="rounded-lg px-3 py-2 text-sm font-semibold text-foreground">
                Trip plan
              </div>
            </div>
            <div className="my-4 h-px bg-border" />
            <div className="flex items-center justify-between text-sm font-semibold text-foreground">
              <span>Members</span>
              <span className="text-muted-foreground">2</span>
            </div>
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  DK
                </div>
                <span className="truncate text-sm font-medium text-foreground">
                  Doh
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  AM
                </div>
                <span className="truncate text-sm font-medium text-foreground">
                  Alex
                </span>
              </div>
            </div>
          </aside>

          <div className="space-y-3 p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-background p-3">
                <p className="text-xs text-muted-foreground">Total spent</p>
                <p className="mt-1 text-2xl font-bold text-primary">
                  £1,748
                </p>
              </div>
              <div className="rounded-xl border border-border bg-background p-3">
                <p className="text-xs text-muted-foreground">Fixed costs</p>
                <p className="mt-1 text-2xl font-bold text-primary">
                  £1,092
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-background p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Wallet className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground">July</p>
                    <p className="text-xs text-muted-foreground">
                      1 Jul 2026 ~ 28 Jul 2026
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Total spent</p>
                  <p className="text-lg font-bold text-primary">£1,748</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1">
                {activity.map((className, index) => (
                  <span
                    key={index}
                    className={`h-3 w-3 rounded-full border border-border ${className}`}
                  />
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-background p-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Users className="h-4 w-4 text-primary" />
                No bank migration, just one shared view.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
