# AGENTS.md

Fitaval: one React + Vite + Tailwind program containing the CRM (`src/crm`), the Admin Panel (`src/admin`)
and a shared login (`src/portal`). See README.md for the folder map and demo logins.

- `npm run dev` / `npm run build` / `npm run lint`
- `@/` imports resolve to `src/crm`. Admin code uses relative imports.
- Keep CRM and Admin styles separate: each has its own `index.css` and Tailwind config.
