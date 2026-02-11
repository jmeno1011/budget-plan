"use client";

import { useMemo, useState } from "react";
import { Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
} from "@/components/ui/alert-dialog";
import type { FixedExpense } from "@/lib/types";

interface FixedExpensesCardProps {
  title?: string;
  items: FixedExpense[];
  onAdd: (expense: FixedExpense) => void;
  onDelete: (id: string) => void;
}

export function FixedExpensesCard({
  title = "Fixed expenses",
  items,
  onAdd,
  onDelete,
}: FixedExpensesCardProps) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [amountError, setAmountError] = useState<string | null>(null);

  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.amount, 0),
    [items],
  );

  const handleAdd = () => {
    const trimmedName = name.trim();
    const parsed = Number(amount);
    const hasName = Boolean(trimmedName);
    const hasAmount = Number.isFinite(parsed) && parsed > 0;
    setNameError(hasName ? null : "Please enter a name.");
    setAmountError(hasAmount ? null : "Please enter an amount.");
    if (!hasName || !hasAmount) return;
    onAdd({
      id: crypto.randomUUID(),
      name: trimmedName,
      amount: parsed,
    });
    setName("");
    setAmount("");
    setNameError(null);
    setAmountError(null);
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground">
            Total fixed costs: £{total.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-[1.5fr_1fr_auto]">
        <div>
          <Input
            id="fixed-expenses-name"
            placeholder="e.g. Netflix"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (nameError) setNameError(null);
            }}
            className="bg-background"
            aria-invalid={Boolean(nameError)}
          />
          {nameError && (
            <p className="mt-1 text-xs text-destructive">{nameError}</p>
          )}
        </div>
        <div>
          <Input
            id="fixed-expenses-amount"
            placeholder="e.g. 12.99"
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              if (amountError) setAmountError(null);
            }}
            onWheel={(e) => e.currentTarget.blur()}
            className="bg-background"
            aria-invalid={Boolean(amountError)}
          />
          {amountError && (
            <p className="mt-1 text-xs text-destructive">{amountError}</p>
          )}
        </div>
        <Button onClick={handleAdd} size="sm" data-testid="fixed-expenses-add">
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </div>

      {items.length === 0 ? (
        <p className="mt-3 text-xs text-muted-foreground">
          No fixed expenses yet.
        </p>
      ) : (
        <div className="mt-3 space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-lg border border-border/60 bg-background px-3 py-2"
              data-testid={`fixed-expense-item-${item.id}`}
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {item.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  £{item.amount.toFixed(2)}
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Delete fixed expense">
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete this fixed expense?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This item will be removed from the fixed expenses list.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onDelete(item.id)}
                      className="bg-destructive text-white hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
