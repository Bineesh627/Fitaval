/** @type {import('tailwindcss').Config} */
const v = (name) => `hsl(var(--${name}) / <alpha-value>)`;

export default {
  content: ['./src/admin/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Geist', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['Geist Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      colors: {
        // CRM semantic tokens (same names as tailwind.crm.config.js) - values live in index.css
        background: v('background'),
        foreground: v('foreground'),
        card: { DEFAULT: v('card'), foreground: v('card-foreground') },
        primary: { DEFAULT: v('primary'), foreground: v('primary-foreground') },
        secondary: { DEFAULT: v('secondary'), foreground: v('secondary-foreground') },
        muted: { DEFAULT: v('muted'), foreground: v('muted-foreground') },
        accent: { DEFAULT: v('accent'), foreground: v('accent-foreground') },
        destructive: { DEFAULT: v('destructive'), foreground: v('destructive-foreground') },
        border: v('border'),
        input: v('input'),
        ring: v('ring'),

        // The admin markup was written with zinc/emerald utilities. They are re-pointed at the CRM palette
        // so every zinc-* / emerald-* class renders in the exact CRM colors.
        zinc: {
          50: v('muted'),
          100: v('secondary'),
          200: v('border'),
          300: 'hsl(150 6% 80% / <alpha-value>)',
          400: 'hsl(0 0% 60% / <alpha-value>)',
          500: v('muted-foreground'),
          600: 'hsl(0 0% 28% / <alpha-value>)',
          700: v('chart-2'),
          800: 'hsl(0 0% 14% / <alpha-value>)',
          900: 'hsl(0 0% 11% / <alpha-value>)',
          950: v('foreground'),
        },
        emerald: {
          50: v('accent'),
          100: 'hsl(142 55% 90% / <alpha-value>)',
          200: 'hsl(142 50% 80% / <alpha-value>)',
          300: 'hsl(142 45% 68% / <alpha-value>)',
          400: 'hsl(142 60% 52% / <alpha-value>)',
          500: v('primary'),
          600: 'hsl(142 71% 35% / <alpha-value>)',
          700: v('accent-foreground'),
          800: 'hsl(142 71% 24% / <alpha-value>)',
        },
      },
    },
  },
  plugins: [],
};
