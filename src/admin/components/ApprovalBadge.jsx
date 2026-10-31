import { Icon } from './Icon';
import { Badge } from './ui/Badge';

export function ApprovalBadge({ s }) {
  if (s === 'Pending') return <Badge tone="black">Pending</Badge>;
  if (s === 'Approved')
    return (
      <Badge tone="solid">
        <Icon n="CheckCircle2" size={11} />
        Approved
      </Badge>
    );
  if (s === 'Rejected') return <Badge tone="outline">Rejected</Badge>;
  return <Badge tone="green">Under Review</Badge>;
}
