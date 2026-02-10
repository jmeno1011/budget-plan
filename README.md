# Budget Plan

Budget Plan is a personal and shared household budget tracker. Log spending by period, see summaries and charts, and collaborate with housemates. It uses Google sign‑in and Firestore for storage, with offline period creation synced once you’re back online.

**Highlights**

- Separate personal and shared budgets
- Create periods with start/end dates and auto‑generated daily entries
- Add spending, including refunds (negative amounts)
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
