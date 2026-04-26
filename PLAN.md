# PLAN.md — TabVault Build Plan

---

## Overview

**Goal:** Build, monetize, and ship TabVault to the Chrome Web Store in 7 days.
**Stack:** React + Vite + Tailwind + Chrome Extension APIs + ExtensionPay
**Monetization:** 7-day free trial → freemium paywall → Monthly / Yearly / Lifetime plans

---

## Pre-Build Checklist (Before Day 1)

- [ ] Create Chrome Web Store developer account — $5 one-time at chrome.google.com/webstore/devconsole
- [ ] Create ExtensionPay account — free at extensionpay.com (set up plans after Day 1 when you have your Extension ID)
- [ ] Create Stripe account — free at stripe.com (connect to ExtensionPay on Day 5)
- [ ] Install Node.js (v18+) and npm
- [ ] Install VS Code or Cursor (recommended for AI-assisted coding)
- [ ] Have a name and simple icon idea ready (can be refined later)

---

## Day 1 — Project Setup & Core Tab Reading

**Goal:** Working Chrome extension that reads and displays open tabs.

### Tasks
- [ ] Scaffold project with Vite + React
  ```bash
  npm create vite@latest tabvault -- --template react
  cd tabvault
  npm install
  npm install -D tailwindcss postcss autoprefixer
  npx tailwindcss init -p
  ```
- [ ] Install dependencies
  ```bash
  npm install extensionpay uuid
  ```
- [ ] Create `manifest.json` with Manifest V3 config
- [ ] Configure `vite.config.js` for Chrome extension build (popup + background entries)
- [ ] Create `background.js` (empty service worker for now)
- [ ] Create `src/popup/index.html` and `src/popup/main.jsx`
- [ ] Create `App.jsx` — renders a list of current open tabs using `chrome.tabs.query`
- [ ] Confirm: opening the popup shows all current tab titles and URLs
- [ ] Load extension in Chrome via `chrome://extensions` → Developer Mode → Load Unpacked → select `/dist`

### Done when
Extension icon appears in Chrome. Clicking it shows a list of currently open tabs.

---

## Day 2 — Save & Restore Sessions

**Goal:** Full save/restore/delete session functionality (the core MVP).

### Tasks
- [ ] Create `src/utils/storage.js` — helpers for chrome.storage.local read/write
- [ ] Create `src/utils/session.js` — Session shape, uuid generation, validation
- [ ] Create `src/utils/smartName.js` — auto-generate session name from tab titles
- [ ] Create `src/hooks/useSessions.js` — load, save, delete sessions from storage
- [ ] Create `src/hooks/useDuplicateCheck.js` — detect duplicate tabs across sessions
- [ ] Create `src/components/SaveModal.jsx` — name input, note input, folder picker, duplicate warning
- [ ] Create `src/components/SessionCard.jsx` — session name, tab count, note preview, restore/switch/delete buttons
- [ ] Create `src/components/SessionList.jsx` — renders list of SessionCards
- [ ] Wire "Save All Tabs" button → smart name generated → opens SaveModal → saves to storage
- [ ] Wire "Restore" button → opens all tabs from session in new window
- [ ] Wire "Delete" button → confirmation step → removes from storage
- [ ] Test: save 5 sessions, close browser, reopen, restore a session

### Done when
User can save tabs with smart name and note, see sessions in list, restore, and delete.

---

## Day 3 — Trial System

**Goal:** 7-day trial logic fully working with banners and feature gating.

### Tasks
- [ ] Create `src/utils/trial.js`
  - `initTrial()` — set installDate if not exists
  - `getTrialStatus()` — returns `{ inTrial, daysRemaining, trialExpired }`
- [ ] Create `src/hooks/useTrial.js` — calls trial.js on popup open, returns trial state
- [ ] Create `src/components/TrialBanner.jsx`
  - Hidden on days 1–4
  - Yellow warning on days 5–6: "X days left in your trial"
  - Orange urgent on day 7: "Trial ends today"
  - Not dismissible on day 7
- [ ] Implement free tier limits in `useSessions.js`
  - Block saving a 4th session when trialExpired and not paid
  - Show upgrade prompt instead
- [ ] Greyed-out locked sessions: sessions beyond limit still show in list but are visually locked
- [ ] Test trial by manually setting `installDate` to 6 days ago in storage

### Done when
Changing installDate simulates trial expiry correctly. Free tier limits engage. Banners show on correct days.

---

## Day 4 — Paid Features (Folders, Reminders, Switch, Auto-Save, Import/Export, Theme)

**Goal:** All paid features built and gated behind paywall.

### Tasks
- [ ] Create `src/hooks/useFolders.js` — CRUD for folders in chrome.storage
- [ ] Create `src/components/FolderTabs.jsx` — tab bar for All / Auto-saves / folder names
- [ ] Add folder picker to `SaveModal.jsx`
- [ ] Filter `SessionList` by selected folder tab
- [ ] Create `src/components/ReminderPicker.jsx` — date + time input
- [ ] Wire reminder to session in storage
- [ ] Create `src/components/SwitchConfirm.jsx` — confirm dialog before switching sessions
- [ ] Wire "Switch to" button → SwitchConfirm → close current tabs → open session tabs → auto-save pre-switch snapshot
- [ ] Create `src/hooks/useBadge.js` — updates extension icon badge with session count
- [ ] Create `src/hooks/useAutoSave.js` — reads/writes autoSave prefs, manages alarms
- [ ] Create `src/hooks/useTheme.js` — reads theme pref, applies dark/light class to root element
- [ ] Create `src/components/ImportExport.jsx`
  - Export: serialize sessions to JSON → download as .json file
  - Import: file picker → parse JSON → validate → merge into storage
- [ ] Update `background.js`:
  - Interval auto-save alarm — fires based on user's intervalMinutes setting
  - Nightly auto-save alarm — fires at midnight, keeps last 7 daily snapshots
  - Best-effort on-close save via `chrome.runtime.onSuspend`
  - Reminder alarms → `chrome.notifications.create()`
  - `chrome.commands.onCommand` → handle save-session and restore-last shortcuts
- [ ] Add `commands` permission to `manifest.json`
- [ ] Create `src/utils/templates.js` — default template data
- [ ] Create `src/components/TemplatePicker.jsx`
- [ ] Gate all paid features behind `isPaid` — show locked UI with upgrade CTA

### Done when
Session switch, all auto-save triggers, import/export, theme toggle, templates, badge, and shortcuts all working. All correctly gated for free users.

---

## Day 5 — Payments (ExtensionPay only)

**Goal:** Real payments working end to end for all 3 plans.

### Tasks
- [ ] Register your Chrome Extension ID on ExtensionPay dashboard at extensionpay.com
- [ ] Set up 3 plans in ExtensionPay: Monthly ($0.99), Yearly ($5.99), Lifetime ($4.99 one-time)
- [ ] Connect your Stripe account to ExtensionPay for payouts
- [ ] Add `VITE_EXTENSIONPAY_KEY` (your extension ID) to `.env`
- [ ] Create `src/hooks/usePaywall.js`
  - Calls `extpay.getUser()` on popup open
  - Returns `isPaid` boolean — same check for all plan types
  - Caches result in chrome.storage as fallback if ExtensionPay is unreachable
- [ ] Create `src/components/UpgradeModal.jsx`
  - 3 plan cards: Monthly / Yearly / Lifetime
  - Each card has a button that calls `extpay.openPaymentPage()`
  - Shows USD prices with early bird note
  - No license key input needed — ExtensionPay handles everything
- [ ] Wire upgrade modal trigger points:
  - Free limit hit
  - Trial banner CTA
  - Settings screen
- [ ] Test full payment flow in ExtensionPay test mode

### Done when
Clicking upgrade opens ExtensionPay checkout. Payment completes. Features unlock automatically on next popup open.

---

## Day 6 — Polish, Search & Final Testing

**Goal:** Production-quality UI. All screens complete and smooth.

### Tasks
- [ ] Create `src/hooks/useSearch.js` — filter sessions by name, note, URL in real time
- [ ] Create `src/components/SearchBar.jsx` — gated for paid users
- [ ] Update `src/components/SettingsScreen.jsx`:
  - Trial status / paid status / plan type
  - Auto-save config: interval picker, midnight toggle, on-close toggle
  - Theme selector: Follow System / Light / Dark
  - Keyboard shortcut reference
  - Manage subscription link (ExtensionPay portal)
  - Restore purchases button
  - Import / Export section
- [ ] Add skeleton loaders for all storage reads
- [ ] Add empty state for zero sessions ("Save your first session →")
- [ ] Add note preview on SessionCard — truncated to 1 line
- [ ] Test theme: switch between system / light / dark — verify applies instantly
- [ ] Test auto-save interval by setting to 15 mins and waiting
- [ ] Test midnight alarm by manually triggering in background.js
- [ ] Test on-close save via chrome.runtime.onSuspend
- [ ] Test import: export a session → delete it → re-import → verify restored
- [ ] Test export: download JSON → verify valid format → re-importable
- [ ] Test keyboard shortcuts end to end
- [ ] Test session switch — verify pre-switch snapshot saves correctly
- [ ] Test duplicate detection in SaveModal
- [ ] Polish all screens — consistent spacing, colors, icons
- [ ] Test free tier limits — not too punishing, not too generous

### Done when
All features tested. Extension looks and feels production-ready. No blank screens or layout breaks.

---

## Day 7 — Submit to Chrome Web Store

**Goal:** Extension live on Chrome Web Store.

### Tasks
- [ ] Run production build: `npm run build`
- [ ] Zip the `/dist` folder
- [ ] Prepare store assets:
  - [ ] App icon: 128x128 PNG (clean, recognizable)
  - [ ] 5 screenshots: 1280x800 showing key screens
  - [ ] Short description (132 chars max): "Save all open tabs in one click. Organize into sessions, set reminders, restore anytime."
  - [ ] Long description: features list, trial info, pricing
  - [ ] Privacy policy URL (host a simple one on GitHub Pages or Notion)
- [ ] Submit to Chrome Web Store developer dashboard
- [ ] Review usually takes 1–3 business days

### Done when
Extension submitted. Waiting for Chrome review.

---

## Week 2 — Launch & First Users

### Day 8–9 (after Chrome approval)
- [ ] Post on r/productivity — "I built a Chrome extension to save tab sessions"
- [ ] Post on r/chrome and r/webdev
- [ ] Submit to Product Hunt (schedule for Tuesday morning for best visibility)
- [ ] Post a 30-second screen recording on TikTok / Instagram Reels showing the extension in use
- [ ] Share in IndieHackers community

### Day 10–14
- [ ] Monitor reviews and respond to all feedback
- [ ] Fix any bugs reported
- [ ] Track conversion: installs → trial → paid
- [ ] If conversion is low → tweak upgrade prompt copy
- [ ] Start planning FocusGuard (Extension 2)

---

## Milestones

| Milestone | Target date |
|---|---|
| MVP working locally | End of Day 2 |
| Trial + paywall complete | End of Day 5 |
| Submitted to Chrome Store | End of Day 7 |
| First install | Day 8–10 |
| First paid user | Week 2 |
| ₹5,000/month revenue | Month 2 |

---

## Tech Stack Summary

| Tool | Purpose |
|---|---|
| React + Vite | UI framework and build tool |
| Tailwind CSS | Styling |
| chrome.tabs API | Read open tabs |
| chrome.storage.local | Save session data |
| chrome.alarms API | Schedule reminders |
| chrome.notifications API | Fire reminder alerts |
| ExtensionPay | All payments — Monthly, Yearly, Lifetime |
| Stripe | Payouts (connected via ExtensionPay) |
| Chrome Web Store | Distribution |
