# TabVault — Dev Log

---

## Day 1 — Project Setup & Full Scaffold
**Date:** 2026-04-25
**Status:** Complete ✓

### What was done
- Initialized git repository
- Created `package.json` with React 18, Vite 5, Tailwind 3, uuid
- Created `vite.config.js` configured for Chrome Extension (dual entry: popup + background)
- Created `tailwind.config.js` with dark mode via `class`, minimalist zinc palette
- Created `postcss.config.js`
- Created `manifest.json` (Manifest V3) — permissions: tabs, storage, alarms, notifications
- Created `.gitignore` and `.env.example`

### Source files created

**background.js (root)**
- Sets `installDate` on first install
- Handles `chrome.alarms.onAlarm` → fires Chrome notification with session name
- Handles `chrome.notifications.onClicked` → opens all session tabs in new window
- Clears reminder from session after firing

**src/popup/index.html** — popup HTML entry point
**src/popup/main.jsx** — React root, applies dark class based on system preference
**src/popup/App.jsx** — root component wiring all hooks and screens together

**src/utils/**
- `storage.js` — `storageGet` / `storageSet` wrappers around `chrome.storage.local`
- `session.js` — `createSession()`, `isValidSession()`, `formatDate()` helpers
- `trial.js` — `initTrial()`, `getTrialStatus()` → returns `{ inTrial, daysRemaining, trialExpired }`
- `pricing.js` — `PRICING` constants for INR and USD (monthly/yearly/lifetime)
- `license.js` — `validateGumroadKey()` → POST to Gumroad API, sets `isPaid` on success

**src/hooks/**
- `useSessions.js` — load/save/delete/restore/update sessions in chrome.storage; creates alarms on reminder set
- `useTrial.js` — calls `getTrialStatus()` on mount, returns trial state
- `usePaywall.js` — checks ExtensionPay on mount, falls back to local `isPaid` cache
- `useFolders.js` — CRUD for folder list in chrome.storage
- `useSearch.js` — filters sessions by active folder + search query (memoized)

**src/components/**
- `TrialBanner.jsx` — yellow (days 5-6) / orange (day 7) banner, hidden days 1-4
- `SearchBar.jsx` — enabled for trial/paid, greyed-out with "Pro" badge for free users
- `FolderTabs.jsx` — pill tab bar, inline folder creation, gated for free users
- `SaveModal.jsx` — bottom sheet, auto-generates session name, folder picker (pro-gated)
- `ReminderPicker.jsx` — bottom sheet date/time picker, remove option
- `SessionCard.jsx` — expandable card: tab list, restore/rename/remind/export/delete actions; locked state for free tier overflow
- `SessionList.jsx` — skeleton loader, empty state, free tier lock at 3 sessions
- `UpgradeModal.jsx` — 3-plan grid (Monthly/Yearly/Lifetime), Gumroad license key input
- `SettingsScreen.jsx` — account status, manage subscription, restore purchase

### Design decisions
- Minimalist zinc palette (Tailwind zinc scale)
- System-aware dark/light mode (reads `prefers-color-scheme` on mount)
- Popup fixed at 380×520px per spec
- Dark mode via Tailwind `darkMode: 'class'`

### Known gaps (will be addressed)
- ExtensionPay integration deferred to Day 5 (need API key from user)
- Gumroad permalink deferred to Day 5
- Icons not yet created (placeholder paths in manifest)
- No GitHub remote yet — add after user provides repo name

### Build output
```
dist/background.js       0.97 kB
dist/popup.js          167.23 kB
dist/assets/popup.css   18.05 kB
Build time: 1.57s ✓
```

---

## Days 2–4 — Code Review & Bug Fixes
**Date:** 2026-04-25
**Status:** Complete ✓

All Days 2–4 features were scaffolded in Day 1. This pass fixed 3 rule violations found during review:

### Bugs fixed
1. **`license.js`** — was making `fetch` directly from popup context, violating AI_RULES "no network requests from popup". Fixed by moving the Gumroad API call to `background.js` via `chrome.runtime.sendMessage({ type: 'VALIDATE_LICENSE' })`.

2. **`SettingsScreen.jsx`** — used `alert()` 3 times, violating AI_RULES "never use alert()". Fixed by adding a local `notice` state that renders an inline timed message (auto-clears after 3s).

3. **`usePaywall.js`** — used incorrect `window.ExtensionPay?.(key)` pattern. Fixed to use message-based `CHECK_PAYMENT` via background.js (stub until Day 5 keys are added).

### background.js message handlers added
- `VALIDATE_LICENSE` — POSTs to Gumroad API, sets `isPaid` in storage on success
- `CHECK_PAYMENT` — reads local `isPaid` cache (ExtensionPay wired on Day 5)
- `RESTORE_PURCHASE` — reads local `isPaid` cache
- `OPEN_PAYMENT_PAGE` — stub for ExtensionPay (Day 5)

## Day 5 — Payments
**Date:** 2026-04-25
**Status:** Complete ✓

- ExtPay key: `tabvaultwithai` | Gumroad permalink: `bxiocl`
- Downloaded `ExtPay.js` (UMD) to `public/` — Vite copies it to `dist/` as-is
- `background.js`: `importScripts('ExtPay.js')` at top, `ExtPay('tabvaultwithai')` init, `extpay.startBackground()` called
- `CHECK_PAYMENT` and `RESTORE_PURCHASE` handlers call `extpay.getUser()` with local cache fallback
- `OPEN_PAYMENT_PAGE` calls `extpay.openPaymentPage()`
- `VALIDATE_LICENSE` posts to Gumroad API with permalink `bxiocl`
- `.env` updated with both keys (gitignored)

## Day 6 — (upcoming) Polish, Search, Export

## Day 7 — (upcoming) Chrome Web Store Submission
