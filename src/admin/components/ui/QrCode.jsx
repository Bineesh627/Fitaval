import { useMemo } from 'react';
import qrcode from 'qrcode-generator';

export function QrCode({ value, size = 168 }) {
  const cells = useMemo(() => {
    try {
      const q = qrcode(0, 'M');
      q.addData(value || ' ');
      q.make();
      const n = q.getModuleCount();
      const d = [];
      for (let y = 0; y < n; y++)
        for (let x = 0; x < n; x++) if (q.isDark(y, x)) d.push('M' + (x + 2) + ' ' + (y + 2) + 'h1v1h-1z');
      return { n: n + 4, d: d.join('') };
    } catch (e) {
      return null;
    }
  }, [value]);
  if (!cells)
    return (
      <div className="flex items-center justify-center text-xs text-zinc-500" style={{ width: size, height: size }}>
        QR unavailable
      </div>
    );
  return (
    <svg
      viewBox={'0 0 ' + cells.n + ' ' + cells.n}
      width={size}
      height={size}
      shapeRendering="crispEdges"
      className="mx-auto block"
      role="img"
      aria-label={'QR code ' + value}
    >
      <rect width={cells.n} height={cells.n} fill="#fff" />
      <path d={cells.d} fill="#171717" />
    </svg>
  );
}
