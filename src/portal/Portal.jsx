// Front door of the program: one login, then the user's role decides which app they get.
//   not signed in  -> shared login page (/login)
//   role "crm"     -> CRM          (src/crm)    served at /
//   role "admin"   -> Admin Panel  (src/admin)  served at /admin
// Sign-in pages (/login, /register, /forgot-password, /reset-password) share one design.
// Only the app that matches the session is downloaded, and signing in/out reloads the page,
// so the two apps' styles never mix.
import { Suspense, lazy, useState, useEffect } from 'react';
import { getSession, homePath } from './session';
import { validateEnv, IS_PROD } from '../config/env';
import { tokenManager } from '../shared/auth/tokenManager';
import Login from './Login';
import Register from './Register';
import ForgotPassword from './ForgotPassword';
import ResetPassword from './ResetPassword';

const envStatus = validateEnv();

export const ConfigErrorScreen = ({ errors }) => (
  <div
    style={{
      position: 'fixed',
      inset: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#09090b',
      color: '#fff',
      padding: 24,
      textAlign: 'center',
      fontFamily: "'Inter', system-ui, sans-serif",
      zIndex: 999999,
    }}
  >
    <div
      style={{
        width: 48,
        height: 48,
        borderRadius: '50%',
        background: 'rgba(239, 68, 68, 0.15)',
        color: '#ef4444',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
      }}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    </div>
    <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>Configuration Error</h2>
    <p style={{ color: '#a1a1aa', maxWidth: 480, marginBottom: 16, fontSize: 14 }}>
      The application cannot start because the production environment is not configured securely.
    </p>
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: 8,
        padding: '12px 16px',
        color: '#f87171',
        fontSize: 13,
        textAlign: 'left',
        maxWidth: 520,
      }}
    >
      {errors.map((err, i) => (
        <div key={i} style={{ marginBottom: 4 }}>• {err}</div>
      ))}
    </div>
  </div>
);

const AUTH_PAGES = {
  '/login': Login,
  '/register': Register,
  '/forgot-password': ForgotPassword,
  '/reset-password': ResetPassword,
};

const CrmApp = lazy(() => import('../crm/entry'));
const AdminApp = lazy(() => import('../admin/entry'));

export const BrandedLoader = ({ text = 'Loading Fitaval...' }) => (
  <div
    style={{
      position: 'fixed',
      inset: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#09090b',
      color: '#fff',
      zIndex: 99999,
      fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    }}
  >
    <div
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 56,
        height: 56,
        borderRadius: 14,
        background: '#10b981',
        color: '#09090b',
        boxShadow: '0 0 32px rgba(16, 185, 129, 0.45)',
        marginBottom: 20,
      }}
    >
      <svg
        width="26"
        height="26"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6.5 6.5v11M17.5 6.5v11M3 9v6M21 9v6M6.5 12h11" />
      </svg>
    </div>
    <div
      style={{
        width: 140,
        height: 3,
        background: 'rgba(255, 255, 255, 0.12)',
        borderRadius: 999,
        overflow: 'hidden',
        position: 'relative',
        marginBottom: 14,
      }}
    >
      <div
        style={{
          width: '50%',
          height: '100%',
          background: '#10b981',
          borderRadius: 999,
          animation: 'pt-loader-indeterminate 1.2s cubic-bezier(0.4, 0, 0.2, 1) infinite',
        }}
      />
    </div>
    <div style={{ fontSize: 13, color: '#a1a1aa', fontWeight: 500, letterSpacing: '0.01em' }}>
      {text}
    </div>
    <style>{`
      @keyframes pt-loader-indeterminate {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(250%); }
      }
    `}</style>
  </div>
);

function Redirect({ to, text = 'Redirecting...' }) {
  useEffect(() => {
    window.location.replace(to);
  }, [to]);
  return <BrandedLoader text={text} />;
}

export default function Portal() {
  const [loc, setLoc] = useState(() => ({
    pathname: window.location.pathname,
    search: window.location.search,
  }));
  const [session, setSession] = useState(() => getSession());

  useEffect(() => {
    const onLocationChange = () => {
      setLoc({
        pathname: window.location.pathname,
        search: window.location.search,
      });
      setSession(getSession());
    };
    window.addEventListener('popstate', onLocationChange);
    const unsub = tokenManager.onAuthChange(() => {
      setSession(getSession());
    });
    return () => {
      window.removeEventListener('popstate', onLocationChange);
      unsub();
    };
  }, []);

  if (IS_PROD && !envStatus.valid) {
    return <ConfigErrorScreen errors={envStatus.errors} />;
  }

  // Idle prefetch CRM & Admin chunks so when user logs in, load is instant
  useEffect(() => {
    if (!session) {
      const prefetch = () => {
        import('../crm/entry');
        import('../admin/entry');
      };
      if ('requestIdleCallback' in window) {
        const id = window.requestIdleCallback(prefetch, { timeout: 2000 });
        return () => window.cancelIdleCallback(id);
      } else {
        const t = setTimeout(prefetch, 1000);
        return () => clearTimeout(t);
      }
    }
  }, [session]);

  const { pathname, search } = loc;
  const AuthPage = AUTH_PAGES[pathname];

  if (!session) {
    if (!AuthPage) {
      const back = pathname + search;
      const target = '/login' + (back !== '/' ? '?returnTo=' + encodeURIComponent(back) : '');
      // When at root '/' or another path, replace URL state in browser history and render Login immediately
      if (pathname === '/') {
        window.history.replaceState(null, '', target);
        return <Login />;
      }
      return <Redirect to={target} text="Taking you to sign in..." />;
    }
    return <AuthPage />;
  }

  const isAdminPath = pathname === '/admin' || pathname.startsWith('/admin/');
  if (AuthPage) {
    const back = new URLSearchParams(search).get('returnTo');
    const ok = back && back.startsWith('/') && !back.startsWith('//') && !back.includes('\\');
    const target = ok && (session.role === 'admin') === (back === '/admin' || back.startsWith('/admin/')) ? back : homePath(session.role);
    return <Redirect to={target} text="Opening your workspace..." />;
  }
  if (session.role === 'admin') {
    if (!isAdminPath) return <Redirect to="/admin" text="Opening Admin Panel..." />;
    return (
      <Suspense fallback={<BrandedLoader text="Opening Admin Panel..." />}>
        <AdminApp />
      </Suspense>
    );
  }
  if (isAdminPath) return <Redirect to="/" text="Opening CRM..." />;
  return (
    <Suspense fallback={<BrandedLoader text="Opening Fitaval CRM..." />}>
      <CrmApp />
    </Suspense>
  );
}
