import * as icons from 'lucide-react';

export function Icon({ n, size = 16, className = '', strokeWidth = 2 }) {
  const C = icons[n];
  return C ? (
    <C size={size} className={className} strokeWidth={strokeWidth} aria-hidden="true" />
  ) : (
    <span className={className} style={{ display: 'inline-block', width: size, height: size }}></span>
  );
}
