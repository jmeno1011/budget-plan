import type { Expense, FixedExpense, Period } from "@/lib/types"

const formatDate = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

const parseDate = (value: string) => {
  const [year, month, day] = value.split("-").map(Number)
  return new Date(year, month - 1, day)
}

const lastDayOfMonth = (year: number, monthIndex: number) =>
  new Date(year, monthIndex + 1, 0).getDate()

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
    ? period.fixedExpensesAppliedToExpenses
      ? getFixedExpensesForPeriod(period, currentFixedExpenses)
          .filter((item) => !item.paymentDay)
          .reduce((sum, item) => sum + item.amount, 0)
      : getFixedExpensesTotalForPeriod(period, currentFixedExpenses)
    : 0

  return baseTotal + fixedTotal
}

export function buildFixedExpenseEntries(
  fixedExpenses: FixedExpense[],
  startDate: string,
  endDate: string,
  createId: (fixedExpenseId: string, date: string) => string,
): Expense[] {
  const start = parseDate(startDate)
  const end = parseDate(endDate)
  const entries: Expense[] = []
  const cursor = new Date(start.getFullYear(), start.getMonth(), 1)
  const endMonth = new Date(end.getFullYear(), end.getMonth(), 1)

  while (cursor <= endMonth) {
    const year = cursor.getFullYear()
    const month = cursor.getMonth()

    fixedExpenses.forEach((fixedExpense) => {
      if (!fixedExpense.paymentDay) return
      const clampedDay = Math.min(
        fixedExpense.paymentDay,
        lastDayOfMonth(year, month),
      )
      const paymentDate = new Date(year, month, clampedDay)
      if (paymentDate < start || paymentDate > end) return

      const date = formatDate(paymentDate)
      entries.push({
        id: createId(fixedExpense.id, date),
        date,
        amount: fixedExpense.amount,
        memo: fixedExpense.name,
        category: "utilities",
        fixedExpenseId: fixedExpense.id,
      })
    })

    cursor.setMonth(cursor.getMonth() + 1)
  }

  return entries
}
