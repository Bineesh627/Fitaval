import { useState, useEffect } from 'react';
import { Icon } from '../../components/Icon';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { Btn } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Field } from '../../components/ui/Field';
import { inputCls } from '../../components/ui/styles';
import { useApp } from '../../context/AppContext';
import { cx } from '../../lib/utils';

export function SecurityTab() {
  const { roleObj, role, toast, addAudit, sessions, setSessions } = useApp();
  const [p, setP] = useState({
    name: roleObj.user,
    email: roleObj.user.toLowerCase().replace(' ', '.') + '@fitaval.in',
    phone: '+91 98470 00110',
    title: roleObj.label,
  });
  useEffect(
    () =>
      setP({
        name: roleObj.user,
        email: roleObj.user.toLowerCase().replace(' ', '.') + '@fitaval.in',
        phone: '+91 98470 00110',
        title: roleObj.label,
      }),
    [role]
  );
  const [pw, setPw] = useState({ cur: '', next: '', conf: '' });
  const [revoke, setRevoke] = useState(true);
  const s = pw.next;
  let score = 0;
  if (s.length >= 10) score++;
  if (/[A-Z]/.test(s) && /[a-z]/.test(s)) score++;
  if (/\d/.test(s)) score++;
  if (/[^A-Za-z0-9]/.test(s)) score++;
  const label = ['Too short', 'Weak', 'Fair', 'Good', 'Strong'][score];
  const ok = pw.cur && pw.next.length >= 10 && pw.next === pw.conf && score >= 3;
  const submit = (e) => {
    e.preventDefault();
    if (!ok) return;
    const before = sessions.length;
    if (revoke) setSessions((ss) => ss.filter((x) => x.current));
    addAudit(
      'SECURITY',
      'accounts.User',
      'usr-0007',
      { active_jti_count: before },
      { password_rotated_at: new Date().toISOString().slice(0, 19), active_jti_count: revoke ? 1 : before }
    );
    toast({
      title: 'Password updated',
      desc: revoke ? before - 1 + ' other device sessions were signed out.' : 'Other device sessions stay signed in.',
    });
    setPw({ cur: '', next: '', conf: '' });
  };
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="p-5">
        <div className="mb-4 flex items-center gap-4">
          <Avatar name={p.name} size={56} />
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold">{p.name}</h3>
            <div className="mt-1 flex flex-wrap gap-1.5">
              <Badge tone="black">
                <Icon n="ShieldCheck" size={11} className="text-emerald-400" />
                {roleObj.group}
              </Badge>
              <Badge tone="green">{roleObj.label}</Badge>
            </div>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" id="pf-name">
            <input
              id="pf-name"
              className={inputCls}
              value={p.name}
              onChange={(e) => setP({ ...p, name: e.target.value })}
            />
          </Field>
          <Field label="Designation" id="pf-title">
            <input
              id="pf-title"
              className={inputCls}
              value={p.title}
              onChange={(e) => setP({ ...p, title: e.target.value })}
            />
          </Field>
          <Field label="Work email" id="pf-email">
            <input
              id="pf-email"
              type="email"
              className={inputCls}
              value={p.email}
              onChange={(e) => setP({ ...p, email: e.target.value })}
            />
          </Field>
          <Field label="Phone" id="pf-phone">
            <input
              id="pf-phone"
              className={inputCls}
              value={p.phone}
              onChange={(e) => setP({ ...p, phone: e.target.value })}
            />
          </Field>
        </div>
        <div className="mt-4 flex justify-end">
          <Btn
            v="primary"
            onClick={() => {
              addAudit('UPDATE', 'accounts.User', 'usr-0007', { name: roleObj.user }, { name: p.name, email: p.email });
              toast({ title: 'Profile saved', desc: 'Your details are updated across branches.' });
            }}
          >
            Save profile
          </Btn>
        </div>
      </Card>
      <Card className="p-5">
        <h3 className="text-base font-semibold">Password rotation</h3>
        <p className="mt-0.5 text-sm text-zinc-500">
          Use at least 10 characters with mixed case, a number and a symbol.
        </p>
        <form className="mt-4 space-y-4" onSubmit={submit}>
          <Field label="Current password" id="pw-cur">
            <input
              id="pw-cur"
              type="password"
              autoComplete="current-password"
              className={inputCls}
              value={pw.cur}
              onChange={(e) => setPw({ ...pw, cur: e.target.value })}
            />
          </Field>
          <Field label="New password" id="pw-new">
            <input
              id="pw-new"
              type="password"
              autoComplete="new-password"
              className={inputCls}
              value={pw.next}
              onChange={(e) => setPw({ ...pw, next: e.target.value })}
            />
            <div className="mt-1 flex items-center gap-2">
              <div className="flex flex-1 gap-1">
                {[1, 2, 3, 4].map((i) => (
                  <span
                    key={i}
                    className={cx(
                      'h-1.5 flex-1 rounded-full',
                      i <= score ? (score >= 3 ? 'bg-emerald-500' : 'bg-zinc-950') : 'bg-zinc-200'
                    )}
                  ></span>
                ))}
              </div>
              <span className="w-16 text-right text-[11px] text-zinc-500">{pw.next ? label : ''}</span>
            </div>
          </Field>
          <Field
            label="Confirm new password"
            id="pw-conf"
            hint={pw.conf && pw.conf !== pw.next ? 'Passwords do not match yet.' : ''}
          >
            <input
              id="pw-conf"
              type="password"
              autoComplete="new-password"
              className={inputCls}
              value={pw.conf}
              onChange={(e) => setPw({ ...pw, conf: e.target.value })}
            />
          </Field>
          <label
            htmlFor="pw-revoke"
            className="flex cursor-pointer items-start gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-3"
          >
            <input
              id="pw-revoke"
              type="checkbox"
              className="mt-0.5 h-4 w-4 accent-emerald-500"
              checked={revoke}
              onChange={(e) => setRevoke(e.target.checked)}
            />
            <span className="text-sm text-zinc-800">
              Revoke all other active JWT device sessions upon password change
            </span>
          </label>
          <Btn v="dark" className="w-full" type="submit" disabled={!ok}>
            <Icon n="KeyRound" size={15} className="text-emerald-400" />
            Rotate password
          </Btn>
        </form>
      </Card>
    </div>
  );
}
