"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { format, parseISO } from "date-fns"
import { enGB } from "date-fns/locale"
import { ArrowLeft, Repeat, Wallet } from "lucide-react"
import { ExpenseForm } from "@/components/expense-form"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { FixedExpense, Period, Expense } from "@/lib/types"
import { auth, db } from "@/lib/firebase"
import { collectionName } from "@/lib/firestore-paths"
import { onAuthStateChanged, type User } from "firebase/auth"
import { doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore"

const EDIT_STORAGE_KEY = "budget-plan-edit-period"
const LEGACY_EDIT_STORAGE_KEY = "pound-tracker-edit-period"

export default function SharedPeriodEditPage() {
  const params = useParams<{ budgetId: string; id: string }>()
  const router = useRouter()
  const budgetId = Array.isArray(params?.budgetId)
    ? params.budgetId[0]
    : params?.budgetId
  const periodId = Array.isArray(params?.id) ? params.id[0] : params?.id

  const [periods, setPeriods] = useState<Period[]>([])
  const [period, setPeriod] = useState<Period | null>(null)
  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [authReady, setAuthReady] = useState(false)
  const dirtyRef = useRef(false)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setAuthReady(true)
      if (!currentUser) {
        const redirect = budgetId && periodId
          ? `/shared/${budgetId}/periods/${periodId}`
          : "/"
        router.replace(`/login?redirect=${encodeURIComponent(redirect)}`)
      }
    })
    return () => unsub()
  }, [router, budgetId, periodId])

  useEffect(() => {
    if (!authReady || !user || !budgetId || !periodId) {
      if (authReady && !user) {
        setIsLoaded(true)
      }
      return
    }

    let unsub: (() => void) | undefined

    const setup = async () => {
      try {
        unsub = onSnapshot(
          doc(db, collectionName("shared_budgets"), budgetId),
          (snap) => {
            const data = snap.data()
            const loadedPeriods = (data?.periods as Period[]) || []
            const loadedFixed = (data?.fixedExpenses as FixedExpense[]) || []
            setPeriods(loadedPeriods)
            setFixedExpenses(loadedFixed)
            const found = loadedPeriods.find((p) => p.id === periodId) || null
            if (!dirtyRef.current) {
              if (found) {
                setPeriod(found)
              } else {
                const draft =
                  sessionStorage.getItem(EDIT_STORAGE_KEY) ||
                  sessionStorage.getItem(LEGACY_EDIT_STORAGE_KEY)
                if (draft) {
                  try {
                    const parsedDraft = JSON.parse(draft) as Period
                    if (parsedDraft?.id === periodId) {
                      setPeriod(parsedDraft)
                      if (!loadedPeriods.find((p) => p.id === parsedDraft.id)) {
                        setPeriods([parsedDraft, ...loadedPeriods])
                      }
                    }
                  } catch (e) {
                    console.error("Failed to parse edit period")
                  }
                }
              }
            }
            setIsLoaded(true)
          },
          () => {
            setIsLoaded(true)
          },
        )
      } catch (e) {
        console.error("Failed to load shared periods")
        setIsLoaded(true)
      }
    }

    setup()

    return () => {
      if (unsub) unsub()
    }
  }, [authReady, user, budgetId, periodId])

  const handleExpenseUpdate = (updatedExpense: Expense) => {
    dirtyRef.current = true
    setPeriod((prev) => {
      if (!prev) return prev
      const updatedExpenses = prev.expenses.map((exp) =>
        exp.id === updatedExpense.id ? updatedExpense : exp,
      )
      return { ...prev, expenses: updatedExpenses }
    })
  }

  const handleBudgetChange = (value: string) => {
    dirtyRef.current = true
    setPeriod((prev) => {
      if (!prev) return prev
      if (value === "") {
        return { ...prev, budget: undefined }
      }
      const parsed = Number(value)
      if (Number.isNaN(parsed)) return prev
      return { ...prev, budget: parsed }
    })
  }

  const handleIncludeFixedChange = (value: boolean) => {
    dirtyRef.current = true
    setPeriod((prev) => {
      if (!prev) return prev
      return { ...prev, includeFixedExpenses: value }
    })
  }

  const handleSave = () => {
    if (!period || !user || !budgetId) return
    const hasExisting = periods.some((p) => p.id === period.id)
    const updated = hasExisting
      ? periods.map((p) => (p.id === period.id ? period : p))
      : [period, ...periods]
    setDoc(
      doc(db, collectionName("shared_budgets"), budgetId),
      { periods: updated, updatedAt: serverTimestamp() },
      { merge: true },
    )
      .then(() => {
        dirtyRef.current = false
        router.push(`/shared?budgetId=${budgetId}`)
      })
      .catch(() => {
        dirtyRef.current = false
        router.push(`/shared?budgetId=${budgetId}`)
      })
  }

  const formatDate = (dateStr: string) => {
    return format(parseISO(dateStr), "d MMM yyyy", { locale: enGB })
  }

  const formatMoney = (value: number) => {
    if (value < 0) {
      return `-£${Math.abs(value).toFixed(2)}`
    }
    return `£${value.toFixed(2)}`
  }

  const fixedTotal = fixedExpenses.reduce((sum, item) => sum + item.amount, 0)
  const baseTotal = period?.expenses.reduce((sum, exp) => sum + exp.amount, 0) ?? 0
  const totalSpent =
    baseTotal + (period?.includeFixedExpenses ? fixedTotal : 0)

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!period) {
    return (
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-4xl px-3 py-4 sm:px-4 sm:py-8">
          <div className="mb-6 flex items-center gap-3">
            <Button asChild variant="ghost" size="icon">
              <Link href="/" aria-label="Back">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <h1 className="text-lg font-semibold text-foreground sm:text-xl">
              Period not found
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            It may have been deleted or the link is invalid.
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-3 py-4 sm:px-4 sm:py-8">
        <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="icon">
              <Link href={`/shared?budgetId=${budgetId}`} aria-label="Back">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-lg font-semibold text-foreground sm:text-2xl">
                Edit {period.name}
              </h1>
              <p className="text-xs text-muted-foreground sm:text-sm">
                {formatDate(period.startDate)} ~ {formatDate(period.endDate)}
              </p>
              <p className="mt-1 text-xs font-semibold text-foreground sm:text-sm">
                Total spent {formatMoney(totalSpent)}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href={`/shared?budgetId=${budgetId}`}>Cancel</Link>
            </Button>
            <Button onClick={handleSave} className="w-full sm:w-auto">
              Save
            </Button>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <Wallet className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-base font-semibold text-foreground sm:text-lg">
              Edit spending entries
            </h2>
          </div>
          <div className="mb-4 grid gap-2 sm:grid-cols-2 sm:items-center">
            <Label
              htmlFor="shared-period-budget"
              className="text-sm text-muted-foreground sm:text-right"
            >
              Budget (optional)
            </Label>
            <Input
              id="shared-period-budget"
              type="number"
              min="0"
              step="0.01"
              placeholder="e.g. 1200.00"
              value={period.budget ?? ""}
              onChange={(e) => handleBudgetChange(e.target.value)}
              onWheel={(e) => e.currentTarget.blur()}
              className="bg-background border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <div className="space-y-2 sm:space-y-3">
            {period.expenses.map((expense) => (
              <ExpenseForm
                key={expense.id}
                expense={expense}
                onUpdate={handleExpenseUpdate}
              />
            ))}
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-border bg-card p-4 sm:mt-6 sm:p-6">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <Repeat className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-base font-semibold text-foreground sm:text-lg">
                Fixed expenses
              </h2>
              <p className="text-xs text-muted-foreground sm:text-sm">
                Recurring costs for this shared budget.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="include-fixed-expenses-edit"
                checked={Boolean(period.includeFixedExpenses)}
                onCheckedChange={(value) =>
                  handleIncludeFixedChange(value === true)
                }
                className="h-5 w-5 border-primary/40 data-[state=checked]:border-primary"
              />
              <Label
                htmlFor="include-fixed-expenses-edit"
                className="text-sm font-semibold text-foreground"
              >
                Include
              </Label>
            </div>
          </div>

          {!period.includeFixedExpenses ? (
            <p className="text-sm text-muted-foreground">
              Fixed expenses are not included in this period.
            </p>
          ) : fixedExpenses.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No fixed expenses yet.
            </p>
          ) : (
            <div className="space-y-2">
              {fixedExpenses.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border border-border/60 bg-background px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {item.name}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    £{item.amount.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
