# Budget Plan

Budget Plan is a personal and shared household budget tracker. Log spending by period, see summaries and charts, and collaborate with housemates. It uses Google sign‑in and Firestore for storage, with offline period creation synced once you’re back online.

**Highlights**

- Separate personal and shared budgets
- Create periods with start/end dates and auto‑generated daily entries
- Add spending, including refunds (negative amounts)
- Fixed expenses with optional inclusion per period
- Period summaries and charts
- Shared budgets with join links
- Offline period creation with automatic sync

**Tech stack**

- Next.js (App Router)
- React + TypeScript
- Tailwind CSS
- Firebase Auth (Google)
- Firestore
- date-fns

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
```

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
- Fixed expenses UI and inclusion are covered in `__tests__/personal-page.test.tsx` and `__tests__/period-edit.test.tsx`

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

---

## Deployment checklist

- Do not commit `.env.local` (it is in `.gitignore`).
- Add the same environment variables in your hosting provider (Vercel/Netlify).
- Run `firebase deploy --only firestore:rules`.
