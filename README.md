# Budget Plan

Budget Plan is a personal and shared household budget tracker for people who want one shared spending view without moving everyone to the same bank. It was built from a real problem: one person using Monzo, another using Revolut, and no clean way to manage shared spending together.

This project is a collaboration between **Doh Kim and OpenAI Codex**. All product planning, UX direction, feature ideas, architecture decisions, and final decisions were proposed and owned by Doh. Codex assisted with code implementation, refactoring, tests, and documentation based on those decisions. It is intentionally not presented as purely hand-written solo code.

**Highlights**

- Separate personal and shared budgets
- Create periods with start/end dates and auto‑generated daily entries
- Add spending, including refunds (negative amounts)
- Fixed expenses with payment days, per-period snapshots, and optional inclusion
- Memo-first expense entry with AI category suggestions
- Bulk AI cleanup for existing memo-only expenses
- Compact category breakdown visualization on period cards
- Daily activity heatmap for spent and no-spend days
- Period summaries and charts
- Shared budgets with join links
- Shared budget favorites and manual ordering
- Offline period creation with automatic sync

**Tech stack**

- Next.js (App Router)
- React + TypeScript
- Tailwind CSS
- Firebase Auth (Google)
- Firestore
- date-fns
- OpenAI Responses API for AI categorization

---

## Getting started

**1) Install dependencies**

```bash
npm install
```

**2) Configure environment variables**
Create a `.env.local` file and fill in:

```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=...
OPENAI_API_KEY=...
OPENAI_CATEGORY_MODEL=gpt-5.4-nano
```

`OPENAI_CATEGORY_MODEL` is optional. It controls the model used by `/api/categorize-expense`.

**3) Firebase setup**

- Create a Firebase project
- Enable Google sign‑in in Authentication
- Enable Firestore
- Deploy security rules

```bash
firebase deploy --only firestore:rules
```

**4) Run the dev server**

```bash
npm run dev
```

---

## Offline behaviour

When offline, **new periods** are stored in localStorage. On the next online session, any missing periods are merged and saved to Firestore.

- Personal key: `budget-plan-pending-personal:{uid}`
- Shared key: `budget-plan-pending-shared:{uid}:{budgetId}`

Note: currently only **new period creation** is synced. Offline edits/deletes are not yet supported.

---

## AI categorization

Budget Plan keeps entry friction low: users can enter an amount and a memo such as `asda`, `sourdough`, or `Rent` without manually choosing a category every time.

AI categorization works in two ways:

- New uncategorized expenses are categorized from the memo when the memo field loses focus.
- Existing period entries can be categorized with `AI sort missing categories` in the period edit screen.

The API route returns one of the fixed category values:

```ts
food | transport | shopping | entertainment | utilities | health | other
```

If AI chooses the wrong category, the user can edit it manually. Manual categories are not overwritten by bulk cleanup.

---

## Fixed expenses and period snapshots

Fixed expenses are treated as the current template for future periods. When a period includes fixed expenses, the app stores a `fixedExpensesSnapshot` on that period and creates dated expense rows based on each payment day.

This means changing a fixed expense later does not rewrite older periods. For example, increasing internet from £19 to £22 in April only affects periods created or updated from that point forward, not January through March.

---

## Scripts

- Dev server: `npm run dev`
- Build: `npm run build`
- Start: `npm run start`
- Unit tests: `npm run test`
- Watch mode: `npm run test:watch`
- E2E tests: `npm run test:e2e`

---

## Testing

**Unit tests (Jest)**

- Home landing page (`__tests__/home-page.test.tsx`)
- Login page (`__tests__/login-page.test.tsx`)
- Personal dashboard (`__tests__/personal-page.test.tsx`)
- Period edit page (`__tests__/period-edit.test.tsx`)
- Shared budgets page (`__tests__/shared-page.test.tsx`)
- Summary stats (`__tests__/summary-stats.test.tsx`)
- Spending chart empty state (`__tests__/spending-chart.test.tsx`)
- Fixed expenses UI and inclusion (`__tests__/fixed-expenses-card.test.tsx`, `__tests__/fixed-expenses.test.ts`)
- AI expense categorization (`__tests__/expense-form.test.tsx`, `__tests__/categorize-expense-api.test.ts`)
- Period category breakdown (`__tests__/period-card.test.tsx`)
- Loading state (`__tests__/page-loading.test.tsx`)

Run:
```bash
npm run test
```

**E2E tests (Cypress)**

- Home landing (`cypress/e2e/home.cy.ts`)
- Login page (`cypress/e2e/login.cy.ts`)
- Personal dashboard (`cypress/e2e/personal.cy.ts`)
- Period edit (`cypress/e2e/period-edit.cy.ts`)
- Shared budgets (`cypress/e2e/shared.cy.ts`)
  - Includes fixed expenses modal, inclusion toggle, and totals

Run:
```bash
# Terminal 1
NEXT_PUBLIC_E2E_TEST_MODE=true npm run dev

# Terminal 2
CYPRESS_personalMode=true npm run test:e2e
```

Notes:
- `NEXT_PUBLIC_E2E_TEST_MODE=true` enables fixture data and bypasses auth for E2E.
- `CYPRESS_personalMode=true` enables personal/shared E2E specs.

## Structure

- `app/`: App Router pages/layouts
- `components/`: UI and feature components
- `components/ui/`: Reusable UI primitives
- `lib/`: Firebase, types, utilities
- `public/`: Icons and static assets
- `database.md`: Firestore data structure for dev and production
- `detail-readme.md`: Detailed user flow documentation

---

## Deployment checklist

- Do not commit `.env.local` (it is in `.gitignore`).
- Add the same environment variables in your hosting provider (Vercel/Netlify).
- Add `OPENAI_API_KEY` in the hosting provider for AI categorization.
- Run `firebase deploy --only firestore:rules`.
