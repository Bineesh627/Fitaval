// Fallback config (only used by the plain-CSS login page). The apps use their own:
//   src/crm/index.css   -> tailwind.crm.config.js
//   src/admin/index.css -> tailwind.admin.config.js
export default { content: ['./src/portal/**/*.{js,jsx}'], theme: { extend: {} }, plugins: [] };
