// Front door of the program: one login, then the user's role decides which app they get.
//   not signed in  -> shared login page (/login)
//   role "crm"     -> CRM          (src/crm)    served at /
//   role "admin"   -> Admin Panel  (src/admin)  served at /admin
// Sign-in pages (/login, /register, /forgot-password, /reset-password) share one design.
// Only the app that matches the session is downloaded, and signing in/out reloads the page,
// so the two apps' styles never mix.
import { Suspense, lazy, useEffect } from 'react';
import { getSession, homePath } from './session';

const AUTH_PAGES = {
  '/login': lazy(() => import('./Login')),
  '/register': lazy(() => import('./Register')),
  '/forgot-password': lazy(() => import('./ForgotPassword')),
  '/reset-password': lazy(() => import('./ResetPassword')),
};
const CrmApp = lazy(() => import('../crm/entry'));
const AdminApp = lazy(() => import('../admin/entry'));

const Spinner = () => (
  <div style={{ position: 'fixed', inset: 0, display: 'grid', placeItems: 'center' }}>
    <div
      style={{
        width: 32,
        height: 32,
        border: '4px solid rgba(16,185,129,.2)',
        borderTopColor: '#10b981',
        borderRadius: '50%',
        animation: 'pt-spin .8s linear infinite',
      }}
    />
    <style>{'@keyframes pt-spin{to{transform:rotate(360deg)}}'}</style>
  </div>
);

function Redirect({ to }) {
  useEffect(() => {
    window.location.replace(to);
  }, [to]);
  return <Spinner />;
}

export default function Portal() {
  const session = getSession();
  const { pathname, search } = window.location;

  const AuthPage = AUTH_PAGES[pathname];

  if (!session) {
    if (!AuthPage) {
      const back = pathname + search;
      return <Redirect to={'/login' + (back !== '/' ? '?returnTo=' + encodeURIComponent(back) : '')} />;
    }
    return (
      <Suspense fallback={<Spinner />}>
        <AuthPage />
      </Suspense>
    );
  }

  const isAdminPath = pathname === '/admin' || pathname.startsWith('/admin/');
  if (AuthPage) {
    const back = new URLSearchParams(search).get('returnTo');
    const ok = back && back.startsWith('/') && !back.startsWith('//') && !back.includes('\\');
    const target = ok && (session.role === 'admin') === (back === '/admin' || back.startsWith('/admin/')) ? back : homePath(session.role);
    return <Redirect to={target} />;
  }
  if (session.role === 'admin') {
    if (!isAdminPath) return <Redirect to="/admin" />;
    return (
      <Suspense fallback={<Spinner />}>
        <AdminApp />
      </Suspense>
    );
  }
  if (isAdminPath) return <Redirect to="/" />;
  return (
    <Suspense fallback={<Spinner />}>
      <CrmApp />
    </Suspense>
  );
}
