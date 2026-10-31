# Fitaval — State & Routing Architecture

> **The Navigation & Data Flowchart:** Complete architectural blueprint mapping client-side routes, role-based gateways, React context providers, and data flow pipelines across Fitaval.

---

## 1. Top-Level Routing & Role Gateway Flowchart

Fitaval implements an intelligent front door (`src/portal/Portal.jsx`) where one unified authentication boundary serves two independent applications. Startup verification validates the environment, followed by role-based routing and reactive session listening.

```mermaid
flowchart TD
    A["Application Boot (src/portal/Portal.jsx)"] --> ENV{"IS_PROD && !validateEnv().valid?"}
    ENV -- Yes --> ERR["Halt & Render ConfigErrorScreen (Fail-Fast)"]
    ENV -- No --> B{"Session exists in tokenManager / sessionStorage?"}
    
    B -- No --> C{"Is current URL an auth page?<br>(/login, /register, /forgot-password, /reset-password)"}
    C -- Yes --> D["Render Shared Auth Shell (src/portal)"]
    C -- No --> E["Redirect to /login?returnTo=..."]
    
    B -- Yes --> F{"User Role in Session"}
    
    F -- "role: crm" --> G{"Is user on /admin* path?"}
    G -- Yes --> H["Redirect to / (CRM Root)"]
    G -- No --> I["Load CRM App (src/crm/entry.jsx) via React.lazy"]
    
    F -- "role: admin" --> J{"Is user on /admin* path?"}
    J -- No --> K["Redirect to /admin (Admin Root)"]
    J -- Yes --> L["Load Admin App (src/admin/entry.jsx) via React.lazy"]

    D --> M["User Submits Credentials (login / signUp)"]
    M --> N["Access token saved in memory, session in sessionStorage"]
    N --> O["Redirect to designated application (role-based)"]

    I --> SUB["Subscribed to tokenManager.onAuthChange"]
    L --> SUB
    SUB -- "401 Expired or Logout" --> E
```

---

## 2. Client-Side Route Definitions

### 2.1 Shared Portal Routes (`src/portal`)

| Route | Component | Description |
|---|---|---|
| `/login` | `Login.jsx` | Shared login form supporting both Gym Owners and Super Admins |
| `/register` | `Register.jsx` | Gym owner self-onboarding flow with 6-digit verification code |
| `/forgot-password` | `ForgotPassword.jsx` | Password reset request with backend email dispatch |
| `/reset-password` | `ResetPassword.jsx` | Token-validated password change form |

---

### 2.2 CRM Client Routes (`src/crm/App.jsx`)

Driven by `react-router-dom` (v6) wrapped in `Layout.jsx` with responsive sidebar and bottom navigation. Protected by route guards redirecting unauthenticated requests to `/login`:

```mermaid
flowchart LR
    CRM["CRM App Shell (/)" ] --> DASH["/ (Dashboard)"]
    CRM --> MBR["/members (Member Directory)"]
    CRM --> FIN["/finance (Income & Expenses)"]
    CRM --> TRN["/trainers & /staff (Trainers)"]
    CRM --> PLN["/plans (Membership Plans)"]
    CRM --> WAL["/wallet (B2C Wallet & Settlements)"]
    CRM --> SUB["/subscription (Gym Software Plan)"]
    CRM --> GYM["/gym-profile (Branding & Operating Hours)"]
    CRM --> SET["/settings & /more (Settings)"]
    CRM --> ERR["* (PageNotFound 404)"]
```

| Route Path | Page Component | Core Data Entities Used |
|---|---|---|
| `/` | `Dashboard.jsx` | `Member`, `Transaction`, `MembershipPlan`, `WalletTransaction` |
| `/members` | `Members.jsx` | `Member` (CRUD, status filter, QR generation, Excel export) |
| `/finance` | `Finance.jsx` | `Transaction` (Income/Expense categorizations, monthly summaries) |
| `/trainers` | `Trainers.jsx` | `Trainer` (Biographies, certifications, client rosters) |
| `/plans` | `Plans.jsx` | `MembershipPlan` (Pricing, duration, benefits, active toggles) |
| `/wallet` | `Wallet.jsx` | `WalletTransaction` (Available balance, withdrawal requests) |
| `/subscription` | `Subscription.jsx`| Software tier subscription, invoicing, billing methods |
| `/gym-profile` | `GymProfilePage.jsx`| Business details, GPS coordinates, facilities, photo gallery |
| `/settings` | `More.jsx` | Notification preferences, theme toggle, account credentials |

---

### 2.3 Super Admin Section Navigation (`src/admin/AdminApp.jsx`)

The Admin Panel operates on a fast in-app section switcher with deep-linking capability via browser history and session verification:

```mermaid
flowchart TD
    ADM["Admin App Shell (/admin)"] --> S1["section: 'dashboard' -> Dashboard.jsx"]
    ADM --> S2["section: 'gym' -> GymManagement.jsx (All Gyms & Approvals)"]
    ADM --> S3["section: 'gymDetail' -> GymDetail.jsx (Individual Gym Tabs)"]
    ADM --> S4["section: 'users' -> UserManagement.jsx (Cross-Gym Members)"]
    ADM --> S5["section: 'plans' -> SubscriptionPlans.jsx"]
    ADM --> S6["section: 'accounts' -> Accounts.jsx (Audit, Security, Staff)"]

    S3 --> T1["Tab: Overview (Address, Hours, Facilities, Photos)"]
    S3 --> T2["Tab: Staff (Directory, Shift status)"]
    S3 --> T3["Tab: Trainers (Coaches, Certifications)"]
    S3 --> T4["Tab: Members (Branch members list, QR tokens)"]
    S3 --> T5["Tab: Reviews (User ratings & review moderation)"]
    S3 --> T6["Tab: Finance (Transactions breakdown)"]
    S3 --> T7["Tab: Wallet (B2C Settlements & Payouts)"]
```

---

## 3. State Management & Context Providers

Fitaval separates state into four clear layers:
1. **Application Session & In-Memory Token Manager** (`src/shared/auth/tokenManager.js` & `src/portal/session.js`)
2. **CRM Authentication & User Context** (`src/crm/lib/AuthContext.jsx`)
3. **Super Admin Platform Context** (`src/admin/context/AppContext.js`)
4. **Server Entity Cache** (`@tanstack/react-query`)

```mermaid
graph TD
    subgraph Secure Storage Architecture
        MEM["Runtime Memory (Access Token - XSS Proof)"]
        SS["sessionStorage (Session Metadata & Role, Tab-Scoped)"]
        LS["localStorage (Refresh Token for Session Rotation)"]
    end

    subgraph Central Networking Layer
        HTTP["httpClient (src/shared/api/httpClient.js)"]
        MEM --> HTTP
        LS --> HTTP
    end

    subgraph CRM State Architecture
        AC["AuthProvider (AuthContext.jsx)"]
        QC["QueryClientProvider (@tanstack/react-query)"]
        TC["ThemeProvider (Light / Dark)"]
        
        SS --> AC
        HTTP --> QC
        AC --> QC
        QC --> CRM_UI["CRM Pages & Components"]
    end

    subgraph Admin State Architecture
        ADMIN_CTX["AppCtx.Provider (AppContext.js)"]
        THEME_ADM["useAdminTheme()"]
        
        SS --> ADMIN_CTX
        THEME_ADM --> ADMIN_CTX
        ADMIN_CTX --> ADM_UI["Admin Pages, Drawers & Modals"]
    end
```

---

## 4. Role-Based Feature Gating Architecture

In the Admin Panel, features are gated by the user's role permissions matrix:

```mermaid
flowchart TD
    ACT["User Attempts Action (e.g. Export, Edit Gym, View Wallet)"] --> CHK{"permsFor(role)"}
    
    CHK -- "perms.editGym == true" --> P1["Allow Review, Edit Hours, Toggle Blue Tick"]
    CHK -- "perms.revenue == true" --> P2["Show Financial KPIs & Wallet Settlements"]
    CHK -- "perms.members == true" --> P3["Show User Directory & Attendance"]
    CHK -- "perms.exportMembers == true" --> P4["Enable 'Export to Excel' Button"]
    CHK -- "perms.freeze == true" --> P5["Enable Reissue / Rotate QR Token"]
    CHK -- "perms.approveGyms == true" --> P6["Enable Approve / Reject Application"]
    CHK -- "perms.viewAudit == true" --> P7["Show Full Audit Trail Tab"]

    CHK -- "Permission Missing" --> LOCK["Display <Locked /> or Disable Action with Tooltip"]
```

---

## 5. Data Flow: Member Check-In & Turnstile Integration

```mermaid
sequenceDiagram
    autonumber
    actor Member as Member App
    participant Scanner as Gym Scanner (ScannerModal.jsx)
    participant CRM as CRM App (src/crm)
    participant API as Fitaval API Gateway
    participant Turnstile as Physical Gate / Door Relay

    Member->>Scanner: Presents Digital QR (FTV-KCH-0001-A1B2C3)
    Scanner->>API: POST /crm/attendance/check-in { qr_token, branch }
    
    alt Membership Active
        API-->>Scanner: 200 OK { status: 'Active', days_left: 76 }
        Scanner->>Turnstile: Trigger Relay (Unlock Gate 3.5s)
        Scanner->>CRM: Add to live activity feed & update branch occupancy
    else Membership Expired
        API-->>Scanner: 403 Forbidden { error: 'membership_expired' }
        Scanner-->>Member: Screen displays Red Denied: Membership Expired
    else Token Rotated / Invalid
        API-->>Scanner: 404 Not Found { error: 'invalid_token' }
        Scanner-->>Member: Screen displays Invalid QR Code
    end
```
