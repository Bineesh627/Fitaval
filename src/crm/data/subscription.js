/**
 * ==============================================================================
 * Fitaval CRM — Software Subscription Catalog & Mock Data
 * ==============================================================================
 */

export const BILLING_CYCLES = [
  { id: "monthly", label: "Monthly", months: 1 },
  { id: "yearly", label: "Yearly", months: 12, note: "2 months free" },
];

export const YEARLY_MULTIPLIER = 10;

export const CRM_PLANS = [
  {
    id: "crm_starter",
    name: "Starter",
    tagline: "For a single small gym getting organised",
    monthly_price: 999,
    limits: { members: 100, staff: 3 },
    features: [
      "Up to 100 members",
      "Up to 3 trainers & staff",
      "Membership plans & renewals",
      "Finance income & expense tracking",
      "Email support",
    ],
  },
  {
    id: "crm_growth",
    name: "Growth",
    tagline: "For busy gyms with a growing team",
    monthly_price: 2499,
    popular: true,
    limits: { members: 500, staff: 10 },
    features: [
      "Up to 500 members",
      "Up to 10 trainers & staff",
      "Staff attendance tracking",
      "Excel export for finance",
      "Fitaval Wallet & settlements",
      "Priority chat support",
    ],
  },
  {
    id: "crm_pro",
    name: "Pro",
    tagline: "For premium clubs that want no limits",
    monthly_price: 4999,
    limits: { members: null, staff: null },
    features: [
      "Unlimited members",
      "Unlimited trainers & staff",
      "Everything in Growth",
      "Advanced reports & analytics",
      "Dedicated account manager",
      "Phone support",
    ],
  },
];

export const SUBSCRIPTION_STATUS_META = {
  active: { label: "Active", badge: "green" },
  trialing: { label: "Free Trial", badge: "amber" },
  cancelled: { label: "Cancelled", badge: "red" },
};

export const SUBSCRIPTION_PAYMENT_METHODS = [
  { value: "upi", label: "UPI" },
  { value: "card", label: "Credit / Debit Card" },
  { value: "netbanking", label: "Net Banking" },
];

export function getCrmPlan(id) {
  return CRM_PLANS.find((p) => p.id === id) || CRM_PLANS[0];
}

export function planPrice(plan, cycle) {
  return cycle === "yearly" ? plan.monthly_price * YEARLY_MULTIPLIER : plan.monthly_price;
}

export const MOCK_SUBSCRIPTION = {
  id: "sub_1",
  plan_id: "crm_growth",
  billing_cycle: "monthly",
  status: "active",
  auto_renew: true,
  started_on: "2026-07-28",
  current_period_start: "2026-10-26",
  current_period_end: "2026-11-25",
  payment_method: "upi",
  last_payment_date: "2026-10-26",
  next_billing_date: "2026-11-25",
  amount: 2499,
  invoices: [
    { id: "inv_3", date: "2026-10-26", amount: 2499, status: "paid", cycle: "Monthly", plan: "Growth", pdf: "#" },
    { id: "inv_2", date: "2026-09-26", amount: 2499, status: "paid", cycle: "Monthly", plan: "Growth", pdf: "#" },
    { id: "inv_1", date: "2026-08-26", amount: 2499, status: "paid", cycle: "Monthly", plan: "Growth", pdf: "#" },
  ],
};
