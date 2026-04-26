# PRD.md — TabVault Product Requirements Document

---

## 1. Overview

**TabVault** is a Chrome extension that lets users save all open browser tabs as a named session in one click, organize sessions into folders, set reminders to reopen them, search across all saved sessions, switch contexts instantly, add notes, and auto-save nightly snapshots. It solves the common problem of losing valuable tab setups when closing a browser window or needing to context-switch.

**Version:** 1.0.0
**Platform:** Chrome Web Store (Manifest V3)
**Target users:** Professionals, students, researchers, developers — anyone who works with many tabs simultaneously.

---

## 2. Problem Statement

- Users lose their entire tab setup when closing Chrome or switching tasks.
- Browser's built-in session restore is unreliable and unorganized.
- No native way to name, categorize, or schedule tab sessions.
- Power users manage 20–50+ tabs with no system to handle context switching.
- No way to add context or notes to a saved set of tabs.
- No automatic backup of tabs — one accidental close and everything is gone.

---

## 3. Goals

- Allow users to save all open tabs as a named session in under 3 seconds.
- Let users restore any saved session with one click.
- Provide organization via folders, notes, and search.
- Remind users to return to a saved session at a set time.
- Let users switch contexts instantly with one-click session switching.
- Auto-save nightly snapshots so no tabs are ever lost accidentally.
- Detect and warn about duplicate tabs across sessions.
- Provide keyboard shortcuts for power users.
- Monetize via a 7-day trial followed by a freemium paywall with 3 paid plans.

---

## 4. Non-Goals (v1.0)

- No cloud sync between browsers (v2 roadmap).
- No team/shared sessions.
- No Firefox or Edge support.
- No mobile support.
- No tab grouping (Chrome's native feature handles this).

---

## 5. User Stories

### Free user
- As a free user, I can save up to 3 tab sessions.
- As a free user, I can restore any of my 3 sessions.
- As a free user, I can delete sessions.
- As a free user, I can see locked sessions beyond my limit with an upgrade prompt.

### Trial user (days 1–7)
- As a trial user, I have full access to all features for 7 days.
- As a trial user, I see a countdown banner on days 5, 6, and 7.
- As a trial user, I can upgrade at any time during the trial.

### Paid user
- As a paid user, I can save unlimited sessions.
- As a paid user, I can organize sessions into named folders.
- As a paid user, I can set a date/time reminder to reopen any session.
- As a paid user, I can search across all sessions by name or URL.
- As a paid user, I can export any session as a list of links.
- As a paid user, I can add a text note to any session.
- As a paid user, I can switch sessions in one click — closing current tabs and opening saved ones.
- As a paid user, my tabs are auto-saved every night as a snapshot.
- As a paid user, I get warned if tabs in a new session already exist in another session.
- As a paid user, I can use keyboard shortcuts to save and restore sessions instantly.
- As a paid user, I can see a badge on the extension icon showing saved session count.
- As a paid user, I can sync sessions across devices (v2).

---

## 6. Features

### 6.1 Session Save
- One-click "Save All Tabs" button in popup.
- Smart auto-generated session name based on tab titles (e.g. tabs open on GitHub + Vercel = "Dev Session").
- User can rename before saving.
- User can assign to a folder before saving.
- User can add an optional note before saving.
- Duplicate tab detection — warns if tabs already exist in another session before saving.
- Saves: tab title, URL, favicon URL, timestamp, note.

### 6.2 Session List
- Displays all saved sessions sorted by most recent.
- Each session shows: name, tab count, folder, date saved, note preview.
- Tap to expand and see individual tabs.
- Actions per session: Restore all, Switch to, Open one tab, Rename, Set reminder, Export, Delete.
- Tab count badge on extension icon showing total saved sessions.

### 6.3 One-Click Session Switch
- "Switch to" button on each session card.
- Closes all current tabs and opens the selected session in one action.
- Confirmation prompt before closing current tabs.
- Previous tabs auto-saved as "Pre-switch snapshot" so nothing is lost.
- Paid feature.

### 6.4 Session Notes
- Optional text note field on every session.
- Shown as a preview in the session card.
- Editable at any time after saving.
- Example: "Come back after the standup" or "Client research — present Friday".
- Paid feature.

### 6.5 Folders
- User can create named folders (e.g. "Work", "Research", "Shopping").
- Sessions assigned to folders shown under folder tabs in main popup.
- Default folder is "All".
- Paid feature — free users see folder UI but cannot create or assign.

### 6.6 Reminders
- User sets a date and time for a reminder on any session.
- At reminder time, Chrome notification fires: "Time to open your session: [name]".
- Clicking notification opens the session.
- Implemented via `chrome.alarms` + `chrome.notifications`.
- Paid feature.

### 6.7 Auto-Save Snapshots
- Background service worker auto-saves open tabs on all 3 triggers:
  - **Custom interval** — user sets their own (15 min / 30 min / 1 hour / 4 hours / Off)
  - **Every night at midnight** — fixed daily snapshot
  - **Best effort on browser close** — attempts to save when Chrome is closing
- Stored as "Auto-save — Apr 25, 10:30am" in a special locked "Auto-saves" folder.
- Interval snapshots: keeps last 5, oldest deleted automatically.
- Nightly snapshots: keeps last 7 days, oldest deleted automatically.
- User configures auto-save in Settings screen:
  ```
  Auto-save interval     [ 15min | 30min | 1hr | 4hrs | Off ]
  Auto-save at midnight  [ ON / OFF ]
  Auto-save on close     [ ON / OFF ]
  ```
- All auto-save preferences stored in `chrome.storage.local` as `autoSave` object.
- Completely silent — no notifications, no interruptions.
- Paid feature.

### 6.8 Duplicate Tab Detection
- When saving a new session, checks if any tabs already exist in another saved session.
- Shows warning: "3 of your tabs are already saved in 'Work Session'."
- User can proceed or cancel.
- Free feature — available to all users.

### 6.9 Search
- Search bar at top of session list.
- Searches session names, notes, and tab URLs/titles in real time.
- Paid feature — search bar visible but disabled for free users with upgrade prompt.

### 6.10 Import / Export
- **Export:** Download any session or all sessions as a `.json` file.
- **Import:** Upload a previously exported `.json` file to restore sessions — preserves name, tabs, folders, notes.
- JSON format ensures full round-trip — export from one device, import on another.
- Useful for backups, migrating between computers, and sharing setups.
- Both import and export are paid features.

### 6.11 Dark / Light Mode
- Follows system preference by default (`prefers-color-scheme` media query).
- User can override in Settings: Force Light / Force Dark / Follow System.
- Preference saved to `chrome.storage.local` as `theme: 'system' | 'light' | 'dark'`.
- Applied via Tailwind's dark mode class on the root element.

### 6.11 Keyboard Shortcuts
- `Ctrl+Shift+S` — save current tabs as session without opening popup.
- `Ctrl+Shift+R` — restore most recently saved session.
- Configurable via Chrome's built-in shortcut manager at chrome://extensions/shortcuts.
- Paid feature.

### 6.12 Session Templates
- Pre-built session starters: "Morning Routine", "Research Mode", "Dev Setup".
- User picks a template → opens a set of predefined URLs.
- User can create custom templates from any existing session.
- Paid feature.

### 6.13 Trial System
- On first install, `installDate` saved to `chrome.storage.local`.
- Trial = 7 days from `installDate`.
- Days 1–4: No banner, full access.
- Days 5–6: Yellow banner "X days left in your trial".
- Day 7: Orange banner "Trial ends today — upgrade to keep access".
- Day 8+: Trial expired. Free tier active. Paid features locked.

### 6.14 Paywall & Upgrade
- Upgrade modal shows 3 plans side by side.
- All 3 plans (Monthly, Yearly, Lifetime) handled entirely by ExtensionPay.
- `extpay.getUser().paid` is the single source of truth for access — works for all plan types.
- `extpay.openPaymentPage()` opens ExtensionPay checkout for selected plan.
- On successful payment: ExtensionPay sets paid status, `usePaywall` hook detects it, all features unlock.
- Upgrade prompt triggered by: hitting free limit, clicking trial banner CTA, settings screen.

---

## 7. Pricing

| Plan | Launch Price | Later Price | Type |
|---|---|---|---|
| Monthly | $0.99/mo | $1.99/mo | Subscription |
| Yearly | $5.99/yr | $11.99/yr | Subscription |
| Lifetime | $4.99 one-time | $9.99 one-time | One-time |

All plans handled by **ExtensionPay**. USD only — ExtensionPay handles currency conversion for international buyers. Prices can be updated anytime from the ExtensionPay dashboard without any code changes.

---

## 8. Screens

| Screen | Description |
|---|---|
| Popup — Main | Session list, save button, folder tabs, search bar, trial banner, badge count |
| Save Session Modal | Name input, note input, folder picker, duplicate warning, save/cancel |
| Session Detail | Tab list inside session, note, actions per tab |
| Reminder Picker | Date/time picker for session reminder |
| Switch Confirmation | "Close X tabs and open Y session?" confirm dialog |
| Template Picker | Pre-built session starters to choose from |
| Import / Export | Export all/one session as JSON, import JSON file |
| Upgrade Modal | 3 plans, ExtensionPay buttons, early bird note |
| Settings | Account status, plan type, auto-save config, theme toggle, keyboard shortcuts, manage subscription |

---

## 9. Permissions Required

```json
"permissions": [
  "tabs",
  "storage",
  "alarms",
  "notifications",
  "commands"
]
```

> `commands` permission is required for keyboard shortcuts via `chrome.commands` API.

---

## 10. Success Metrics

| Metric | Target (Month 2) |
|---|---|
| Chrome Store installs | 500+ |
| Trial to paid conversion | 5–10% |
| Paid users | 25–50 |
| Monthly revenue | ₹4,000–15,000 |
| Rating | 4.0+ stars |

---

## 11. Risks

| Risk | Mitigation |
|---|---|
| Chrome Store review rejection | Follow all policies, clear privacy policy |
| Low organic installs | Reddit + Product Hunt launch push |
| Users not converting after trial | Improve upgrade prompt copy, show value loss |
| ExtensionPay downtime | Fallback to local paid flag with periodic re-verify |
