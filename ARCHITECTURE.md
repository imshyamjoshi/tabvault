# ARCHITECTURE.md — TabVault

---

## 1. High-Level Architecture

TabVault is a Chrome Extension built on Manifest V3. It has two main execution contexts:

```
┌─────────────────────────────────────────────────────┐
│                   POPUP (React UI)                   │
│  src/popup/         — renders when icon is clicked   │
│  src/components/    — reusable UI components         │
│  src/hooks/         — state & chrome API hooks       │
│  src/utils/         — trial, license, pricing logic  │
└────────────────────┬────────────────────────────────┘
                     │ chrome.runtime.sendMessage
                     ▼
┌─────────────────────────────────────────────────────┐
│              BACKGROUND (Service Worker)             │
│  background.js      — alarms, notifications, events  │
└────────────────────┬────────────────────────────────┘
                     │ chrome.storage.local
                     ▼
┌─────────────────────────────────────────────────────┐
│                CHROME STORAGE                        │
│  sessions[], folders[], installDate, isPaid, etc.    │
└─────────────────────────────────────────────────────┘
```

---

## 2. Folder Structure

```
tabvault/
├── manifest.json              # Extension config, permissions, entry points
├── background.js              # Service worker — alarms, notifications, auto-save, shortcuts
├── public/
│   └── icons/                 # Extension icons (16, 48, 128px PNG)
├── src/
│   ├── popup/
│   │   ├── index.html         # Popup HTML entry point
│   │   ├── main.jsx           # React root mount
│   │   └── App.jsx            # Root component, router/screen manager
│   ├── components/
│   │   ├── SessionCard.jsx        # Single session row with actions
│   │   ├── SessionList.jsx        # List of all sessions
│   │   ├── SaveModal.jsx          # Save session — name, note, folder, duplicate warning
│   │   ├── FolderTabs.jsx         # Folder tab navigation
│   │   ├── ReminderPicker.jsx     # Date/time picker for reminders
│   │   ├── SwitchConfirm.jsx      # Confirm dialog for one-click session switch
│   │   ├── TemplatePicker.jsx     # Pre-built session template chooser
│   │   ├── ImportExport.jsx       # Export session as JSON / import JSON file
│   │   ├── UpgradeModal.jsx       # Paywall — 3 plans all via ExtensionPay
│   │   ├── TrialBanner.jsx        # Trial countdown banner
│   │   ├── SearchBar.jsx          # Session search input
│   │   └── SettingsScreen.jsx     # Account, auto-save config, theme, shortcuts
│   ├── hooks/
│   │   ├── useSessions.js         # CRUD for sessions in chrome.storage
│   │   ├── useTrial.js            # Trial status, days remaining
│   │   ├── usePaywall.js          # isPaid check via ExtensionPay
│   │   ├── useFolders.js          # Folder CRUD
│   │   ├── useSearch.js           # Search/filter sessions
│   │   ├── useDuplicateCheck.js   # Detect duplicate tabs across sessions
│   │   ├── useBadge.js            # Update extension icon badge count
│   │   ├── useAutoSave.js         # Auto-save preferences and alarm management
│   │   └── useTheme.js            # Dark/light/system theme management
│   └── utils/
│       ├── storage.js             # chrome.storage read/write helpers
│       ├── trial.js               # Trial date logic
│       ├── pricing.js             # Pricing constants (USD)
│       ├── session.js             # Session shape, validation, uuid gen
│       ├── smartName.js           # Auto-generate session name from tab titles
│       └── templates.js           # Default session templates data
├── .env                           # VITE_EXTENSIONPAY_KEY (your Chrome Extension ID)
├── vite.config.js                 # Vite + Chrome extension build config
├── tailwind.config.js
└── package.json
```

---

## 3. Data Models

### Session
```js
{
  id: string,           // uuid v4
  name: string,         // user-given or smart auto-generated name
  folder: string,       // folder name, default: 'default'
  note: string,         // optional user note, default: ''
  isAutoSave: boolean,  // true if created by nightly auto-save
  isTemplate: boolean,  // true if saved as a template
  tabs: [
    {
      title: string,
      url: string,
      favIconUrl: string
    }
  ],
  createdAt: string,    // ISO 8601 date string
  reminder: string | null  // ISO 8601 date string or null
}
```

### Storage Keys (chrome.storage.local)
```js
{
  sessions: Session[],         // all saved sessions including auto-saves
  folders: string[],           // list of user-created folder names
  templates: Session[],        // saved session templates
  installDate: string,         // ISO date, set on first install
  isPaid: boolean,             // local cache of paid status
  paidSince: string | null,    // ISO date of upgrade
  planType: string | null,     // 'monthly' | 'yearly' | 'lifetime'
  lastAutoSave: string | null, // ISO date of last auto-save
  autoSave: {
    intervalMinutes: number | null,  // 15 | 30 | 60 | 240 | null (off)
    midnightEnabled: boolean,        // default: true
    onCloseEnabled: boolean,         // default: true
  },
  theme: string,               // 'system' | 'light' | 'dark' — default: 'system'
  trialNotified: {             // which trial banners have been shown
    day5: boolean,
    day6: boolean,
    day7: boolean
  }
}
```

---

## 4. Key Flows

### 4.1 Save Session Flow
```
User clicks "Save All Tabs"
  → chrome.tabs.query({ currentWindow: true })
  → Filter out chrome:// and extension pages
  → smartName.js generates name from tab titles
  → useDuplicateCheck.js checks tabs against all saved sessions
  → If duplicates found → show warning in SaveModal
  → Open SaveModal with tab list preview, smart name, note input, folder picker
  → User confirms → session.js creates Session object with uuid
  → storage.js appends to sessions[] in chrome.storage.local
  → useBadge.js updates extension icon badge count
  → SessionList re-renders via useSessions hook
```

### 4.2 One-Click Session Switch Flow
```
User clicks "Switch to" on a session card
  → SwitchConfirm modal opens: "Close X tabs and open [session name]?"
  → User confirms
  → Current tabs auto-saved as "Pre-switch snapshot — [time]" in Auto-saves folder
  → chrome.tabs.query gets all current tabs
  → All current tabs closed via chrome.tabs.remove()
  → Session tabs opened via chrome.tabs.create()
  → Badge count updated via useBadge.js
```

### 4.3 Auto-Save Flow
```
On popup open → useAutoSave reads autoSave prefs from storage
  → If intervalMinutes set → background.js creates/updates interval alarm
  → If midnightEnabled → background.js creates/updates nightly alarm

On interval alarm fire (e.g. every 30 mins):
  → chrome.tabs.query({ currentWindow: true })
  → Session created with isAutoSave=true, name="Auto-save — [date time]"
  → Saved to sessions[] in chrome.storage.local
  → Old interval auto-saves beyond 5 deleted (oldest first)

On midnight alarm fire:
  → Same as above but keeps last 7 daily snapshots separately

On browser close (best effort via chrome.runtime.onSuspend):
  → If onCloseEnabled → attempt tab query + save
  → Not guaranteed to complete — service workers may be killed by Chrome
  → Treated as bonus save, not relied upon as primary backup
```

### 4.4 Keyboard Shortcut Flow
```
User presses Ctrl+Shift+S
  → chrome.commands.onCommand fires in background.js with command='save-session'
  → background.js queries all current tabs
  → Creates session with smart auto-name, no folder, no note
  → Saves to storage silently
  → chrome.notifications.create() fires: "Session saved: [name]"

User presses Ctrl+Shift+R
  → chrome.commands.onCommand fires with command='restore-last'
  → background.js reads sessions[] from storage, gets most recent
  → Opens all tabs from that session
  → Notification: "Restored: [session name]"
```

### 4.2 Trial Check Flow
```
Popup opens
  → useTrial hook reads installDate from chrome.storage.local
  → If no installDate → set installDate = now (first install)
  → Calculate daysElapsed = today - installDate
  → If daysElapsed <= 7 → inTrial = true
  → If daysElapsed > 7 → inTrial = false
  → Pass { inTrial, daysRemaining, trialExpired } to App.jsx
  → App.jsx renders TrialBanner if days 5–7
  → App.jsx enforces free tier limits if trialExpired
```

### 4.3 Paywall Check Flow
```
Popup opens
  → usePaywall hook calls ExtensionPay.getUser()
  → If user.paid === true → isPaid = true, save to storage
  → If user.paid === false → isPaid = false
  → If ExtensionPay fails → fallback to local isPaid from storage
  → All feature gates read from isPaid state
```

### 4.4 Reminder Flow
```
User sets reminder on a session
  → ReminderPicker returns ISO date string
  → session updated in storage with reminder field
  → background.js creates chrome.alarm with name = session.id, when = reminder timestamp
  → On alarm fire → chrome.notifications.create() with session name
  → User clicks notification → background.js opens all tabs from session
```

### 4.6 Import / Export Flow
```
Export:
  User clicks Export in session card or Settings
  → useSessions returns session(s) as JS object
  → JSON.stringify() → Blob → download as tabvault-export-[date].json

Import:
  User clicks Import → file picker opens → user selects .json file
  → FileReader reads JSON → validates shape against session schema
  → Valid sessions merged into sessions[] in chrome.storage.local
  → Duplicate IDs skipped — no overwriting existing sessions
  → SessionList re-renders with imported sessions
```

### 4.7 Theme Flow
```
App.jsx mounts
  → useTheme reads theme from chrome.storage.local
  → If 'system' → listen to window.matchMedia('prefers-color-scheme: dark')
  → If 'light' or 'dark' → apply directly
  → Add/remove 'dark' class on root <html> element
  → Tailwind dark: classes apply automatically
  → User changes theme in Settings → saved to storage → applied instantly
```

---

## 5. Manifest V3 Config

```json
{
  "manifest_version": 3,
  "name": "TabVault",
  "version": "1.0.0",
  "description": "Save all open tabs in one click. Organize, remind, restore.",
  "permissions": ["tabs", "storage", "alarms", "notifications", "commands"],
  "action": {
    "default_popup": "src/popup/index.html",
    "default_icon": {
      "16": "public/icons/icon16.png",
      "48": "public/icons/icon48.png",
      "128": "public/icons/icon128.png"
    }
  },
  "background": {
    "service_worker": "background.js"
  },
  "commands": {
    "save-session": {
      "suggested_key": { "default": "Ctrl+Shift+S", "mac": "Command+Shift+S" },
      "description": "Save all current tabs as a session"
    },
    "restore-last": {
      "suggested_key": { "default": "Ctrl+Shift+R", "mac": "Command+Shift+R" },
      "description": "Restore most recently saved session"
    }
  },
  "icons": {
    "16": "public/icons/icon16.png",
    "48": "public/icons/icon48.png",
    "128": "public/icons/icon128.png"
  }
}
```

---

## 6. Third-Party Integrations

### ExtensionPay
- SDK loaded via npm: `extensionpay`
- Called in `usePaywall.js` on every popup open
- Handles all 3 plans: Monthly, Yearly, and Lifetime (one-time)
- `extpay.getUser()` returns `{ paid: true/false }` — same check for all plan types
- `extpay.openPaymentPage()` opens checkout for the selected plan
- Dashboard at extensionpay.com
- Payouts via Stripe — connect your Stripe account in ExtensionPay dashboard

---

## 7. Build & Dev Setup

```bash
# Install dependencies
npm install

# Dev mode (hot reload popup)
npm run dev

# Build for production
npm run build

# Output goes to /dist — zip and upload to Chrome Web Store
```

### Vite config for Chrome Extension
```js
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        popup: 'src/popup/index.html',
        background: 'background.js'
      },
      output: {
        entryFileNames: '[name].js'
      }
    }
  }
})
```

---

## 8. Environment Variables

```env
# .env
VITE_EXTENSIONPAY_KEY=your_chrome_extension_id
```

> Note: The ExtensionPay "key" is simply your Chrome Extension ID. You get this from chrome://extensions after loading your unpacked extension on Day 1.

---

## 9. Security Rules

- No API keys in frontend code — only public keys via `.env`.
- `.env` is in `.gitignore` — never commit it.
- ExtensionPay handles all payment security and validation on their backend.
- No user PII is collected or transmitted.
- All data stays in `chrome.storage.local` — never leaves the user's browser except for ExtensionPay verification calls.
