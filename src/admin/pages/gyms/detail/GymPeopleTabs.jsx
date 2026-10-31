import { useState } from 'react';
import { DataTable, actBadge, DetailSheet, nameBtn, viewBtn } from '../../../components/DataTable';
import { Badge, StatusBadge } from '../../../components/ui/Badge';
import { Card } from '../../../components/ui/Card';
import { Locked } from '../../../components/ui/PageHead';
import { useApp } from '../../../context/AppContext';
import { hrsText } from '../../../lib/gym';
import { inr, fmtDate } from '../../../lib/utils';

export function GymStaffTab({ g }) {
  const [open, setOpen] = useState(null);
  const tone = { 'On Shift': 'green', 'Off Today': 'muted', 'On Leave': 'black' };
  const c = (k) => g.staff.filter((s) => s.status === k).length;
  const cur = g.staff.find((s) => s.id === open);
  const cols = [
    {
      id: 'name',
      label: 'Staff member',
      type: 'text',
      w: 220,
      get: (s) => s.name + ' ' + s.role,
      render: (s) => nameBtn(s.name, s.role, () => setOpen(s.id)),
    },
    { id: 'phone', label: 'Phone number', type: 'text', get: (s) => s.phone },
    {
      id: 'status',
      label: 'Shift status',
      type: 'select',
      get: (s) => s.status,
      render: (s) => <Badge tone={tone[s.status]}>{s.status}</Badge>,
    },
    {
      id: 'active',
      label: 'Active status',
      type: 'select',
      get: (s) => (s.active ? 'Active' : 'Inactive'),
      render: (s) => actBadge(s.active),
    },
    { id: 'act', label: 'Actions', nofilter: true, get: (s) => '', render: (s) => viewBtn(() => setOpen(s.id)) },
  ];
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          ['Total staff', g.staff.length],
          ['On shift now', c('On Shift')],
          ['On leave', c('On Leave')],
        ].map(([l, v]) => (
          <Card key={l} className="p-4">
            <p className="text-xs text-zinc-500">{l}</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">{v}</p>
          </Card>
        ))}
      </div>
      <DataTable cols={cols} rows={g.staff} noun="staff" />
      {cur && (
        <DetailSheet
          title="Staff details"
          sub={g.name}
          name={cur.name}
          onClose={() => setOpen(null)}
          badges={
            <>
              <Badge tone="muted">{cur.role}</Badge>
              <Badge tone={tone[cur.status]}>{cur.status}</Badge>
              {actBadge(cur.active)}
            </>
          }
          sections={[
            [
              'Contact',
              [
                ['Phone number', cur.phone],
                ['Email address', cur.email, true],
              ],
            ],
            [
              'Work',
              [
                ['Role', cur.role],
                ['Joined', fmtDate(cur.since)],
                ['Operating hours and shift', hrsText(cur.hours), true],
                ['Shift', cur.shift, true],
              ],
            ],
            ['About', [['Bio', cur.bio, true]]],
          ]}
        />
      )}
    </div>
  );
}

export function GymTrainersTab({ g }) {
  const [open, setOpen] = useState(null);
  const cur = g.trainers.find((t) => t.id === open);
  const cols = [
    {
      id: 'name',
      label: 'Trainer',
      type: 'text',
      w: 220,
      get: (t) => t.name,
      render: (t) => nameBtn(t.name, t.exp + ' yrs experience', () => setOpen(t.id)),
    },
    { id: 'phone', label: 'Phone number', type: 'text', get: (t) => t.phone },
    {
      id: 'active',
      label: 'Active status',
      type: 'select',
      get: (t) => (t.active ? 'Active' : 'Inactive'),
      render: (t) => actBadge(t.active),
    },
    { id: 'act', label: 'Actions', nofilter: true, get: (t) => '', render: (t) => viewBtn(() => setOpen(t.id)) },
  ];
  return (
    <div>
      <DataTable cols={cols} rows={g.trainers} noun="trainers" />
      {cur && (
        <DetailSheet
          title="Trainer details"
          sub={g.name}
          name={cur.name}
          onClose={() => setOpen(null)}
          badges={
            <>
              {actBadge(cur.active)}
              <Badge tone="muted">{cur.exp} yrs experience</Badge>
            </>
          }
          sections={[
            [
              'Contact',
              [
                ['Phone number', cur.phone],
                ['Email address', cur.email, true],
              ],
            ],
            [
              'Coaching',
              [
                ['Experience', cur.exp + ' years'],
                ['Clients', cur.clients],
                ['Certifications', cur.certs, true],
                [
                  'Specializations',
                  <div className="flex flex-wrap gap-1">
                    {cur.specs.map((x) => (
                      <Badge key={x} tone="green">
                        {x}
                      </Badge>
                    ))}
                  </div>,
                  true,
                ],
                ['Operating hours and shift', hrsText(cur.hours), true],
              ],
            ],
            ['About', [['Coach bio', cur.bio, true]]],
          ]}
        />
      )}
    </div>
  );
}

export function GymMembersTab({ g }) {
  const { perms } = useApp();
  const [open, setOpen] = useState(null);
  if (!perms.members)
    return (
      <Locked
        title="Member records are restricted"
        text="Trainers cannot see the member list. Switch the role preview to Front Desk Staff, Branch Manager or Super Admin to continue."
      />
    );
  const payTone = { Paid: 'green', Partial: 'outline', Pending: 'black' };
  const cur = g.members.find((m) => m.id === open);
  const cols = [
    {
      id: 'name',
      label: 'Member',
      type: 'text',
      w: 220,
      get: (m) => m.name,
      render: (m) => nameBtn(m.name, null, () => setOpen(m.id)),
    },
    { id: 'phone', label: 'Phone number', type: 'text', get: (m) => m.phone },
    { id: 'plan', label: 'Membership plan', type: 'select', get: (m) => m.plan },
    {
      id: 'status',
      label: 'Membership status',
      type: 'select',
      get: (m) => m.status,
      render: (m) => <StatusBadge s={m.status} />,
    },
    {
      id: 'pay',
      label: 'Payment status',
      type: 'select',
      get: (m) => m.pay,
      render: (m) => <Badge tone={payTone[m.pay]}>{m.pay}</Badge>,
    },
    { id: 'act', label: 'Actions', nofilter: true, get: (m) => '', render: (m) => viewBtn(() => setOpen(m.id)) },
  ];
  return (
    <div>
      <DataTable cols={cols} rows={g.members} noun="members" />
      {cur && (
        <DetailSheet
          title="Member details"
          sub={cur.token}
          name={cur.name}
          onClose={() => setOpen(null)}
          badges={
            <>
              <StatusBadge s={cur.status} />
              <Badge tone="muted">{cur.plan}</Badge>
              <Badge tone={payTone[cur.pay]}>{cur.pay}</Badge>
            </>
          }
          sections={[
            [
              'Personal',
              [
                ['Gender', cur.gender],
                ['Date of birth', fmtDate(cur.dob)],
                ['Phone number', cur.phone],
                ['Email address', cur.email, true],
                ['Address', cur.address, true],
              ],
            ],
            [
              'Membership',
              [
                ['Plan', cur.plan],
                ['Plan fee', inr(cur.fee)],
                ['Start date', fmtDate(cur.start)],
                ['End date', fmtDate(cur.end)],
                ['Assigned trainer', cur.trainer],
                ['Last visit', fmtDate(cur.last)],
                ['Payment method', cur.payMethod, true],
                ['QR token', <span className="font-mono text-xs">{cur.token}</span>, true],
              ],
            ],
          ]}
        />
      )}
    </div>
  );
}
