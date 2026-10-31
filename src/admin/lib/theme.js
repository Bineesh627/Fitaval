// Admin light/dark theme. Same palette as the CRM; the CRM's own theme key is kept separate (fitaval_theme).
import { useEffect, useState } from 'react';

const KEY = 'fitaval_admin_theme';

export function useAdminTheme() {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem(KEY) === 'dark' ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    try {
      localStorage.setItem(KEY, theme);
    } catch {
      /* storage blocked: theme just won't persist */
    }
    return () => root.classList.remove('dark'); // do not leak into the CRM
  }, [theme]);
  return { theme, dark: theme === 'dark', toggleTheme: () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')) };
}

/** Hex values for chart libraries / SVG attributes (they cannot read CSS variables). */
export const chartColors = (dark) =>
  dark
    ? { axis: '#9AA3B2', grid: '#2F3644', cursor: '#475062', track: '#2A3140', ink: '#E8ECF1', primary: '#21C45D', primaryHi: '#5AD98A', muted: '#7C8596' }
    : { axis: '#616161', grid: '#F5F5F5', cursor: '#C9CFCC', track: '#F5F5F5', ink: '#171717', primary: '#1EAE53', primaryHi: '#47D17A', muted: '#999999' };
