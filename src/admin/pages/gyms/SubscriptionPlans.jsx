import { useState } from 'react';
import { Icon } from '../../components/Icon';
import { Badge } from '../../components/ui/Badge';
import { Btn } from '../../components/ui/Button';
import { Field } from '../../components/ui/Field';
import { Modal } from '../../components/ui/Modal';
import { PageHead } from '../../components/ui/PageHead';
import { Switch } from '../../components/ui/Switch';
import { inputCls } from '../../components/ui/styles';
import { useApp } from '../../context/AppContext';
import { cx, inr } from '../../lib/utils';

export function SubscriptionPlans() {
  const { perms, plans, setPlans, toast, addAudit } = useApp();
  const [edit, setEdit] = useState(null);
  return (
    <div>
      <PageHead
        title="Subscription Plans"
        sub="Pricing tiers members subscribe to. Changes apply to new sign-ups and renewals."
      />
      <div className="grid gap-4 pt-3 sm:grid-cols-2 xl:grid-cols-4">
        {plans.map((p) => (
          <div
            key={p.id}
            className={cx(
              'relative flex flex-col rounded-xl p-5',
              p.popular
                ? 'border-2 border-emerald-500 bg-zinc-950 text-white shadow-lg'
                : 'border border-zinc-200 bg-white text-zinc-950'
            )}
          >
            {p.popular && (
              <span className="absolute -top-3 left-5">
                <Badge tone="solid">Most Popular</Badge>
              </span>
            )}
            <p className={cx('text-sm font-semibold', p.popular ? 'text-emerald-400' : 'text-zinc-500')}>{p.name}</p>
            <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight">{inr(p.price)}</p>
            <p className={cx('mt-1 text-xs tabular-nums', p.popular ? 'text-zinc-400' : 'text-zinc-500')}>
              {p.days} days · {inr(Math.round(p.price / p.days))} per day
            </p>
            <ul className="mt-5 flex-1 space-y-2.5">
              {p.perks.map((k) => (
                <li key={k} className="flex items-start gap-2 text-sm">
                  <span
                    className={cx(
                      'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full',
                      p.popular ? 'bg-emerald-500 text-zinc-950' : 'bg-emerald-50 text-emerald-700'
                    )}
                  >
                    <Icon n="Check" size={10} strokeWidth={3} />
                  </span>
                  <span className={p.popular ? 'text-zinc-200' : 'text-zinc-700'}>{k}</span>
                </li>
              ))}
            </ul>
            <div
              className={cx(
                'mt-5 flex items-center justify-between border-t pt-4 text-xs',
                p.popular ? 'border-zinc-800 text-zinc-400' : 'border-zinc-100 text-zinc-500'
              )}
            >
              <span className="tabular-nums">{p.subs} active subscribers</span>
            </div>
            {perms.editGym ? (
              <Btn
                v={p.popular ? 'primary' : 'dark'}
                className="mt-3 w-full"
                onClick={() => setEdit({ ...p, perksText: p.perks.join('\n') })}
              >
                <Icon n="Pencil" size={14} />
                Edit plan
              </Btn>
            ) : (
              <p className={cx('mt-3 text-center text-xs', p.popular ? 'text-zinc-500' : 'text-zinc-400')}>
                View only for your role
              </p>
            )}
          </div>
        ))}
      </div>
      {edit && (
        <Modal
          open={true}
          onClose={() => setEdit(null)}
          title={'Edit ' + edit.name + ' plan'}
          sub="Changes apply to new sign-ups and renewals"
          footer={
            <>
              <Btn onClick={() => setEdit(null)}>Discard</Btn>
              <Btn
                v="primary"
                disabled={!edit.name.trim() || Number(edit.price) <= 0 || Number(edit.days) <= 0}
                onClick={() => {
                  const next = {
                    ...edit,
                    price: Number(edit.price),
                    days: Number(edit.days),
                    perks: edit.perksText
                      .split('\n')
                      .map((s) => s.trim())
                      .filter(Boolean),
                  };
                  delete next.perksText;
                  const old = plans.find((p) => p.id === edit.id);
                  setPlans((ps) =>
                    ps.map((p) => (p.id === edit.id ? next : next.popular ? { ...p, popular: false } : p))
                  );
                  addAudit(
                    'UPDATE',
                    'billing.SubscriptionPlan',
                    'plan-' + next.name.toLowerCase().replace(/\s+/g, '-'),
                    { price_inr: old.price, duration_days: old.days },
                    { price_inr: next.price, duration_days: next.days }
                  );
                  toast({
                    title: 'Plan saved',
                    desc: next.name + ' is now ' + inr(next.price) + ' for ' + next.days + ' days.',
                  });
                  setEdit(null);
                }}
              >
                Save plan
              </Btn>
            </>
          }
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Plan name" id="pl-name">
              <input
                id="pl-name"
                className={inputCls}
                value={edit.name}
                onChange={(e) => setEdit({ ...edit, name: e.target.value })}
              />
            </Field>
            <Field label="Duration (days)" id="pl-days">
              <input
                id="pl-days"
                type="number"
                min="1"
                className={inputCls}
                value={edit.days}
                onChange={(e) => setEdit({ ...edit, days: e.target.value })}
              />
            </Field>
            <Field label="Price (₹)" id="pl-price">
              <input
                id="pl-price"
                type="number"
                min="1"
                className={inputCls}
                value={edit.price}
                onChange={(e) => setEdit({ ...edit, price: e.target.value })}
              />
            </Field>
            <div className="flex items-end justify-between gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2">
              <label htmlFor="pl-pop" className="text-sm font-medium">
                Mark as Most Popular
              </label>
              <Switch
                id="pl-pop"
                checked={edit.popular}
                onChange={(v) => setEdit({ ...edit, popular: v })}
                label="Most popular"
              />
            </div>
            <Field label="Perks (one per line)" id="pl-perks" className="sm:col-span-2">
              <textarea
                id="pl-perks"
                rows="6"
                className={cx(inputCls, 'h-auto py-2')}
                value={edit.perksText}
                onChange={(e) => setEdit({ ...edit, perksText: e.target.value })}
              ></textarea>
            </Field>
          </div>
        </Modal>
      )}
    </div>
  );
}
