# AI_RULES.md — TabVault

> These rules must be followed by any AI assistant (Claude, Cursor, Copilot, etc.) working on this project. Read this file before making any changes.

---

## 1. Project Identity

- **Project name:** TabVault
- **Type:** Chrome Extension (Manifest V3)
- **Stack:** React + Vite + Tailwind CSS + Chrome Extension APIs
- **Payments:** ExtensionPay (subscriptions) + Gumroad (lifetime license key)
- **Target platforms:** Chrome Web Store (global + India)

---

## 2. General Coding Rules

- Always use **functional React components** with hooks. No class components.
- Always use **TypeScript** if the project is initialized with it. If not, use plain JS with JSDoc comments.
- Use **Tailwind CSS** for all styling. No inline styles. No separate CSS files unless absolutely necessary.
- All Chrome API calls must be **wrapped in try/catch** blocks.
- Never use `localStorage` or `sessionStorage` — always use **`chrome.storage.local`** or **`chrome.storage.sync`**.
- Never use `alert()`, `confirm()`, or `prompt()` — use in-UI modals instead.
- All async functions must use **async/await**, not `.then()` chains.
- Keep components small — if a component exceeds 150 lines, split it.

---

## 3. File & Folder Rules

- All UI lives in `src/popup/` — this is the extension popup.
- All background logic lives in `background.js` at the root.
- Reusable components go in `src/components/`.
- Custom hooks go in `src/hooks/`.
- Helper utilities go in `src/utils/`.
- Never put business logic directly in a component — extract to a hook or util.

---

## 4. Chrome Extension Rules

- This extension uses **Manifest V3** — never use Manifest V2 patterns.
- Use `chrome.tabs.query` to read open tabs — never assume tab data.
- Use `chrome.alarms` for reminders — never use `setTimeout` for anything longer than a few seconds.
- Use `chrome.notifications` for system-level reminder alerts.
- All permissions must be declared in `manifest.json` before use.
- Content scripts are not needed for this extension — do not create them.
- The background script is a **service worker** — it has no DOM access.

---

## 5. Trial & Paywall Rules

- Install date is stored in `chrome.storage.local` as `installDate` (ISO string) on first run.
- Trial duration is **7 days** from `installDate`.
- Trial status is checked on every popup open via `src/utils/trial.js`.
- Paid status is verified via ExtensionPay on every popup open.
- **Never trust client-side trial state alone** — always re-verify with ExtensionPay.
- Free tier limits:
  - Max **3 sessions** saved
  - No folders/categories
  - No reminders
  - No search
  - No export
  - No sync
- Locked features must be **visible but greyed out** with an upgrade CTA — never hidden entirely.
- The upgrade modal must always show all 3 plans: Monthly, Yearly, Lifetime.

---

## 6. Payment Rules

- **ExtensionPay** handles Monthly and Yearly subscriptions.
- **Gumroad** license key handles Lifetime access — validated via `src/utils/license.js`.
- Never hardcode prices in components — always import from `src/utils/pricing.js`.
- Pricing constants:
  ```js
  // India
  INR_MONTHLY = 149
  INR_YEARLY = 999
  INR_LIFETIME = 799
  // Global
  USD_MONTHLY = 1.99
  USD_YEARLY = 11.99
  USD_LIFETIME = 9.99
  ```
- Never expose any secret keys in frontend code.
- ExtensionPay public key lives in `.env` as `VITE_EXTENSIONPAY_KEY`.

---

## 7. Data Rules

- All session data is stored in `chrome.storage.local`.
- Session object shape:
  ```js
  {
    id: string,          // uuid
    name: string,        // user-given name
    folder: string,      // folder name or 'default'
    tabs: [{ title, url, favIconUrl }],
    createdAt: string,   // ISO date
    reminder: string | null  // ISO date or null
  }
  ```
- Never mutate session objects directly — always create a new copy.
- Always validate data shape before saving to storage.

---

## 8. UI & UX Rules

- Popup dimensions: **380px wide, 520px tall** — never exceed this.
- All screens must be scrollable if content overflows — never clip content.
- Use skeleton loaders while reading from `chrome.storage` — never show blank screens.
- Every destructive action (delete session) requires a confirmation step.
- Trial banner appears at the **top** of the popup on days 5, 6, 7 — not dismissible on day 7.
- Upgrade modal can be triggered from: limit hit, trial banner CTA, settings screen.

---

## 9. What AI Must Never Do

- Never remove or bypass trial/paywall logic under any circumstance.
- Never add new npm packages without checking if a Chrome API can do the same job.
- Never write to `chrome.storage.sync` without checking storage quota (max 100KB).
- Never make network requests from the popup — only from background.js.
- Never generate placeholder or lorem ipsum content in production code.
- Never create files outside the defined folder structure without asking first.
