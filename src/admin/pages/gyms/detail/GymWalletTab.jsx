import { useState } from 'react';
import { Icon } from '../../../components/Icon';
import { Btn } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Locked } from '../../../components/ui/PageHead';
import { useApp } from '../../../context/AppContext';
import { cx, inr, fmtDate } from '../../../lib/utils';

export function GymWalletTab({ g }) {
  const { perms, toast } = useApp();
  const [settling, setSettling] = useState(false);

  if (!perms.revenue)
    return (
      <Locked
        title="Wallet is restricted"
        text="Wallet balance and settlements are visible to Branch Managers and Super Admins. Switch the role preview to continue."
      />
    );

  const w = g.wallet || { status: 'Active', updated: '', txns: [] };
  const earned = w.txns.filter((t) => t.type === 'credit').reduce((a, t) => a + t.amount, 0);
  const withdrawn = w.txns.filter((t) => t.type === 'debit').reduce((a, t) => a + t.amount, 0);
  const balance = earned - withdrawn;

  const handleSettle = () => {
    if (balance <= 0) {
      toast({ title: 'No balance to settle', desc: 'Available balance is zero.' });
      return;
    }
    setSettling(true);
    setTimeout(() => {
      setSettling(false);
      toast({
        title: 'Settlement initiated',
        desc: `Transfer of ${inr(balance)} scheduled to registered bank account (T+2).`,
      });
    }, 600);
  };

  const handleExport = () => {
    toast({
      title: 'Statement exported',
      desc: `${g.name} wallet history downloaded as Excel.`,
    });
  };

  const stats = [
    {
      label: 'Total Earned',
      value: earned,
      icon: 'TrendingUp',
      bgTone: 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400',
      badge: 'All-time gross',
    },
    {
      label: 'Withdrawn / Settled',
      value: withdrawn,
      icon: 'Download',
      bgTone: 'bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400',
      badge: `${w.txns.filter((t) => t.type === 'debit').length} payouts`,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Available Balance Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-900 p-6 text-white shadow-xl sm:p-7 border border-white/10">
        {/* Glow effects */}
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-emerald-500/20 blur-3xl"></div>
        <div className="pointer-events-none absolute left-8 -bottom-10 h-36 w-36 rounded-full bg-emerald-500/10 blur-2xl"></div>

        <div className="relative">
          {/* Top header row */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 border border-white/15 text-white">
                <Icon n="Wallet" size={20} />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
                  Fitaval Wallet · B2C Settlement
                </p>
                <p className="text-sm font-medium text-white/90">Available Balance</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              {w.status || 'Active'}
            </span>
          </div>

          {/* Amount */}
          <p className="mt-5 text-4xl sm:text-5xl font-extrabold tabular-nums tracking-tight text-white leading-none">
            {inr(balance)}
          </p>

          <p className="mt-2 text-xs text-white/60">
            Updated {w.updated || 'recently'} · Auto-settlement active for {g.name}
          </p>

          {/* Divider */}
          <div className="my-5 border-t border-white/10" />

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleSettle}
              disabled={settling}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-60"
            >
              <Icon n={settling ? 'Loader2' : 'ArrowUpRight'} size={15} className={settling ? 'animate-spin' : ''} />
              {settling ? 'Processing...' : 'Settle Payout'}
            </button>
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              <Icon n="FileSpreadsheet" size={15} />
              Export History
            </button>
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid gap-3 sm:grid-cols-2">
        {stats.map((s) => (
          <Card key={s.label} className="rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <span className={cx('flex h-10 w-10 items-center justify-center rounded-xl', s.bgTone)}>
                <Icon n={s.icon} size={18} />
              </span>
              <span className="text-[11px] font-medium text-zinc-400">{s.badge}</span>
            </div>
            <p className="mt-3 text-xs text-zinc-500">{s.label}</p>
            <p className="mt-0.5 text-xl font-bold tabular-nums text-zinc-950">{inr(s.value)}</p>
          </Card>
        ))}
      </div>

      {/* Transactions list */}
      <Card className="rounded-2xl p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Transaction History</h2>
          <span className="text-xs text-zinc-400 tabular-nums">{w.txns.length} records</span>
        </div>
        <ul className="mt-4 divide-y divide-zinc-100">
          {w.txns.map((t) => {
            const cr = t.type === 'credit';
            return (
              <li key={t.id} className="flex items-center gap-4 py-3.5">
                <span
                  className={cx(
                    'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
                    cr
                      ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                      : 'bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400'
                  )}
                >
                  <Icon n={cr ? 'ArrowDownLeft' : 'ArrowUpRight'} size={17} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-zinc-950">{t.description}</p>
                  <p className="mt-0.5 text-xs tabular-nums text-zinc-500">{fmtDate(t.date)}</p>
                </div>
                <p
                  className={cx(
                    'shrink-0 text-sm font-semibold tabular-nums',
                    cr ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                  )}
                >
                  {cr ? '+' : '-'}
                  {inr(t.amount)}
                </p>
              </li>
            );
          })}
          {!w.txns.length && (
            <li className="py-8 text-center text-sm text-zinc-500">No wallet transactions yet.</li>
          )}
        </ul>
      </Card>
    </div>
  );
}
