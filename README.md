# Fitaval — Frontend Application

> **One program, one login, two apps.**  
> Fitaval combines a modern Gym Management CRM (`src/crm`) and an enterprise Super Admin Panel (`src/admin`) behind a unified authentication gateway (`src/portal`), powered by React 18, Vite, and Tailwind CSS.

---

## 1. Architecture Overview

After signing in, the account's role dynamically routes to the appropriate application:

| Role | Application | Served Path | Source Directory | Primary Purpose |
|---|---|---|---|---|
| **Gym Owner / Staff** | **CRM** | `/` | `src/crm/` | Gym operations, members, attendance, plans, trainers, wallet |
| **Super Admin** | **Admin Panel** | `/admin` | `src/admin/` | Platform-wide gym oversight, approvals, users, audit, finance |
| **Unauthenticated** | **Portal** | `/login` | `src/portal/` | Shared authentication shell (login, register, password recovery) |

* **Style Isolation:** Each application maintains its own isolated styling context (`tailwind.crm.config.js` and `tailwind.admin.config.js`) with dedicated CSS stylesheets.
* **Code Splitting:** Only the active application bundle is loaded via `React.lazy()` chunks.

---

## 2. Quick Start & Developer Entry Guide

### Prerequisites
* **Node.js:** v18.0.0 or higher (v20+ recommended)
* **Package Manager:** `npm` v9+ (or `pnpm` / `yarn`)

### 2.1 Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/fitaval/fitaval-frontend.git
cd fitaval-frontend
npm install
```

### 2.2 Local Development Server
Start the Vite development server with Hot Module Replacement (HMR):
```bash
npm run dev
```
Open your browser at **`http://localhost:5173`**.

---

## 3. Demo Credentials

The application includes built-in mock accounts for local development and QA testing:

| Email | Password | Role | Opens |
|---|---|---|---|
| `owner@fitaval.com` | `owner123` | Gym Owner | **CRM** (`/`) |
| `admin@fitaval.com` | `admin123` | Super Admin | **Admin Panel** (`/admin`) |

* Any non-admin email + password automatically authenticates as a demo Gym Owner.
* Session tokens persist in browser `sessionStorage`, allowing different browser tabs or incognito windows to test both roles simultaneously.

---

## 4. Linting, Code Quality & Testing

### 4.1 Running the Linter
Fitaval enforces strict code standards using ESLint 9 with React and React Hooks plugins:
```bash
# Check for lint errors
npm run lint

# Automatically fix autofixable issues
npm run lint:fix
```

### 4.2 Executing Component & Unit Tests
When setting up automated test runners (e.g. Vitest):
```bash
# Run unit and component test suite
npm test
```

---

## 5. Building for Production & Deployment

### 5.1 Production Build
Compile and minify all client assets into the `dist/` directory:
```bash
npm run build
```

### 5.2 Preview Production Build Locally
Verify the production build locally before deploying:
```bash
npm run preview
```

### 5.3 Deployment Targets
* **Vercel / Netlify:** Configure the build command as `npm run build` and output directory as `dist`. Include single-page application (SPA) rewrites to redirect all routes to `/index.html`.
* **Docker / Nginx:** Serve the generated `dist/` folder using Nginx with `try_files $uri $uri/ /index.html;`.

---

## 6. Project Directory Map

```
fitaval/
├── src/
│   ├── portal/            # Shared auth shell & gateway (Portal.jsx, Login.jsx, session.js)
│   ├── crm/               # Gym Owner CRM (@/ aliases resolve here)
│   │   ├── pages/         # Dashboard, Members, Finance, Plans, Trainers, Wallet...
│   │   ├── components/    # Layout, StatCard, QrScannerDialog, UI primitives...
│   │   ├── lib/           # AuthContext, QueryClient, theme provider...
│   │   └── index.css      # CRM-specific design tokens
│   ├── admin/             # Super Admin application
│   │   ├── pages/         # Dashboard, GymManagement, GymDetail, UserManagement...
│   │   ├── components/    # DataTable, Sheet, Modal, ScannerModal, Visuals...
│   │   ├── context/       # AppContext (central reactive store)
│   │   └── index.css      # Admin-specific design tokens
│   ├── shared/            # Cross-application shared components (e.g. VerifiedTick)
│   └── main.jsx           # Application entrypoint
├── docs/                  # Comprehensive architecture & API documentation
│   ├── DESIGN_SYSTEM.md   # Design System & UI Style Guide (colors, type, Storybook)
│   ├── STATE_AND_ROUTING.md# State architecture, navigation flowchart & data pipeline
│   ├── CRM_API.md         # Full REST API specification for CRM operations
│   └── ADMIN_API.md       # Full REST API specification for Super Admin operations
├── tailwind.crm.config.js # CRM Tailwind configuration
├── tailwind.admin.config.js# Admin Tailwind configuration
├── vite.config.js         # Vite bundler configuration
└── package.json           # Scripts and dependencies
```

---

## 7. Documentation Directory

For in-depth guides, consult the dedicated documentation files:

* 🎨 [**Design System & Style Guide**](docs/DESIGN_SYSTEM.md) — Color tokens, Geist typography, Tailwind grids, component states, and Storybook integration.
* 🧭 [**State & Routing Architecture**](docs/STATE_AND_ROUTING.md) — Navigation flowchart, client-side route map, React contexts, and data flow pipelines.
* 🏋️ [**CRM REST API Documentation**](docs/CRM_API.md) — Complete endpoint reference for member check-in, plans, trainers, and wallet settlements.
* 🛡️ [**Super Admin REST API Documentation**](docs/ADMIN_API.md) — Complete endpoint reference for multi-gym oversight, approvals, audit logs, and payouts.

---

*© 2026 Fitaval. All rights reserved.*
