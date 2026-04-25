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
├── background.js              # Service worker — alarms, notifications
├── public/
│   └── icons/                 # Extension icons (16, 48, 128px PNG)
├── src/
│   ├── popup/
│   │   ├── index.html         # Popup HTML entry point
│   │   ├── main.jsx           # React root mount
│   │   └── App.jsx            # Root component, router/screen manager
│   ├── components/
│   │   ├── SessionCard.jsx    # Single session row with actions
│   │   ├── SessionList.jsx    # List of all sessions
│   │   ├── SaveModal.jsx      # Save session name + folder picker
│   │   ├── FolderTabs.jsx     # Folder tab navigation
│   │   ├── ReminderPicker.jsx # Date/time picker for reminders
│   │   ├── UpgradeModal.jsx   # Paywall — 3 plans + Gumroad key
│   │   ├── TrialBanner.jsx    # Trial countdown banner
│   │   ├── SearchBar.jsx      # Session search input
│   │   └── SettingsScreen.jsx # Account, subscription status
│   ├── hooks/
│   │   ├── useSessions.js     # CRUD for sessions in chrome.storage
│   │   ├── useTrial.js        # Trial status, days remaining
│   │   ├── usePaywall.js      # isPaid check via ExtensionPay
│   │   ├── useFolders.js      # Folder CRUD
│   │   └── useSearch.js       # Search/filter sessions
│   └── utils/
│       ├── storage.js         # chrome.storage read/write helpers
│       ├── trial.js           # Trial date logic
│       ├── license.js         # Gumroad license key validation
│       ├── pricing.js         # Pricing constants (INR + USD)
│       └── session.js         # Session shape, validation, uuid gen
├── .env                       # VITE_EXTENSIONPAY_KEY
├── vite.config.js             # Vite + Chrome extension build config
├── tailwind.config.js
└── package.json
```

---

## 3. Data Models

### Session
```js
{
  id: string,           // uuid v4
  name: string,         // user-given name
  folder: string,       // folder name, default: 'default'
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
  sessions: Session[],         // all saved sessions
  folders: string[],           // list of folder names
  installDate: string,         // ISO date, set on first install
  isPaid: boolean,             // local cache of paid status
  paidSince: string | null,    // ISO date of upgrade
  licenseKey: string | null,   // Gumroad key if lifetime user
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
  → Open SaveModal with tab list preview
  → User enters name, picks folder
  → Confirm → session.js creates Session object with uuid
  → storage.js appends to sessions[] in chrome.storage.local
  → SessionList re-renders via useSessions hook
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

### 4.5 Gumroad Lifetime Key Flow
```
User enters license key in UpgradeModal
  → license.js sends key to Gumroad API for validation
  → If valid → isPaid = true, licenseKey saved to storage
  → UpgradeModal closes, all features unlocked
  → If invalid → show error "Invalid license key"
```

---

## 5. Manifest V3 Config

```json
{
  "manifest_version": 3,
  "name": "TabVault",
  "version": "1.0.0",
  "description": "Save all open tabs in one click. Organize, remind, restore.",
  "permissions": ["tabs", "storage", "alarms", "notifications"],
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
- Handles Monthly + Yearly subscription billing
- Dashboard at extensionpay.com

### Gumroad License Validation
- REST call to `https://api.gumroad.com/v2/licenses/verify`
- Requires `product_permalink` + `license_key` in POST body
- Returns `{ success: true/false, purchase: {...} }`
- Handled in `src/utils/license.js`

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
VITE_EXTENSIONPAY_KEY=your_extensionpay_public_key
VITE_GUMROAD_PRODUCT_PERMALINK=your_gumroad_product_slug
```

---

## 9. Security Rules

- No API keys in frontend code — only public keys via `.env`.
- `.env` is in `.gitignore` — never commit it.
- Gumroad validation happens client-side only in v1 — acceptable for low-stakes licensing. Server-side validation is a v2 improvement.
- No user PII is collected or transmitted.
- All data stays in `chrome.storage.local` — never leaves the user's browser except for payment verification calls.
