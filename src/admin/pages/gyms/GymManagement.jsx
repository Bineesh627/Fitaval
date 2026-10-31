import { useState } from 'react';
import { ApprovalBadge } from '../../components/ApprovalBadge';
import { DataTable } from '../../components/DataTable';
import { Icon } from '../../components/Icon';
import { Kpi } from '../../components/Kpi';
import { Badge } from '../../components/ui/Badge';
import { Btn } from '../../components/ui/Button';
import { Field } from '../../components/ui/Field';
import { Modal } from '../../components/ui/Modal';
import { PageHead } from '../../components/ui/PageHead';
import { inputCls } from '../../components/ui/styles';
import { useApp } from '../../context/AppContext';
import { DOCS } from '../../data/approvals';
import { cx } from '../../lib/utils';
import VerifiedTick from '../../../shared/VerifiedTick';
import { useVerified } from '../../../shared/verified';

function NameTick({ id }) {
  return useVerified(id) ? <VerifiedTick size={15} className="ml-1" /> : null;
}

export function ReviewModal({ g, onClose, onDone }) {
  const { perms, setApprovals, setApprovedN, toast, addAudit } = useApp();
  const [checks, setChecks] = useState(() => DOCS.map((_, i) => i < (g.status === 'Under Review' ? 3 : 2)));
  const [note, setNote] = useState('');
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');
  const verified = checks.filter(Boolean).length;
  const st = g.status.toUpperCase().replace(' ', '_');
  const finish = (title, desc, leave) => {
    toast({ title, desc });
    onClose();
    if (leave && onDone) onDone();
  };
  const approve = () => {
    setApprovals((a) => a.map((x) => (x.id === g.id ? { ...x, status: 'Approved' } : x)));
    setApprovedN((n) => n + 1);
    addAudit('UPDATE', 'gyms.Gym', g.id, { status: st }, { status: 'APPROVED', documents_verified: verified });
    finish(g.name + ' approved', 'The gym is now active and the owner has been notified.', true);
  };
  const startReview = () => {
    setApprovals((a) => a.map((x) => (x.id === g.id ? { ...x, status: 'Under Review' } : x)));
    addAudit('UPDATE', 'gyms.Gym', g.id, { status: st }, { status: 'UNDER_REVIEW' });
    finish('Review started', g.name + ' moved to Under Review.');
  };
  const reject = () => {
    setApprovals((a) => a.map((x) => (x.id === g.id ? { ...x, status: 'Rejected' } : x)));
    addAudit('UPDATE', 'gyms.Gym', g.id, { status: st }, { status: 'REJECTED', reason: reason.trim() });
    finish(g.name + ' rejected', 'The owner will be emailed the reason.', true);
  };
  return (
    <Modal
      open={true}
      onClose={onClose}
      size="md"
      title={'Review ' + g.name}
      sub={g.id + ' · submitted ' + g.on}
      footer={
        <>
          <Btn onClick={onClose}>Close</Btn>
          {perms.editGym && !rejecting && <Btn onClick={() => setRejecting(true)}>Reject</Btn>}
          {perms.editGym && g.status === 'Pending' && (
            <Btn v="soft" onClick={startReview}>
              Start review
            </Btn>
          )}
          {perms.editGym && (
            <Btn v="primary" disabled={verified < DOCS.length || rejecting} onClick={approve}>
              Approve gym
            </Btn>
          )}
        </>
      }
    >
      <dl className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <dt className="text-xs text-zinc-500">Location</dt>
          <dd className="mt-0.5 flex items-center gap-1.5 font-medium">
            <Icon n="MapPin" size={14} className="text-zinc-400" />
            {g.loc}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-zinc-500">Owner</dt>
          <dd className="mt-0.5 flex items-center gap-1.5 font-medium">
            <Icon n="User" size={14} className="text-zinc-400" />
            {g.owner}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-zinc-500">Submitted on</dt>
          <dd className="mt-0.5 font-medium tabular-nums">{g.on}</dd>
        </div>
        <div>
          <dt className="text-xs text-zinc-500">Status</dt>
          <dd className="mt-0.5">
            <ApprovalBadge s={g.status} />
          </dd>
        </div>
      </dl>
      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-semibold">Documents</p>
          <span className="text-xs tabular-nums text-zinc-500">
            {verified} of {DOCS.length} verified
          </span>
        </div>
        <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-zinc-100">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all"
            style={{ width: (verified / DOCS.length) * 100 + '%' }}
          ></div>
        </div>
        <ul className="divide-y divide-zinc-100 rounded-lg border border-zinc-200">
          {DOCS.map((d, i) => (
            <li key={d}>
              <label htmlFor={'doc-' + i} className="flex cursor-pointer items-center gap-3 px-3 py-2.5 text-sm">
                <input
                  id={'doc-' + i}
                  type="checkbox"
                  className="h-4 w-4 accent-emerald-500"
                  disabled={!perms.editGym}
                  checked={checks[i]}
                  onChange={() => setChecks((c) => c.map((v, j) => (j === i ? !v : v)))}
                />
                <span className={checks[i] ? 'text-zinc-950' : 'text-zinc-600'}>{d}</span>
                {checks[i] && (
                  <Badge tone="green" className="ml-auto">
                    Verified
                  </Badge>
                )}
              </label>
            </li>
          ))}
        </ul>
      </div>
      <Field label="Internal note" id="rv-note" className="mt-4">
        <textarea
          id="rv-note"
          rows="2"
          disabled={!perms.editGym}
          className={cx(inputCls, 'h-auto py-2')}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Visible to admins only"
        ></textarea>
      </Field>
      {rejecting && (
        <div className="mt-4 space-y-3 rounded-lg border-2 border-zinc-950 p-3">
          <Field label="Reason for rejection" id="rv-reason">
            <input
              id="rv-reason"
              className={inputCls}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Insurance certificate has expired"
            />
          </Field>
          <div className="flex gap-2">
            <Btn v="dark" disabled={!reason.trim()} onClick={reject}>
              Confirm rejection
            </Btn>
            <Btn
              v="ghost"
              onClick={() => {
                setRejecting(false);
                setReason('');
              }}
            >
              Cancel
            </Btn>
          </div>
        </div>
      )}
      {!perms.editGym && (
        <p className="mt-4 text-xs text-zinc-500">
          View only for your role. Switch to Branch Manager or Super Admin to approve or reject.
        </p>
      )}
    </Modal>
  );
}

export function GymManagement() {
  const { perms, approvals, approvedN, openGym } = useApp();
  const [review, setReview] = useState(null);
  const live = review ? approvals.find((a) => a.id === review) : null;
  const isPend = (g) => g.status === 'Pending' || g.status === 'Under Review';
  const n = (v) => v.toLocaleString('en-US');
  const kpis = [
    { label: 'Total Gyms', value: n(1245), icon: 'Building2', trend: '12.5%', period: '30 days' },
    { label: 'Active Gyms', value: n(1187 + approvedN), icon: 'CheckCircle2', trend: '8.3%', period: '30 days' },
    { label: 'Flagged Reviews', value: '23', icon: 'Flag', trend: '5.2%', down: true, period: '7 days' },
    {
      label: 'Revenue',
      value: '₹1.04 Cr',
      icon: 'IndianRupee',
      trend: '18.7%',
      period: '30 days',
      locked: !perms.revenue,
    },
  ];
  const toIso = (d) => {
    const [m, dd, y] = d.split('/');
    return y + '-' + m.padStart(2, '0') + '-' + dd.padStart(2, '0');
  };
  const rows = approvals.map((a) => ({ ...a, iso: toIso(a.on) }));
  const cnt = (k) => approvals.filter((a) => a.status === k).length;
  const cols = [
    {
      id: 'name',
      label: 'Gym name',
      type: 'text',
      w: 220,
      get: (g) => g.name + ' ' + g.id,
      render: (g) => (
        <div>
          <button
            className="text-left font-medium text-zinc-950 underline-offset-2 hover:text-emerald-700 hover:underline"
            onClick={() => openGym(g.id)}
          >
            {g.name}
          </button>
          <NameTick id={g.id} />
          <p className="text-xs text-zinc-500">{g.id}</p>
        </div>
      ),
    },
    {
      id: 'loc',
      label: 'Location',
      type: 'select',
      get: (g) => g.loc,
      render: (g) => (
        <span className="inline-flex items-center gap-2">
          <Icon n="MapPin" size={15} className="text-zinc-400" />
          {g.loc}
        </span>
      ),
    },
    {
      id: 'owner',
      label: 'Owner',
      type: 'select',
      get: (g) => g.owner,
      render: (g) => (
        <span className="inline-flex items-center gap-2">
          <Icon n="User" size={15} className="text-zinc-400" />
          {g.owner}
        </span>
      ),
    },
    {
      id: 'on',
      label: 'Submitted on',
      type: 'range',
      get: (g) => g.iso,
      render: (g) => (
        <span className="inline-flex items-center gap-2 tabular-nums">
          <Icon n="Calendar" size={15} className="text-zinc-400" />
          {g.on}
        </span>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      type: 'select',
      get: (g) => g.status,
      render: (g) => <ApprovalBadge s={g.status} />,
    },
    {
      id: 'act',
      label: 'Action',
      type: 'select',
      get: (g) => (isPend(g) ? 'Needs review' : 'Reviewed'),
      render: (g) =>
        isPend(g) ? (
          <button
            className="inline-flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700"
            onClick={() => setReview(g.id)}
          >
            Review
            <Icon n="ArrowRight" size={14} />
          </button>
        ) : (
          <button
            className="inline-flex items-center gap-1 text-sm font-medium text-zinc-600 hover:text-zinc-950"
            onClick={() => openGym(g.id)}
          >
            View details
            <Icon n="ArrowRight" size={14} />
          </button>
        ),
    },
  ];
  return (
    <div>
      <PageHead title="All Gyms" sub="Monitor every registered gym, review new registrations and see approved gyms" />
      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        {kpis.map((k) => (
          <Kpi key={k.label} {...k} />
        ))}
      </div>
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">Gym registrations</h2>
          <p className="mt-0.5 text-sm text-zinc-500">
            Pending, approved and rejected gyms in one list. Use the filters under each heading.
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Badge tone="black" className="tabular-nums">
            {cnt('Pending')} pending
          </Badge>
          <Badge tone="green" className="tabular-nums">
            {cnt('Under Review')} under review
          </Badge>
          <Badge tone="solid" className="tabular-nums">
            {cnt('Approved')} approved
          </Badge>
          <Badge tone="outline" className="tabular-nums">
            {cnt('Rejected')} rejected
          </Badge>
        </div>
      </div>
      <DataTable cols={cols} rows={rows} noun="gyms" />
      {live && <ReviewModal key={live.id} g={live} onClose={() => setReview(null)} />}
    </div>
  );
}
