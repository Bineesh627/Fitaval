import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { Btn } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useApp } from '../../context/AppContext';
import { BR } from '../../data/branches';
import { TODAY, fmtDate } from '../../lib/utils';

export function StaffTab() {
  const { branch, staff, setStaff, toast } = useApp();
  const list = staff.filter((s) => branch === 'all' || s.branch === branch);
  const tone = {
    'On Shift': 'green',
    Completed: 'muted',
    Late: 'black',
    'Not Started': 'outline',
    'On Break': 'muted',
  };
  const now = () => new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
  const act = (s) => {
    if (s.status === 'Not Started') {
      setStaff((x) => x.map((r) => (r.id === s.id ? { ...r, status: 'On Shift', in: now() } : r)));
      toast({ title: s.name + ' checked in', desc: 'Shift ' + s.shift });
    } else if (s.status === 'On Shift' || s.status === 'Late' || s.status === 'On Break') {
      setStaff((x) => x.map((r) => (r.id === s.id ? { ...r, status: 'Completed', out: now() } : r)));
      toast({ title: s.name + ' checked out', desc: 'Shift closed for today.' });
    }
  };
  const c = (k) => list.filter((s) => s.status === k).length;
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-4">
        {[
          ['On Shift', c('On Shift') + c('Late')],
          ['On Break', c('On Break')],
          ['Not Started', c('Not Started')],
          ['Completed', c('Completed')],
        ].map(([l, v]) => (
          <Card key={l} className="p-4">
            <p className="text-xs text-zinc-500">{l}</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">{v}</p>
          </Card>
        ))}
      </div>
      <Card className="overflow-hidden">
        <div className="border-b border-zinc-100 px-5 py-4">
          <h3 className="text-base font-semibold">Staff attendance · {fmtDate(TODAY)}</h3>
        </div>
        <div className="thin-scroll overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="bg-zinc-950 text-xs text-zinc-300">
                {['Staff member', 'Branch', 'Shift', 'In', 'Out', 'Status', ''].map((h, i) => (
                  <th key={i} className="px-4 py-3 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {list.map((s) => (
                <tr key={s.id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={s.name} size={32} />
                      <div>
                        <p className="font-medium">{s.name}</p>
                        <p className="text-xs text-zinc-500">{s.role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-zinc-600">{BR[s.branch].short}</td>
                  <td className="whitespace-nowrap px-4 py-3 tabular-nums text-zinc-600">{s.shift}</td>
                  <td className="px-4 py-3 tabular-nums">{s.in || '·'}</td>
                  <td className="px-4 py-3 tabular-nums">{s.out || '·'}</td>
                  <td className="px-4 py-3">
                    <Badge tone={tone[s.status]}>{s.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {s.status !== 'Completed' && (
                      <Btn size="sm" v={s.status === 'Not Started' ? 'primary' : 'outline'} onClick={() => act(s)}>
                        {s.status === 'Not Started' ? 'Check in' : 'Check out'}
                      </Btn>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
