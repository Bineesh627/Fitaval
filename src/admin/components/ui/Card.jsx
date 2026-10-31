import { cx } from '../../lib/utils';

export function Card({ className = '', children, ...p }) {
  return (
    <div className={cx('rounded-xl border border-zinc-200 bg-white', className)} {...p}>
      {children}
    </div>
  );
}
