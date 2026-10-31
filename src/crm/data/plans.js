/**
 * ==============================================================================
 * Fitaval CRM — Plans UI Constants & Mock Data
 * ==============================================================================
 */

export const DURATION_UNITS = [
  { unit: "Days", multiplier: 1 },
  { unit: "Weeks", multiplier: 7 },
  { unit: "Months", multiplier: 30 },
  { unit: "Years", multiplier: 365 },
];

export const PLAN_STATUS_FILTERS = [
  { id: "all", label: "All Plans" },
  { id: "active", label: "Active" },
  { id: "inactive", label: "Inactive" },
];

export const POPULAR_PLAN_BENEFITS = [
  {
    title: "Gym floor & cardio zone access",
    description: "Unlimited daily access to strength and cardio equipment",
  },
  {
    title: "Free locker and shower usage",
    description: "Day locker allocation and clean shower amenities",
  },
  {
    title: "Fitness evaluation & body scan",
    description: "1 free initial body composition and BMI assessment",
  },
  {
    title: "Access to group fitness classes",
    description: "HIIT, Yoga, and Zumba community sessions included",
  },
  {
    title: "Steam & sauna recovery access",
    description: "Complimentary access to steam room and sauna recovery",
  },
  {
    title: "Personal training voucher",
    description: "Discount voucher for 1-on-1 personal coaching sessions",
  },
];

export const MOCK_PLANS = [
  {
    id: "plan_1",
    name: "Monthly Basic",
    duration_days: 30,
    duration_value: 1,
    duration_unit: "Months",
    price: 1499,
    benefits: JSON.stringify([
      { title: "Gym floor access", description: "Standard cardio and free weights floor access" },
      { title: "Standard locker use", description: "Day locker usage during workout sessions" },
      { title: "Fitness evaluation", description: "1 free initial fitness and BMI assessment" },
    ]),
    is_active: true,
    created_date: "2026-09-01",
  },
  {
    id: "plan_2",
    name: "Quarterly Pro",
    duration_days: 90,
    duration_value: 3,
    duration_unit: "Months",
    price: 3999,
    benefits: JSON.stringify([
      { title: "Gym floor access", description: "Full daily cardio, strength & functional area access" },
      { title: "Steam & sauna recovery", description: "Access to post-workout steam and sauna zone" },
      { title: "2 Personal training sessions", description: "Two 1-on-1 guided sessions with senior coach" },
      { title: "Diet consultation", description: "Personalized nutrition plan from certified nutritionist" },
    ]),
    is_active: true,
    created_date: "2026-09-11",
  },
  {
    id: "plan_3",
    name: "Annual Elite",
    duration_days: 365,
    duration_value: 1,
    duration_unit: "Years",
    price: 11999,
    benefits: JSON.stringify([
      { title: "Unlimited gym access", description: "Priority access 7 days a week with zero peak hour limits" },
      { title: "All group fitness classes", description: "Unlimited access to HIIT, Yoga, and Zumba schedules" },
      { title: "Monthly nutritionist consult", description: "Monthly progress review and meal plan adjustments" },
      { title: "Free Fitaval starter kit", description: "Branded gym duffel bag, shaker bottle, and workout towel" },
    ]),
    is_active: true,
    created_date: "2026-09-21",
  },
  {
    id: "plan_4",
    name: "VIP All-Access",
    duration_days: 365,
    duration_value: 365,
    duration_unit: "Days",
    price: 18999,
    benefits: JSON.stringify([
      { title: "24/7 Priority access", description: "All-hours digital gym access including public holidays" },
      { title: "Reserved locker", description: "Permanent dedicated personal locker with lock" },
      { title: "Weekly 1-on-1 PT", description: "1 private personal training hour every week" },
      { title: "VIP lounge access", description: "Free recovery drinks, protein shakes, and relaxation lounge" },
      { title: "5 Guest passes", description: "Bring a workout partner 5 times across membership cycle" },
    ]),
    is_active: true,
    created_date: "2026-10-01",
  },
];
