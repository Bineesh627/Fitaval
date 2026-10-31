import { useState, useEffect } from 'react';
import { Icon } from './Icon';
import { Avatar } from './ui/Avatar';
import { Badge } from './ui/Badge';
import { Btn } from './ui/Button';
import { Card } from './ui/Card';
import { Sheet } from './ui/Sheet';
import { Tip } from './ui/Tooltip';
import { inputCls } from './ui/styles';
import { cx } from '../lib/utils';

export function DataTable({ cols, rows, noun = 'records', maxH = 'max-h-[620px]', onCount }) {
  const [f, setF] = useState({});
  const [q, setQ] = useState('');
  const set = (id, v) => setF((p) => ({ ...p, [id]: v }));
  const flat = (v) => (Array.isArray(v) ? v : [v]);
  const on = (c) => {
    const v = f[c.id];
    if (v == null) return false;
    if (c.type === 'range') return (v.min || '') !== '' || (v.max || '') !== '';
    return String(v).trim() !== '';
  };
  const pass = (c, r) => {
    if (!on(c)) return true;
    const v = f[c.id],
      x = c.get(r);
    if (c.type === 'select') return flat(x).map(String).includes(v);
    if (c.type === 'range') {
      const n = c.num ? Number(x) : String(x);
      const lo = v.min ? (c.num ? Number(v.min) : v.min) : null;
      const hi = v.max ? (c.num ? Number(v.max) : v.max) : null;
      return (lo == null || n >= lo) && (hi == null || n <= hi);
    }
    return flat(x).join(' ').toLowerCase().includes(String(v).trim().toLowerCase());
  };
  const shown = rows.filter(
    (r) =>
      cols.every((c) => pass(c, r)) &&
      (!q.trim() ||
        cols
          .map((c) => flat(c.get(r)).join(' '))
          .join(' ')
          .toLowerCase()
          .includes(q.trim().toLowerCase()))
  );
  const nAct = cols.filter(on).length + (q.trim() ? 1 : 0);
  useEffect(() => {
    if (onCount) onCount(shown.length);
  }, [shown.length]);
  const base =
    'h-8 w-full min-w-0 rounded border border-zinc-200 bg-white px-2 text-xs font-normal text-zinc-800 focus:border-emerald-500 focus:outline-none';
  const ctl = (c) => {
    if (c.type === 'select') {
      const o = [...new Set(rows.flatMap((r) => flat(c.get(r)).map(String)))].sort();
      return (
        <select
          aria-label={'Filter ' + c.label}
          className={base}
          value={f[c.id] || ''}
          onChange={(e) => set(c.id, e.target.value)}
        >
          <option value="">All</option>
          {o.map((x) => (
            <option key={x} value={x}>
              {x}
            </option>
          ))}
        </select>
      );
    }
    if (c.type === 'range') {
      const v = f[c.id] || {};
      const t = c.num ? 'number' : 'date';
      return (
        <div className="flex gap-1">
          <input
            type={t}
            placeholder="Min"
            aria-label={c.label + ' from'}
            className={base}
            value={v.min || ''}
            onChange={(e) => set(c.id, { ...v, min: e.target.value })}
          />
          <input
            type={t}
            placeholder="Max"
            aria-label={c.label + ' to'}
            className={base}
            value={v.max || ''}
            onChange={(e) => set(c.id, { ...v, max: e.target.value })}
          />
        </div>
      );
    }
    return (
      <input
        placeholder="Filter"
        aria-label={'Filter ' + c.label}
        className={base}
        value={f[c.id] || ''}
        onChange={(e) => set(c.id, e.target.value)}
      />
    );
  };
  const wOf = (c) => (c.type === 'range' ? (c.num ? 150 : 290) : c.w || 170);
  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-zinc-100 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Icon n="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            aria-label={'Search ' + noun}
            className={cx(inputCls, 'pl-9')}
            placeholder={'Search all ' + noun}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Badge tone={nAct ? 'green' : 'muted'}>
            <Icon n="Filter" size={11} />
            {nAct} active filter{nAct === 1 ? '' : 's'}
          </Badge>
          <Btn
            size="sm"
            v="outline"
            disabled={!nAct}
            onClick={() => {
              setF({});
              setQ('');
            }}
          >
            Clear filters
          </Btn>
        </div>
      </div>
      <div className={cx('thin-scroll overflow-auto', maxH)}>
        <table className="w-full text-left text-sm" style={{ minWidth: cols.reduce((a, c) => a + wOf(c) + 16, 0) }}>
          <thead className="sticky top-0 z-10">
            <tr className="bg-zinc-950 text-xs text-zinc-300">
              {cols.map((c) => (
                <th key={c.id} className="whitespace-nowrap px-4 py-3 font-medium">
                  <span className="inline-flex items-center gap-1.5">
                    {c.label}
                    {on(c) && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>}
                  </span>
                </th>
              ))}
            </tr>
            <tr className="border-b border-zinc-200 bg-zinc-50">
              {cols.map((c) => (
                <th key={c.id} className="px-3 py-2 font-normal" style={{ minWidth: wOf(c) }}>
                  {c.nofilter ? null : ctl(c)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {shown.map((r) => (
              <tr key={r.id} className="hover:bg-emerald-50/30">
                {cols.map((c) => (
                  <td
                    key={c.id}
                    className={cx(
                      'px-4 py-3 align-top',
                      c.wrap
                        ? 'min-w-[240px] max-w-[320px] text-xs leading-relaxed text-zinc-600'
                        : 'whitespace-nowrap text-zinc-600'
                    )}
                  >
                    {c.render ? c.render(r) : String(c.get(r))}
                  </td>
                ))}
              </tr>
            ))}
            {!shown.length && (
              <tr>
                <td colSpan={cols.length} className="px-4 py-12 text-center text-sm text-zinc-500">
                  No {noun} match these filters. Clear the filters to see everyone.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="border-t border-zinc-100 px-4 py-3 text-xs text-zinc-500">
        Showing {shown.length} of {rows.length} {noun}
      </div>
    </Card>
  );
}

export const person = (n, sub) => (
  <div className="flex items-center gap-3">
    <Avatar name={n} size={32} />
    <div>
      <p className="font-medium text-zinc-950">{n}</p>
      {sub && <p className="text-xs text-zinc-500">{sub}</p>}
    </div>
  </div>
);

export const actBadge = (a) => <Badge tone={a ? 'green' : 'muted'}>{a ? 'Active' : 'Inactive'}</Badge>;

export function Info({ items }) {
  return (
    <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
      {items.map(([l, v, wide]) => (
        <div key={l} className={wide ? 'col-span-2' : ''}>
          <dt className="text-xs text-zinc-500">{l}</dt>
          <dd className="mt-0.5 break-words font-medium text-zinc-900">{v == null || v === '' ? '·' : v}</dd>
        </div>
      ))}
    </dl>
  );
}

export function DetailSheet({ title, sub, name, badges, sections, onClose }) {
  return (
    <Sheet open={true} onClose={onClose} title={title} sub={sub}>
      <div className="space-y-4 pb-4">
        <Card className="p-5">
          <div className="flex items-center gap-4">
            <Avatar name={name} size={60} />
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-lg font-semibold">{name}</h3>
              <div className="mt-2 flex flex-wrap gap-1.5">{badges}</div>
            </div>
          </div>
        </Card>
        {sections.map(([t, items]) => (
          <Card key={t} className="p-5">
            <h4 className="mb-3 text-sm font-semibold">{t}</h4>
            <Info items={items} />
          </Card>
        ))}
      </div>
    </Sheet>
  );
}

export const nameBtn = (n, sub, onClick) => (
  <div className="flex items-center gap-3">
    <Avatar name={n} size={32} />
    <div>
      <button className="text-left font-medium text-zinc-950 hover:text-emerald-700" onClick={onClick}>
        {n}
      </button>
      {sub && <p className="text-xs text-zinc-500">{sub}</p>}
    </div>
  </div>
);

export const viewBtn = (onClick) => (
  <Tip text="View full details">
    <Btn v="ghost" size="icon" aria-label="View full details" onClick={onClick}>
      <Icon n="Eye" size={15} />
    </Btn>
  </Tip>
);
