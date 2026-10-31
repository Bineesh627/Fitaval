import { useState } from 'react';
import './portal.css';

function handleEnterNav(e) {
  if (e.key !== 'Enter' || e.shiftKey || e.ctrlKey || e.metaKey || e.altKey) return;
  const target = e.target;
  if (!target || !(target instanceof HTMLElement)) return;
  if (target.tagName !== 'INPUT') return;

  const form = target.closest('form');
  if (!form) return;

  const selector = 'input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([disabled]), button[type="submit"]:not([disabled])';
  const elements = Array.from(form.querySelectorAll(selector)).filter(
    (el) => el.offsetWidth > 0 || el.offsetHeight > 0 || el.getClientRects().length > 0
  );

  const idx = elements.indexOf(target);
  if (idx !== -1 && idx < elements.length - 1) {
    const next = elements[idx + 1];
    if (next.getAttribute('type') === 'submit' || next.tagName === 'BUTTON') {
      return; // allow form submission on the last input
    }
    e.preventDefault();
    next.focus();
    if (typeof next.select === 'function' && next.type !== 'date') {
      next.select();
    }
  }
}

// Shared look for every sign-in page (login, create account, forgot / reset password).
export default function AuthShell({ title, sub, children, footer }) {
  const handleLinkClick = (e) => {
    const anchor = e.target.closest('a[href^="/"]');
    if (anchor && !e.defaultPrevented && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && anchor.target !== '_blank') {
      const href = anchor.getAttribute('href');
      if (
        href &&
        (href.startsWith('/login') ||
          href.startsWith('/register') ||
          href.startsWith('/forgot-password') ||
          href.startsWith('/reset-password'))
      ) {
        e.preventDefault();
        window.history.pushState(null, '', href);
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
    }
  };

  return (
    <div className="pt-root" onClick={handleLinkClick} onKeyDown={handleEnterNav}>
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
