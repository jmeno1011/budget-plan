import { CATEGORIES, type CategoryValue, type Expense } from "@/lib/types"

export type CategorizationProgress = {
  completed: number
  sorted: number
  total: number
}

export type CategorizationResult = CategorizationProgress & {
  expenses: Expense[]
}

export function isExpenseCategorizationTarget(expense: Expense) {
  return (
    !expense.category &&
    expense.categorySource !== "manual" &&
    Boolean(expense.memo?.trim())
  )
}

function isCategoryValue(value: unknown): value is CategoryValue {
  return (
    typeof value === "string" &&
    CATEGORIES.some((category) => category.value === value)
  )
}

export async function categorizeMissingExpenses(
  expenses: Expense[],
  onProgress?: (progress: CategorizationProgress) => void,
): Promise<CategorizationResult> {
  const targets = expenses.filter(isExpenseCategorizationTarget)
  const categorizedExpenses = [...expenses]
  let completed = 0
  let sorted = 0

  for (const expense of targets) {
    try {
      const response = await fetch("/api/categorize-expense", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memo: expense.memo?.trim(),
          amount: expense.amount,
        }),
      })

      if (!response.ok) {
        throw new Error("Could not categorize expense")
      }

      const result = (await response.json()) as { category?: unknown }

      if (!isCategoryValue(result.category)) {
        throw new Error("Unknown category")
      }

      const index = categorizedExpenses.findIndex(
        (item) => item.id === expense.id,
      )

      if (index >= 0) {
        categorizedExpenses[index] = {
          ...categorizedExpenses[index],
          category: result.category,
          categorySource: "ai",
        }
        sorted += 1
      }
    } catch {
      // Keep the original expense editable when categorization fails.
    } finally {
      completed += 1
      onProgress?.({
        completed,
        sorted,
        total: targets.length,
      })
    }
  }

  return {
    completed,
    expenses: categorizedExpenses,
    sorted,
    total: targets.length,
  }
}
