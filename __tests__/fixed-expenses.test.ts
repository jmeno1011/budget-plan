import {
  buildFixedExpenseEntries,
  getFixedExpensesForPeriod,
  getFixedExpensesTotalForPeriod,
  getTotalSpentForPeriod,
  snapshotFixedExpenses,
} from "@/lib/fixed-expenses"
import type { FixedExpense, Period } from "@/lib/types"

const currentFixedExpenses: FixedExpense[] = [
  { id: "fx-current", name: "Internet", amount: 22 },
]

describe("fixed expense snapshots", () => {
  it("uses a period snapshot instead of the current fixed expenses", () => {
    const period: Period = {
      id: "p-1",
      name: "March",
      startDate: "2026-03-01",
      endDate: "2026-03-31",
      includeFixedExpenses: true,
      fixedExpensesSnapshot: [
        { id: "fx-snapshot", name: "Internet", amount: 19 },
      ],
      expenses: [{ id: "e-1", date: "2026-03-01", amount: 10 }],
    }

    expect(getFixedExpensesForPeriod(period, currentFixedExpenses)).toEqual([
      { id: "fx-snapshot", name: "Internet", amount: 19 },
    ])
    expect(getFixedExpensesTotalForPeriod(period, currentFixedExpenses)).toBe(19)
  })

  it("falls back to current fixed expenses for older periods without snapshots", () => {
    const period: Period = {
      id: "p-1",
      name: "Legacy",
      startDate: "2026-03-01",
      endDate: "2026-03-31",
      includeFixedExpenses: true,
      expenses: [],
    }

    expect(getFixedExpensesForPeriod(period, currentFixedExpenses)).toEqual(
      currentFixedExpenses,
    )
    expect(getFixedExpensesTotalForPeriod(period, currentFixedExpenses)).toBe(22)
  })

  it("copies fixed expenses into a snapshot", () => {
    const snapshot = snapshotFixedExpenses(currentFixedExpenses)

    expect(snapshot).toEqual(currentFixedExpenses)
    expect(snapshot).not.toBe(currentFixedExpenses)
    expect(snapshot[0]).not.toBe(currentFixedExpenses[0])
  })

  it("creates fixed expense entries on their payment dates inside a period", () => {
    const entries = buildFixedExpenseEntries(
      [
        { id: "fx-rent", name: "Rent", amount: 905, paymentDay: 16 },
        { id: "fx-net", name: "Internet", amount: 22, paymentDay: 21 },
      ],
      "2026-04-21",
      "2026-05-15",
      (id) => `expense-${id}`,
    )

    expect(entries).toEqual([
      {
        id: "expense-fx-net",
        date: "2026-04-21",
        amount: 22,
        memo: "Internet",
        category: "utilities",
        fixedExpenseId: "fx-net",
      },
    ])
  })

  it("does not add snapshot totals again when fixed expenses are applied as entries", () => {
    const period: Period = {
      id: "p-1",
      name: "April",
      startDate: "2026-04-21",
      endDate: "2026-05-15",
      includeFixedExpenses: true,
      fixedExpensesAppliedToExpenses: true,
      fixedExpensesSnapshot: [
        { id: "fx-net", name: "Internet", amount: 22, paymentDay: 21 },
      ],
      expenses: [
        {
          id: "expense-fx-net",
          date: "2026-04-21",
          amount: 22,
          memo: "Internet",
          fixedExpenseId: "fx-net",
        },
      ],
    }

    expect(getTotalSpentForPeriod(period, [])).toBe(22)
  })

  it("keeps undated legacy fixed expenses in totals after dated entries are applied", () => {
    const period: Period = {
      id: "p-1",
      name: "April",
      startDate: "2026-04-21",
      endDate: "2026-05-15",
      includeFixedExpenses: true,
      fixedExpensesAppliedToExpenses: true,
      fixedExpensesSnapshot: [
        { id: "fx-net", name: "Internet", amount: 22, paymentDay: 21 },
        { id: "fx-legacy", name: "Legacy", amount: 10 },
      ],
      expenses: [
        {
          id: "expense-fx-net",
          date: "2026-04-21",
          amount: 22,
          memo: "Internet",
          fixedExpenseId: "fx-net",
        },
      ],
    }

    expect(getTotalSpentForPeriod(period, [])).toBe(32)
  })
})
