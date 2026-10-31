# Fitaval CRM — API Documentation

> **Version:** 1.0.0
> **Base URL:** `https://api.fitaval.com/v1`
> **Auth:** `Authorization: Bearer <token>` (JWT)
> **Content-Type:** `application/json`
> **Scope:** Gym-level operations — all endpoints are automatically scoped to the `gym_id` embedded in the Bearer token.

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [Members](#2-members)
3. [Membership Plans](#3-membership-plans)
4. [Subscriptions](#4-subscriptions)
5. [Transactions](#5-transactions)
6. [Wallet](#6-wallet)
7. [Attendance & Check-ins](#7-attendance--check-ins)
8. [Trainers](#8-trainers)
9. [CRM Interactions](#9-crm-interactions)
10. [Webhooks](#10-webhooks)
11. [Error Codes](#11-error-codes)
12. [Rate Limiting](#12-rate-limiting)
13. [Pagination](#13-pagination)
14. [Quick Reference](#14-quick-reference)

---

## 1. Authentication

### `POST /auth/login/`
Authenticate a gym staff member and receive JWT access and refresh tokens.

**Request Body:**
```json
{
  "email": "owner@mygym.com",
  "password": "your_password",
  "role": "crm"
}
```

> `role` must be `crm` for CRM access. Other values: `admin`, `super_admin`.

**Response `200 OK`:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4...",
  "expires_in": 3600,
  "user": {
    "id": "usr_01",
    "name": "Anand Menon",
    "email": "owner@mygym.com",
    "role": "Branch Manager",
    "gym_id": "GYM-KCH-001"
  }
}
```

---

### `POST /auth/register/`
Gym owner registration to request an onboarding verification OTP.

**Request Body:**
```json
{
  "email": "owner@mygym.com",
  "password": "secure_password",
  "gym_name": "Olympus Fitness",
  "full_name": "Anand Menon",
  "role": "crm"
}
```

**Response `201 Created` / `200 OK`:**
```json
{
  "status": "pending_verification",
  "message": "6-digit OTP dispatched to email."
}
```

---

### `POST /auth/verify-otp/`
Verify email onboarding code and establish the gym owner's session.

**Request Body:**
```json
{
  "email": "owner@mygym.com",
  "otp": "492019"
}
```

**Response `200 OK`:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4...",
  "user": {
    "id": "usr_01",
    "name": "Anand Menon",
    "email": "owner@mygym.com",
    "role": "crm"
  }
}
```

---

### `POST /auth/token/refresh/`
Standard DRF SimpleJWT token refresh rotation endpoint. Handled automatically by `httpClient.js` on 401 Unauthorized.

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
  "refresh": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4..."
}
```

---

### `POST /auth/password/reset/`
Trigger a password reset email for an existing gym account.

**Request Body:**
```json
{
  "email": "owner@mygym.com"
}
```

**Response `200 OK`:**
```json
{
  "status": "success",
  "message": "Password reset instructions sent."
}
```

---

### `POST /auth/password/reset/confirm/`
Confirm password update with the reset token.

**Request Body:**
```json
{
  "token": "reset_token_from_email",
  "password": "new_secure_password"
}
```

**Response `200 OK`:**
```json
{
  "status": "success",
  "message": "Password successfully updated."
}
```

---

### `POST /auth/logout/`
Invalidate the current access and refresh tokens.

**Headers:** `Authorization: Bearer <token>`

**Response `204 No Content`**

---

## 2. Members

### `GET /crm/members`
List all members for the authenticated gym.

**Query Parameters:**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `status` | string | — | `Active` · `Expired` · `Frozen` |
| `plan` | string | — | Filter by plan name |
| `branch` | string | — | Filter by branch ID |
| `q` | string | — | Full-text search on name or phone |
| `sort` | string | `-created_date` | Prefix `-` for descending |
| `limit` | integer | 50 | Max 200 |
| `offset` | integer | 0 | Pagination offset |

**Response `200 OK`:**
```json
{
  "total": 512,
  "limit": 50,
  "offset": 0,
  "has_more": true,
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
      "last_visit": "28 Oct 2026",
      "qr_token": "FTV-KCH-0001-A1B2C3",
      "created_date": "2025-01-15T10:30:00Z"
    }
  ]
}
```

---

### `GET /crm/members/:id`
Retrieve a single member's full profile including CRM history.

**Path Parameter:** `id` — Member ID (e.g. `MBR-0001`)

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
  "last_visit": "28 Oct 2026",
  "qr_token": "FTV-KCH-0001-A1B2C3",
  "crm_notes": [
    {
      "id": "crm-1001",
      "channel": "Phone Call",
      "by": "Meena Thomas",
      "note": "Called to check renewal intent. Member confirmed upgrade to Premium.",
      "when": "28 Oct 2026, 10:30 AM",
      "follow_up": "2026-11-05",
      "created_at": "2026-10-28T10:30:00Z"
    }
  ]
}
```

**Response `404 Not Found`:**
```json
{ "error": "not_found", "message": "Member MBR-0001 not found." }
```

---

### `POST /crm/members`
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

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | ✅ | Full name |
| `phone` | string | ✅ | Must be unique within the gym |
| `email` | string | — | Optional |
| `gender` | string | — | `Male` · `Female` · `Other` |
| `dob` | date | — | ISO 8601 (YYYY-MM-DD) |
| `plan_id` | string | ✅ | ID from `/crm/plans` |
| `branch` | string | ✅ | Branch ID |
| `start_date` | date | ✅ | Membership start date |

**Response `201 Created`:**
```json
{
  "id": "MBR-0513",
  "qr_token": "FTV-KCH-0513-D4E5F6",
  "message": "Member registered successfully."
}
```

**Response `409 Conflict` (duplicate phone):**
```json
{
  "error": "conflict",
  "message": "A member with phone +91 90000 11111 already exists in this gym."
}
```

---

### `PATCH /crm/members/:id`
Update a member's details or membership status. Only include fields you want to change.

**Request Body (partial):**
```json
{
  "status": "Frozen",
  "plan": "Basic",
  "email": "priya.new@example.com"
}
```

> Freezing a membership prevents QR check-in immediately.

**Response `200 OK`:**
```json
{
  "id": "MBR-0513",
  "status": "Frozen",
  "updated_at": "2026-10-31T11:00:00Z"
}
```

---

### `POST /crm/members/:id/rotate-qr`
Rotate the member's QR token. The old token is **immediately** invalidated at all turnstiles.

> **Permission required:** `freeze_members`

**Response `200 OK`:**
```json
{
  "member_id": "MBR-0001",
  "old_token": "FTV-KCH-0001-A1B2C3",
  "new_token": "FTV-KCH-0001-X9Y8Z7",
  "rotated_at": "2026-10-31T10:00:00Z",
  "message": "QR token rotated. Old token is now invalid."
}
```

---

## 3. Membership Plans

### `GET /crm/plans`
List all membership plans for the gym.

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
      "member_count": 142,
      "created_date": "2025-01-01T00:00:00Z"
    },
    {
      "id": "plan_basic",
      "name": "Basic",
      "duration_days": 30,
      "price": 1500,
      "features": ["Gym access", "Locker"],
      "active": true,
      "member_count": 289,
      "created_date": "2025-01-01T00:00:00Z"
    }
  ]
}
```

---

### `POST /crm/plans`
Create a new membership plan.

**Request Body:**
```json
{
  "name": "Gold",
  "duration_days": 180,
  "price": 7500,
  "features": ["Unlimited access", "Group classes", "2 Personal training sessions"],
  "active": true
}
```

**Response `201 Created`:**
```json
{
  "id": "plan_gold",
  "name": "Gold",
  "message": "Plan created successfully."
}
```

---

### `PATCH /crm/plans/:id`
Update an existing plan. Does not affect active memberships using this plan.

**Request Body (partial):**
```json
{
  "price": 8000,
  "features": ["Unlimited access", "Group classes", "3 Personal training sessions"]
}
```

---

### `DELETE /crm/plans/:id`
Soft-deactivate a plan. Existing active memberships are unaffected; the plan can no longer be assigned to new members.

**Response `200 OK`:**
```json
{
  "id": "plan_gold",
  "active": false,
  "message": "Plan deactivated. 23 existing memberships remain unaffected."
}
```

---

## 4. Subscriptions

### `GET /crm/subscriptions`
List all active and historical subscriptions.

**Query Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `member_id` | string | Filter by member |
| `plan_id` | string | Filter by plan |
| `status` | string | `Active` · `Expired` · `Frozen` |
| `sort` | string | Default: `-start_date` |
| `limit` | integer | Max 200 |

**Response `200 OK`:**
```json
{
  "total": 620,
  "data": [
    {
      "id": "sub_001",
      "member_id": "MBR-0001",
      "member_name": "Arjun Sharma",
      "plan_id": "plan_premium",
      "plan_name": "Premium",
      "start_date": "2025-01-15",
      "end_date": "2026-01-15",
      "status": "Active",
      "amount_paid": 12000,
      "payment_method": "UPI",
      "created_at": "2025-01-15T09:00:00Z"
    }
  ]
}
```

---

### `POST /crm/subscriptions`
Create a new subscription — for new enrollment or renewal.

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

| Field | Type | Required | Description |
|---|---|---|---|
| `member_id` | string | ✅ | Existing member ID |
| `plan_id` | string | ✅ | Plan to subscribe to |
| `start_date` | date | ✅ | ISO 8601 |
| `payment_method` | string | ✅ | `UPI` · `Card` · `Cash` · `Bank Transfer` |
| `amount_paid` | integer | ✅ | Amount in paise (INR) |

**Response `201 Created`:**
```json
{
  "id": "sub_089",
  "member_id": "MBR-0001",
  "plan_name": "Premium",
  "start_date": "2026-01-16",
  "end_date": "2027-01-16",
  "status": "Active",
  "message": "Subscription created successfully."
}
```

---

## 5. Transactions

### `GET /crm/transactions`
List all income and expense transactions for the gym.

**Query Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `type` | string | `income` · `expense` |
| `category` | string | e.g. `Membership`, `Personal Training`, `Equipment`, `Salaries` |
| `member_id` | string | Filter by member |
| `date_from` | date | ISO 8601 (`YYYY-MM-DD`) |
| `date_to` | date | ISO 8601 |
| `sort` | string | Default: `-date` |
| `limit` | integer | Max 200 |
| `offset` | integer | Default: 0 |

**Response `200 OK`:**
```json
{
  "total": 2340,
  "summary": {
    "total_income": 1850000,
    "total_expenses": 420000,
    "net": 1430000
  },
  "data": [
    {
      "id": "txn_001",
      "type": "income",
      "category": "Membership",
      "description": "Premium renewal — Arjun Sharma",
      "amount": 12000,
      "date": "2026-10-28",
      "member_id": "MBR-0001",
      "payment_method": "UPI",
      "created_at": "2026-10-28T10:00:00Z"
    }
  ]
}
```

---

### `POST /crm/transactions`
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

| Field | Type | Required | Description |
|---|---|---|---|
| `type` | string | ✅ | `income` or `expense` |
| `category` | string | ✅ | Transaction category |
| `description` | string | ✅ | Human-readable label |
| `amount` | integer | ✅ | Amount in INR (₹) |
| `date` | date | ✅ | ISO 8601 |
| `member_id` | string | — | Required for membership income |
| `payment_method` | string | — | `UPI` · `Card` · `Cash` · `Bank Transfer` |

**Response `201 Created`:**
```json
{
  "id": "txn_892",
  "type": "income",
  "amount": 7500,
  "created_at": "2026-11-01T09:30:00Z"
}
```

---

## 6. Wallet

The Fitaval Wallet holds B2C membership revenue collected via the member-facing app, and allows gym owners to request settlement withdrawals.

### `GET /crm/wallet/balance`
Get the current wallet balance and summary.

**Response `200 OK`:**
```json
{
  "balance": 84500,
  "total_earned": 125000,
  "total_withdrawn": 40500,
  "status": "Active",
  "pending_withdrawals": 0,
  "last_withdrawal": "2026-10-15",
  "updated_at": "2026-10-31T10:00:00Z"
}
```

---

### `GET /crm/wallet/transactions`
List wallet transaction history.

**Query Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `type` | string | `credit` · `debit` · `withdrawal` |
| `status` | string | `completed` · `pending` · `failed` |
| `date_from` | date | ISO 8601 |
| `date_to` | date | ISO 8601 |
| `sort` | string | Default: `-date` |
| `limit` | integer | Max 100 |

**Response `200 OK`:**
```json
{
  "total": 48,
  "data": [
    {
      "id": "wtxn_001",
      "type": "credit",
      "amount": 12000,
      "description": "B2C Membership — Premium Plan (Arjun Sharma)",
      "date": "2026-10-28",
      "status": "completed",
      "created_at": "2026-10-28T18:00:00Z"
    },
    {
      "id": "wtxn_002",
      "type": "withdrawal",
      "amount": 20000,
      "description": "Monthly settlement — October",
      "date": "2026-10-15",
      "status": "completed",
      "created_at": "2026-10-15T10:00:00Z"
    }
  ]
}
```

---

### `POST /crm/wallet/withdraw`
Request a settlement withdrawal from the wallet.

**Request Body:**
```json
{
  "amount": 20000,
  "bank_account_id": "bacc_001",
  "note": "Monthly settlement — October"
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `amount` | integer | ✅ | Must be ≤ current balance |
| `bank_account_id` | string | ✅ | Pre-registered bank account |
| `note` | string | — | Internal reference note |

**Response `202 Accepted`:**
```json
{
  "withdrawal_id": "wdrl_002",
  "amount": 20000,
  "status": "pending",
  "estimated_credit": "2026-11-03",
  "message": "Withdrawal initiated. Funds will be credited within 2–3 business days."
}
```

**Response `422 Unprocessable Entity` (insufficient balance):**
```json
{
  "error": "insufficient_balance",
  "message": "Requested ₹20,000 but available balance is ₹8,450.",
  "available_balance": 8450
}
```

---

## 7. Attendance & Check-ins

### `GET /crm/attendance`
List check-in records for the gym.

**Query Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `member_id` | string | Filter by member |
| `branch` | string | Branch ID |
| `date_from` | date | ISO 8601 |
| `date_to` | date | ISO 8601 |
| `sort` | string | Default: `-checked_in_at` |
| `limit` | integer | Max 500 |

**Response `200 OK`:**
```json
{
  "total": 8920,
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

---

### `POST /crm/attendance/check-in`
Record a member check-in via QR scan. Called from the scanner at the gym entrance.

**Request Body:**
```json
{
  "qr_token": "FTV-KCH-0001-A1B2C3",
  "branch": "kochi"
}
```

**Response `200 OK` (successful check-in):**
```json
{
  "check_in_id": "att_892",
  "member_id": "MBR-0001",
  "member_name": "Arjun Sharma",
  "plan": "Premium",
  "status": "Active",
  "days_left": 76,
  "total_visits": 143,
  "checked_in_at": "2026-10-31T07:45:00Z"
}
```

**Response `403 Forbidden` — expired membership:**
```json
{
  "error": "membership_expired",
  "member_id": "MBR-0205",
  "member_name": "Rekha Pillai",
  "message": "Membership expired on 15 Sep 2026. Please renew at the front desk."
}
```

**Response `403 Forbidden` — frozen membership:**
```json
{
  "error": "membership_frozen",
  "member_id": "MBR-0312",
  "member_name": "Suresh Kumar",
  "message": "Membership is currently frozen. Contact the front desk."
}
```

**Response `404 Not Found` — invalid token:**
```json
{
  "error": "invalid_token",
  "message": "QR token FTV-KCH-0001-XXXXXX is not valid or has been rotated."
}
```

---

## 8. Trainers

### `GET /crm/trainers`
List all trainers for the gym.

**Query Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `active` | boolean | `true` · `false` |
| `q` | string | Search by name or specialization |

**Response `200 OK`:**
```json
{
  "data": [
    {
      "id": "trn_001",
      "name": "Ravi Kumar",
      "phone": "+91 97777 22222",
      "email": "ravi@mygym.com",
      "experience_years": 8,
      "specializations": ["Strength Training", "HIIT", "CrossFit"],
      "certifications": "ACE, NASM",
      "clients": 34,
      "active": true,
      "bio": "Expert strength and conditioning coach with 8 years experience.",
      "hours": "Mon–Sat · 6 AM–2 PM",
      "created_at": "2024-06-01T00:00:00Z"
    }
  ]
}
```

---

### `GET /crm/trainers/:id`
Get a single trainer's full profile.

---

### `POST /crm/trainers`
Add a new trainer to the gym.

**Request Body:**
```json
{
  "name": "Deepa Menon",
  "phone": "+91 96000 77000",
  "email": "deepa@mygym.com",
  "experience_years": 5,
  "specializations": ["Yoga", "Pilates"],
  "certifications": "RYT-200",
  "bio": "Certified Yoga and Pilates instructor.",
  "hours": "Mon–Fri · 8 AM–4 PM"
}
```

**Response `201 Created`:**
```json
{
  "id": "trn_007",
  "name": "Deepa Menon",
  "message": "Trainer added successfully."
}
```

---

### `PATCH /crm/trainers/:id`
Update trainer details.

**Request Body (partial):**
```json
{
  "specializations": ["Yoga", "Pilates", "Meditation"],
  "active": false
}
```

---

### `DELETE /crm/trainers/:id`
Deactivate a trainer (`active: false`). Their profile is retained for audit history.

---

## 9. CRM Interactions

Log and retrieve member communication history (phone calls, WhatsApp, emails, in-person conversations).

### `GET /crm/members/:id/interactions`
List all CRM interaction notes for a member, newest first.

**Response `200 OK`:**
```json
{
  "total": 12,
  "data": [
    {
      "id": "crm-1001",
      "channel": "Phone Call",
      "by": "Meena Thomas",
      "note": "Member confirmed renewal intent for January. Interested in upgrading to Premium.",
      "when": "28 Oct 2026, 10:30 AM",
      "follow_up": "2026-11-05",
      "created_at": "2026-10-28T10:30:00Z"
    },
    {
      "id": "crm-0998",
      "channel": "WhatsApp",
      "by": "Anand Menon",
      "note": "Sent renewal reminder with new plan pricing.",
      "when": "20 Oct 2026, 3:15 PM",
      "follow_up": null,
      "created_at": "2026-10-20T15:15:00Z"
    }
  ]
}
```

---

### `POST /crm/members/:id/interactions`
Log a new CRM interaction note.

**Request Body:**
```json
{
  "channel": "WhatsApp",
  "note": "Sent renewal reminder. Member is interested in upgrading to Premium next month.",
  "follow_up": "2026-11-10"
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `channel` | string | ✅ | See channel list below |
| `note` | string | ✅ | Summary of the interaction |
| `follow_up` | date | — | ISO 8601 date for follow-up reminder |

**Available channels:**

| Value | Description |
|---|---|
| `Phone Call` | Voice call |
| `WhatsApp` | WhatsApp message |
| `Email` | Email communication |
| `In-Person` | Face-to-face at the gym |
| `SMS` | Text message |

**Response `201 Created`:**
```json
{
  "id": "crm-1002",
  "member_id": "MBR-0001",
  "channel": "WhatsApp",
  "follow_up": "2026-11-10",
  "created_at": "2026-10-31T11:00:00Z"
}
```

---

## 10. Webhooks

Register a webhook URL to receive real-time events from the Fitaval CRM.

### `POST /webhooks`
Register a new webhook endpoint.

```json
{
  "url": "https://yourapp.com/webhooks/fitaval",
  "events": ["member.created", "member.expired", "check_in.completed"],
  "secret": "your_webhook_signing_secret"
}
```

### CRM Webhook Events

| Event | Trigger |
|---|---|
| `member.created` | New member registered |
| `member.renewed` | Membership renewed |
| `member.expired` | Membership expired |
| `member.frozen` | Membership frozen/unfrozen |
| `member.qr_rotated` | QR token rotated |
| `check_in.completed` | Successful QR check-in |
| `check_in.denied` | Check-in denied (expired/frozen/invalid) |
| `transaction.created` | New income/expense recorded |
| `wallet.credited` | Wallet credited from B2C purchase |
| `wallet.withdrawal_requested` | Withdrawal request initiated |
| `wallet.settled` | Withdrawal settlement completed |

### Webhook Payload

```json
{
  "event": "member.created",
  "gym_id": "GYM-KCH-001",
  "timestamp": "2026-10-31T10:30:00Z",
  "data": {
    "id": "MBR-0513",
    "name": "Priya Nair",
    "plan": "Premium",
    "branch": "kochi"
  }
}
```

### Signature Verification

Every request includes `X-Fitaval-Signature`. Verify with HMAC-SHA256:

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

## 11. Error Codes

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
| `400` | `validation_error` | Request body or query params failed validation |
| `401` | `unauthorized` | Missing or invalid Bearer token |
| `403` | `forbidden` | Insufficient role/permission for this action |
| `403` | `membership_expired` | Check-in denied — membership has expired |
| `403` | `membership_frozen` | Check-in denied — membership is frozen |
| `404` | `not_found` | Resource not found |
| `404` | `invalid_token` | QR token not found or already rotated |
| `409` | `conflict` | Duplicate record (e.g. phone number already registered) |
| `422` | `insufficient_balance` | Withdrawal amount exceeds wallet balance |
| `429` | `rate_limit_exceeded` | Too many requests |
| `500` | `internal_error` | Unexpected server error |
| `503` | `service_unavailable` | Maintenance or outage |

---

## 12. Rate Limiting

| Tier | Limit | Window |
|---|---|---|
| Default API calls | 300 requests | per minute |
| Auth (`/auth/*`) | 20 requests | per minute |
| Data exports | 10 requests | per hour |

**Rate limit headers on every response:**
```
X-RateLimit-Limit: 300
X-RateLimit-Remaining: 247
X-RateLimit-Reset: 1730368200
Retry-After: 18
```

---

## 13. Pagination

All list endpoints use offset-based pagination.

```
GET /crm/members?limit=50&offset=100
```

**Response envelope:**
```json
{
  "total": 512,
  "limit": 50,
  "offset": 100,
  "has_more": true,
  "data": [...]
}
```

**Sort:** prefix a field name with `-` for descending, no prefix for ascending.
```
sort=-created_date   → newest first
sort=name            → A → Z
```

---

## 14. Quick Reference

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/auth/login` | Login | — |
| `POST` | `/auth/refresh` | Refresh token | — |
| `POST` | `/auth/logout` | Logout | ✅ |
| `GET` | `/crm/members` | List members | ✅ |
| `GET` | `/crm/members/:id` | Get member | ✅ |
| `POST` | `/crm/members` | Register member | ✅ |
| `PATCH` | `/crm/members/:id` | Update member | ✅ |
| `POST` | `/crm/members/:id/rotate-qr` | Rotate QR | ✅ `freeze_members` |
| `GET` | `/crm/members/:id/interactions` | CRM history | ✅ |
| `POST` | `/crm/members/:id/interactions` | Log CRM note | ✅ |
| `GET` | `/crm/plans` | List plans | ✅ |
| `POST` | `/crm/plans` | Create plan | ✅ |
| `PATCH` | `/crm/plans/:id` | Update plan | ✅ |
| `DELETE` | `/crm/plans/:id` | Deactivate plan | ✅ |
| `GET` | `/crm/subscriptions` | List subscriptions | ✅ |
| `POST` | `/crm/subscriptions` | Create subscription | ✅ |
| `GET` | `/crm/transactions` | List transactions | ✅ |
| `POST` | `/crm/transactions` | Record transaction | ✅ |
| `GET` | `/crm/wallet/balance` | Wallet balance | ✅ |
| `GET` | `/crm/wallet/transactions` | Wallet history | ✅ |
| `POST` | `/crm/wallet/withdraw` | Request withdrawal | ✅ |
| `GET` | `/crm/attendance` | Check-in records | ✅ |
| `POST` | `/crm/attendance/check-in` | Record check-in | ✅ |
| `GET` | `/crm/trainers` | List trainers | ✅ |
| `GET` | `/crm/trainers/:id` | Get trainer | ✅ |
| `POST` | `/crm/trainers` | Add trainer | ✅ |
| `PATCH` | `/crm/trainers/:id` | Update trainer | ✅ |
| `DELETE` | `/crm/trainers/:id` | Deactivate trainer | ✅ |
| `POST` | `/webhooks` | Register webhook | ✅ |

---

*© 2026 Fitaval · CRM API v1.0.0 · For authorized integrators only.*

