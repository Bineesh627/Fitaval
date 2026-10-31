/**
 * Days of the week list with keys and labels
 */
export const DAYS_OF_WEEK = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" },
];

/**
 * Default gym operating schedule across the week
 */
export const DEFAULT_WEEK_SCHEDULE = {
  monday: { enabled: true, open: "5:30 AM", close: "10:30 PM" },
  tuesday: { enabled: true, open: "5:30 AM", close: "10:30 PM" },
  wednesday: { enabled: true, open: "5:30 AM", close: "10:30 PM" },
  thursday: { enabled: true, open: "5:30 AM", close: "10:30 PM" },
  friday: { enabled: true, open: "5:30 AM", close: "10:30 PM" },
  saturday: { enabled: true, open: "5:30 AM", close: "10:30 PM" },
  sunday: { enabled: false, open: "7:00 AM", close: "8:00 PM" },
};

/**
 * Default trainer operating schedule across the week
 */
export const DEFAULT_TRAINER_SCHEDULE = {
  monday: { enabled: true, open: "06:00 AM", close: "02:00 PM" },
  tuesday: { enabled: true, open: "06:00 AM", close: "02:00 PM" },
  wednesday: { enabled: true, open: "06:00 AM", close: "02:00 PM" },
  thursday: { enabled: true, open: "06:00 AM", close: "02:00 PM" },
  friday: { enabled: true, open: "06:00 AM", close: "02:00 PM" },
  saturday: { enabled: false, open: "06:00 AM", close: "02:00 PM" },
  sunday: { enabled: false, open: "06:00 AM", close: "02:00 PM" },
};

/**
 * Format weekly schedule into a human-readable summary string
 */
export function formatWeeklyScheduleSummary(schedule) {
  if (!schedule) return "Monday – Saturday: 5:30 AM – 10:30 PM | Sunday: Closed";
  const weekdaysOpen = ["monday", "tuesday", "wednesday", "thursday", "friday"].every(
    (k) =>
      schedule[k]?.enabled &&
      schedule[k]?.open === schedule.monday?.open &&
      schedule[k]?.close === schedule.monday?.close
  );
  if (
    weekdaysOpen &&
    schedule.saturday?.enabled &&
    schedule.saturday?.open === schedule.monday?.open
  ) {
    const sun = schedule.sunday?.enabled
      ? `Sunday: ${schedule.sunday.open} – ${schedule.sunday.close}`
      : "Sunday: Closed";
    return `Mon – Sat: ${schedule.monday.open} – ${schedule.monday.close} | ${sun}`;
  }
  return "Custom weekly operating schedule configured";
}
