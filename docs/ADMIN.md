> This app now lives inside the combined Fitaval program. Run it from the project root (`npm run dev`) and sign in via the shared login. See ../README.md.

# Fitaval Admin Panel

Platform admin panel for Fitaval (React 18 + Vite + Tailwind). Separate app from `../crm`, with its own look (black sidebar, emerald accents, Geist font).

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
npm run lint
```

## Structure

```
src/admin/
  api/          ← API Client for backend integration (src/admin/api/client.js)
  data/         ← Initial mock datasets & seed generators
    branches.js  roles.js  plans.js  members.js  crm.js  audit.js  sessions.js
    staff.js  alerts.js  audiences.js  approvals.js  gyms.js  finance.js  feed.js  navigation.js
  lib/          helpers (formatters, dates, gym helpers)
  context/      AppContext (shared app state & adminClient provider)
  components/   shared UI: ui/ primitives (Button, Modal, QrCode…), DataTable, ScannerModal, NotifDrawer
  layout/       Sidebar, Header
  pages/        dashboard/  gyms/ (+ detail/ tabs)  users/  account/
  AdminApp.jsx  app shell + state
```

## Backend API Integration

The Admin Panel includes an API client located at `src/admin/api/client.js`:

* **Mock Mode (Default):** Controlled via `VITE_ENABLE_MOCK_API=true` in `.env`. Provides full offline reactivity.
* **Production API Mode:** Set `VITE_ENABLE_MOCK_API=false` in `.env` and specify `VITE_API_BASE_URL`. The client automatically sends authenticated requests with `Authorization: Bearer <token>` to your backend.
* **Available Modules:**
  * `adminClient.gyms` (list, get, update, verify, getPhotos)
  * `adminClient.approvals` (list, review, approve, reject)
  * `adminClient.users` (list, get, rotateQr, export)
  * `adminClient.staff` (list, create, update, setRole)
  * `adminClient.finance` (getOverview, getSummary)
  * `adminClient.wallet` (get, getTransactions, settle)
  * `adminClient.audit` (list, log)
  * `adminClient.roles` (list)
