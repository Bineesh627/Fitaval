import { useState } from 'react';
import AuthShell, { PasswordField } from './AuthShell';
import { login, homePath } from './session';

function safeReturnTo(role) {
  const raw = new URLSearchParams(window.location.search).get('returnTo');
  if (!raw || !raw.startsWith('/') || raw.startsWith('//') || raw.includes('\\')) return null;
  const adminPath = raw === '/admin' || raw.startsWith('/admin/');
  return (role === 'admin') === adminPath ? raw : null;
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await login(email, password);
    if (!res.ok) {
      setLoading(false);
      return setError(res.error);
    }
    window.location.assign(safeReturnTo(res.role) || homePath(res.role));
  };

  return (
    <AuthShell
      title="Welcome back"
      sub="Sign in to continue. We'll take you to the right place."
      footer={<>New gym owner? <a href="/register">Create an account</a> · <a href="/forgot-password">Forgot password?</a></>}
    >
      <form onSubmit={submit} noValidate>
        <label htmlFor="pt-email">Email</label>
        <input id="pt-email" type="email" autoComplete="username" placeholder="you@gym.com" value={email}
          onChange={(e) => { setEmail(e.target.value); setError(''); }} />

        <PasswordField id="pt-pass" label="Password" autoComplete="current-password" value={password}
          onChange={(e) => { setPassword(e.target.value); setError(''); }} />

        {error && <p className="pt-error" role="alert">{error}</p>}
        <button className="pt-submit" type="submit" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </AuthShell>
  );
}
