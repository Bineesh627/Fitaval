# Fitaval Super Admin — API Documentation

> **Version:** 1.0.0
> **Base URL:** `https://api.fitaval.com/v1`
> **Auth:** `Authorization: Bearer <token>` (JWT)
> **Content-Type:** `application/json`
> **Scope:** Platform-wide operations across all gyms. Requires `super_admin` or `branch_manager` role.

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [Gyms](#2-gyms)
3. [Gym Approvals](#3-gym-approvals)
4. [Users (Cross-gym)](#4-users-cross-gym)
5. [Staff & Trainers](#5-staff--trainers)
6. [Finance](#6-finance)
7. [Gym Wallet & Settlements](#7-gym-wallet--settlements)
8. [Reviews](#8-reviews)
9. [Audit Logs](#9-audit-logs)
10. [Roles & Permissions](#10-roles--permissions)
11. [Webhooks](#11-webhooks)
12. [Error Codes](#12-error-codes)
13. [Rate Limiting](#13-rate-limiting)
14. [Pagination](#14-pagination)
15. [Quick Reference](#15-quick-reference)

---

## 1. Authentication

### `POST /auth/login/`
Authenticate and receive a JWT access token with Super Admin scope.

**Request Body:**
```json
{
  "email": "superadmin@fitaval.com",
  "password": "your_password",
  "role": "super_admin"
}
```

> `role` must be `super_admin` or `admin` for admin panel access.

**Response `200 OK`:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4...",
  "expires_in": 3600,
  "user": {
    "id": "usr_admin_01",
    "name": "Platform Admin",
    "email": "superadmin@fitaval.com",
    "role": "Super Admin",
    "permissions": {
      "edit_gym": true,
      "revenue": true,
      "members": true,
      "export_members": true,
      "approve_gyms": true,
      "view_audit": true
    }
  }
}
```

---

### `POST /auth/token/refresh/`
Refresh an expired access token using DRF SimpleJWT token rotation. Used automatically by `httpClient.js` on HTTP 401.

**Request Body:**
```json
{
  "refresh": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4..."
}
```

**Response `200 OK`:**
```json
{
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### `POST /auth/logout/`
Invalidate the current session and tokens.

**Headers:** `Authorization: Bearer <token>`

**Response `204 No Content`**

---

## 2. Gyms

### `GET /admin/gyms`
List all registered gyms on the platform with key stats.

**Query Parameters:**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `status` | string | — | `Approved` · `Pending` · `Under Review` · `Rejected` |
| `verified` | boolean | — | `true` to show only blue-tick gyms |
| `loc` | string | — | City or state filter |
| `q` | string | — | Search by gym name or ID |
| `sort` | string | `-created_date` | Prefix `-` for descending |
| `limit` | integer | 50 | Max 200 |
| `offset` | integer | 0 | Pagination offset |

**Response `200 OK`:**
```json
{
  "total": 1245,
  "limit": 50,
  "offset": 0,
  "has_more": true,
  "data": [
    {
      "id": "GYM-KCH-001",
      "name": "FitZone Kochi",
      "owner": "Anand Menon",
      "location": "Kochi, Kerala",
      "address": "MG Road, Ernakulam",
      "zip": "682011",
      "phone": "+91 484 2345678",
      "email": "contact@fitzonekochi.com",
      "status": "Approved",
      "verified": true,
      "submitted_on": "10/15/2025",
      "staff_count": 8,
      "trainer_count": 5,
      "member_count": 342,
      "rating": 4.6,
      "review_count": 89
    }
  ]
}
```

---

### `GET /admin/gyms/:id`
Get full gym details including stats, staff, trainers, members, photos, and wallet.

**Response `200 OK`:**
```json
{
  "id": "GYM-KCH-001",
  "name": "FitZone Kochi",
  "owner": "Anand Menon",
  "location": "Kochi, Kerala",
  "address": "MG Road, Ernakulam",
  "zip": "682011",
  "lat": 9.9312,
  "lng": 76.2673,
  "phone": "+91 484 2345678",
  "email": "contact@fitzonekochi.com",
  "about": "Premier fitness center in central Kochi.",
  "status": "Approved",
  "verified": true,
  "facilities": ["Swimming Pool", "Sauna", "Steam Room", "Parking"],
  "services": ["Personal Training", "Yoga", "Zumba", "CrossFit"],
  "hours": [
    { "day": "Monday",    "open": true,  "from": "06:00", "to": "22:00" },
    { "day": "Tuesday",   "open": true,  "from": "06:00", "to": "22:00" },
    { "day": "Sunday",    "open": false, "from": null,    "to": null    }
  ],
  "photos": [
    { "id": "ph_001", "url": "https://cdn.fitaval.com/gyms/GYM-KCH-001/main.jpg", "label": "Main Floor" }
  ],
  "staff": { "count": 8, "on_shift": 3 },
  "trainers": { "count": 5, "active": 5 },
  "members": { "count": 342, "active": 291, "expired": 51 },
  "wallet": {
    "balance": 250000,
    "status": "Active",
    "last_settlement": "2026-10-15"
  },
  "rating": 4.6,
  "review_count": 89,
  "created_at": "2025-10-15T00:00:00Z"
}
```

---

### `PATCH /admin/gyms/:id`
Update gym information. Only include fields you want to change.

> **Permission required:** `edit_gym`

**Request Body (partial):**
```json
{
  "verified": true,
  "about": "Updated description for FitZone Kochi.",
  "facilities": ["Swimming Pool", "Sauna", "Parking", "Steam Room", "Jacuzzi"],
  "hours": [
    { "day": "Monday", "open": true, "from": "05:30", "to": "23:00" }
  ]
}
```

**Response `200 OK`:**
```json
{
  "id": "GYM-KCH-001",
  "updated_at": "2026-10-31T11:00:00Z",
  "message": "Gym updated successfully."
}
```

---

### `POST /admin/gyms/:id/verify`
Toggle the verified blue tick badge for a gym. The tick appears in the member-facing app.

> **Permission required:** `edit_gym`

**Request Body:**
```json
{ "verified": true }
```

**Response `200 OK`:**
```json
{
  "id": "GYM-KCH-001",
  "name": "FitZone Kochi",
  "verified": true,
  "message": "Blue tick granted. FitZone Kochi now shows as verified in the member app."
}
```

---

### `GET /admin/gyms/:id/photos`
List a gym's photo gallery.

**Response `200 OK`:**
```json
{
  "gym_id": "GYM-KCH-001",
  "photos": [
    { "id": "ph_001", "url": "https://cdn.fitaval.com/...", "label": "Main Floor", "kind": "upload" },
    { "id": "ph_002", "url": "https://cdn.fitaval.com/...", "label": "Pool Area", "kind": "scene"  }
  ]
}
```

---

## 3. Gym Approvals

Manage the gym onboarding lifecycle: Pending → Under Review → Approved / Rejected.

### `GET /admin/approvals`
List gym registration approval requests.

**Query Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `status` | string | `Pending` · `Under Review` · `Approved` · `Rejected` |
| `date_from` | date | Filter by submission date (ISO 8601) |
| `date_to` | date | ISO 8601 |
| `sort` | string | Default: `-submitted_on` |
| `limit` | integer | Max 100 |

**Response `200 OK`:**
```json
{
  "counts": {
    "pending": 14,
    "under_review": 5,
    "approved": 1187,
    "rejected": 39
  },
  "data": [
    {
      "id": "GYM-BLR-045",
      "name": "PowerHouse Bangalore",
      "owner": "Vikram Singh",
      "location": "Bengaluru, Karnataka",
      "status": "Pending",
      "submitted_on": "10/25/2026",
      "documents_verified": 2,
      "documents_total": 5
    }
  ]
}
```

---

### `POST /admin/approvals/:id/review`
Move a gym from `Pending` to `Under Review`, signalling that a Super Admin has started document verification.

> **Permission required:** `approve_gyms`

**Request Body:**
```json
{
  "note": "Beginning document verification. Owner contacted for updated insurance."
}
```

**Response `200 OK`:**
```json
{
  "id": "GYM-BLR-045",
  "status": "Under Review",
  "updated_at": "2026-10-31T10:00:00Z",
  "message": "Gym moved to Under Review. Owner notified."
}
```

---

### `POST /admin/approvals/:id/approve`
Approve a gym registration. All documents must be verified before approval.

> **Permission required:** `approve_gyms`

**Request Body:**
```json
{
  "documents_verified": [
    "GST Certificate",
    "Trade License",
    "Owner ID",
    "Insurance Certificate",
    "Health & Safety NOC"
  ],
  "internal_note": "All 5 documents verified. Gym premises inspected on 30 Oct."
}
```

**Response `200 OK`:**
```json
{
  "id": "GYM-BLR-045",
  "name": "PowerHouse Bangalore",
  "status": "Approved",
  "approved_at": "2026-10-31T10:15:00Z",
  "message": "Gym approved. Owner notified via email and push notification."
}
```

**Response `422` — documents incomplete:**
```json
{
  "error": "documents_incomplete",
  "message": "All 5 documents must be verified before approval.",
  "verified": 4,
  "required": 5
}
```

---

### `POST /admin/approvals/:id/reject`
Reject a gym registration with a reason sent to the owner.

> **Permission required:** `approve_gyms`

**Request Body:**
```json
{
  "reason": "Insurance certificate expired January 2026. Please renew and reapply with a valid certificate.",
  "internal_note": "Called owner on 31 Oct. Agreed to reapply after renewal."
}
```

**Response `200 OK`:**
```json
{
  "id": "GYM-BLR-045",
  "status": "Rejected",
  "rejected_at": "2026-10-31T10:20:00Z",
  "message": "Rejection email sent to owner with the stated reason."
}
```

---

## 4. Users (Cross-gym)

View and manage members across all gyms on the platform.

### `GET /admin/users`
List all members across every gym.

**Query Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `gym_id` | string | Filter by gym |
| `branch` | string | Filter by branch |
| `status` | string | `Active` · `Expired` · `Frozen` |
| `plan` | string | Filter by plan name |
| `q` | string | Search by name or phone |
| `sort` | string | Default: `-since` |
| `limit` | integer | Max 200 |
| `offset` | integer | Default: 0 |

**Response `200 OK`:**
```json
{
  "total": 18750,
  "summary": {
    "active": 14820,
    "expired": 3110,
    "frozen": 820
  },
  "data": [
    {
      "id": "MBR-0001",
      "name": "Arjun Sharma",
      "phone": "+91 98765 43210",
      "plan": "Premium",
      "status": "Active",
      "branch": "kochi",
      "gym_id": "GYM-KCH-001",
      "gym_name": "FitZone Kochi",
      "since": "2025-01-15",
      "end": "2026-01-15",
      "qr_token": "FTV-KCH-0001-A1B2C3"
    }
  ]
}
```

---

### `GET /admin/users/:id`
Get a member's full profile, CRM history, and attendance stats.

**Response `200 OK`:**
```json
{
  "id": "MBR-0001",
  "name": "Arjun Sharma",
  "phone": "+91 98765 43210",
  "email": "arjun@example.com",
  "gender": "Male",
  "dob": "1995-07-12",
  "plan": "Premium",
  "status": "Active",
  "branch": "kochi",
  "gym_id": "GYM-KCH-001",
  "since": "2025-01-15",
  "end": "2026-01-15",
  "visits": 142,
  "last_visit": "28 Oct 2026",
  "qr_token": "FTV-KCH-0001-A1B2C3",
  "crm_notes": [...]
}
```

---

### `POST /admin/users/:id/rotate-qr`
Admin-level QR token rotation with full audit trail.

> **Permission required:** `freeze_members`

**Response `200 OK`:**
```json
{
  "member_id": "MBR-0001",
  "old_token": "FTV-KCH-0001-A1B2C3",
  "new_token": "FTV-KCH-0001-X9Y8Z7",
  "rotated_by": "admin@fitaval.com",
  "rotated_at": "2026-10-31T10:00:00Z",
  "audit_id": "aud_8921",
  "message": "QR token rotated. Old token invalidated immediately."
}
```

---

### `POST /admin/users/export`
Export all user records to Excel. Returns a download URL valid for 15 minutes.

> **Permission required:** `export_members`

**Request Body:**
```json
{
  "gym_id": "GYM-KCH-001",
  "status": "Active",
  "format": "xlsx"
}
```

**Response `202 Accepted`:**
```json
{
  "export_id": "exp_001",
  "status": "processing",
  "estimated_ready": "2026-10-31T10:02:00Z",
  "message": "Export is being prepared. Poll /admin/exports/exp_001 for the download link."
}
```

---

## 5. Staff & Trainers

### `GET /admin/gyms/:gym_id/staff`
List all staff members for a specific gym.

**Query Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `status` | string | `On Shift` · `Off Today` · `On Leave` |
| `active` | boolean | Filter active/inactive |

**Response `200 OK`:**
```json
{
  "gym_id": "GYM-KCH-001",
  "data": [
    {
      "id": "stf_001",
      "name": "Meena Thomas",
      "role": "Front Desk",
      "phone": "+91 93000 44000",
      "email": "meena@fitzonekochi.com",
      "status": "On Shift",
      "active": true,
      "since": "2024-03-01",
      "shift": "Morning (6 AM – 2 PM)",
      "hours": "Mon–Sat · 6 AM–2 PM",
      "bio": "Senior front desk associate with 3 years experience."
    }
  ]
}
```

---

### `GET /admin/gyms/:gym_id/staff/:id`
Get a single staff member's full details.

---

### `POST /admin/gyms/:gym_id/staff`
Add a new staff member to a gym.

**Request Body:**
```json
{
  "name": "Rahul Nair",
  "role": "Trainer",
  "phone": "+91 98000 55000",
  "email": "rahul@fitzonekochi.com",
  "shift": "Evening (2 PM – 10 PM)",
  "hours": "Mon–Sat · 2 PM–10 PM",
  "bio": "Certified personal trainer, 4 years experience."
}
```

**Response `201 Created`:**
```json
{
  "id": "stf_009",
  "name": "Rahul Nair",
  "gym_id": "GYM-KCH-001",
  "message": "Staff member added successfully."
}
```

---

### `PATCH /admin/gyms/:gym_id/staff/:id`
Update a staff member's details or status.

**Request Body (partial):**
```json
{
  "role": "Branch Manager",
  "status": "On Leave",
  "active": true
}
```

---

### `DELETE /admin/gyms/:gym_id/staff/:id`
Deactivate (soft-delete) a staff member.

---

### `GET /admin/gyms/:gym_id/trainers`
List all trainers for a gym.

**Response `200 OK`:**
```json
{
  "gym_id": "GYM-KCH-001",
  "data": [
    {
      "id": "trn_001",
      "name": "Ravi Kumar",
      "phone": "+91 97777 22222",
      "email": "ravi@fitzonekochi.com",
      "experience_years": 8,
      "specializations": ["Strength Training", "HIIT", "CrossFit"],
      "certifications": "ACE, NASM",
      "clients": 34,
      "active": true,
      "hours": "Mon–Sat · 6 AM–2 PM"
    }
  ]
}
```

---

### `POST /admin/gyms/:gym_id/trainers`
Add a trainer to a gym.

---

## 6. Finance

Platform-wide financial records and revenue analytics.

### `GET /admin/finance`
List all income and expense transactions across all gyms (or filtered by gym).

> **Permission required:** `revenue`

**Query Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `gym_id` | string | Filter by gym |
| `type` | string | `income` · `expense` |
| `category` | string | e.g. `Membership`, `Personal Training` |
| `date_from` | date | ISO 8601 |
| `date_to` | date | ISO 8601 |
| `sort` | string | Default: `-date` |
| `limit` | integer | Max 500 |
| `offset` | integer | Default: 0 |

**Response `200 OK`:**
```json
{
  "total": 92400,
  "summary": {
    "total_revenue": 10400000,
    "total_expenses": 2800000,
    "net": 7600000,
    "period": "2026-10"
  },
  "data": [
    {
      "id": "txn_001",
      "gym_id": "GYM-KCH-001",
      "gym_name": "FitZone Kochi",
      "type": "income",
      "category": "Membership",
      "amount": 12000,
      "date": "2026-10-28",
      "description": "Premium renewal — Arjun Sharma",
      "payment_method": "UPI"
    }
  ]
}
```

---

### `GET /admin/finance/summary`
Aggregated revenue statistics and top-performing gyms.

> **Permission required:** `revenue`

**Query Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `period` | string | `today` · `week` · `month` · `year` |
| `gym_id` | string | Scope to one gym |

**Response `200 OK`:**
```json
{
  "total_revenue": {
    "today": 85000,
    "this_week": 560000,
    "this_month": 10400000,
    "all_time": 124800000
  },
  "active_gyms": 1187,
  "total_members": 18750,
  "top_gyms_by_revenue": [
    { "gym_id": "GYM-KCH-001", "name": "FitZone Kochi",    "revenue": 1200000, "members": 342 },
    { "gym_id": "GYM-MUM-003", "name": "PeakFit Mumbai",   "revenue": 980000,  "members": 289 }
  ],
  "revenue_by_category": {
    "Membership": 8500000,
    "Personal Training": 1200000,
    "Group Classes": 450000,
    "Merchandise": 250000
  },
  "revenue_trend": [
    { "date": "2026-10-25", "revenue": 78000 },
    { "date": "2026-10-26", "revenue": 85000 }
  ]
}
```

---

## 7. Gym Wallet & Settlements

View and manage per-gym B2C wallet balances and settlement payouts.

### `GET /admin/gyms/:id/wallet`
Get wallet balance and settlement status for a specific gym.

> **Permission required:** `revenue`

**Response `200 OK`:**
```json
{
  "gym_id": "GYM-KCH-001",
  "gym_name": "FitZone Kochi",
  "balance": 250000,
  "total_earned": 1250000,
  "total_withdrawn": 1000000,
  "status": "Active",
  "pending_settlements": 1,
  "last_settlement": "2026-10-15",
  "bank_account": {
    "id": "bacc_gym_001",
    "bank": "HDFC Bank",
    "account_last4": "4521",
    "ifsc": "HDFC0001234"
  },
  "updated_at": "2026-10-31T08:00:00Z"
}
```

---

### `GET /admin/gyms/:id/wallet/transactions`
List all wallet transactions for a gym — credits (B2C purchases) and debits (settlements).

**Query Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `type` | string | `credit` · `debit` |
| `status` | string | `completed` · `pending` · `failed` |
| `date_from` | date | ISO 8601 |
| `date_to` | date | ISO 8601 |
| `sort` | string | Default: `-date` |
| `limit` | integer | Max 200 |

**Response `200 OK`:**
```json
{
  "gym_id": "GYM-KCH-001",
  "total": 142,
  "data": [
    {
      "id": "wtxn_001",
      "type": "credit",
      "amount": 12000,
      "description": "B2C Membership — Premium Plan (Arjun Sharma)",
      "date": "2026-10-28",
      "status": "completed"
    },
    {
      "id": "wtxn_002",
      "type": "debit",
      "amount": 50000,
      "description": "Monthly settlement — October",
      "date": "2026-10-15",
      "status": "completed"
    }
  ]
}
```

---

### `POST /admin/gyms/:id/wallet/settle`
Trigger a manual settlement payout for a gym.

> **Permission required:** `revenue`

**Request Body:**
```json
{
  "amount": 100000,
  "bank_account_id": "bacc_gym_001",
  "note": "October monthly settlement"
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `amount` | integer | ✅ | Must be ≤ gym wallet balance |
| `bank_account_id` | string | ✅ | Gym's pre-registered bank account |
| `note` | string | — | Reference note |

**Response `202 Accepted`:**
```json
{
  "settlement_id": "sett_003",
  "gym_id": "GYM-KCH-001",
  "amount": 100000,
  "status": "pending",
  "initiated_at": "2026-10-31T10:00:00Z",
  "estimated_credit": "2026-11-02",
  "message": "Settlement initiated. Funds credited to HDFC ****4521 within 2 business days."
}
```

---

### `GET /admin/settlements`
List all settlement payouts across all gyms.

**Query Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `gym_id` | string | Filter by gym |
| `status` | string | `pending` · `completed` · `failed` |
| `date_from` | date | ISO 8601 |
| `date_to` | date | ISO 8601 |
| `limit` | integer | Max 200 |

---

## 8. Reviews

### `GET /admin/gyms/:id/reviews`
List all member reviews for a gym.

**Query Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `rating` | integer | Filter by star rating (1–5) |
| `flagged` | boolean | `true` for flagged reviews only |
| `sort` | string | Default: `-created_at` |
| `limit` | integer | Max 100 |

**Response `200 OK`:**
```json
{
  "gym_id": "GYM-KCH-001",
  "avg_rating": 4.6,
  "total": 89,
  "data": [
    {
      "id": "rev_001",
      "member_id": "MBR-0001",
      "member_name": "Arjun Sharma",
      "rating": 5,
      "comment": "Excellent facility and amazing trainers!",
      "flagged": false,
      "created_at": "2026-10-20T14:00:00Z"
    }
  ]
}
```

---

### `POST /admin/reviews/:id/flag`
Flag a review for policy violation.

**Request Body:**
```json
{
  "reason": "Contains inappropriate language."
}
```

---

### `DELETE /admin/reviews/:id`
Remove a review (Super Admin only).

> **Permission required:** `edit_gym`

---

## 9. Audit Logs

Full immutable audit trail of all admin actions on the platform.

### `GET /admin/audit`
Retrieve the platform-wide audit log.

> **Permission required:** `view_audit`

**Query Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `action` | string | `CREATE` · `UPDATE` · `DELETE` · `SECURITY` |
| `entity` | string | `gyms.Gym` · `memberships.Membership` · `crm.Interaction` · `finance.Transaction` |
| `actor_id` | string | Filter by the user who made the change |
| `gym_id` | string | Filter by gym |
| `date_from` | date | ISO 8601 |
| `date_to` | date | ISO 8601 |
| `sort` | string | Default: `-created_at` |
| `limit` | integer | Max 100 |

**Response `200 OK`:**
```json
{
  "total": 89210,
  "data": [
    {
      "id": "aud_001",
      "action": "UPDATE",
      "entity": "gyms.Gym",
      "entity_id": "GYM-BLR-045",
      "actor": "admin@fitaval.com",
      "actor_role": "Super Admin",
      "description": "Gym approval status changed to APPROVED",
      "changes": {
        "before": { "status": "UNDER_REVIEW" },
        "after":  { "status": "APPROVED", "documents_verified": 5 }
      },
      "created_at": "2026-10-31T10:15:00Z",
      "ip": "103.21.xx.xx"
    },
    {
      "id": "aud_002",
      "action": "SECURITY",
      "entity": "memberships.Membership",
      "entity_id": "FTV-KCH-0001-A1B2C3",
      "actor": "admin@fitaval.com",
      "actor_role": "Super Admin",
      "description": "QR token rotated",
      "changes": {
        "before": { "qr": "FTV-KCH-0001-A1B2C3" },
        "after":  { "qr": "FTV-KCH-0001-X9Y8Z7" }
      },
      "created_at": "2026-10-31T10:00:00Z",
      "ip": "103.21.xx.xx"
    }
  ]
}
```

---

### `GET /admin/audit/:id`
Get a single audit log entry with full change details.

---

## 10. Roles & Permissions

### `GET /admin/roles`
List all available roles and their permission sets.

**Response `200 OK`:**
```json
{
  "data": [
    {
      "id": "super_admin",
      "name": "Super Admin",
      "description": "Full platform access — all gyms, finance, approvals, and audit.",
      "permissions": {
        "view_members":    true,
        "edit_gym":        true,
        "revenue":         true,
        "export_members":  true,
        "freeze_members":  true,
        "manage_staff":    true,
        "approve_gyms":    true,
        "view_audit":      true
      }
    },
    {
      "id": "branch_manager",
      "name": "Branch Manager",
      "description": "Full gym management including revenue, but cannot approve gyms or view audit.",
      "permissions": {
        "view_members":    true,
        "edit_gym":        true,
        "revenue":         true,
        "export_members":  true,
        "freeze_members":  true,
        "manage_staff":    true,
        "approve_gyms":    false,
        "view_audit":      false
      }
    },
    {
      "id": "front_desk",
      "name": "Front Desk Staff",
      "description": "View members and record check-ins. No finance or management access.",
      "permissions": {
        "view_members":    true,
        "edit_gym":        false,
        "revenue":         false,
        "export_members":  false,
        "freeze_members":  false,
        "manage_staff":    false,
        "approve_gyms":    false,
        "view_audit":      false
      }
    },
    {
      "id": "trainer",
      "name": "Trainer",
      "description": "Access to own class rosters only. Cannot view the member directory.",
      "permissions": {
        "view_members":    false,
        "edit_gym":        false,
        "revenue":         false,
        "export_members":  false,
        "freeze_members":  false,
        "manage_staff":    false,
        "approve_gyms":    false,
        "view_audit":      false
      }
    }
  ]
}
```

---

### `POST /admin/staff/:id/role`
Assign or change a staff member's role.

> **Permission required:** `manage_staff`

**Request Body:**
```json
{
  "role_id": "branch_manager",
  "gym_id": "GYM-KCH-001"
}
```

**Response `200 OK`:**
```json
{
  "staff_id": "stf_001",
  "name": "Meena Thomas",
  "role": "Branch Manager",
  "gym_id": "GYM-KCH-001",
  "updated_at": "2026-10-31T11:00:00Z",
  "message": "Role updated. Meena Thomas now has Branch Manager access."
}
```

---

## 11. Webhooks

Register webhook endpoints to receive real-time events for admin-level actions.

### `POST /webhooks`
Register a webhook.

```json
{
  "url": "https://yourapp.com/webhooks/fitaval-admin",
  "events": ["gym.approved", "gym.rejected", "wallet.settled"],
  "secret": "your_webhook_signing_secret"
}
```

### Admin Webhook Events

| Event | Trigger |
|---|---|
| `gym.created` | New gym registration submitted |
| `gym.approved` | Gym approval granted |
| `gym.rejected` | Gym registration rejected |
| `gym.verified` | Verified blue tick added or removed |
| `gym.updated` | Gym details updated by admin |
| `wallet.credited` | Gym wallet credited from B2C |
| `wallet.withdrawal_requested` | Gym requested a withdrawal |
| `wallet.settled` | Settlement payout completed |
| `settlement.failed` | Settlement payout failed |
| `staff.role_changed` | Staff member role updated |
| `review.flagged` | Review flagged by admin |
| `review.removed` | Review removed by admin |

### Webhook Payload

```json
{
  "event": "gym.approved",
  "timestamp": "2026-10-31T10:15:00Z",
  "data": {
    "id": "GYM-BLR-045",
    "name": "PowerHouse Bangalore",
    "owner": "Vikram Singh",
    "approved_by": "admin@fitaval.com"
  }
}
```

### Signature Verification

Every webhook request includes `X-Fitaval-Signature`. Verify with HMAC-SHA256:

```javascript
const crypto = require('crypto');

function verifyWebhook(rawBody, signature, secret) {
  const expected = 'sha256=' + crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(expected),
    Buffer.from(signature)
  );
}
```

---

## 12. Error Codes

All error responses follow this shape:

```json
{
  "error": "error_code",
  "message": "Human-readable description.",
  "field": "optional_field_name",
  "request_id": "req_01JF8XKPQR4MVWZ"
}
```

| HTTP Status | Error Code | Description |
|---|---|---|
| `400` | `validation_error` | Request body or params failed validation |
| `401` | `unauthorized` | Missing or invalid Bearer token |
| `403` | `forbidden` | Insufficient role/permissions for this action |
| `404` | `not_found` | Resource not found |
| `409` | `conflict` | Duplicate resource |
| `422` | `documents_incomplete` | Gym approval attempted without all docs verified |
| `422` | `insufficient_balance` | Settlement amount exceeds gym wallet balance |
| `429` | `rate_limit_exceeded` | Too many requests |
| `500` | `internal_error` | Unexpected server error |
| `503` | `service_unavailable` | Maintenance or outage |

---

## 13. Rate Limiting

| Tier | Limit | Window |
|---|---|---|
| Default API calls | 300 requests | per minute |
| Auth (`/auth/*`) | 20 requests | per minute |
| Data exports | 10 requests | per hour |
| Finance export | 5 requests | per hour |

**Rate limit headers on every response:**
```
X-RateLimit-Limit: 300
X-RateLimit-Remaining: 247
X-RateLimit-Reset: 1730368200
Retry-After: 18
```

---

## 14. Pagination

All list endpoints use offset-based pagination.

```
GET /admin/gyms?limit=50&offset=100
```

**Response envelope:**
```json
{
  "total": 1245,
  "limit": 50,
  "offset": 100,
  "has_more": true,
  "data": [...]
}
```

**Sort:** prefix `-` for descending, no prefix for ascending.

```
sort=-submitted_on   → newest first
sort=name            → A → Z
```

---

## 15. Quick Reference

| Method | Endpoint | Description | Permission |
|---|---|---|---|
| `POST` | `/auth/login` | Login | — |
| `POST` | `/auth/refresh` | Refresh token | — |
| `POST` | `/auth/logout` | Logout | ✅ |
| **Gyms** | | | |
| `GET` | `/admin/gyms` | List all gyms | ✅ |
| `GET` | `/admin/gyms/:id` | Gym full detail | ✅ |
| `PATCH` | `/admin/gyms/:id` | Update gym | `edit_gym` |
| `POST` | `/admin/gyms/:id/verify` | Toggle blue tick | `edit_gym` |
| `GET` | `/admin/gyms/:id/photos` | Gym photo gallery | ✅ |
| **Approvals** | | | |
| `GET` | `/admin/approvals` | Approval queue | ✅ |
| `POST` | `/admin/approvals/:id/review` | Start review | `approve_gyms` |
| `POST` | `/admin/approvals/:id/approve` | Approve gym | `approve_gyms` |
| `POST` | `/admin/approvals/:id/reject` | Reject gym | `approve_gyms` |
| **Users** | | | |
| `GET` | `/admin/users` | All users (cross-gym) | `view_members` |
| `GET` | `/admin/users/:id` | User full profile | `view_members` |
| `POST` | `/admin/users/:id/rotate-qr` | Rotate QR | `freeze_members` |
| `POST` | `/admin/users/export` | Export to Excel | `export_members` |
| **Staff & Trainers** | | | |
| `GET` | `/admin/gyms/:id/staff` | List staff | ✅ |
| `GET` | `/admin/gyms/:id/staff/:id` | Staff detail | ✅ |
| `POST` | `/admin/gyms/:id/staff` | Add staff | `manage_staff` |
| `PATCH` | `/admin/gyms/:id/staff/:id` | Update staff | `manage_staff` |
| `DELETE` | `/admin/gyms/:id/staff/:id` | Remove staff | `manage_staff` |
| `GET` | `/admin/gyms/:id/trainers` | List trainers | ✅ |
| `POST` | `/admin/gyms/:id/trainers` | Add trainer | `manage_staff` |
| `POST` | `/admin/staff/:id/role` | Assign role | `manage_staff` |
| **Finance** | | | |
| `GET` | `/admin/finance` | Finance records | `revenue` |
| `GET` | `/admin/finance/summary` | Revenue summary | `revenue` |
| **Wallet & Settlements** | | | |
| `GET` | `/admin/gyms/:id/wallet` | Gym wallet balance | `revenue` |
| `GET` | `/admin/gyms/:id/wallet/transactions` | Wallet history | `revenue` |
| `POST` | `/admin/gyms/:id/wallet/settle` | Trigger settlement | `revenue` |
| `GET` | `/admin/settlements` | All settlements | `revenue` |
| **Reviews** | | | |
| `GET` | `/admin/gyms/:id/reviews` | Gym reviews | ✅ |
| `POST` | `/admin/reviews/:id/flag` | Flag review | `edit_gym` |
| `DELETE` | `/admin/reviews/:id` | Remove review | `edit_gym` |
| **Audit & Roles** | | | |
| `GET` | `/admin/audit` | Audit log | `view_audit` |
| `GET` | `/admin/audit/:id` | Audit entry detail | `view_audit` |
| `GET` | `/admin/roles` | Role definitions | ✅ |
| **Webhooks** | | | |
| `POST` | `/webhooks` | Register webhook | ✅ |

---

*© 2026 Fitaval · Super Admin API v1.0.0 · For authorized integrators only.*

