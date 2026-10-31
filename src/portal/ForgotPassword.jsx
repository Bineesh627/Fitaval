import { useState } from 'react';
import AuthShell from './AuthShell';
import { USE_MOCK } from '../config/env';
import { httpClient } from '../shared/api/httpClient';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) return;
    setLoading(true);
    setError('');

    if (!USE_MOCK) {
      try {
        await httpClient.post(
          '/auth/password/reset/',
          { email: cleanEmail },
          { skipAuth: true, retryOn401: false }
        );
        setSent(true);
      } catch (err) {
        setError(err.message || 'Unable to send password reset email. Please try again.');
      } finally {
        setLoading(false);
      }
      return;
    }

    // Mock mode
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 200);
  };

  return (
    <AuthShell title="Reset password" sub="We'll send you a link to reset it." footer={<a href="/login">← Back to sign in</a>}>
      {sent ? (
        <p className="pt-ok" role="status">If an account exists with that email, you'll receive a password reset link shortly.</p>
      ) : (
        <form onSubmit={submit} noValidate>
          <label htmlFor="pt-email">Email address</label>
          <input
            id="pt-email"
            type="email"
            autoComplete="email"
            placeholder="you@gym.com"
            autoFocus
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError('');
            }}
          />
          {error && <p className="pt-error" role="alert">{error}</p>}
          <button className="pt-submit" type="submit" disabled={!email.trim() || loading}>
            {loading ? 'Sending link...' : 'Send reset link'}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
