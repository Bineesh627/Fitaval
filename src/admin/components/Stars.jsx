import { Icon } from './Icon';

export function Stars({ v, size = 14 }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={v + ' out of 5 stars'}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Icon
          key={i}
          n="Star"
          size={size}
          className={i <= Math.round(v) ? 'fill-emerald-500 text-emerald-500' : 'text-zinc-300'}
        />
      ))}
    </span>
  );
}
