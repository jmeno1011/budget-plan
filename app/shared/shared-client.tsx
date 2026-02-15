"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { PeriodSelector } from "@/components/period-selector";
import { FixedExpensesCard } from "@/components/fixed-expenses-card";
import { PeriodCard } from "@/components/period-card";
import { SpendingChart } from "@/components/spending-chart";
import { SummaryStats } from "@/components/summary-stats";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import type { FixedExpense, Period, SharedBudget } from "@/lib/types";
import { Plus, Share2, Trash2, Wallet } from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import {
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { cn } from "@/lib/utils";
import { collectionName, shouldUseTestPrefix } from "@/lib/firestore-paths";
import { e2eSharedBudgets } from "@/lib/e2e-fixtures";

export default function SharedPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [sharedBudgets, setSharedBudgets] = useState<SharedBudget[]>([]);
  const [activeSharedId, setActiveSharedId] = useState<string | null>(null);
  const [isCreateSharedPeriodOpen, setIsCreateSharedPeriodOpen] =
    useState(false);
  const [isCreateSharedOpen, setIsCreateSharedOpen] = useState(false);
  const [createSharedError, setCreateSharedError] = useState<string | null>(
    null,
  );
  const [sharedSaveError, setSharedSaveError] = useState<string | null>(null);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [shareError, setShareError] = useState<string | null>(null);
  const [shareCopyError, setShareCopyError] = useState<string | null>(null);
  const [shareNativeError, setShareNativeError] = useState<string | null>(null);
  const [shareCopied, setShareCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [origin, setOrigin] = useState("");
  const [newSharedName, setNewSharedName] = useState("");
  const [newSharedDescription, setNewSharedDescription] = useState("");
  const isE2ETest = process.env.NEXT_PUBLIC_E2E_TEST_MODE === "true";

  const getPendingKey = (uid: string, budgetId: string) =>
    `budget-plan-pending-shared:${uid}:${budgetId}`;
  const getLegacyPendingKey = (uid: string, budgetId: string) =>
    `pound-tracker-pending-shared:${uid}:${budgetId}`;

  const readPendingPeriods = (key: string) => {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as Period[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const migratePendingPeriods = (key: string, legacyKey: string) => {
    const current = readPendingPeriods(key);
    const legacy = readPendingPeriods(legacyKey);
    if (legacy.length) {
      const merged = [...current];
      legacy.forEach((period) => {
        if (!merged.some((p) => p.id === period.id)) {
          merged.push(period);
        }
      });
      writePendingPeriods(key, merged);
      try {
        window.localStorage.removeItem(legacyKey);
      } catch {
        // ignore
      }
      return merged;
    }
    return current;
  };

  const writePendingPeriods = (key: string, periods: Period[]) => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(key, JSON.stringify(periods));
    } catch {
      // ignore storage failures
    }
  };

  const enqueuePendingPeriods = (key: string, periods: Period[]) => {
    const existing = readPendingPeriods(key);
    const merged = [...existing];
    periods.forEach((period) => {
      if (!merged.some((p) => p.id === period.id)) {
        merged.push(period);
      }
    });
    writePendingPeriods(key, merged);
  };

  const flushPendingPeriods = async (
    uid: string,
    budgetId: string,
    loadedPeriods: Period[],
  ) => {
    if (!navigator.onLine) return;
    const key = getPendingKey(uid, budgetId);
    const legacyKey = getLegacyPendingKey(uid, budgetId);
    const pending = migratePendingPeriods(key, legacyKey);
    if (!pending.length) return;
    const missing = pending.filter(
      (period) => !loadedPeriods.some((p) => p.id === period.id),
    );
    if (!missing.length) {
      writePendingPeriods(key, []);
      return;
    }
    const merged = [...missing, ...loadedPeriods];
    try {
      await setDoc(
        doc(db, collectionName("shared_budgets"), budgetId),
        {
          periods: merged,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );
      writePendingPeriods(key, []);
      setSharedBudgets((prev) =>
        prev.map((budget) =>
          budget.id === budgetId ? { ...budget, periods: merged } : budget,
        ),
      );
    } catch (e) {
      console.error("Failed to sync shared pending periods", e);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  useEffect(() => {
    const budgetId = searchParams.get("budgetId");
    if (budgetId) {
      setActiveSharedId(budgetId);
    }
  }, [searchParams]);

  useEffect(() => {
    if (isE2ETest) {
      const e2eUser = {
        uid: "e2e-user",
        displayName: "E2E User",
        email: "e2e@example.com",
      } as User;
      setUser(e2eUser);
      setSharedBudgets(e2eSharedBudgets);
      setActiveSharedId(e2eSharedBudgets[0]?.id ?? null);
      setIsLoaded(true);
      return;
    }
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setSharedBudgets([]);
        setActiveSharedId(null);
        setIsLoaded(true);
        return;
      }
      setIsLoaded(false);
    });
    return () => unsub();
  }, [isE2ETest]);

  useEffect(() => {
    if (isE2ETest || !user) return;
    const q = query(
      collection(db, collectionName("shared_budgets")),
      where("memberUids", "array-contains", user.uid),
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        const budgets = snap.docs.map(
          (docSnap) => ({ id: docSnap.id, ...docSnap.data() }) as SharedBudget,
        );
        setSharedBudgets(budgets);
        budgets.forEach((budget) => {
          if (!user) return;
          void flushPendingPeriods(
            user.uid,
            budget.id,
            budget.periods || [],
          );
        });
        setIsLoaded(true);
      },
      () => {
        setIsLoaded(true);
      },
    );
    return () => unsub();
  }, [user, isE2ETest]);

  useEffect(() => {
    if (sharedBudgets.length === 0) {
      setActiveSharedId(null);
      return;
    }
    const exists = sharedBudgets.some((budget) => budget.id === activeSharedId);
    if (!exists) {
      const nextId = sharedBudgets[0].id;
      setActiveSharedId(nextId);
      router.replace(`/shared?budgetId=${nextId}`);
    }
  }, [sharedBudgets, activeSharedId, router]);

  const activeSharedBudget = useMemo(
    () => sharedBudgets.find((budget) => budget.id === activeSharedId) || null,
    [sharedBudgets, activeSharedId],
  );

  useEffect(() => {
    if (!activeSharedBudget) {
      setInviteCode(null);
      return;
    }
    setInviteCode(activeSharedBudget.inviteCode || null);
  }, [activeSharedBudget]);

  const activeFixedTotal = useMemo(() => {
    if (!activeSharedBudget?.fixedExpenses) return 0;
    return activeSharedBudget.fixedExpenses.reduce(
      (sum, expense) => sum + expense.amount,
      0,
    );
  }, [activeSharedBudget]);

  const membersForView = useMemo(() => {
    if (!activeSharedBudget) return [];
    const members =
      activeSharedBudget.members?.filter((member) => member?.uid) || [];
    if (members.length) return members;
    return (activeSharedBudget.memberUids || []).map((uid) => ({
      uid,
      name: "",
      email: "",
    }));
  }, [activeSharedBudget]);

  const getMemberLabel = (member: { name?: string; email?: string; uid: string }) =>
    member.name?.trim() || member.email?.trim() || `Member ${member.uid.slice(0, 6)}`;

  const getMemberInitials = (label: string) => {
    const parts = label.trim().split(" ");
    const letters = parts.length >= 2 ? parts[0][0] + parts[1][0] : label[0];
    return letters?.toUpperCase() || "M";
  };

  const canShare =
    !!user && !!activeSharedBudget && activeSharedBudget.ownerUid === user.uid;

  const saveSharedBudgetPeriods = async (
    budgetId: string,
    nextPeriods: Period[],
    pendingPeriods: Period[] = [],
  ) => {
    if (!user) return;
    setSharedSaveError(null);
    setSharedBudgets((prev) =>
      prev.map((budget) =>
        budget.id === budgetId ? { ...budget, periods: nextPeriods } : budget,
      ),
    );
    try {
      if (!navigator.onLine) {
        if (pendingPeriods.length) {
          const pendingKey = getPendingKey(user.uid, budgetId);
          enqueuePendingPeriods(pendingKey, pendingPeriods);
        }
        return;
      }
      await setDoc(
        doc(db, collectionName("shared_budgets"), budgetId),
        {
          periods: nextPeriods,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );
    } catch (e) {
      console.error("Failed to save shared budget", e);
      const message =
        e instanceof Error ? e.message : "Unknown error occurred.";
      setSharedSaveError(message);
      if (pendingPeriods.length) {
        const pendingKey = getPendingKey(user.uid, budgetId);
        enqueuePendingPeriods(pendingKey, pendingPeriods);
      }
    }
  };

  const handleCreatePeriod = (period: Period) => {
    if (activeSharedBudget) {
      const next = [period, ...(activeSharedBudget.periods || [])];
      saveSharedBudgetPeriods(activeSharedBudget.id, next, [period]);
    }
  };

  const handleDeletePeriod = (id: string) => {
    if (activeSharedBudget) {
      saveSharedBudgetPeriods(
        activeSharedBudget.id,
        (activeSharedBudget.periods || []).filter((p) => p.id !== id),
      );
    }
  };

  const saveSharedFixedExpenses = async (
    budgetId: string,
    nextExpenses: FixedExpense[],
  ) => {
    if (!user) return;
    setSharedBudgets((prev) =>
      prev.map((budget) =>
        budget.id === budgetId ? { ...budget, fixedExpenses: nextExpenses } : budget,
      ),
    );
    try {
      if (!navigator.onLine) return;
      await setDoc(
        doc(db, collectionName("shared_budgets"), budgetId),
        { fixedExpenses: nextExpenses, updatedAt: serverTimestamp() },
        { merge: true },
      );
    } catch (e) {
      console.error("Failed to save fixed expenses", e);
    }
  };

  const handleAddFixedExpense = (expense: FixedExpense) => {
    if (!activeSharedBudget) return;
    const next = [expense, ...(activeSharedBudget.fixedExpenses || [])];
    saveSharedFixedExpenses(activeSharedBudget.id, next);
  };

  const handleDeleteFixedExpense = (id: string) => {
    if (!activeSharedBudget) return;
    const next = (activeSharedBudget.fixedExpenses || []).filter(
      (expense) => expense.id !== id,
    );
    saveSharedFixedExpenses(activeSharedBudget.id, next);
  };

  const handleCreateSharedBudget = async () => {
    const trimmedName = newSharedName.trim();
    if (!user || !trimmedName) return;
    setCreateSharedError(null);
    const basePayload = {
      name: trimmedName,
      description: newSharedDescription.trim() || "",
      ownerUid: user.uid,
      memberUids: [user.uid],
      members: [
        {
          uid: user.uid,
          email: user.email || "",
          name: user.displayName || "",
        },
      ],
      periods: [],
      fixedExpenses: [],
    };
    if (isE2ETest) {
      const id = `sb-${crypto.randomUUID()}`;
      const payload: SharedBudget = {
        id,
        ...basePayload,
      };
      setSharedBudgets((prev) => [payload, ...prev]);
      setNewSharedName("");
      setNewSharedDescription("");
      setIsCreateSharedOpen(false);
      setActiveSharedId(id);
      router.replace(`/shared?budgetId=${id}`);
      return;
    }
    const ref = doc(collection(db, collectionName("shared_budgets")));
    const payload: SharedBudget = {
      id: ref.id,
      ...basePayload,
    };
    try {
      await setDoc(ref, {
        ...payload,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setNewSharedName("");
      setNewSharedDescription("");
      setIsCreateSharedOpen(false);
      setActiveSharedId(ref.id);
      router.replace(`/shared?budgetId=${ref.id}`);
    } catch (e) {
      console.error("Failed to create shared budget", e);
      const message =
        e instanceof Error ? e.message : "Unknown error occurred.";
      setCreateSharedError(message);
    }
  };

  const generateInviteCode = () =>
    crypto.randomUUID().replace(/-/g, "").slice(0, 12).toUpperCase();

  const handleCreateInvite = async () => {
    if (!user || !activeSharedBudget || !canShare) return;
    if (activeSharedBudget.inviteCode) {
      setInviteCode(activeSharedBudget.inviteCode);
      setShareError(null);
      setShareCopyError(null);
      setShareNativeError(null);
      setShareCopied(false);
      return;
    }
    const code = generateInviteCode();
    setShareError(null);
    setShareCopyError(null);
    setShareNativeError(null);
    setShareCopied(false);
    setIsSharing(true);
    try {
      const isLocal = shouldUseTestPrefix();
      await setDoc(
        doc(db, collectionName("shared_budget_invites"), code),
        {
          budgetId: activeSharedBudget.id,
          ownerUid: user.uid,
          createdAt: serverTimestamp(),
          status: isLocal ? "test" : "active",
          usedBy: [],
        },
        { merge: true },
      );
      await setDoc(
        doc(db, collectionName("shared_budgets"), activeSharedBudget.id),
        { inviteCode: code, updatedAt: serverTimestamp() },
        { merge: true },
      );
      setSharedBudgets((prev) =>
        prev.map((budget) =>
          budget.id === activeSharedBudget.id
            ? { ...budget, inviteCode: code }
            : budget,
        ),
      );
      setInviteCode(code);
    } catch (e) {
      setShareError("Failed to create link. Please try again.");
    } finally {
      setIsSharing(false);
    }
  };

  const inviteLink = inviteCode ? `${origin}/join?code=${inviteCode}` : "";

  const handleCopyInvite = async () => {
    if (!inviteLink) {
      setShareCopyError("Create a link first.");
      setShareNativeError(null);
      return;
    }
    try {
      setShareCopyError(null);
      setShareNativeError(null);
      await navigator.clipboard.writeText(inviteLink);
      setShareCopied(true);
      window.setTimeout(() => setShareCopied(false), 2000);
    } catch (e) {
      setShareCopyError("Failed to copy link.");
    }
  };

  const handleShareInvite = async () => {
    if (!inviteLink) {
      setShareNativeError("Create a link first.");
      return;
    }
    if (typeof navigator === "undefined" || !("share" in navigator)) {
      setShareNativeError("Sharing is not supported on this device.");
      return;
    }
    setShareNativeError(null);
    try {
      await navigator.share({
        title: "Budget Plan",
        text: activeSharedBudget
          ? `Join my shared budget: ${activeSharedBudget.name}`
          : "Join my shared budget",
        url: inviteLink,
      });
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") return;
      setShareNativeError("Failed to share. Please try again.");
    }
  };

  const handleDeleteSharedBudget = async () => {
    if (!user || !activeSharedBudget || !canShare) return;
    setDeleteError(null);
    setIsDeleting(true);
    try {
      await deleteDoc(
        doc(db, collectionName("shared_budgets"), activeSharedBudget.id),
      );
      setSharedBudgets((prev) =>
        prev.filter((budget) => budget.id !== activeSharedBudget.id),
      );
      setActiveSharedId(null);
      router.replace("/shared");
    } catch (e) {
      console.error("Failed to delete shared budget", e);
      const message =
        e instanceof Error ? e.message : "Failed to delete shared budget.";
      setDeleteError(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const periodsForView = activeSharedBudget?.periods || [];

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-background">
        <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
            <Wallet className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-lg font-semibold text-foreground">
            Sign in to continue
          </h1>
          <p className="text-sm text-muted-foreground">
            Shared budgets are stored in Firestore.
          </p>
          <Button asChild className="w-full">
            <Link href="/login?redirect=/shared">Continue with Google</Link>
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main
      className={cn(
        "min-h-screen bg-background transition-opacity duration-200",
        isSigningOut && "opacity-0",
      )}
    >
      <div className="mx-auto max-w-6xl px-3 py-3 sm:px-4 sm:py-6">
        <div className="mb-4 flex items-center gap-3 sm:mb-5 sm:gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary sm:h-11 sm:w-11 sm:rounded-xl">
            <Wallet className="h-4 w-4 text-primary-foreground sm:h-6 sm:w-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground sm:text-2xl">
              Budget Plan
            </h1>
            <p className="text-xs text-muted-foreground sm:text-sm">
              Track spending by period
            </p>
          </div>
          <div className="ml-auto flex flex-col items-end gap-2 sm:flex-row sm:items-center">
            <div className="hidden text-right sm:block">
              <p className="text-xs text-muted-foreground">Signed in as</p>
              <p className="text-sm font-medium text-foreground">
                {user.displayName || user.email}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsSigningOut(true);
                window.setTimeout(async () => {
                  try {
                    await signOut(auth);
                  } finally {
                    router.replace("/");
                  }
                }, 180);
              }}
            >
              Sign out
            </Button>
          </div>
        </div>

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="inline-flex w-fit items-center rounded-full bg-secondary p-1 text-sm">
            <Link
              href="/"
              className={cn(
                "rounded-full px-3 py-1.5 font-medium transition",
                "text-muted-foreground hover:text-foreground",
              )}
            >
              Personal
            </Link>
            <Link
              href="/shared"
              aria-current="page"
              className={cn(
                "rounded-full px-3 py-1.5 font-medium transition",
                "bg-background text-foreground shadow-sm",
              )}
            >
              Shared budgets
            </Link>
          </div>

          <div className="flex flex-wrap gap-2">
            <Dialog open={isCreateSharedOpen} onOpenChange={setIsCreateSharedOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" aria-label="New shared budget">
                  <Plus className="h-4 w-4 [@media(min-width:744px)]:hidden" />
                  <span className="hidden [@media(min-width:744px)]:inline">
                    New shared budget
                  </span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Create shared budget</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Input
                      data-testid="shared-budget-name"
                      placeholder="Budget name"
                      value={newSharedName}
                      onChange={(e) => setNewSharedName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Textarea
                      data-testid="shared-budget-description"
                      placeholder="Description (optional)"
                      value={newSharedDescription}
                      onChange={(e) => setNewSharedDescription(e.target.value)}
                    />
                  </div>
                  <Button
                    onClick={handleCreateSharedBudget}
                    disabled={!newSharedName.trim()}
                    className="w-full"
                    data-testid="shared-budget-create"
                  >
                    Create
                  </Button>
                  {createSharedError && (
                    <p className="text-xs text-destructive">
                      {createSharedError}
                    </p>
                  )}
                </div>
              </DialogContent>
            </Dialog>

            {activeSharedBudget && (
              <div className="flex flex-wrap gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="whitespace-nowrap"
                    >
                      Fixed £{activeFixedTotal.toFixed(2)}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Fixed expenses</DialogTitle>
                    </DialogHeader>
                    <FixedExpensesCard
                      items={activeSharedBudget.fixedExpenses || []}
                      onAdd={handleAddFixedExpense}
                      onDelete={handleDeleteFixedExpense}
                    />
                  </DialogContent>
                </Dialog>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" disabled={!canShare} aria-label="Share link">
                      <Share2 className="h-4 w-4 [@media(min-width:744px)]:hidden" />
                      <span className="hidden [@media(min-width:744px)]:inline">
                        Share link
                      </span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Share this budget</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                      {!canShare && (
                        <p className="text-xs text-muted-foreground">
                          Only the owner can create a join link.
                        </p>
                      )}
                      <div className="rounded-lg border border-border bg-card p-3">
                        <p className="text-sm font-medium text-foreground">
                          Join link
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Create a link and send it to your friend.
                        </p>
                        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCreateInvite}
                    disabled={!canShare}
                    data-testid="share-create-link"
                  >
                    Create link
                  </Button>
                  <Input
                    readOnly
                    value={inviteLink}
                    placeholder="Link will appear here"
                    className="h-9 bg-background"
                    data-testid="share-link-input"
                  />
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleCopyInvite}
                    disabled={!inviteLink}
                    data-testid="share-copy-link"
                  >
                    {shareCopied ? "Copied" : "Copy"}
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleShareInvite}
                    disabled={!inviteLink}
                    data-testid="share-native"
                  >
                    Share
                  </Button>
                        </div>
                      </div>
                      {shareError && (
                        <p className="text-xs text-destructive">{shareError}</p>
                      )}
                      {shareCopyError && (
                        <p className="text-xs text-destructive">
                          {shareCopyError}
                        </p>
                      )}
                      {shareNativeError && (
                        <p className="text-xs text-destructive">
                          {shareNativeError}
                        </p>
                      )}
                      {shareCopied && (
                        <p className="text-xs text-emerald-600">
                          Link copied to clipboard.
                        </p>
                      )}
                      {isSharing && (
                        <p className="text-xs text-muted-foreground">
                          Working...
                        </p>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>

                {deleteError && (
                  <p className="text-xs text-destructive">{deleteError}</p>
                )}

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={!canShare || isDeleting}
                      aria-label="Delete budget"
                    >
                      <Trash2 className="h-4 w-4 [@media(min-width:744px)]:hidden" />
                      <span className="hidden [@media(min-width:744px)]:inline">
                        Delete budget
                      </span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete this shared budget?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete all periods and entries in
                        this shared budget for every member. This action cannot
                        be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteSharedBudget}
                        className="bg-destructive text-white hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
          <aside className="rounded-xl border border-border bg-card p-3">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-medium text-foreground">
                Shared budgets
              </p>
              <span className="text-xs text-muted-foreground">
                {sharedBudgets.length}
              </span>
            </div>
            {sharedBudgets.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Create a shared budget to start collaborating.
              </p>
            ) : (
              <div className="space-y-1">
                {sharedBudgets.map((budget) => (
                  <button
                    key={budget.id}
                    type="button"
                    onClick={() => {
                      setActiveSharedId(budget.id);
                      router.replace(`/shared?budgetId=${budget.id}`);
                    }}
                    className={cn(
                      "w-full rounded-md px-3 py-2 text-left text-sm transition",
                      budget.id === activeSharedId
                        ? "bg-secondary text-foreground"
                        : "text-muted-foreground hover:bg-secondary/70",
                    )}
                  >
                    <p className="font-medium text-foreground">
                      {budget.name}
                    </p>
                    {budget.description && (
                      <p className="text-xs text-muted-foreground">
                        {budget.description}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            )}

            {activeSharedBudget && (
              <div className="mt-4 border-t border-border pt-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Members
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {membersForView.length}
                  </span>
                </div>
                <div className="mt-2 space-y-2">
                  {membersForView.map((member) => {
                    const label = getMemberLabel(member);
                    const initials = getMemberInitials(label);
                    return (
                      <div
                        key={member.uid}
                        className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-foreground"
                      >
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-[0.65rem] font-semibold text-primary">
                          {initials}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-foreground">
                            {label}
                          </p>
                        </div>
                        {member.uid === activeSharedBudget.ownerUid && (
                          <span className="text-[0.6rem] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                            Owner
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </aside>

          <div>
            {!activeSharedBudget ? (
              <div className="flex h-40 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 sm:h-52">
                <Wallet className="mb-2.5 h-9 w-9 text-muted-foreground/50 sm:mb-3 sm:h-10 sm:w-10" />
                <p className="px-4 text-center text-xs text-muted-foreground sm:text-sm">
                  Select a shared budget to view details
                </p>
              </div>
            ) : (
              <>
                <div className="mb-4 sm:mb-5">
                  <SummaryStats
                    periods={periodsForView}
                    fixedExpenses={activeSharedBudget.fixedExpenses || []}
                  />
                </div>
                <div className="mb-4 sm:mb-5">
                  <SpendingChart
                    periods={periodsForView}
                    fixedExpenses={activeSharedBudget.fixedExpenses || []}
                  />
                </div>
                <div className="space-y-4 sm:space-y-5">
                  <div>
                    <div className="mb-2.5 flex flex-col gap-2 sm:mb-3 sm:flex-row sm:items-center sm:justify-between">
                      <h2 className="text-base font-semibold text-foreground sm:text-lg">
                        Periods ({periodsForView.length})
                      </h2>
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <Dialog
                          open={isCreateSharedPeriodOpen}
                          onOpenChange={setIsCreateSharedPeriodOpen}
                        >
                          <DialogTrigger asChild>
                            <Button size="sm">
                              <Plus className="mr-2 h-4 w-4" />
                              Add period
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle>Add a new period</DialogTitle>
                            </DialogHeader>
                            <PeriodSelector
                              onCreatePeriod={handleCreatePeriod}
                              onCreated={() =>
                                setIsCreateSharedPeriodOpen(false)
                              }
                              variant="plain"
                              showTitle={false}
                              fixedExpenses={
                                activeSharedBudget.fixedExpenses || []
                              }
                            />
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                    {sharedSaveError && (
                      <p className="text-xs text-destructive">
                        {sharedSaveError}
                      </p>
                    )}
                    {periodsForView.length === 0 ? (
                      <div className="flex h-40 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 sm:h-52">
                        <Wallet className="mb-2.5 h-9 w-9 text-muted-foreground/50 sm:mb-3 sm:h-10 sm:w-10" />
                        <p className="px-4 text-center text-xs text-muted-foreground sm:text-sm">
                          No periods yet
                          <br />
                          Add a period to get started
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2.5 sm:space-y-3">
                        {periodsForView.map((period) => (
                          <PeriodCard
                            key={period.id}
                            period={period}
                            onDelete={handleDeletePeriod}
                            fixedExpenses={activeSharedBudget.fixedExpenses || []}
                            editHref={`/shared/${activeSharedBudget.id}/periods/${period.id}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
