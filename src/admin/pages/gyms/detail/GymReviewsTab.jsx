import { useState } from 'react';
import { Icon } from '../../../components/Icon';
import { Stars } from '../../../components/Stars';
import { Avatar } from '../../../components/ui/Avatar';
import { Badge } from '../../../components/ui/Badge';
import { Btn } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { inputCls } from '../../../components/ui/styles';
import { useApp } from '../../../context/AppContext';
import { avgRating } from '../../../lib/gym';
import { cx, iso, TODAY, fmtDate } from '../../../lib/utils';

export function GymReviewsTab({ g }) {
  const { updateGym, perms, roleObj, toast, addAudit } = useApp();
  const [filter, setFilter] = useState('all');
  const [replying, setReplying] = useState(null);
  const [text, setText] = useState('');
  const rv = g.reviews || [];
  const avg = avgRating(rv);
  const cnt = (k) => rv.filter((x) => x.rating === k).length;
  const shown = rv.filter((x) =>
    filter === 'all' ? true : filter === 'open' ? !x.reply : x.rating === Number(filter)
  );
  const save = (x, isEdit) => {
    if (!text.trim()) return;
    const reply = { by: roleObj.user, text: text.trim(), when: iso(TODAY) };
    updateGym(g.id, { reviews: rv.map((y) => (y.id === x.id ? { ...y, reply } : y)) });
    addAudit(
      'CREATE',
      'gyms.ReviewReply',
      x.id,
      { reply: x.reply ? x.reply.text : null },
      { reply: reply.text, gym: g.id }
    );
    toast({
      title: isEdit ? 'Reply updated' : 'Reply sent',
      desc: 'Your response to ' + x.name + ' is now visible on the gym page.',
    });
    setReplying(null);
    setText('');
  };
  const del = (x) => {
    updateGym(g.id, { reviews: rv.map((y) => (y.id === x.id ? { ...y, reply: null } : y)) });
    addAudit('UPDATE', 'gyms.ReviewReply', x.id, { reply: x.reply.text }, { reply: null, gym: g.id });
    toast({ title: 'Reply removed', desc: 'The review is back in the unanswered list.' });
  };
  const chips = [
    ['all', 'All (' + rv.length + ')'],
    ['open', 'Needs reply (' + rv.filter((x) => !x.reply).length + ')'],
    ...[5, 4, 3, 2, 1].map((k) => [String(k), k + ' star (' + cnt(k) + ')']),
  ];
  return (
    <div className="space-y-4">
      <Card className="p-5">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="text-center sm:w-40">
            <p className="text-5xl font-semibold tabular-nums tracking-tight">{avg.toFixed(1)}</p>
            <div className="mt-2 flex justify-center">
              <Stars v={avg} size={16} />
            </div>
            <p className="mt-1 text-xs text-zinc-500">{rv.length} reviews</p>
          </div>
          <div className="min-w-0 flex-1 space-y-1.5">
            {[5, 4, 3, 2, 1].map((k) => (
              <div key={k} className="flex items-center gap-3 text-xs">
                <span className="w-10 tabular-nums text-zinc-600">{k} star</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-100">
                  <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{ width: (rv.length ? (cnt(k) / rv.length) * 100 : 0) + '%' }}
                  ></div>
                </div>
                <span className="w-6 text-right tabular-nums text-zinc-500">{cnt(k)}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
      <div className="no-scrollbar flex gap-1 overflow-x-auto">
        {chips.map(([k, l]) => (
          <button
            key={k}
            onClick={() => setFilter(k)}
            className={cx(
              'shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold',
              filter === k ? 'border-zinc-950 bg-zinc-950 text-white' : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'
            )}
          >
            {l}
          </button>
        ))}
      </div>
      {!perms.editGym && (
        <p className="text-xs text-zinc-500">Only Branch Managers and Super Admins can reply to reviews.</p>
      )}
      <div className="space-y-3">
        {shown.map((x) => (
          <Card key={x.id} className="p-4">
            <div className="flex items-start gap-3">
              <Avatar name={x.name} size={36} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <p className="text-sm font-semibold">{x.name}</p>
                  <Stars v={x.rating} />
                  <span className="text-xs text-zinc-500">{fmtDate(x.date)}</span>
                  {!x.reply && <Badge tone="black">Needs reply</Badge>}
                </div>
                <p className="mt-1.5 text-sm text-zinc-700">{x.text}</p>
                {x.reply && replying !== x.id && (
                  <div className="mt-3 rounded-lg border border-zinc-200 bg-zinc-50 p-3">
                    <p className="flex items-center gap-1.5 text-xs font-semibold text-zinc-700">
                      <Icon n="CornerDownRight" size={13} />
                      Reply from {x.reply.by}
                      <span className="font-normal text-zinc-500">· {fmtDate(x.reply.when)}</span>
                    </p>
                    <p className="mt-1 text-sm text-zinc-700">{x.reply.text}</p>
                    {perms.editGym && (
                      <div className="mt-2 flex gap-3 text-xs font-medium">
                        <button
                          className="text-emerald-700 hover:underline"
                          onClick={() => {
                            setReplying(x.id);
                            setText(x.reply.text);
                          }}
                        >
                          Edit reply
                        </button>
                        <button className="text-zinc-600 hover:underline" onClick={() => del(x)}>
                          Delete reply
                        </button>
                      </div>
                    )}
                  </div>
                )}
                {replying === x.id && (
                  <div className="mt-3 space-y-2">
                    <label className="sr-only" htmlFor={'rp-' + x.id}>
                      Your reply
                    </label>
                    <textarea
                      id={'rp-' + x.id}
                      rows="3"
                      className={cx(inputCls, 'h-auto py-2')}
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="Write a reply to this member"
                    ></textarea>
                    <div className="flex gap-2">
                      <Btn v="primary" size="sm" disabled={!text.trim()} onClick={() => save(x, !!x.reply)}>
                        <Icon n="Send" size={14} />
                        {x.reply ? 'Update reply' : 'Send reply'}
                      </Btn>
                      <Btn
                        v="ghost"
                        size="sm"
                        onClick={() => {
                          setReplying(null);
                          setText('');
                        }}
                      >
                        Cancel
                      </Btn>
                    </div>
                  </div>
                )}
                {!x.reply && replying !== x.id && perms.editGym && (
                  <Btn
                    className="mt-3"
                    v="outline"
                    size="sm"
                    onClick={() => {
                      setReplying(x.id);
                      setText('');
                    }}
                  >
                    <Icon n="Reply" size={14} />
                    Reply
                  </Btn>
                )}
              </div>
            </div>
          </Card>
        ))}
        {!shown.length && <Card className="p-8 text-center text-sm text-zinc-500">No reviews match this filter.</Card>}
      </div>
    </div>
  );
}
