import { useState } from 'react';
import { Icon } from '../../../components/Icon';
import { Card } from '../../../components/ui/Card';
import { Locked } from '../../../components/ui/PageHead';
import { useApp } from '../../../context/AppContext';
import { cx, inr, TODAY_ISO, fmtDate } from '../../../lib/utils';

export function GymFinanceTab({ g }) {
  const { perms } = useApp();
  const [filter, setFilter] = useState('all');
  if (!perms.revenue)
    return (
      <Locked
        title="Finance is restricted"
        text="Income and expense records are visible to Branch Managers and Super Admins. Switch the role preview to continue."
      />
    );
  const txs = g.txns || [];
  const mk = TODAY_ISO.slice(0, 7);
  const month = txs.filter((t) => t.date.startsWith(mk));
  const sum = (k) => month.filter((t) => t.type === k).reduce((a, t) => a + t.amount, 0);
  const inc = sum('income'),
    exp = sum('expense'),
    net = inc - exp;
  const shown = txs.filter((t) => filter === 'all' || t.type === filter);
  const kpi = [
    ['Income', inc, 'TrendingUp', 'bg-emerald-100 text-emerald-600'],
    ['Expense', exp, 'TrendingDown', 'bg-red-100 text-red-600'],
  ];
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        {kpi.map(([l, v, ic, tone]) => (
          <Card key={l} className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-600">{l}</p>
                <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight">{inr(v)}</p>
                <p className="mt-1 text-sm text-zinc-500">This month</p>
              </div>
              <span className={cx('flex h-11 w-11 items-center justify-center rounded-xl', tone)}>
                <Icon n={ic} size={20} />
              </span>
            </div>
          </Card>
        ))}
        <Card className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-600">Net</p>
          <p
            className={cx(
              'mt-2 text-3xl font-semibold tabular-nums tracking-tight',
              net < 0 ? 'text-red-600' : 'text-emerald-600'
            )}
          >
            {net < 0 ? '-' : '+'}
            {inr(Math.abs(net))}
          </p>
          <p className="mt-1 text-sm text-zinc-500">Income minus expense</p>
        </Card>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-semibold">Transactions ({shown.length})</h2>
        <div className="flex flex-wrap items-center gap-2">
          <div
            className="inline-flex rounded-md border border-zinc-200 p-0.5"
            role="group"
            aria-label="Filter transactions"
          >
            {[
              ['all', 'All'],
              ['income', 'Income'],
              ['expense', 'Expense'],
            ].map(([k, l]) => (
              <button
                key={k}
                onClick={() => setFilter(k)}
                className={cx(
                  'rounded px-3 py-1 text-xs font-semibold',
                  filter === k ? 'bg-zinc-950 text-white' : 'text-zinc-500 hover:text-zinc-950'
                )}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="space-y-3">
        {shown.map((t) => {
          const inc = t.type === 'income';
          const sal = t.salary;
          return (
            <Card key={t.id} className="rounded-2xl p-4 sm:p-5">
              <div className="flex items-start gap-4">
                <span
                  className={cx(
                    'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl',
                    inc ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
                  )}
                >
                  <Icon n={inc ? 'TrendingUp' : 'TrendingDown'} size={20} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-base font-semibold">{t.category}</p>
                    <p
                      className={cx(
                        'shrink-0 text-lg font-semibold tabular-nums',
                        inc ? 'text-emerald-600' : 'text-red-600'
                      )}
                    >
                      {inc ? '+' : '-'}
                      {inr(t.amount)}
                    </p>
                  </div>
                  <p className="mt-0.5 text-sm text-zinc-600">
                    {t.description || (sal && sal.name ? 'Salary - ' + sal.name : 'No description')}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-800">
                      <Icon n="CreditCard" size={13} />
                      {t.paymentMethod}
                    </span>
                    <span
                      className={cx(
                        'rounded-full px-2.5 py-1 text-xs font-semibold',
                        inc ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                      )}
                    >
                      {inc ? 'Income' : 'Expense'}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium tabular-nums text-zinc-600">
                      <Icon n="Calendar" size={13} />
                      {fmtDate(t.date)}
                    </span>
                    {sal && (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-700">
                        <Icon n="User" size={13} />
                        {sal.recipientType}
                        {sal.name ? ': ' + sal.name : ''}
                        {sal.designation ? ' · ' + sal.designation : ''}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
        {!shown.length && <Card className="p-8 text-center text-sm text-zinc-500">No transactions to show.</Card>}
      </div>
    </div>
  );
}
