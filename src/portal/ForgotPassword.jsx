import { useState } from 'react';
import AuthShell from './AuthShell';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  return (
    <AuthShell title="Reset password" sub="We'll send you a link to reset it." footer={<a href="/login">← Back to sign in</a>}>
      {sent ? (
        <p className="pt-ok" role="status">If an account exists with that email, you'll receive a password reset link shortly.</p>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); if (email.trim()) setSent(true); }} noValidate>
          <label htmlFor="pt-email">Email address</label>
          <input id="pt-email" type="email" autoComplete="email" placeholder="you@gym.com" autoFocus value={email}
            onChange={(e) => setEmail(e.target.value)} />
          <button className="pt-submit" type="submit" disabled={!email.trim()}>Send reset link</button>
        </form>
      )}
    </AuthShell>
  );
}
