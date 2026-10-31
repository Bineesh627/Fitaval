import { useState, useMemo } from 'react';
import { Icon } from './Icon';
import { cx, mulberry } from '../lib/utils';

export function GymScene({ kind }) {
  const svg = 'h-full w-full';
  if (kind === 'racks')
    return (
      <svg
        viewBox="0 0 400 300"
        preserveAspectRatio="xMidYMid slice"
        className={svg}
        role="img"
        aria-label="Dumbbell zone"
      >
        <rect width="400" height="300" fill="#171717" />
        <rect width="400" height="140" fill="#1C1C1C" />
        {[0, 1, 2, 3].map((i) => (
          <g key={'m' + i}>
            <rect x={14 + i * 96} y="14" width="88" height="96" fill="#242424" />
            <polygon
              points={
                14 +
                i * 96 +
                ',110 ' +
                (14 + i * 96 + 40) +
                ',14 ' +
                (14 + i * 96 + 62) +
                ',14 ' +
                (14 + i * 96 + 22) +
                ',110'
              }
              fill="#FFFFFF"
              opacity="0.07"
            />
          </g>
        ))}
        {[150, 200, 250].map((y) => (
          <g key={'s' + y}>
            <rect x="24" y={y} width="352" height="7" fill="#333333" />
            {Array.from({ length: 11 }, (_, k) => (
              <g key={k}>
                <rect x={34 + k * 31} y={y - 17} width="24" height="17" rx="3" fill="#474747" />
                <rect x={34 + k * 31} y={y - 17} width="24" height="3" rx="1.5" fill="#999999" />
                {k % 3 === 0 && <rect x={34 + k * 31 + 8} y={y - 11} width="8" height="5" rx="1" fill="#1EAE53" />}
              </g>
            ))}
          </g>
        ))}
        <rect y="282" width="400" height="18" fill="#1C1C1C" />
        <rect y="282" width="400" height="2" fill="#1EAE53" />
      </svg>
    );
  if (kind === 'cardio') {
    const tm = (x, y, s, k) => (
      <g key={k} transform={'translate(' + x + ' ' + y + ') scale(' + s + ')'}>
        <rect x="0" y="0" width="84" height="10" rx="2" fill="#333333" />
        <rect x="6" y="2" width="72" height="3" fill="#1EAE53" opacity="0.6" />
        <rect x="8" y="-56" width="6" height="56" fill="#474747" />
        <rect x="-2" y="-72" width="42" height="22" rx="3" fill="#171717" stroke="#474747" />
        <rect x="2" y="-68" width="34" height="13" fill="#1EAE53" opacity="0.85" />
        <rect x="30" y="-46" width="32" height="4" rx="2" fill="#616161" />
      </g>
    );
    const rows = [
      [250, 1, [30, 150, 270]],
      [205, 0.72, [50, 160, 270]],
      [172, 0.5, [60, 150, 240, 330]],
    ];
    return (
      <svg
        viewBox="0 0 400 300"
        preserveAspectRatio="xMidYMid slice"
        className={svg}
        role="img"
        aria-label="Cardio deck"
      >
        <rect width="400" height="300" fill="#1C1C1C" />
        <rect width="400" height="140" fill="#242424" />
        {[
          [10, 60],
          [48, 90],
          [92, 50],
          [130, 100],
          [180, 70],
          [226, 95],
          [272, 55],
          [312, 85],
          [356, 65],
        ].map(([x, h], i) => (
          <g key={'b' + i}>
            <rect x={x} y={140 - h} width="34" height={h} fill="#333333" />
            {[0, 1, 2, 3].map((j) => (
              <rect
                key={j}
                x={x + 6 + (j % 2) * 14}
                y={140 - h + 8 + Math.floor(j / 2) * 16}
                width="6"
                height="8"
                fill="#1EAE53"
                opacity={0.35 + ((i + j) % 3) * 0.25}
              />
            ))}
          </g>
        ))}
        <rect y="140" width="400" height="160" fill="#171717" />
        <rect y="140" width="400" height="2" fill="#1EAE53" />
        {rows.map(([y, s, xs]) => xs.map((x, i) => tm(x * (s === 1 ? 1 : 1), y, s, y + '-' + i)))}
      </svg>
    );
  }
  return (
    <svg
      viewBox="0 0 400 300"
      preserveAspectRatio="xMidYMid slice"
      className={svg}
      role="img"
      aria-label="Free weights floor"
    >
      <rect width="400" height="300" fill="#E3E8E6" />
      {[0, 1, 2, 3].map((i) => (
        <g key={'w' + i}>
          <rect x={222 + i * 42} y="22" width="38" height="108" fill="#F3F6F5" />
          <rect x={222 + i * 42} y="22" width="38" height="108" fill="none" stroke="#171717" strokeWidth="2" />
          <line x1={222 + i * 42} y1="76" x2={260 + i * 42} y2="76" stroke="#171717" strokeWidth="1.5" />
        </g>
      ))}
      <rect x="20" y="30" width="150" height="10" fill="#1EAE53" />
      <rect x="20" y="50" width="110" height="6" fill="#171717" opacity="0.8" />
      <polygon points="0,150 400,150 400,300 0,300" fill="#C9CFCC" />
      {[-120, -60, 0, 60, 120, 180, 240, 300, 360, 420, 480, 540].map((x) => (
        <line key={'l' + x} x1="200" y1="150" x2={x} y2="300" stroke="#999999" strokeWidth="1" opacity="0.7" />
      ))}
      <polygon points="240,150 330,150 400,300 300,300" fill="#FFFFFF" opacity="0.35" />
      {[
        [40, 190],
        [150, 200],
        [250, 190],
      ].map(([x, y], i) => (
        <g key={'r' + i}>
          <rect x={x} y={y - 40} width="5" height="62" fill="#171717" />
          <rect x={x + 52} y={y - 40} width="5" height="62" fill="#171717" />
          <rect x={x - 6} y={y - 28} width="69" height="4" fill="#171717" />
          <circle cx={x - 6} cy={y - 26} r="9" fill="#171717" />
          <circle cx={x + 63} cy={y - 26} r="9" fill="#171717" />
          <circle cx={x - 6} cy={y - 26} r="3" fill="#1EAE53" />
          <circle cx={x + 63} cy={y - 26} r="3" fill="#1EAE53" />
          <rect x={x + 8} y={y + 30} width="42" height="9" rx="2" fill="#1C1C1C" />
        </g>
      ))}
    </svg>
  );
}

export function LogoTile({ name, size = 64 }) {
  const ini = name
    .split(/[ &]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-2xl bg-zinc-950 font-semibold text-emerald-400 shadow-[0_0_28px_rgba(30,174,83,0.35)] ring-1 ring-zinc-800"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.36) }}
    >
      {ini}
    </span>
  );
}

export function MapView({ lat, lng }) {
  const [z, setZ] = useState(1);
  const blocks = useMemo(() => {
    const r = mulberry(Math.floor(Math.abs(lat * 1000 + lng * 10)));
    const out = [];
    for (let c = 0; c < 10; c++)
      for (let rw = 0; rw < 5; rw++) {
        const v = r();
        out.push({ x: c * 60 + 4, y: rw * 52 + 4, f: v < 0.12 ? '#D7F4E2' : v < 0.55 ? '#F5F5F5' : '#E3E8E6' });
      }
    return out;
  }, [lat, lng]);
  const link = 'https://www.openstreetmap.org/?mlat=' + lat + '&mlon=' + lng + '#map=16/' + lat + '/' + lng;
  const pill = 'absolute rounded-md border border-zinc-200 bg-white/95 text-[11px] font-medium text-zinc-700 shadow-sm';
  return (
    <div className="relative h-64 overflow-hidden rounded-lg border border-zinc-200 bg-white">
      <svg
        viewBox="0 0 600 260"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        <rect width="600" height="260" fill="#FFFFFF" />
        <g style={{ transform: 'scale(' + z + ')', transformOrigin: '300px 130px', transition: 'transform .3s ease' }}>
          {blocks.map((b, i) => (
            <rect key={i} x={b.x} y={b.y} width="52" height="44" rx="3" fill={b.f} />
          ))}
          <path d="M-20 215 L620 45" stroke="#999999" strokeWidth="13" fill="none" />
          <path d="M-20 215 L620 45" stroke="#F3F6F5" strokeWidth="9" fill="none" />
          <path d="M-20 215 L620 45" stroke="#1EAE53" strokeWidth="1.5" strokeDasharray="6 6" fill="none" />
          <path d="M140 -10 C 180 80, 250 150, 215 280" stroke="#C9CFCC" strokeWidth="9" fill="none" />
          <path d="M140 -10 C 180 80, 250 150, 215 280" stroke="#FFFFFF" strokeWidth="5" fill="none" />
        </g>
        <g transform="translate(300 134)">
          <ellipse cx="0" cy="24" rx="11" ry="4" fill="#171717" opacity="0.18" />
          <path
            d="M0 -30 C-13 -30 -20 -19 -20 -9 C-20 7 0 28 0 28 C0 28 20 7 20 -9 C20 -19 13 -30 0 -30Z"
            fill="#1EAE53"
            stroke="#FFFFFF"
            strokeWidth="2.5"
          />
          <circle cx="0" cy="-11" r="7" fill="#FFFFFF" />
        </g>
      </svg>
      <span className={cx(pill, 'left-3 top-3 flex items-center gap-1.5 px-2 py-1')}>
        <Icon n="Map" size={12} className="text-emerald-600" />
        OpenStreetMap
      </span>
      <div className="absolute right-3 top-3 flex flex-col overflow-hidden rounded-md border border-zinc-200 bg-white shadow-sm">
        <button
          aria-label="Zoom in"
          disabled={z >= 2}
          onClick={() => setZ((v) => Math.min(2, +(v + 0.5).toFixed(1)))}
          className="flex h-8 w-8 items-center justify-center border-b border-zinc-200 text-zinc-800 hover:bg-zinc-50 disabled:opacity-30"
        >
          <Icon n="Plus" size={15} />
        </button>
        <button
          aria-label="Zoom out"
          disabled={z <= 1}
          onClick={() => setZ((v) => Math.max(1, +(v - 0.5).toFixed(1)))}
          className="flex h-8 w-8 items-center justify-center text-zinc-800 hover:bg-zinc-50 disabled:opacity-30"
        >
          <Icon n="Minus" size={15} />
        </button>
      </div>
      <span className={cx(pill, 'bottom-3 left-3 px-2 py-1 font-mono tabular-nums')}>
        {lat.toFixed(4)}, {lng.toFixed(4)}
      </span>
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className={cx(pill, 'bottom-3 right-3 flex items-center gap-1.5 px-2 py-1 text-emerald-700 hover:bg-white')}
      >
        Open in OpenStreetMap
        <Icon n="ExternalLink" size={11} />
      </a>
    </div>
  );
}
