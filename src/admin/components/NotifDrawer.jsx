import { useState } from 'react';
import { Icon } from './Icon';
import { Btn } from './ui/Button';
import { Field } from './ui/Field';
import { Locked } from './ui/PageHead';
import { Sheet } from './ui/Sheet';
import { Tabs } from './ui/Tabs';
import { inputCls } from './ui/styles';
import { useApp } from '../context/AppContext';
import { AUDIENCES } from '../data/audiences';
import { cx, fmtTime, uid } from '../lib/utils';

export function NotifDrawer({ onClose }) {
  const { alerts, setAlerts, perms, toast, addAudit, broadcasts, setBroadcasts } = useApp();
  const [tab, setTab] = useState('alerts');
  const [b, setB] = useState({
    title: 'Evening Strength has 2 spots',
    body: 'Book your spot for 6 PM in the Fitaval app before it fills up.',
    aud: 'kochi',
    link: 'Class booking',
  });
  const aud = AUDIENCES.find((a) => a.id === b.aud);
  const icons = { capacity: 'Users', expiry: 'CalendarClock', denied: 'Ban', staff: 'Clock', sync: 'Smartphone' };
  const send = () => {
    setBroadcasts((h) => [{ id: uid(), title: b.title, aud: aud.label, n: aud.n, at: new Date() }, ...h]);
    addAudit(
      'CREATE',
      'notifications.Broadcast',
      'notif-' + Math.floor(Math.random() * 9000 + 1000),
      {},
      { title: b.title, audience: b.aud, recipients: aud.n }
    );
    toast({ title: 'Push broadcast queued via API', desc: aud.n + ' devices · ' + aud.label });
    setTab('alerts');
  };
  return (
    <Sheet
      open={true}
      onClose={onClose}
      title="Notifications & Push Broadcast"
      sub="Alerts from the floor and push messages to the member app"
      width="max-w-lg"
      headRight={
        tab === 'alerts' && (
          <Btn size="sm" v="ghost" onClick={() => setAlerts((a) => a.map((x) => ({ ...x, read: true })))}>
            Mark all read
          </Btn>
        )
      }
    >
      <div className="mb-4">
        <Tabs
          tabs={[
            { id: 'alerts', label: 'Alerts', icon: 'Bell' },
            { id: 'fcm', label: 'Push Broadcast', icon: 'Send', lock: !perms.broadcast },
          ]}
          value={tab}
          onChange={setTab}
        />
      </div>
      {tab === 'alerts' && (
        <div className="space-y-2">
          {alerts.map((a) => (
            <div
              key={a.id}
              className={cx(
                'flex gap-3 rounded-lg border p-3',
                a.read ? 'border-zinc-200 bg-white' : 'border-emerald-200 bg-emerald-50/60'
              )}
            >
              <span
                className={cx(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                  a.type === 'denied' ? 'bg-zinc-950 text-white' : 'bg-white text-emerald-600 ring-1 ring-zinc-200'
                )}
              >
                <Icon n={icons[a.type]} size={15} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold">{a.title}</p>
                  {!a.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-emerald-500"></span>}
                </div>
                <p className="mt-0.5 text-xs text-zinc-600">{a.desc}</p>
                <p className="mt-1 text-[11px] text-zinc-400">{a.time}</p>
              </div>
            </div>
          ))}
          {broadcasts.length > 0 && (
            <p className="pt-3 text-xs font-medium uppercase tracking-wider text-zinc-500">Sent broadcasts</p>
          )}
          {broadcasts.map((h) => (
            <div key={h.id} className="rounded-lg border border-zinc-200 bg-white p-3">
              <p className="text-sm font-semibold">{h.title}</p>
              <p className="mt-0.5 text-xs text-zinc-500">
                {h.n} devices · {h.aud} · {fmtTime(h.at)}
              </p>
            </div>
          ))}
        </div>
      )}
      {tab === 'fcm' &&
        (perms.broadcast ? (
          <div className="space-y-4">
            <Field label="Audience" id="fcm-aud">
              <select
                id="fcm-aud"
                className={inputCls}
                value={b.aud}
                onChange={(e) => setB({ ...b, aud: e.target.value })}
              >
                {AUDIENCES.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.label} ({a.n})
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Title" id="fcm-title" hint={b.title.length + '/45 characters'}>
              <input
                id="fcm-title"
                maxLength="45"
                className={inputCls}
                value={b.title}
                onChange={(e) => setB({ ...b, title: e.target.value })}
              />
            </Field>
            <Field label="Message" id="fcm-body" hint={b.body.length + '/120 characters'}>
              <textarea
                id="fcm-body"
                rows="3"
                maxLength="120"
                className={cx(inputCls, 'h-auto py-2')}
                value={b.body}
                onChange={(e) => setB({ ...b, body: e.target.value })}
              ></textarea>
            </Field>
            <Field label="Opens in the app" id="fcm-link">
              <select
                id="fcm-link"
                className={inputCls}
                value={b.link}
                onChange={(e) => setB({ ...b, link: e.target.value })}
              >
                {['Class booking', 'Membership renewal', 'Offers', 'Home'].map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </select>
            </Field>
            <div>
              <p className="mb-2 text-xs font-medium text-zinc-700">Lock-screen preview</p>
              <div className="rounded-2xl bg-zinc-950 p-3">
                <div className="flex gap-3 rounded-xl bg-zinc-800/80 p-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500 text-zinc-950">
                    <Icon n="Dumbbell" size={18} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11px] text-zinc-400">FITAVAL · now</p>
                    <p className="truncate text-sm font-semibold text-white">{b.title || 'Title'}</p>
                    <p className="line-clamp-2 text-xs text-zinc-300">{b.body || 'Message'}</p>
                  </div>
                </div>
              </div>
            </div>
            <Btn v="primary" className="w-full" disabled={!b.title.trim() || !b.body.trim()} onClick={send}>
              <Icon n="Send" size={15} />
              Send to {aud.n} devices
            </Btn>
          </div>
        ) : (
          <Locked
            title="Broadcasts need manager access"
            text="Branch Managers and Super Admins can send push notifications to the member app."
          />
        ))}
    </Sheet>
  );
}
