import type { FixedExpense, Period } from "@/lib/types"

export function snapshotFixedExpenses(
  fixedExpenses: FixedExpense[],
): FixedExpense[] {
  return fixedExpenses.map((item) => ({ ...item }))
}

export function getFixedExpensesForPeriod(
  period: Period,
  currentFixedExpenses: FixedExpense[],
): FixedExpense[] {
  return period.fixedExpensesSnapshot ?? currentFixedExpenses
}

export function getFixedExpensesTotalForPeriod(
  period: Period,
  currentFixedExpenses: FixedExpense[],
): number {
  return getFixedExpensesForPeriod(period, currentFixedExpenses).reduce(
    (sum, item) => sum + item.amount,
    0,
  )
}

export function getTotalSpentForPeriod(
  period: Period,
  currentFixedExpenses: FixedExpense[],
): number {
  const baseTotal = period.expenses.reduce((sum, exp) => sum + exp.amount, 0)
  const fixedTotal = period.includeFixedExpenses
    ? getFixedExpensesTotalForPeriod(period, currentFixedExpenses)
    : 0

  return baseTotal + fixedTotal
}
