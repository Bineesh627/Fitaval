import { BadgeCheck } from 'lucide-react';

/** Blue verified tick (Super Admin approved gym). Colors are inline so it renders the same in CRM and Admin. */
export default function VerifiedTick({ size = 18, className = '', title = 'Verified by Fitaval' }) {
  return (
    <span className={'inline-flex shrink-0 align-middle ' + className} title={title}>
      <BadgeCheck size={size} fill="#1D9BF0" stroke="#FFFFFF" strokeWidth={2} role="img" aria-label={title} />
    </span>
  );
}
