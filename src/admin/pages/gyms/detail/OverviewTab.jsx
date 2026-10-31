import { useState } from 'react';
import { GymScene, MapView } from '../../../components/GymVisuals';
import { Icon } from '../../../components/Icon';
import { Section } from '../../../components/Section';
import { Badge } from '../../../components/ui/Badge';
import { SCENES } from '../../../data/gyms';
import { cx, TODAY, DAYS_FULL } from '../../../lib/utils';

export function OverviewTab({ g }) {
  const [sf, setSf] = useState('all');
  const items = [...g.facilities.map((n) => ({ n, t: 'f' })), ...g.services.map((n) => ({ n, t: 's' }))];
  const shown = items.filter((i) => sf === 'all' || (sf === 'f' ? i.t === 'f' : i.t === 's'));
  const todayIdx = (TODAY.getDay() + 6) % 7;
  const filt = [
    ['all', 'All', items.length],
    ['s', 'Services', g.services.length],
    ['f', 'Facilities', g.facilities.length],
  ];
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="space-y-4">
        <Section icon="Contact" title="Contact information">
          <ul className="space-y-3">
            {[
              ['MapPin', 'Address', g.addr + ', ' + g.loc + ' ' + g.zip],
              ['Phone', 'Phone', g.phone],
              ['Mail', 'Email', g.email],
            ].map(([ic, l, v]) => (
              <li key={l} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <Icon n={ic} size={14} />
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] text-zinc-500">{l}</p>
                  <p className="break-words text-sm font-semibold tabular-nums">{v}</p>
                </div>
              </li>
            ))}
          </ul>
        </Section>
        <Section icon="Info" title="About">
          <p className="text-sm leading-relaxed text-zinc-600">{g.about}</p>
        </Section>
        <Section
          icon="Clock"
          title="Operating hours"
        >
          <ul className="divide-y divide-zinc-100">
            {g.hours.map((h, i) => (
              <li key={i} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                <span className={cx('flex items-center gap-2', i === todayIdx ? 'font-semibold' : 'font-medium')}>
                  {DAYS_FULL[i]}
                  {i === todayIdx && <Badge tone="green">Today</Badge>}
                </span>
                <span className="flex items-center gap-2 tabular-nums">
                  <span className={h.open ? 'text-zinc-800' : 'text-zinc-400'}>
                    {h.open ? h.from + ' to ' + h.to : 'Closed'}
                  </span>
                  <span className={cx('h-2 w-2 rounded-full', h.open ? 'bg-emerald-500' : 'bg-zinc-300')}></span>
                </span>
              </li>
            ))}
          </ul>
        </Section>
      </div>
      <div className="space-y-4">
        <Section
          icon="Sparkles"
          title="Services and amenities"
        >
          <p className="mb-3 text-xs text-zinc-500">
            Available facilities, wellness perks and member service offerings
          </p>
          <div className="mb-3 flex flex-wrap gap-1.5">
            {filt.map(([k, l, n]) => (
              <button
                key={k}
                onClick={() => setSf(k)}
                aria-pressed={sf === k}
                className={cx(
                  'rounded-full border px-3 py-1 text-xs font-semibold',
                  sf === k
                    ? 'border-emerald-500 bg-emerald-500 text-white'
                    : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                )}
              >
                {l} ({n})
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {shown.map((i) => (
              <span
                key={i.n}
                className={cx(
                  'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium',
                  i.t === 's'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                    : 'border-zinc-200 bg-white text-zinc-700'
                )}
              >
                <Icon n="Check" size={12} className="text-emerald-600" />
                {i.n}
                {i.t === 's' && (
                  <span className="rounded bg-emerald-500 px-1 py-px text-[9px] font-bold tracking-wide text-white">
                    SERVICE
                  </span>
                )}
              </span>
            ))}
          </div>
          {!shown.length && <p className="py-4 text-sm text-zinc-500">Nothing listed here yet.</p>}
        </Section>
        <Section
          icon="MapPin"
          title="Gym location"
        >
          <p className="mb-3 text-sm font-semibold">
            {g.addr}, {g.loc}
          </p>
          <MapView lat={g.lat} lng={g.lng} />
        </Section>
      </div>
      <div className="lg:col-span-2">
        <Section
          icon="Image"
          title="Photo gallery"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {g.photos.map((p) => {
              const photoSrc = p.src || p.url || (p.kind === 'upload' ? p.src : null);
              return (
                <figure
                  key={p.id}
                  className="relative aspect-[4/3] overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100"
                >
                  {photoSrc ? (
                    <img src={photoSrc} alt={p.name} className="h-full w-full object-cover" />
                  ) : (
                    <GymScene kind={p.scene} />
                  )}
                  <figcaption className="absolute bottom-2 left-2 rounded bg-zinc-950/85 px-2 py-0.5 text-[11px] font-medium text-white">
                    {p.name || (p.scene ? SCENES[p.scene] : 'Gym photo')}
                  </figcaption>
                </figure>
              );
            })}
          </div>
          {!g.photos.length && (
            <p className="py-8 text-center text-sm text-zinc-500">No photos uploaded for this gym yet.</p>
          )}
        </Section>
      </div>
    </div>
  );
}
