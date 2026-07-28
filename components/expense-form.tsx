"use client";

import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { enGB } from "date-fns/locale";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIES, type Expense, type CategoryValue } from "@/lib/types";

interface ExpenseFormProps {
  expense: Expense;
  onUpdate: (expense: Expense) => void;
  onDelete?: (id: string) => void;
  showDate?: boolean;
}

export function ExpenseForm({
  expense,
  onUpdate,
  onDelete,
  showDate = true,
}: ExpenseFormProps) {
  const formatAmountInput = (amount: number) =>
    amount === 0 ? "" : String(amount);
  const [amountInput, setAmountInput] = useState(
    formatAmountInput(expense.amount),
  );
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [isCategorizing, setIsCategorizing] = useState(false);
  const [categoryError, setCategoryError] = useState(false);

  useEffect(() => {
    setAmountInput(formatAmountInput(expense.amount));
  }, [expense.amount]);

  const handleAmountChange = (value: string) => {
    setAmountInput(value);
    if (value === "") {
      onUpdate({ ...expense, amount: 0 });
      return;
    }
    if (value === "-" || value === "." || value === "-.") return;
    const amount = Number(value);
    if (Number.isNaN(amount)) return;
    onUpdate({ ...expense, amount });
  };

  const handleAmountBlur = () => {
    if (amountInput === "-" || amountInput === "." || amountInput === "-.") {
      setAmountInput(formatAmountInput(expense.amount));
    }
  };

  const handleMemoChange = (value: string) => {
    setCategoryError(false);
    onUpdate({ ...expense, memo: value });
  };

  const handleCategoryChange = (value: string) => {
    onUpdate({
      ...expense,
      category: value === "none" ? undefined : (value as CategoryValue),
      categorySource: "manual",
    });
    setIsEditingCategory(false);
    setCategoryError(false);
  };

  const handleMemoBlur = async (value: string) => {
    const memo = value.trim();
    if (
      !memo ||
      expense.category ||
      expense.categorySource === "manual" ||
      isCategorizing
    ) {
      return;
    }

    setIsCategorizing(true);
    setCategoryError(false);

    try {
      const response = await fetch("/api/categorize-expense", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memo, amount: expense.amount }),
      });

      if (!response.ok) {
        throw new Error("Could not categorize expense");
      }

      const result = (await response.json()) as { category?: string };
      const category = CATEGORIES.find((cat) => cat.value === result.category);

      if (!category) {
        throw new Error("Unknown category");
      }

      onUpdate({
        ...expense,
        category: category.value,
        categorySource: "ai",
      });
    } catch {
      setCategoryError(true);
    } finally {
      setIsCategorizing(false);
    }
  };

  const formattedDate = format(parseISO(expense.date), "d MMM (EEE)", {
    locale: enGB,
  });
  const selectedCategory = CATEGORIES.find(
    (cat) => cat.value === expense.category,
  );

  return (
    <div className="rounded-lg border border-border bg-muted/30 p-2 sm:p-3">
      {showDate && (
        <div className="mb-1.5 text-xs font-medium text-primary sm:mb-2 sm:text-sm">
          {formattedDate}
        </div>
      )}
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        <div className="relative w-24 shrink-0 sm:w-28">
          <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground sm:left-3 sm:text-sm">
            £
          </span>
          <Input
            type="number"
            step="0.01"
            value={amountInput}
            onChange={(e) => handleAmountChange(e.target.value)}
            onWheel={(e) => e.currentTarget.blur()}
            onBlur={handleAmountBlur}
            placeholder="0.00"
            className="h-8 bg-background border-border pl-6 text-sm text-foreground placeholder:text-muted-foreground sm:h-9 sm:pl-7 sm:text-base"
          />
        </div>

        <div className="min-w-32 flex-1">
          <Input
            value={expense.memo || ""}
            onChange={(e) => handleMemoChange(e.target.value)}
            onBlur={(e) => handleMemoBlur(e.target.value)}
            placeholder="Notes (optional)"
            className="h-8 bg-background border-border text-sm text-foreground placeholder:text-muted-foreground sm:h-9 sm:text-base"
          />
        </div>
        {onDelete && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Delete expense item"
            onClick={() => onDelete(expense.id)}
            className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive sm:h-9 sm:w-9"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
        <div className="flex min-h-8 w-full flex-wrap items-center gap-1.5 sm:min-h-9 sm:gap-2">
          {isEditingCategory ? (
            <div className="w-full max-w-52">
              <Select
                value={expense.category || "none"}
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger className="h-8 w-full bg-background border-border text-xs text-foreground sm:h-9 sm:text-sm">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent
                  className="bg-popover border-border select-content-compact"
                  align="start"
                  sideOffset={6}
                  collisionPadding={12}
                >
                  <SelectItem value="none" className="text-muted-foreground">
                    No category
                  </SelectItem>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : selectedCategory ? (
            <>
              <span className="inline-flex h-6 items-center rounded-full border border-primary/20 bg-primary/10 px-2 text-[11px] font-medium leading-none text-primary sm:text-xs">
                {expense.categorySource === "ai"
                  ? `AI sorted: ${selectedCategory.label}`
                  : `Category: ${selectedCategory.label}`}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                aria-label="Edit category"
                onClick={() => setIsEditingCategory(true)}
                className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
              >
                <Pencil className="mr-1 h-3.5 w-3.5" />
                Edit category
              </Button>
            </>
          ) : isCategorizing ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 text-xs text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              AI sorting...
            </span>
          ) : categoryError ? (
            <>
              <span className="text-xs text-muted-foreground">
                Could not categorize
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                aria-label="Edit category"
                onClick={() => setIsEditingCategory(true)}
                className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
              >
                <Pencil className="mr-1 h-3.5 w-3.5" />
                Edit category
              </Button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
