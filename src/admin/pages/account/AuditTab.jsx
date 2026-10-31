import { useState } from 'react';
import { Icon } from '../../components/Icon';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { Locked } from '../../components/ui/PageHead';
import { inputCls } from '../../components/ui/styles';
import { useApp } from '../../context/AppContext';
import { cx, fmtTs } from '../../lib/utils';

export function JsonBlock({ title, obj, other, tone }) {
  const lines = JSON.stringify(obj, null, 2).split('\n');
  const otherSet = new Set(JSON.stringify(other, null, 2).split('\n'));
  return (
    <div className="min-w-0 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950">
      <div className="flex items-center justify-between border-b border-zinc-800 px-3 py-2">
        <span className="text-xs font-semibold text-white">{title}</span>
        <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
      </div>
      <pre className="thin-scroll overflow-x-auto p-3 font-mono text-xs leading-6 text-emerald-400">
        {lines.map((l, i) => (
          <div
            key={i}
            className={cx(
              '-mx-3 px-3',
              !otherSet.has(l) &&
                (tone === 'after' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-zinc-800 text-zinc-400')
            )}
          >
            {l}
          </div>
        ))}
      </pre>
    </div>
  );
}

export function AuditTab() {
  const { perms, audit } = useApp();
  const [f, setF] = useState('ALL');
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(null);
  if (!perms.audit)
    return (
      <Locked
        title="Audit logs are for Super Admins"
        text="System audit logs record sensitive actions such as freezes, exports and security changes. Switch the role preview to Super Admin to view them."
      />
    );
  const aTone = { CREATE: 'green', UPDATE: 'muted', FREEZE: 'black', SECURITY: 'outline', EXPORT: 'solid' };
  const rows = audit.filter(
    (a) =>
      (f === 'ALL' || a.action === f) &&
      (!q.trim() || (a.actor + a.model + a.obj + a.ip).toLowerCase().includes(q.trim().toLowerCase()))
  );
  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-zinc-100 p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="no-scrollbar flex gap-1 overflow-x-auto">
          {['ALL', 'CREATE', 'UPDATE', 'FREEZE', 'SECURITY', 'EXPORT'].map((k) => (
            <button
              key={k}
              onClick={() => setF(k)}
              className={cx(
                'rounded-full border px-3 py-1.5 text-xs font-semibold',
                f === k ? 'border-zinc-950 bg-zinc-950 text-white' : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'
              )}
            >
              {k}
            </button>
          ))}
        </div>
        <div className="relative w-full lg:max-w-xs">
          <Icon n="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            aria-label="Search audit logs"
            className={cx(inputCls, 'pl-9')}
            placeholder="Search actor, model or IP"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>
      <div className="thin-scroll max-h-[620px] overflow-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="sticky top-0">
            <tr className="bg-zinc-950 text-xs text-zinc-300">
              {['Timestamp', 'Action', 'Actor', 'Target model', 'IP address', ''].map((h, i) => (
                <th key={i} className="px-4 py-3 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {rows.map((a) => (
              <tr
                key={a.id}
                tabIndex="0"
                className="cursor-pointer hover:bg-emerald-50/40"
                onClick={() => setSel(a)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') setSel(a);
                }}
              >
                <td className="whitespace-nowrap px-4 py-3 font-mono text-xs tabular-nums text-zinc-600">
                  {fmtTs(a.at)}
                </td>
                <td className="px-4 py-3">
                  <Badge tone={aTone[a.action]}>{a.action}</Badge>
                </td>
                <td className="whitespace-nowrap px-4 py-3 font-medium">{a.actor}</td>
                <td className="px-4 py-3">
                  <span className="font-mono text-xs">{a.model}</span>
                  <p className="font-mono text-[11px] text-zinc-500">{a.obj}</p>
                </td>
                <td className="px-4 py-3 font-mono text-xs tabular-nums text-zinc-600">{a.ip}</td>
                <td className="px-4 py-3 text-right text-zinc-400">
                  <Icon n="ChevronRight" size={16} />
                </td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td colSpan="6" className="px-4 py-12 text-center text-sm text-zinc-500">
                  No audit entries match. Try a different action filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {sel && (
        <Modal
          open={true}
          onClose={() => setSel(null)}
          size="xl"
          title="JSON diff inspector"
          sub={sel.action + ' · ' + sel.model + ' · ' + sel.obj + ' · by ' + sel.actor}
        >
          <div className="grid gap-3 md:grid-cols-2">
            <JsonBlock title="Before State" obj={sel.before} other={sel.after} tone="before" />
            <JsonBlock title="After State" obj={sel.after} other={sel.before} tone="after" />
          </div>
          <p className="mt-3 text-xs text-zinc-500">
            Highlighted lines changed. {fmtTs(sel.at)} from {sel.ip}.
          </p>
        </Modal>
      )}
    </Card>
  );
}
