import {
  Home,
  Users,
  Wallet,
  Dumbbell,
  Settings,
  Building2,
  Tag,
  Crown,
  Sun,
  Moon,
  Laptop,
} from "lucide-react";

/**
 * Main application navigation items for desktop sidebar & mobile bottom bar
 */
export const NAV_ITEMS = [
  { to: "/", label: "Home", icon: Home, end: true },
  { to: "/members", label: "Members", icon: Users },
  { to: "/finance", label: "Finance", icon: Wallet },
  { to: "/staff", label: "Staff", icon: Dumbbell },
  { to: "/settings", label: "Settings", icon: Settings },
];

/**
 * Settings / More page navigation items
 */
export const SETTINGS_MENU_ITEMS = [
  {
    to: "/gym-profile",
    label: "Gym Profile",
    desc: "Logo, address, services & amenities, gallery",
    icon: Building2,
    color: "bg-primary/10 text-primary",
  },
  {
    to: "/plans",
    label: "Plans",
    desc: "Membership packages, pricing & durations",
    icon: Tag,
    color: "bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400",
  },
  {
    to: "/subscription",
    label: "Subscription",
    desc: "Your Fitaval CRM plan, usage, billing & invoices",
    icon: Crown,
    color: "bg-violet-100 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400",
  },
  {
    to: "/wallet",
    label: "Fitaval Wallet",
    desc: "B2C revenue, settlements & withdrawals",
    icon: Wallet,
    color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
  },
];

/**
 * Theme mode options for settings
 */
export const THEME_OPTIONS = [
  { id: "light", label: "White / Light", icon: Sun },
  { id: "dark", label: "Dark Mode", icon: Moon },
  { id: "system", label: "System", icon: Laptop },
];

/**
 * Dashboard cash flow chart timeframe ranges
 */
export const CASH_FLOW_RANGES = [
  { id: "week", label: "Week" },
  { id: "monthly", label: "Monthly" },
  { id: "yearly", label: "Yearly" },
];
