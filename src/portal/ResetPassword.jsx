import { useState } from 'react';
import AuthShell, { PasswordField } from './AuthShell';
import { USE_MOCK } from '../config/env';
import { httpClient } from '../shared/api/httpClient';

export default function ResetPassword() {
  const token = new URLSearchParams(window.location.search).get('token');
  const [pw, setPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!token) {
    return (
      <AuthShell title="Invalid reset link" sub="This password reset link is missing or invalid." footer={<a href="/forgot-password">Request a new link</a>}>
        <p className="pt-hint">The link you used looks incomplete. Please request a new password reset email.</p>
      </AuthShell>
    );
  }

  const submit = async (e) => {
    e.preventDefault();
    if (pw.length < 6) return setError('Password must be at least 6 characters.');
    if (pw !== confirm) return setError('Passwords do not match.');
    setLoading(true);
    setError('');

    if (!USE_MOCK) {
      try {
        await httpClient.post(
          '/auth/password/reset/confirm/',
          { token, password: pw },
          { skipAuth: true, retryOn401: false }
        );
        window.history.pushState(null, '', '/login?reset=success');
        window.dispatchEvent(new PopStateEvent('popstate'));
      } catch (err) {
        setError(err.message || 'Failed to reset password. The link may have expired.');
      } finally {
        setLoading(false);
      }
      return;
    }

    // Mock mode
    setTimeout(() => {
      window.history.pushState(null, '', '/login');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }, 150);
  };

  return (
    <AuthShell title="New password" sub="Enter your new password below." footer={<a href="/login">← Back to sign in</a>}>
      <form onSubmit={submit} noValidate>
        <PasswordField id="pt-pass" label="New password" autoComplete="new-password" placeholder="At least 6 characters" value={pw}
          onChange={(e) => { setPw(e.target.value); setError(''); }} />
        <PasswordField id="pt-confirm" label="Confirm password" autoComplete="new-password" placeholder="Re-enter your password" value={confirm}
          onChange={(e) => { setConfirm(e.target.value); setError(''); }} />
        {error && <p className="pt-error" role="alert">{error}</p>}
        <button className="pt-submit" type="submit" disabled={loading}>
          {loading ? 'Resetting password...' : 'Reset password'}
        </button>
      </form>
    </AuthShell>
  );
}
