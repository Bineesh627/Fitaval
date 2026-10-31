import { useState, useEffect, useRef } from 'react';
import { Icon } from './Icon';
import { Avatar } from './ui/Avatar';
import { Btn } from './ui/Button';
import { Modal } from './ui/Modal';
import { QrCode } from './ui/QrCode';
import { inputCls } from './ui/styles';
import { useApp } from '../context/AppContext';
import { token } from '../data/members';
import { cx, dayDiff, TODAY_ISO, fmtDate } from '../lib/utils';

export function ScannerModal({ onClose }) {
  const { members, recordScan, toast, dark } = useApp();
  const ink = dark ? '#E8ECF1' : '#171717';
  const ring = dark ? '#2F3644' : '#E3E8E6';
  const [val, setVal] = useState('');
  const [phase, setPhase] = useState('idle');
  const [res, setRes] = useState(null);
  const [gate, setGate] = useState(false);
  const timers = useRef([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const samples = [
    members.find((m) => m.status === 'Active'),
    members.find((m) => m.status === 'Frozen'),
    members.find((m) => m.status === 'Expired'),
  ].filter(Boolean);
  const scan = (v) => {
    const t = (v || val).trim().toUpperCase();
    if (!t) return;
    setPhase('reading');
    setRes(null);
    setGate(false);
    timers.current.push(
      setTimeout(() => {
        const m = members.find((x) => token(x) === t);
        if (!m) {
          setRes({ kind: 'unknown', token: t });
          setPhase('done');
          return;
        }
        const days = dayDiff(TODAY_ISO, m.end);
        if (m.status === 'Active') {
          setRes({ kind: 'ok', m, days });
          setGate(true);
          recordScan(m, 'IN', 'ACTIVE');
          timers.current.push(setTimeout(() => setGate(false), 3500));
        } else {
          const s = m.status === 'Frozen' ? 'DENIED - FROZEN' : 'DENIED - EXPIRED';
          setRes({ kind: 'deny', m, reason: s });
          recordScan(m, 'IN', s);
        }
        setPhase('done');
      }, 900)
    );
  };
  return (
    <Modal
      open={true}
      onClose={onClose}
      title="Quick check-in scanner"
      sub="Gate 1 · Kochi Central turnstile (simulation)"
      size="md"
      footer={<Btn onClick={onClose}>Close scanner</Btn>}
    >
      <div className="grid gap-4 sm:grid-cols-[1fr_150px]">
        <div className="space-y-3">
          <div className="relative overflow-hidden rounded-lg bg-zinc-950 p-4">
            {phase === 'reading' && <div className="laser"></div>}
            <div className="rounded bg-white p-3">
              <QrCode value={val.trim() || 'FTV-1-0000-000000'} size={120} />
            </div>
            <p className="mt-2 text-center font-mono text-xs tabular-nums text-emerald-400">
              {phase === 'reading' ? 'READING…' : 'READY TO SCAN'}
            </p>
          </div>
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              scan();
            }}
          >
            <input
              id="scan-input"
              aria-label="QR token"
              className={cx(inputCls, 'font-mono uppercase')}
              placeholder="FTV-1-1042-9A8F3C"
              value={val}
              onChange={(e) => setVal(e.target.value)}
            />
            <Btn v="primary" type="submit" disabled={!val.trim() || phase === 'reading'}>
              Scan
            </Btn>
          </form>
          <div>
            <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-zinc-500">Try a sample</p>
            <div className="flex flex-wrap gap-1.5">
              {samples.map((m) => (
                <button
                  key={m.id}
                  className="rounded-full border border-zinc-200 px-2.5 py-1 text-xs hover:bg-zinc-50"
                  onClick={() => {
                    setVal(token(m));
                    scan(token(m));
                  }}
                >
                  {m.status}: <span className="font-mono">{token(m)}</span>
                </button>
              ))}
              <button
                className="rounded-full border border-zinc-200 px-2.5 py-1 text-xs hover:bg-zinc-50"
                onClick={() => {
                  setVal('FTV-9-0000-AAAAAA');
                  scan('FTV-9-0000-AAAAAA');
                }}
              >
                Unknown tag
              </button>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 p-3">
          <svg viewBox="0 0 120 120" className="h-28 w-28" aria-hidden="true">
            <circle cx="60" cy="60" r="46" fill="none" stroke={ring} strokeWidth="2" />
            {[0, 120, 240].map((a) => (
              <g
                key={a}
                className="arm"
                style={{ transform: `rotate(${a + (gate ? 120 : 0)}deg)`, transformOrigin: '60px 60px' }}
              >
                <line
                  x1="60"
                  y1="60"
                  x2="60"
                  y2="16"
                  stroke={gate ? '#1EAE53' : ink}
                  strokeWidth="6"
                  strokeLinecap="round"
                />
              </g>
            ))}
            <circle cx="60" cy="60" r="9" fill={ink} />
            <circle cx="60" cy="60" r="3" fill={gate ? '#1EAE53' : (dark ? '#9AA3B2' : '#474747')} />
          </svg>
          <p className={cx('mt-1 text-xs font-semibold', gate ? 'text-emerald-700' : 'text-zinc-500')}>
            {gate ? 'GATE OPEN' : 'GATE LOCKED'}
          </p>
        </div>
      </div>
      {res && res.kind === 'ok' && (
        <div className="feed-in mt-4 flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
          <Avatar name={res.m.name} size={44} />
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-2 text-sm font-semibold text-emerald-800">
              <Icon n="CheckCircle2" size={16} />
              ACCESS GRANTED
            </p>
            <p className="truncate text-sm font-medium text-zinc-950">{res.m.name}</p>
            <p className="text-xs text-zinc-600">
              {res.m.plan} · {res.days} days left · visit #{res.m.visits + 1}
            </p>
          </div>
        </div>
      )}
      {res && res.kind === 'deny' && (
        <div className="feed-in mt-4 flex items-center gap-3 rounded-lg border-2 border-zinc-950 bg-white p-4">
          <Avatar name={res.m.name} size={44} />
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-2 text-sm font-semibold text-zinc-950">
              <Icon n="XCircle" size={16} />
              {res.reason}
            </p>
            <p className="truncate text-sm font-medium">{res.m.name}</p>
            <p className="text-xs text-zinc-600">
              {res.m.status === 'Frozen'
                ? 'Membership is frozen. Direct the member to the front desk to unfreeze.'
                : 'Plan ended ' + fmtDate(res.m.end) + '. Offer a renewal at the desk.'}
            </p>
          </div>
        </div>
      )}
      {res && res.kind === 'unknown' && (
        <div className="feed-in mt-4 rounded-lg border-2 border-zinc-950 bg-white p-4">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <Icon n="XCircle" size={16} />
            UNKNOWN TOKEN
          </p>
          <p className="mt-1 font-mono text-xs text-zinc-600">{res.token}</p>
          <p className="mt-1 text-xs text-zinc-600">No member matches this QR code. It may have been rotated.</p>
        </div>
      )}
    </Modal>
  );
}
