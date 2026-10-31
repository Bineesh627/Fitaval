# Fitaval API Documentation

> **Version:** 1.0.0  
> **Base URL:** `https://api.fitaval.com/v1`  
> **Authentication:** Bearer token (JWT) in `Authorization` header  
> **Content-Type:** `application/json`

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [CRM API](#2-crm-api)
   - [Members](#21-members)
   - [Membership Plans](#22-membership-plans)
   - [Transactions](#23-transactions)
   - [Wallet](#24-wallet)
   - [Attendance / Check-ins](#25-attendance--check-ins)
   - [Trainers](#26-trainers)
   - [Subscriptions](#27-subscriptions)
   - [CRM Interactions](#28-crm-interactions)
3. [Super Admin API](#3-super-admin-api)
   - [Gyms](#31-gyms)
   - [Gym Approvals](#32-gym-approvals)
   - [Users (Super Admin)](#33-users-super-admin)
   - [Staff](#34-staff)
   - [Finance](#35-finance)
   - [Gym Wallet](#36-gym-wallet)
   - [Audit Logs](#37-audit-logs)
   - [Roles & Permissions](#38-roles--permissions)
4. [Webhooks](#4-webhooks)
5. [Error Codes](#5-error-codes)
6. [Rate Limiting](#6-rate-limiting)
7. [Pagination](#7-pagination)

---

## 1. Authentication

### POST `/auth/login`
Authenticate and receive an access token.

**Request Body:**
```json
{
  "email": "owner@fitaval.com",
  "password": "your_password",
  "role": "crm" 
}
```
> `role` must be one of: `crm`, `admin`, `super_admin`

**Response `200 OK`:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4...",
  "expires_in": 3600,
  "user": {
    "id": "usr_01",
    "email": "owner@fitaval.com",
    "role": "Branch Manager",
    "gym_id": "GYM-KCH-001"
  }
}
```

### POST `/auth/refresh`
Refresh an expired access token.

**Request Body:**
```json
{ "refresh_token": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4..." }
```

### POST `/auth/logout`
Invalidate the current session token.

**Headers:** `Authorization: Bearer <token>`

**Response `204 No Content`**

---

## 2. CRM API

> **Scope:** Gym-level operations. All endpoints are scoped to the authenticated gym (`gym_id` from token).

### 2.1 Members

#### `GET /crm/members`
List all members for the authenticated gym.

**Query Parameters:**
| Parameter | Type | Default | Description |
|---|---|---|---|
| `status` | string | — | Filter by `Active`, `Expired`, `Frozen` |
| `plan` | string | — | Filter by plan name |
| `branch` | string | — | Filter by branch ID |
| `q` | string | — | Full-text search on name, phone |
| `sort` | string | `-created_date` | Field to sort by (prefix `-` for descending) |
| `limit` | integer | 50 | Max records (max 200) |
| `offset` | integer | 0 | Pagination offset |

**Response `200 OK`:**
```json
{
  "total": 512,
  "limit": 50,
  "offset": 0,
  "data": [
    {
      "id": "MBR-0001",
      "name": "Arjun Sharma",
      "phone": "+91 98765 43210",
      "email": "arjun@example.com",
      "plan": "Premium",
      "status": "Active",
      "branch": "kochi",
      "since": "2025-01-15",
      "end": "2026-01-15",
      "visits": 142,
      "last": "28 Oct 2026",
      "qr_token": "FTV-KCH-0001-A1B2C3",
      "created_date": "2025-01-15T10:30:00Z"
    }
  ]
}
```

#### `GET /crm/members/:id`
Retrieve a single member's full profile.

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
  "since": "2025-01-15",
  "end": "2026-01-15",
  "visits": 142,
  "last": "28 Oct 2026",
  "qr_token": "FTV-KCH-0001-A1B2C3",
  "crm_notes": [
    {
      "id": "crm-1001",
      "channel": "Phone Call",
      "by": "Staff Name",
      "note": "Called to check renewal intent.",
      "when": "28 Oct 2026, 10:30 AM",
      "follow_up": "2026-11-05"
    }
  ]
}
```

#### `POST /crm/members`
Register a new member.

**Request Body:**
```json
{
  "name": "Priya Nair",
  "phone": "+91 90000 11111",
  "email": "priya@example.com",
  "gender": "Female",
  "dob": "1998-03-22",
  "plan_id": "plan_premium",
  "branch": "kochi",
  "start_date": "2026-11-01"
}
```

**Response `201 Created`:**
```json
{
  "id": "MBR-0513",
  "qr_token": "FTV-KCH-0513-D4E5F6",
  "message": "Member registered successfully."
}
```

#### `PATCH /crm/members/:id`
Update member details or status.

**Request Body (partial):**
```json
{
  "status": "Frozen",
  "plan": "Basic"
}
```

#### `POST /crm/members/:id/rotate-qr`
Rotate the member's QR token (old token is immediately invalidated).

**Response `200 OK`:**
```json
{
  "old_token": "FTV-KCH-0001-A1B2C3",
  "new_token": "FTV-KCH-0001-X9Y8Z7",
  "message": "QR token rotated. Old token is now invalid."
}
```

---

### 2.2 Membership Plans

#### `GET /crm/plans`
List all membership plans.

**Response `200 OK`:**
```json
{
  "data": [
    {
      "id": "plan_premium",
      "name": "Premium",
      "duration_days": 365,
      "price": 12000,
      "features": ["Unlimited access", "Personal trainer", "Diet consultation"],
      "active": true,
      "created_date": "2025-01-01T00:00:00Z"
    }
  ]
}
```

#### `POST /crm/plans`
Create a new membership plan.

**Request Body:**
```json
{
  "name": "Gold",
  "duration_days": 180,
  "price": 7500,
  "features": ["Unlimited access", "Group classes"],
  "active": true
}
```

#### `PATCH /crm/plans/:id`
Update an existing plan.

#### `DELETE /crm/plans/:id`
Deactivate (soft-delete) a plan. Active memberships using this plan are unaffected.

---

### 2.3 Transactions

#### `GET /crm/transactions`
List all financial transactions for the gym.

**Query Parameters:**
| Parameter | Type | Description |
|---|---|---|
| `type` | string | `income`, `expense` |
| `category` | string | e.g. `Membership`, `Equipment` |
| `date_from` | date | ISO 8601 date |
| `date_to` | date | ISO 8601 date |
| `sort` | string | Default: `-date` |
| `limit` | integer | Max 200 |

**Response `200 OK`:**
```json
{
  "total": 2340,
  "data": [
    {
      "id": "txn_001",
      "type": "income",
      "category": "Membership",
      "description": "Premium renewal — Arjun Sharma",
      "amount": 12000,
      "date": "2026-10-28",
      "member_id": "MBR-0001",
      "payment_method": "UPI"
    }
  ]
}
```

#### `POST /crm/transactions`
Record a new transaction.

**Request Body:**
```json
{
  "type": "income",
  "category": "Membership",
  "description": "New membership — Priya Nair",
  "amount": 7500,
  "date": "2026-11-01",
  "member_id": "MBR-0513",
  "payment_method": "Card"
}
```

---

### 2.4 Wallet

#### `GET /crm/wallet/balance`
Get the current wallet balance and summary.

**Response `200 OK`:**
```json
{
  "balance": 84500,
  "total_earned": 125000,
  "total_withdrawn": 40500,
  "status": "Active",
  "updated_at": "2026-10-31T10:00:00Z"
}
```

#### `GET /crm/wallet/transactions`
List all wallet transactions.

**Query Parameters:**
| Parameter | Type | Description |
|---|---|---|
| `type` | string | `credit`, `debit`, `withdrawal` |
| `status` | string | `completed`, `pending`, `failed` |
| `sort` | string | Default: `-date` |
| `limit` | integer | Max 100 |

**Response `200 OK`:**
```json
{
  "data": [
    {
      "id": "wtxn_001",
      "type": "credit",
      "amount": 12000,
      "description": "B2C Membership — Premium Plan",
      "date": "2026-10-28",
      "status": "completed"
    }
  ]
}
```

#### `POST /crm/wallet/withdraw`
Request a withdrawal from the wallet.

**Request Body:**
```json
{
  "amount": 20000,
  "bank_account_id": "bacc_001",
  "note": "Monthly settlement"
}
```

**Response `202 Accepted`:**
```json
{
  "withdrawal_id": "wdrl_002",
  "amount": 20000,
  "status": "pending",
  "estimated_credit": "2026-11-03",
  "message": "Withdrawal initiated. Funds credited within 2-3 business days."
}
```

---

### 2.5 Attendance / Check-ins

#### `GET /crm/attendance`
List attendance / check-in records.

**Query Parameters:**
| Parameter | Type | Description |
|---|---|---|
| `member_id` | string | Filter by member |
| `date_from` | date | ISO 8601 |
| `date_to` | date | ISO 8601 |
| `branch` | string | Branch ID |
| `limit` | integer | Max 500 |

**Response `200 OK`:**
```json
{
  "data": [
    {
      "id": "att_001",
      "member_id": "MBR-0001",
      "member_name": "Arjun Sharma",
      "qr_token": "FTV-KCH-0001-A1B2C3",
      "branch": "kochi",
      "checked_in_at": "2026-10-31T07:45:00Z",
      "method": "qr_scan"
    }
  ]
}
```

#### `POST /crm/attendance/check-in`
Record a check-in via QR scan.

**Request Body:**
```json
{
  "qr_token": "FTV-KCH-0001-A1B2C3",
  "branch": "kochi"
}
```

**Response `200 OK`:**
```json
{
  "member_id": "MBR-0001",
  "member_name": "Arjun Sharma",
  "status": "Active",
  "plan": "Premium",
  "days_left": 76,
  "check_in_id": "att_892",
  "checked_in_at": "2026-10-31T07:45:00Z"
}
```

**Response `403 Forbidden` (expired membership):**
```json
{
  "error": "membership_expired",
  "message": "Membership expired on 2026-09-15. Please renew.",
  "member_id": "MBR-0205"
}
```

---

### 2.6 Trainers

#### `GET /crm/trainers`
List all trainers for the gym.

**Response `200 OK`:**
```json
{
  "data": [
    {
      "id": "trn_001",
      "name": "Ravi Kumar",
      "phone": "+91 97777 22222",
      "email": "ravi@fitaval.com",
      "experience_years": 8,
      "specializations": ["Strength Training", "HIIT", "CrossFit"],
      "certifications": "ACE, NASM",
      "clients": 34,
      "active": true,
      "bio": "Expert strength and conditioning coach."
    }
  ]
}
```

#### `POST /crm/trainers`
Add a new trainer.

#### `PATCH /crm/trainers/:id`
Update trainer details.

#### `DELETE /crm/trainers/:id`
Deactivate a trainer.

---

### 2.7 Subscriptions

#### `GET /crm/subscriptions`
List all active and past subscriptions.

**Response `200 OK`:**
```json
{
  "data": [
    {
      "id": "sub_001",
      "member_id": "MBR-0001",
      "plan_id": "plan_premium",
      "plan_name": "Premium",
      "start_date": "2025-01-15",
      "end_date": "2026-01-15",
      "status": "Active",
      "amount_paid": 12000,
      "payment_method": "UPI"
    }
  ]
}
```

#### `POST /crm/subscriptions`
Create a new subscription (renew or new enrollment).

**Request Body:**
```json
{
  "member_id": "MBR-0001",
  "plan_id": "plan_premium",
  "start_date": "2026-01-16",
  "payment_method": "Card",
  "amount_paid": 12000
}
```

---

### 2.8 CRM Interactions

#### `GET /crm/members/:id/interactions`
List CRM interaction history for a member.

**Response `200 OK`:**
```json
{
  "data": [
    {
      "id": "crm-1001",
      "channel": "Phone Call",
      "by": "Staff Name",
      "note": "Member confirmed renewal for January.",
      "when": "28 Oct 2026, 10:30 AM",
      "follow_up": "2026-11-05",
      "created_at": "2026-10-28T10:30:00Z"
    }
  ]
}
```

#### `POST /crm/members/:id/interactions`
Log a new CRM interaction note.

**Request Body:**
```json
{
  "channel": "WhatsApp",
  "note": "Sent renewal reminder. Member interested in upgrading to Premium.",
  "follow_up": "2026-11-10"
}
```

> **Channels:** `Phone Call`, `WhatsApp`, `Email`, `In-Person`, `SMS`

---

## 3. Super Admin API

> **Scope:** Platform-wide operations. Requires `super_admin` or `branch_manager` role.

### 3.1 Gyms

#### `GET /admin/gyms`
List all registered gyms on the platform.

**Query Parameters:**
| Parameter | Type | Description |
|---|---|---|
| `status` | string | `Approved`, `Pending`, `Under Review`, `Rejected` |
| `loc` | string | City/state filter |
| `q` | string | Search by gym name or ID |
| `sort` | string | Default: `-created_date` |
| `limit` | integer | Max 200 |

**Response `200 OK`:**
```json
{
  "total": 1245,
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
      "approval_status": "Approved",
      "submitted_on": "10/15/2025",
      "staff_count": 8,
      "trainer_count": 5,
      "member_count": 342,
      "rating": 4.6,
      "review_count": 89,
      "verified": true
    }
  ]
}
```

#### `GET /admin/gyms/:id`
Get full gym details including staff, trainers, members, wallet.

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
  "facilities": ["Swimming Pool", "Sauna", "Parking"],
  "services": ["Personal Training", "Yoga", "Zumba"],
  "hours": [
    { "day": "Monday", "open": true, "from": "06:00", "to": "22:00" }
  ],
  "staff": { "count": 8 },
  "trainers": { "count": 5 },
  "members": { "count": 342 },
  "wallet": {
    "balance": 250000,
    "status": "Active"
  },
  "rating": 4.6,
  "review_count": 89
}
```

#### `PATCH /admin/gyms/:id`
Update gym details (Super Admin / Branch Manager only).

**Request Body (partial):**
```json
{
  "verified": true,
  "facilities": ["Swimming Pool", "Sauna", "Parking", "Steam Room"],
  "hours": [
    { "day": "Monday", "open": true, "from": "05:30", "to": "22:30" }
  ]
}
```

---

### 3.2 Gym Approvals

#### `GET /admin/approvals`
List gym approval requests.

**Query Parameters:**
| Parameter | Type | Description |
|---|---|---|
| `status` | string | `Pending`, `Under Review`, `Approved`, `Rejected` |
| `sort` | string | Default: `-submitted_on` |
| `limit` | integer | Max 100 |

**Response `200 OK`:**
```json
{
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

#### `POST /admin/approvals/:id/review`
Start review of a pending gym.

**Request Body:**
```json
{ "note": "Beginning document verification process." }
```

**Response `200 OK`:**
```json
{
  "id": "GYM-BLR-045",
  "status": "Under Review",
  "updated_at": "2026-10-31T10:00:00Z"
}
```

#### `POST /admin/approvals/:id/approve`
Approve a gym registration.

**Request Body:**
```json
{
  "documents_verified": ["GST Certificate", "Trade License", "Owner ID", "Insurance", "Health NOC"],
  "internal_note": "All documents verified. Gym meets all requirements."
}
```

**Response `200 OK`:**
```json
{
  "id": "GYM-BLR-045",
  "status": "Approved",
  "approved_at": "2026-10-31T10:15:00Z",
  "message": "Gym approved. Owner notified via email."
}
```

#### `POST /admin/approvals/:id/reject`
Reject a gym registration.

**Request Body:**
```json
{
  "reason": "Insurance certificate has expired. Please renew and reapply.",
  "internal_note": "Insurance expired Jan 2026. Contacted owner."
}
```

**Response `200 OK`:**
```json
{
  "id": "GYM-BLR-045",
  "status": "Rejected",
  "rejected_at": "2026-10-31T10:20:00Z",
  "message": "Rejection email sent to owner."
}
```

#### `POST /admin/gyms/:id/verify`
Toggle the verified blue tick for a gym.

**Request Body:**
```json
{ "verified": true }
```

---

### 3.3 Users (Super Admin)

#### `GET /admin/users`
List all users (members) across all gyms.

**Query Parameters:**
| Parameter | Type | Description |
|---|---|---|
| `gym_id` | string | Filter by gym |
| `branch` | string | Filter by branch |
| `status` | string | `Active`, `Expired`, `Frozen` |
| `plan` | string | Filter by plan name |
| `q` | string | Search by name/phone |
| `sort` | string | Default: `-since` |
| `limit` | integer | Max 200 |

**Response `200 OK`:**
```json
{
  "total": 18750,
  "data": [
    {
      "id": "MBR-0001",
      "name": "Arjun Sharma",
      "phone": "+91 98765 43210",
      "plan": "Premium",
      "status": "Active",
      "branch": "kochi",
      "gym_id": "GYM-KCH-001",
      "since": "2025-01-15",
      "end": "2026-01-15",
      "qr_token": "FTV-KCH-0001-A1B2C3"
    }
  ]
}
```

#### `GET /admin/users/:id`
Get full user profile with CRM history.

#### `POST /admin/users/:id/rotate-qr`
Admin-level QR token rotation with full audit trail.

**Response `200 OK`:**
```json
{
  "old_token": "FTV-KCH-0001-A1B2C3",
  "new_token": "FTV-KCH-0001-X9Y8Z7",
  "rotated_by": "admin@fitaval.com",
  "rotated_at": "2026-10-31T10:00:00Z"
}
```

---

### 3.4 Staff

#### `GET /admin/gyms/:gym_id/staff`
List all staff for a gym.

**Response `200 OK`:**
```json
{
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
      "shift": "Morning (6 AM - 2 PM)"
    }
  ]
}
```

#### `GET /admin/gyms/:gym_id/trainers`
List all trainers for a gym.

#### `POST /admin/gyms/:gym_id/staff`
Add a staff member to a gym.

**Request Body:**
```json
{
  "name": "Rahul Nair",
  "role": "Trainer",
  "phone": "+91 98000 55000",
  "email": "rahul@fitzonekochi.com",
  "shift": "Evening (2 PM - 10 PM)"
}
```

---

### 3.5 Finance

#### `GET /admin/finance`
Platform-wide financial overview.

**Query Parameters:**
| Parameter | Type | Description |
|---|---|---|
| `gym_id` | string | Filter by gym |
| `date_from` | date | ISO 8601 |
| `date_to` | date | ISO 8601 |
| `type` | string | `income`, `expense` |
| `sort` | string | Default: `-date` |
| `limit` | integer | Max 500 |

**Response `200 OK`:**
```json
{
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
      "description": "Premium renewal — Arjun Sharma"
    }
  ]
}
```

#### `GET /admin/finance/summary`
Aggregated revenue statistics.

**Response `200 OK`:**
```json
{
  "total_revenue": {
    "today": 85000,
    "this_week": 560000,
    "this_month": 10400000,
    "all_time": 124800000
  },
  "top_gyms": [
    { "gym_id": "GYM-KCH-001", "name": "FitZone Kochi", "revenue": 1200000 }
  ],
  "revenue_by_category": {
    "Membership": 8500000,
    "Personal Training": 1200000,
    "Merchandise": 700000
  }
}
```

---

### 3.6 Gym Wallet

#### `GET /admin/gyms/:id/wallet`
Get wallet balance and settlement status for a gym.

**Response `200 OK`:**
```json
{
  "gym_id": "GYM-KCH-001",
  "balance": 250000,
  "total_earned": 1250000,
  "total_withdrawn": 1000000,
  "status": "Active",
  "pending_settlements": 0,
  "last_settlement": "2026-10-15",
  "updated_at": "2026-10-31T08:00:00Z"
}
```

#### `GET /admin/gyms/:id/wallet/transactions`
List wallet transactions for a specific gym.

**Response `200 OK`:**
```json
{
  "data": [
    {
      "id": "wtxn_001",
      "type": "credit",
      "amount": 12000,
      "description": "B2C Membership — Premium Plan",
      "date": "2026-10-28",
      "status": "completed"
    },
    {
      "id": "wtxn_002",
      "type": "debit",
      "amount": 50000,
      "description": "Monthly settlement",
      "date": "2026-10-15",
      "status": "completed"
    }
  ]
}
```

#### `POST /admin/gyms/:id/wallet/settle`
Trigger a manual settlement for a gym.

**Request Body:**
```json
{
  "amount": 100000,
  "bank_account_id": "bacc_gym_001",
  "note": "October settlement"
}
```

**Response `202 Accepted`:**
```json
{
  "settlement_id": "sett_003",
  "gym_id": "GYM-KCH-001",
  "amount": 100000,
  "status": "pending",
  "initiated_at": "2026-10-31T10:00:00Z",
  "estimated_credit": "2026-11-02"
}
```

---

### 3.7 Audit Logs

#### `GET /admin/audit`
Retrieve platform-wide audit log.

**Query Parameters:**
| Parameter | Type | Description |
|---|---|---|
| `action` | string | `CREATE`, `UPDATE`, `DELETE`, `SECURITY` |
| `entity` | string | e.g. `gyms.Gym`, `memberships.Membership`, `crm.Interaction` |
| `actor_id` | string | Filter by staff who made the change |
| `gym_id` | string | Filter by gym |
| `date_from` | date | ISO 8601 |
| `date_to` | date | ISO 8601 |
| `sort` | string | Default: `-created_at` |
| `limit` | integer | Max 100 |

**Response `200 OK`:**
```json
{
  "total": 8921,
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
        "after": { "status": "APPROVED", "documents_verified": 5 }
      },
      "created_at": "2026-10-31T10:15:00Z",
      "ip": "103.21.xx.xx"
    }
  ]
}
```

---

### 3.8 Roles & Permissions

#### `GET /admin/roles`
List all available roles and their permissions.

**Response `200 OK`:**
```json
{
  "data": [
    {
      "id": "super_admin",
      "name": "Super Admin",
      "permissions": {
        "view_members": true,
        "edit_gym": true,
        "revenue": true,
        "export_members": true,
        "freeze_members": true,
        "manage_staff": true,
        "approve_gyms": true,
        "view_audit": true
      }
    },
    {
      "id": "branch_manager",
      "name": "Branch Manager",
      "permissions": {
        "view_members": true,
        "edit_gym": true,
        "revenue": true,
        "export_members": true,
        "freeze_members": true,
        "manage_staff": true,
        "approve_gyms": false,
        "view_audit": false
      }
    },
    {
      "id": "front_desk",
      "name": "Front Desk Staff",
      "permissions": {
        "view_members": true,
        "edit_gym": false,
        "revenue": false,
        "export_members": false,
        "freeze_members": false,
        "manage_staff": false,
        "approve_gyms": false,
        "view_audit": false
      }
    },
    {
      "id": "trainer",
      "name": "Trainer",
      "permissions": {
        "view_members": false,
        "edit_gym": false,
        "revenue": false,
        "export_members": false,
        "freeze_members": false,
        "manage_staff": false,
        "approve_gyms": false,
        "view_audit": false
      }
    }
  ]
}
```

#### `POST /admin/staff/:id/role`
Assign a role to a staff member.

**Request Body:**
```json
{
  "role_id": "branch_manager",
  "gym_id": "GYM-KCH-001"
}
```

---

## 4. Webhooks

Fitaval sends HTTP POST requests to your webhook URL when key events occur.

### Registering a Webhook

```http
POST /webhooks
Authorization: Bearer <token>

{
  "url": "https://yourapp.com/webhooks/fitaval",
  "events": ["member.created", "member.expired", "gym.approved", "check_in.completed"],
  "secret": "your_webhook_signing_secret"
}
```

### Event Types

| Event | Trigger |
|---|---|
| `member.created` | New member registered |
| `member.renewed` | Membership renewed |
| `member.expired` | Membership expired |
| `member.frozen` | Membership frozen |
| `check_in.completed` | QR scan / check-in recorded |
| `check_in.denied` | Check-in denied (expired/frozen) |
| `gym.created` | New gym registered |
| `gym.approved` | Gym approval granted |
| `gym.rejected` | Gym application rejected |
| `gym.verified` | Blue tick added/removed |
| `wallet.credited` | Wallet credited (B2C purchase) |
| `wallet.withdrawal_requested` | Withdrawal request initiated |
| `wallet.settled` | Settlement completed |
| `transaction.created` | New transaction recorded |

### Webhook Payload

```json
{
  "event": "member.created",
  "timestamp": "2026-10-31T10:30:00Z",
  "data": {
    "id": "MBR-0513",
    "name": "Priya Nair",
    "plan": "Premium",
    "gym_id": "GYM-KCH-001"
  }
}
```

### Signature Verification

Every webhook request includes an `X-Fitaval-Signature` header. Verify using HMAC-SHA256:

```javascript
const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  return `sha256=${expected}` === signature;
}
```

---

## 5. Error Codes

All errors return a JSON body with `error` and `message` fields.

| HTTP Status | Error Code | Description |
|---|---|---|
| `400` | `validation_error` | Request body or params failed validation |
| `401` | `unauthorized` | Missing or invalid Bearer token |
| `403` | `forbidden` | Token valid but insufficient role/permissions |
| `404` | `not_found` | Resource not found |
| `409` | `conflict` | Duplicate resource (e.g. existing member with same phone) |
| `422` | `membership_expired` | QR check-in attempted on expired membership |
| `422` | `membership_frozen` | QR check-in attempted on frozen membership |
| `429` | `rate_limit_exceeded` | Too many requests — see Rate Limiting |
| `500` | `internal_error` | Unexpected server error |
| `503` | `service_unavailable` | Maintenance or outage |

**Error Response Example:**
```json
{
  "error": "validation_error",
  "message": "The 'amount' field must be a positive number.",
  "field": "amount",
  "request_id": "req_01JF8XKPQR4MVWZ"
}
```

---

## 6. Rate Limiting

| Tier | Limit | Window |
|---|---|---|
| Default | 300 requests | per minute |
| Auth endpoints | 20 requests | per minute |
| Exports | 10 requests | per hour |

**Rate Limit Headers:**
```
X-RateLimit-Limit: 300
X-RateLimit-Remaining: 247
X-RateLimit-Reset: 1730368200
```

When the limit is exceeded, the API returns `429 Too Many Requests`.

---

## 7. Pagination

All list endpoints support cursor-based and offset pagination.

**Offset Pagination (default):**
```
GET /crm/members?limit=50&offset=100
```

**Response includes:**
```json
{
  "total": 512,
  "limit": 50,
  "offset": 100,
  "has_more": true,
  "data": [...]
}
```

**Sort Order:**
- Prefix field with `-` for descending: `sort=-created_date`
- Ascending: `sort=name`

---

## Quick Reference

### CRM Endpoints Summary

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/crm/members` | List members |
| `GET` | `/crm/members/:id` | Get member |
| `POST` | `/crm/members` | Create member |
| `PATCH` | `/crm/members/:id` | Update member |
| `POST` | `/crm/members/:id/rotate-qr` | Rotate QR token |
| `POST` | `/crm/members/:id/interactions` | Log CRM note |
| `GET` | `/crm/plans` | List plans |
| `POST` | `/crm/plans` | Create plan |
| `GET` | `/crm/transactions` | List transactions |
| `POST` | `/crm/transactions` | Record transaction |
| `GET` | `/crm/wallet/balance` | Wallet balance |
| `GET` | `/crm/wallet/transactions` | Wallet history |
| `POST` | `/crm/wallet/withdraw` | Request withdrawal |
| `GET` | `/crm/attendance` | Attendance records |
| `POST` | `/crm/attendance/check-in` | Record check-in |
| `GET` | `/crm/trainers` | List trainers |

### Super Admin Endpoints Summary

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/admin/gyms` | List all gyms |
| `GET` | `/admin/gyms/:id` | Gym full detail |
| `PATCH` | `/admin/gyms/:id` | Update gym |
| `POST` | `/admin/gyms/:id/verify` | Toggle blue tick |
| `GET` | `/admin/approvals` | Approval queue |
| `POST` | `/admin/approvals/:id/review` | Start review |
| `POST` | `/admin/approvals/:id/approve` | Approve gym |
| `POST` | `/admin/approvals/:id/reject` | Reject gym |
| `GET` | `/admin/users` | All users |
| `GET` | `/admin/gyms/:id/staff` | Gym staff |
| `GET` | `/admin/gyms/:id/wallet` | Gym wallet |
| `POST` | `/admin/gyms/:id/wallet/settle` | Trigger settlement |
| `GET` | `/admin/finance` | Finance records |
| `GET` | `/admin/finance/summary` | Revenue summary |
| `GET` | `/admin/audit` | Audit log |
| `GET` | `/admin/roles` | Role definitions |

---

*© 2026 Fitaval. All rights reserved. This documentation is for authorized integrators only.*

