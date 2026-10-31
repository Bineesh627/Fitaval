# Fitaval — Design System & Style Guide

> **The Visual Dictionary:** Comprehensive documentation of UI component styles, color systems, typography, grid layouts, and interactive component states across the Fitaval CRM and Admin Panel.

---

## 1. Design Principles

Fitaval delivers a high-density, mission-critical interface for fitness businesses:

1. **Information Density with Breathing Room:** Clean whitespace, clear tabular numbers, and consistent padding hierarchy prevent visual fatigue.
2. **Role-Tailored Aesthetics:**
   - **CRM (Gym Owner):** Clean, inviting, high-clarity interface with signature emerald greens, neutral cards, and mobile-responsive drawer interactions.
   - **Admin Panel (Super Admin):** Deep obsidian/carbon surfaces, dark glass cards, high-contrast indicators, and dense data tables for multi-gym operations.
3. **Accessibility & Contrast:** High contrast text ratios (WCAG AA compliant), prominent focus rings (`outline: 2px solid ring`), and color-blind safe status tones.

---

## 2. Color Palette & Semantic Tokens

Both applications share unified HSL-based CSS custom properties defined in their respective root stylesheets (`src/crm/index.css` and `src/admin/index.css`).

### 2.1 Core Semantic Tokens

| Token | Light Theme Value | Dark Theme Value | Usage |
|---|---|---|---|
| `--background` | `0 0% 100%` (White) | `222 25% 10%` (#121824) | Canvas background |
| `--foreground` | `0 0% 9%` (#171717) | `210 20% 98%` (#FAFBFC) | Primary headings & text |
| `--card` | `0 0% 100%` (White) | `222 22% 14%` (#1A2332) | Cards, panels, modals |
| `--card-foreground` | `0 0% 9%` | `210 20% 98%` | Card titles and body text |
| `--primary` | `142 71% 40%` (#1EAE53) | `142 71% 45%` (#22C55E) | Brand green, CTA buttons |
| `--primary-foreground`| `0 0% 100%` (White) | `0 0% 100%` (White) | Text on primary buttons |
| `--secondary` | `0 0% 96.1%` (#F5F5F5) | `222 18% 18%` (#202B3C) | Secondary buttons, pills |
| `--muted` | `150 14% 96%` (#F4F7F5) | `222 18% 17%` (#1E2838) | Table header, subtle rows |
| `--muted-foreground` | `0 0% 38%` (#616161) | `215 16% 65%` (#9CA3AF) | Subtitles, labels, hints |
| `--accent` | `142 60% 95%` (#EBFAF0) | `142 45% 18%` (#143822) | Active tab pills, soft badges |
| `--accent-foreground` | `142 71% 30%` (#15803D) | `142 75% 75%` (#86EFAC) | Text inside accent badges |
| `--destructive` | `0 84% 60%` (#EF4444) | `0 72% 51%` (#DC2626) | Danger buttons, errors |
| `--border` | `150 10% 90%` (#E3E8E6) | `222 16% 22%` (#2D3748) | Card outlines, dividers |

### 2.2 Status & Feedback Colors

| State | Background (Light) | Text (Light) | Background (Dark) | Text (Dark) | Example Usage |
|---|---|---|---|---|---|
| **Active / Success** | `bg-emerald-50` | `text-emerald-700` | `bg-emerald-950/40` | `text-emerald-400` | Active member, Approved gym |
| **Pending / Warning** | `bg-amber-50` | `text-amber-700` | `bg-amber-950/40` | `text-amber-400` | Under review, Pending payout |
| **Expired / Danger** | `bg-red-50` | `text-red-700` | `bg-red-950/40` | `text-red-400` | Expired plan, Denied entry |
| **Frozen / Inactive** | `bg-zinc-100` | `text-zinc-600` | `bg-zinc-800` | `text-zinc-400` | Frozen membership, Off shift |

---

## 3. Typography

Fitaval utilizes the modern geometric sans-serif **Geist** (`font-sans`), with monospace numerals for financial and tabular data (`font-mono` / `tabular-nums`).

```
Primary: Geist, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
Monospace: Geist Mono, SFMono-Regular, Menlo, Monaco, Consolas, monospace
```

### Type Scale

| Size Token | Class | Size / Line-Height | Weight | Common Application |
|---|---|---|---|---|
| **Display 2XL** | `text-5xl font-extrabold` | 48px / 1.1 | 800 | Wallet Available Balance |
| **Display XL** | `text-4xl font-bold` | 36px / 1.15 | 700 | Dashboard KPI main numbers |
| **Title L** | `text-2xl font-semibold` | 24px / 1.25 | 600 | Page titles, Modal headers |
| **Title M** | `text-xl font-semibold` | 20px / 1.3 | 600 | Card headings, Section headers |
| **Body Large** | `text-base font-medium` | 16px / 1.5 | 500 | Form inputs, button labels |
| **Body Regular**| `text-sm font-normal` | 14px / 1.5 | 400 | Data table rows, descriptive text |
| **Caption** | `text-xs font-medium` | 12px / 1.4 | 500 | Metadata, timestamps, table th |
| **Overline** | `text-[11px] font-semibold uppercase` | 11px / 1.2 | 600 | Kicker labels, card sub-headers |

---

## 4. Layout Grids & Spacing System

Fitaval uses an 8-point baseline grid (`0.5rem` = 8px) with Tailwind spacing units:

### Breakpoints
- `sm`: 640px (Mobile landscape / small tablets)
- `md`: 768px (Tablets)
- `lg`: 1024px (Laptops / Small desktops)
- `xl`: 1280px (Standard desktops)
- `2xl`: 1536px (Ultra-wide displays)

### Common Grid Layouts

```html
<!-- Dashboard KPI Row -->
<div class="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-5">...</div>

<!-- Split Overview Layout (Gym Detail & Profile) -->
<div class="grid grid-cols-1 gap-4 lg:grid-cols-2">...</div>

<!-- Photo Gallery Grid -->
<div class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">...</div>
```

---

## 5. UI Component Catalog

### 5.1 Buttons (`Btn` / `Button`)

Located in `src/admin/components/ui/Button.jsx` and `src/crm/components/ui/button.jsx`.

| Variant (`v`) | Styling | States Handled | Typical Use Case |
|---|---|---|---|
| `primary` | Emerald background (`bg-primary`), white text | Hover, active, disabled, focus-ring | Primary actions: "Approve gym", "Save changes" |
| `outline` | Border `border-border`, transparent bg | Hover (`bg-muted`), active, disabled | Secondary actions: "Back to all gyms", "Filter" |
| `ghost` | No border, transparent bg | Hover (`bg-muted`), icon buttons | Table actions, close button `X` |
| `dark` | Deep obsidian (`bg-zinc-950`), white text | Hover (`bg-zinc-800`), disabled | Premium actions: "Export to Excel" |
| `soft` | Mint accent (`bg-accent`), emerald text | Hover (`bg-accent/80`) | Positive secondary actions: "Verify tick" |
| `destructive`| Red background (`bg-destructive`), white text | Hover, disabled | "Reject registration", "Delete plan" |

#### Button Sizing
- `sm`: `h-8 px-3 text-xs rounded-lg`
- `md`: `h-9 px-4 text-sm rounded-lg` (Default)
- `lg`: `h-11 px-5 text-base rounded-xl`
- `icon`: `h-8 w-8 p-0 rounded-lg flex items-center justify-center`

---

### 5.2 Badges & Status Indicators

Located in `src/admin/components/ui/Badge.jsx` and `src/crm/components/ui-shared.jsx`.

```jsx
// Status badge with automated color tone mapping
<StatusBadge s="Active" />   // Tone: Green
<StatusBadge s="Pending" />  // Tone: Amber
<StatusBadge s="Expired" />  // Tone: Red
<StatusBadge s="Frozen" />   // Tone: Gray
```

---

### 5.3 Drawers & Sheets (`Sheet`)

Located in `src/admin/components/ui/Sheet.jsx`.

Slide-over right drawer used for high-density inspect panels (Member Details, Staff Dossier, Trainer Dossier, FCM Notifications):

* **Backdrop Scrim:** `bg-black/60` dark overlay with smooth fade-in animation (`.fade-in`). Zero milky haze or blur.
* **Surface Panel:** `bg-white dark:bg-card shadow-2xl border-l border-zinc-200 dark:border-border`.
* **Keyboard Navigation:** Listens for `Escape` key to close panel.
* **Safe-Area Inset Handling:** Native iOS safe areas supported via `env(safe-area-inset-top)`.

---

### 5.4 Modals (`Modal`)

Located in `src/admin/components/ui/Modal.jsx`.

* **Backdrop Scrim:** `fixed inset-0 z-[60] bg-black/60 flex items-center justify-center`.
* **Dialog Animation:** `.modal-in` with subtle translateY scaling (`scale(.985)` to `1`).
* **Header / Body / Sticky Footer:** Clear visual division with responsive max-height constraints (`max-h-[calc(100vh-2rem)]`).

---

### 5.5 High-Density Data Tables (`DataTable`)

Located in `src/admin/components/DataTable.jsx`.

* **Sticky Headers:** `thead.sticky.top-0` with dark heading row and dedicated per-column filter controls.
* **Filter Types:** Full-text search, multi-option dropdown select, numerical/date range filter.
* **Tabular Alignment:** Numbers are right-aligned or formatted with `tabular-nums`.
* **Empty States:** Integrated fallback message when no search matches are found.

---

## 6. Storybook & Component Isolation Setup

To visualize, develop, and test UI components in isolation, Fitaval supports Storybook integration:

### 6.1 Recommended Storybook Setup

Install Storybook with Vite builder:
```bash
npx storybook@latest init --builder vite
```

### 6.2 Example Story Structure (`src/admin/components/ui/Button.stories.jsx`)

```javascript
import { Btn } from './Button';
import { Icon } from '../Icon';

export default {
  title: 'Admin/UI/Button',
  component: Btn,
  argTypes: {
    v: {
      control: 'select',
      options: ['primary', 'outline', 'ghost', 'dark', 'soft', 'destructive'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'icon'],
    },
    disabled: { control: 'boolean' },
  },
};

export const Primary = {
  args: {
    v: 'primary',
    children: 'Approve Gym',
  },
};

export const WithIcon = {
  render: (args) => (
    <Btn {...args}>
      <Icon n="ArrowRight" size={14} />
      Continue
    </Btn>
  ),
  args: {
    v: 'primary',
  },
};

export const Destructive = {
  args: {
    v: 'destructive',
    children: 'Reject Application',
  },
};
```

---

## 7. Interactive Component States & Micro-interactions

| State | CSS / Tailwind Selector | Transition | Visual Cue |
|---|---|---|---|
| **Hover** | `hover:bg-*`, `hover:border-*` | `transition-colors duration-150` | Background lightens or accent color fades in |
| **Focus-Visible** | `:focus-visible` | `ring-2 ring-primary ring-offset-2` | 2px solid emerald ring around element |
| **Active / Pressed** | `active:scale-[0.98]` | `transform 100ms ease` | Tactile push-in effect |
| **Disabled** | `disabled:opacity-50 disabled:pointer-events-none` | Static | Fades to 50% opacity, cursor disabled |
| **Loading** | `.animate-spin` on Lucide icon | Continuous `rotate(360deg)` | Spinner replaces standard icon |
| **Drawer Slide** | `.sheet-in` | `cubic-bezier(.22,.8,.3,1) 0.26s` | Smooth slide from right edge |

