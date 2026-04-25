# PRD.md — TabVault Product Requirements Document

---

## 1. Overview

**TabVault** is a Chrome extension that lets users save all open browser tabs as a named session in one click, organize sessions into folders, set reminders to reopen them, and search across all saved sessions. It solves the common problem of losing valuable tab setups when closing a browser window or needing to context-switch.

**Version:** 1.0.0
**Platform:** Chrome Web Store (Manifest V3)
**Target users:** Professionals, students, researchers, developers — anyone who works with many tabs simultaneously.

---

## 2. Problem Statement

- Users lose their entire tab setup when closing Chrome or switching tasks.
- Browser's built-in session restore is unreliable and unorganized.
- No native way to name, categorize, or schedule tab sessions.
- Power users manage 20–50+ tabs with no system to handle context switching.

---

## 3. Goals

- Allow users to save all open tabs as a named session in under 3 seconds.
- Let users restore any saved session with one click.
- Provide organization via folders and search.
- Remind users to return to a saved session at a set time.
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
- As a paid user, I can sync sessions across devices (v2).

---

## 6. Features

### 6.1 Session Save
- One-click "Save All Tabs" button in popup.
- Auto-generated session name (e.g. "Session — Apr 25, 10:42am").
- User can rename before saving.
- User can assign to a folder before saving.
- Saves: tab title, URL, favicon URL, timestamp.

### 6.2 Session List
- Displays all saved sessions sorted by most recent.
- Each session shows: name, tab count, folder, date saved.
- Tap to expand and see individual tabs.
- Actions per session: Restore all, Open one tab, Rename, Set reminder, Export, Delete.

### 6.3 Folders
- User can create named folders (e.g. "Work", "Research", "Shopping").
- Sessions assigned to folders shown under folder tabs in main popup.
- Default folder is "All".
- Paid feature — free users see folder UI but cannot create or assign.

### 6.4 Reminders
- User sets a date and time for a reminder on any session.
- At reminder time, Chrome notification fires: "Time to open your session: [name]".
- Clicking notification opens the session.
- Implemented via `chrome.alarms` + `chrome.notifications`.
- Paid feature.

### 6.5 Search
- Search bar at top of session list.
- Searches session names and tab URLs/titles in real time.
- Paid feature — search bar visible but disabled for free users with upgrade prompt.

### 6.6 Export
- Export any session as plain text list of URLs.
- Copy to clipboard or download as .txt file.
- Paid feature.

### 6.7 Trial System
- On first install, `installDate` saved to `chrome.storage.local`.
- Trial = 7 days from `installDate`.
- Days 1–4: No banner, full access.
- Days 5–6: Yellow banner "X days left in your trial".
- Day 7: Orange banner "Trial ends today — upgrade to keep access".
- Day 8+: Trial expired. Free tier active. Paid features locked.

### 6.8 Paywall & Upgrade
- Upgrade modal shows 3 plans side by side.
- Monthly and Yearly handled by ExtensionPay.
- Lifetime handled by Gumroad license key input.
- On valid payment/key: `isPaid = true` stored, all features unlocked.
- Upgrade prompt triggered by: hitting free limit, clicking trial banner CTA, settings screen.

---

## 7. Pricing

| Plan | India | Global |
|---|---|---|
| Monthly | ₹149/mo | $1.99/mo |
| Yearly | ₹999/yr | $11.99/yr |
| Lifetime | ₹799 one-time | $9.99 one-time |

---

## 8. Screens

| Screen | Description |
|---|---|
| Popup — Main | Session list, save button, folder tabs, search bar, trial banner |
| Save Session Modal | Name input, folder picker, save/cancel |
| Session Detail | Tab list inside session, actions per tab |
| Reminder Picker | Date/time picker for session reminder |
| Upgrade Modal | 3 plans, ExtensionPay buttons, Gumroad key input |
| Settings | Account status, manage subscription, restore purchases |

---

## 9. Permissions Required

```json
"permissions": [
  "tabs",
  "storage",
  "alarms",
  "notifications"
]
```

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
