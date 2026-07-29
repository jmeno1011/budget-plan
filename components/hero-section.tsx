import Link from "next/link"
import { Plus, Sparkles, Users, Wallet } from "lucide-react"

const categoryColors = [
  { className: "bg-[#f97316] text-[#f97316]", label: "Utilities £905", width: "66%" },
  { className: "bg-[#3b9df0] text-[#3b9df0]", label: "Food £246", width: "18%" },
  { className: "bg-[#22c55e] text-[#22c55e]", label: "Shopping £109", width: "8%" },
  { className: "bg-[#db5a9d] text-[#db5a9d]", label: "Transport £68", width: "5%" },
  { className: "bg-[#8b5cf6] text-[#8b5cf6]", label: "Leisure £36", width: "3%" },
]

export function HeroSection() {
  return (
    <section className="grid items-center gap-8 lg:grid-cols-[0.86fr_1.14fr] lg:gap-12">
      <div>
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-muted-foreground">
          Mixed-bank shared spending · AI category cleanup
        </div>
        <h1 className="mt-5 max-w-2xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
          Shared spending, without the bank switch.
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Track periods, fixed bills, and everyday notes with friends or
          partners. Add quick notes now. Let AI sort the categories later.
        </p>

        <div className="mt-5 border-l-4 border-primary pl-4">
          <p className="text-sm leading-relaxed text-muted-foreground">
            One person uses Monzo. Another uses Revolut. Budget Plan keeps the
            shared budget in one place without forcing the money, cards, or
            accounts to move.
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

        <div className="grid md:grid-cols-[190px_1fr]">
          <aside className="hidden border-r border-border bg-background/60 p-4 md:block">
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
              <MemberBadge initials="DK" name="Doh" />
              <MemberBadge initials="AM" name="Alex" />
            </div>
          </aside>

          <div className="space-y-3 p-4">
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
                  <p className="text-lg font-bold text-primary">£1,364.39</p>
                </div>
              </div>

              <div className="mt-3 flex h-3 overflow-hidden rounded-full bg-muted ring-1 ring-border/60">
                {categoryColors.map((category) => (
                  <span
                    key={category.label}
                    className={category.className}
                    style={{ width: category.width }}
                  />
                ))}
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {categoryColors.map((category) => (
                  <span
                    key={category.label}
                    className="inline-flex h-6 items-center gap-1.5 rounded-full border border-border bg-secondary/60 px-2 text-[11px] font-medium leading-none"
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${category.className}`}
                    />
                    <span className={category.className.replace("bg-", "text-")}>
                      {category.label}
                    </span>
                  </span>
                ))}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                12 spent · 16 no-spend · 5 categories
              </p>
            </div>

            <div className="grid gap-3 rounded-xl border border-border bg-secondary/40 p-3 sm:grid-cols-[1fr_auto] sm:items-center">
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Sparkles className="h-4 w-4 text-primary" />
                  AI category cleanup
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  12 memo-only entries ready to sort
                </p>
              </div>
              <button className="inline-flex h-9 items-center justify-center rounded-lg border border-border bg-background px-3 text-xs font-semibold text-foreground">
                AI sort missing categories
              </button>
            </div>

            <div className="space-y-2">
              <Entry amount="£60.10" memo="asda" />
              <Entry amount="£4.55" memo="sourdough" />
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

function MemberBadge({ initials, name }: { initials: string; name: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
        {initials}
      </div>
      <span className="truncate text-sm font-medium text-foreground">{name}</span>
    </div>
  )
}

function Entry({ amount, memo }: { amount: string; memo: string }) {
  return (
    <div className="grid grid-cols-[76px_1fr] items-center gap-2 rounded-xl border border-border bg-background p-2.5 sm:grid-cols-[76px_1fr_auto]">
      <span className="font-semibold text-foreground">{amount}</span>
      <span className="min-w-0 truncate text-sm text-foreground">{memo}</span>
      <span className="col-start-2 inline-flex w-fit items-center rounded-full bg-primary/10 px-2 py-1 text-[11px] font-medium text-primary sm:col-start-auto">
        AI sorted: Food
      </span>
    </div>
  )
}
