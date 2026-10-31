import './portal.css';

// Shared look for every sign-in page (login, create account, forgot / reset password).
export default function AuthShell({ title, sub, children, footer }) {
  return (
    <div className="pt-root">
      <aside className="pt-brand">
        <div className="pt-logo" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6.5 6.5v11M17.5 6.5v11M3 9v6M21 9v6M6.5 12h11" />
          </svg>
        </div>
        <h1>Fitaval</h1>
        <p className="pt-tag">sign-in for gym owners.</p>
        <ul className="pt-points">
          <li><b>Gym owners</b> open the CRM: members, plans, finance, staff.</li>
        </ul>
      </aside>

      <main className="pt-main">
        <div className="pt-card">
          <h2>{title}</h2>
          <p className="pt-sub">{sub}</p>
          {children}
          {footer && <p className="pt-foot">{footer}</p>}
        </div>
      </main>
    </div>
  );
}

export function PasswordField({ id, label, value, onChange, placeholder = 'Your password', autoComplete }) {
  return <PasswordInner {...{ id, label, value, onChange, placeholder, autoComplete }} />;
}

import { useState } from 'react';
function PasswordInner({ id, label, value, onChange, placeholder, autoComplete }) {
  const [show, setShow] = useState(false);
  return (
    <>
      <label htmlFor={id}>{label}</label>
      <div className="pt-pass">
        <input id={id} type={show ? 'text' : 'password'} autoComplete={autoComplete} placeholder={placeholder} value={value} onChange={onChange} />
        <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'}>
          {show ? 'Hide' : 'Show'}
        </button>
      </div>
    </>
  );
}
