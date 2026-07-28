"use client"

import { useState } from "react"
import Link from "next/link"
import { eachDayOfInterval, format, parseISO } from "date-fns"
import { enGB } from "date-fns/locale"
import {
  Pencil,
  PoundSterling,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { CATEGORIES, type FixedExpense, type Period } from "@/lib/types"
import {
  getFixedExpensesForPeriod,
  getFixedExpensesTotalForPeriod,
  getTotalSpentForPeriod,
} from "@/lib/fixed-expenses"

interface PeriodCardProps {
  period: Period
  onDelete: (id: string) => void
  editHref?: string
  fixedExpenses?: FixedExpense[]
}

export function PeriodCard({
  period,
  onDelete,
  editHref,
  fixedExpenses = [],
}: PeriodCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const editStorageKey = "budget-plan-edit-period"

  const fixedItems = getFixedExpensesForPeriod(period, fixedExpenses)
  const fixedTotal = getFixedExpensesTotalForPeriod(period, fixedExpenses)
  const totalSpent = getTotalSpentForPeriod(period, fixedExpenses)
  
  const categoryTotals = period.expenses.reduce((acc, exp) => {
    if (exp.category && exp.amount !== 0) {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount
    }
    return acc
  }, {} as Record<string, number>)

  const formatDate = (dateStr: string) => {
    return format(parseISO(dateStr), "d MMM yyyy", { locale: enGB })
  }

  const formatDateShort = (dateStr: string) => {
    return format(parseISO(dateStr), "d/M", { locale: enGB })
  }

  const formatExpenseDate = (dateStr: string) => {
    return format(parseISO(dateStr), "d MMM (EEE)", { locale: enGB })
  }

  const formatMoney = (value: number) => {
    if (value < 0) {
      return `-£${Math.abs(value).toFixed(2)}`
    }
    return `£${value.toFixed(2)}`
  }

  const storeEditPeriod = () => {
    try {
      sessionStorage.setItem(editStorageKey, JSON.stringify(period))
    } catch (e) {
      // ignore storage failures
    }
  }

  const periodDays = eachDayOfInterval({
    start: parseISO(period.startDate),
    end: parseISO(period.endDate),
  })

  const dailyActivity = periodDays.map((day) => {
    const date = format(day, "yyyy-MM-dd")
    const total = period.expenses
      .filter((expense) => expense.date === date)
      .reduce((sum, expense) => sum + expense.amount, 0)
    return { date, total }
  })
  const spentDays = dailyActivity.filter((day) => day.total > 0).length
  const noSpendDays = dailyActivity.length - spentDays

  const getActivityClass = (amount: number) => {
    if (amount <= 0) return "bg-muted"
    if (amount <= 25) return "bg-primary/20"
    if (amount <= 75) return "bg-primary/40"
    if (amount <= 150) return "bg-primary/70"
    return "bg-primary"
  }

  return (
    <div
      className="overflow-hidden rounded-lg border border-border bg-card"
      data-testid="period-card"
    >
      <div
        className="cursor-pointer p-2.5 transition-colors hover:bg-secondary/50 sm:p-4"
        onClick={() => setIsExpanded(!isExpanded)}
        data-testid="period-card-header"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
            <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 sm:flex">
              <PoundSterling className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-sm font-semibold text-card-foreground sm:text-lg">{period.name}</h3>
              <p className="text-xs text-muted-foreground">
                <span className="sm:hidden">{formatDateShort(period.startDate)} ~ {formatDateShort(period.endDate)}</span>
                <span className="hidden sm:inline">{formatDate(period.startDate)} ~ {formatDate(period.endDate)}</span>
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <div className="text-right">
              <p className="hidden text-xs text-muted-foreground sm:block">Total spent</p>
              <p className="text-base font-bold text-primary sm:text-xl">{formatMoney(totalSpent)}</p>
            </div>
            <Button
              asChild
              variant="outline"
              size="icon"
              className="h-8 w-8 sm:h-9 sm:w-9"
            >
              <Link
                href={editHref || `/periods/${period.id}`}
                aria-label="Edit period"
                onClick={(e) => {
                  e.stopPropagation()
                  storeEditPeriod()
                }}
              >
                <Pencil className="h-4 w-4" />
              </Link>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => e.stopPropagation()}
                  aria-label="Delete period"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive sm:h-9 sm:w-9"
                >
                  <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this period?</AlertDialogTitle>
                  <AlertDialogDescription>
                    All spending entries in this period will be deleted. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(period.id)}
                    className="bg-destructive text-white hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <div className="mt-3 grid gap-2 sm:ml-[52px] sm:grid-cols-[1fr_auto] sm:items-end">
          <div className="grid grid-cols-7 gap-1 sm:grid-cols-[repeat(auto-fit,minmax(10px,16px))]">
            {dailyActivity.map((day) => (
              <div
                key={day.date}
                className={`aspect-square min-w-2 rounded-sm border border-border/60 ${getActivityClass(day.total)}`}
                title={`${formatExpenseDate(day.date)} · ${formatMoney(day.total)}`}
                data-testid={`period-activity-day-${day.date}`}
              />
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            {spentDays} spent · {noSpendDays} no-spend
          </p>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-border p-2.5 sm:p-4">
          {period.includeFixedExpenses && (
            <div className="mb-3 rounded-lg border border-border bg-background p-2.5 sm:p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">
                  Fixed expenses
                </p>
                <p className="text-xs text-muted-foreground">
                  Total {formatMoney(fixedTotal)}
                </p>
              </div>
              {fixedItems.length === 0 ? (
                <p className="mt-2 text-xs text-muted-foreground">
                  No fixed expenses yet.
                </p>
              ) : (
                <div className="mt-2 space-y-1.5">
                  {fixedItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-md border border-border/60 bg-muted/30 px-2 py-1.5 text-xs"
                    >
                      <span className="truncate text-foreground">
                        {item.name}
                      </span>
                      <span className="font-medium text-foreground">
                        {formatMoney(item.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="mb-2.5 flex items-center justify-between sm:mb-3">
            <p className="text-sm font-medium text-foreground">Spending entries</p>
          </div>
          {Object.keys(categoryTotals).length > 0 && (
            <div className="mb-3 flex flex-wrap gap-1.5 sm:mb-4 sm:gap-2">
              {Object.entries(categoryTotals).map(([cat, amount]) => {
                const category = CATEGORIES.find((c) => c.value === cat)
                return (
                  <div
                    key={cat}
                    className="rounded-full bg-secondary px-2 py-0.5 text-xs sm:px-2.5 sm:py-1"
                  >
                    <span className="text-muted-foreground">{category?.label}: </span>
                    <span className="font-medium text-foreground">{formatMoney(amount)}</span>
                  </div>
                )
              })}
            </div>
          )}

          <div className="space-y-1.5">
            {period.expenses.map((expense) => {
              const category = CATEGORIES.find((c) => c.value === expense.category)
              return (
                <div
                  key={expense.id}
                  className="rounded-md border border-border bg-muted/30 p-2"
                >
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="font-medium text-primary">
                      {formatExpenseDate(expense.date)}
                    </span>
                    <span className="font-semibold text-foreground">
                      {formatMoney(expense.amount)}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-muted-foreground">
                      {category?.label ?? "No category"}
                    </span>
                    <span className={expense.memo ? "text-foreground" : "text-muted-foreground"}>
                      {expense.memo || "No note"}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
