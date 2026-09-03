# Monthly Expenditure Tracker

A mobile-first monthly expenditure tracker built with React + Vite, Firebase Anonymous Authentication, Firestore, Recharts, React Hook Form and Tailwind CSS.

## Features

- Anonymous Firebase authentication; no sign-up form.
- User-scoped Firestore data.
- Custom categories with editable names and colors.
- Expense create, edit and delete.
- Delete confirmation.
- Clear All Data in Settings with a single confirmation step.
- Filters: All Time, This Month, This Week and Custom Range.
- Dashboard metrics and three responsive charts:
  - 12-month spending comparison.
  - Category spending donut for the selected filter.
  - Daily spending trend for the selected filter.
- Mobile-first bottom navigation.
- Toast notifications and loading/empty states.
- KES display without a currency symbol in numeric inputs.


## Local development before Firebase setup

The app can now run in **local demo mode** when the Firebase environment variables are absent. This is intentional so you can inspect and test the complete UI before creating/configuring your Firebase project.

In demo mode:

- Default categories are available immediately.
- Expenses, category changes and filters work.
- Data is stored in browser `localStorage`.
- The Settings page shows that Firebase is not connected.
- A banner at the top identifies Demo Mode.
- Once all `VITE_FIREBASE_*` variables are supplied, the app automatically switches to Firebase Anonymous Auth + Firestore mode.

Demo-mode data is not cloud-backed and should not be considered production data.

## 1. Create the Firebase project

1. Open the Firebase Console.
2. Create a Firebase project.
3. Add a Web App.
4. Copy the Firebase web configuration values.
5. Enable **Authentication > Sign-in method > Anonymous**.
6. Create a Firestore database.
7. Deploy the included Firestore rules.

Anonymous authentication gives each browser/device session a Firebase UID. Clearing browser site data, changing browser/device, or signing out/clearing the anonymous session can produce a different UID. This app intentionally has no cross-device account recovery.

## 2. Install

Requirements:
- Node.js 20+ recommended.
- npm.
- Firebase CLI.

```bash
npm install
```

## 3. Environment variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Fill in:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

These values are web-app configuration values, not Firestore admin credentials. Never put Firebase Admin SDK service-account private keys in a Vite `.env` file.

## 4. Run locally

```bash
npm run dev
```

Then open the URL shown by Vite, normally `http://localhost:5173`.

## 5. Deploy Firestore rules

Install/login to the Firebase CLI if needed:

```bash
npm install -g firebase-tools
firebase login
```

Connect the local project to your Firebase project:

```bash
firebase use --add
```

Choose the Firebase project you created.

Deploy rules:

```bash
npm run firebase:rules
```

## 6. Build and deploy Hosting

```bash
npm run build
firebase deploy --only hosting
```

Or deploy Hosting and Firestore rules together:

```bash
npm run firebase:deploy
```

## Firestore structure

```text
users/{uid}
  categories/{categoryId}
    userId
    name
    color
    createdAt
    updatedAt

  expenses/{expenseId}
    userId
    name
    amount
    categoryId
    date        // YYYY-MM-DD
    createdAt
    updatedAt
```

All queries are scoped to the current anonymous UID.

## Security model

The Firestore rules only permit authenticated users to access documents below their own `users/{uid}` path. Every category and expense also stores `userId`, and creates/updates are rejected if that field does not match the authenticated UID.

The app does not use Firebase Storage, Cloud Functions, or an admin SDK.

## Chart/filter behavior

The default dashboard filter is **This Month**. Changing the filter updates the expense list, metric cards and the filter-driven charts.

- The 12-month comparison chart always displays the previous 12 calendar months, with each month's total restricted to the selected date range when the selected filter has a finite range.
- The category donut uses expenses inside the selected filter.
- The daily trend uses daily totals inside the selected filter.

This preserves the requested month-comparison view while making the dashboard responsive to filtering.

## Production checklist

Before publishing to a wider audience:

- Set a Firebase budget alert.
- Review Firestore usage and billing.
- Consider adding a real authentication provider if users need data recovery across devices.
- Consider App Check if appropriate for your threat model.
- Keep Firestore rules deployed from source control.
- Test the app on a 320px-wide device as well as 375px and desktop.
