# PLAN.md — TabVault Build Plan

---

## Overview

**Goal:** Build, monetize, and ship TabVault to the Chrome Web Store in 7 days.
**Stack:** React + Vite + Tailwind + Chrome Extension APIs + ExtensionPay + Gumroad
**Monetization:** 7-day free trial → freemium paywall → Monthly / Yearly / Lifetime plans

---

## Pre-Build Checklist (Before Day 1)

- [ ] Create Chrome Web Store developer account — $5 one-time at chrome.google.com/webstore/devconsole
- [ ] Create ExtensionPay account — free at extensionpay.com
- [ ] Create Gumroad account — free at gumroad.com, set up product, get permalink
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
- [ ] Create `src/hooks/useSessions.js` — load, save, delete sessions from storage
- [ ] Create `src/components/SaveModal.jsx` — name input + confirm button
- [ ] Create `src/components/SessionCard.jsx` — session name, tab count, restore/delete buttons
- [ ] Create `src/components/SessionList.jsx` — renders list of SessionCards
- [ ] Wire "Save All Tabs" button → opens SaveModal → saves to storage
- [ ] Wire "Restore" button → opens all tabs from session in new window
- [ ] Wire "Delete" button → confirmation step → removes from storage
- [ ] Test: save 5 sessions, close browser, reopen, restore a session

### Done when
User can save tabs, name the session, see it in the list, restore it, and delete it.

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

## Day 4 — Folders & Reminders (Paid Features)

**Goal:** Folders and reminders built and gated behind paywall.

### Tasks
- [ ] Create `src/hooks/useFolders.js` — CRUD for folders in chrome.storage
- [ ] Create `src/components/FolderTabs.jsx` — tab bar for All / folder names
- [ ] Add folder picker to `SaveModal.jsx`
- [ ] Filter `SessionList` by selected folder tab
- [ ] Create `src/components/ReminderPicker.jsx` — date + time input
- [ ] Wire reminder to session in storage
- [ ] Update `background.js`:
  - On `chrome.alarms.onAlarm` → read session from storage → `chrome.notifications.create()`
  - On `chrome.notifications.onClicked` → open all session tabs
- [ ] Gate folders + reminders behind `isPaid` — show locked UI with upgrade CTA for free users

### Done when
Paid users can assign sessions to folders and set reminders. Free users see locked versions with upgrade prompts.

---

## Day 5 — Payments (ExtensionPay + Gumroad)

**Goal:** Real payments working end to end.

### Tasks
- [ ] Set up ExtensionPay product with Monthly + Yearly plans at extensionpay.com
- [ ] Add `VITE_EXTENSIONPAY_KEY` to `.env`
- [ ] Create `src/hooks/usePaywall.js`
  - Calls `ExtensionPay.getUser()` on popup open
  - Returns `isPaid` boolean
  - Caches result in chrome.storage as fallback
- [ ] Create `src/utils/license.js`
  - `validateGumroadKey(key)` — POST to Gumroad API
  - Returns `true/false`
  - On success → sets `isPaid = true` in storage
- [ ] Create `src/components/UpgradeModal.jsx`
  - 3 plan cards: Monthly / Yearly / Lifetime
  - Monthly + Yearly → ExtensionPay payment button
  - Lifetime → Gumroad license key input field + validate button
  - Shows INR and USD prices
- [ ] Wire upgrade modal trigger points:
  - Free limit hit
  - Trial banner CTA
  - Settings screen
- [ ] Test full payment flow in ExtensionPay test mode

### Done when
Clicking upgrade opens the modal. Monthly/Yearly payment flow works in test mode. Gumroad key validates and unlocks features.

---

## Day 6 — Polish, Search & Export

**Goal:** Production-quality UI. All screens complete and smooth.

### Tasks
- [ ] Create `src/hooks/useSearch.js` — filter sessions by name/URL in real time
- [ ] Create `src/components/SearchBar.jsx` — gated for paid users
- [ ] Add export feature to SessionCard — copy URLs to clipboard or download .txt
- [ ] Create `src/components/SettingsScreen.jsx`
  - Show trial status / paid status
  - Link to manage subscription (ExtensionPay portal)
  - Restore purchases button
- [ ] Add skeleton loaders for all storage reads
- [ ] Add empty state for zero sessions ("Save your first session →")
- [ ] Polish all screens — consistent spacing, colors, icons
- [ ] Test on Chrome with real tabs — check all flows end to end
- [ ] Test free tier limits feel correct — not too punishing, not too generous

### Done when
Extension looks and feels production-ready. All flows tested. No blank screens or layout breaks.

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
- [ ] Set up Gumroad product page with pricing and description
- [ ] Review usually takes 1–3 business days

### Done when
Extension submitted. Gumroad product live. Waiting for Chrome review.

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
| ExtensionPay | Monthly + Yearly subscriptions |
| Gumroad | Lifetime license key sales |
| Chrome Web Store | Distribution |
