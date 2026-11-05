import { CircleHelp } from 'lucide-react';
import { ORDER_STATUS } from '../config/catalog';

/** Colour, icon and label together, so status never rests on colour alone. */
export default function OrderStatusPill({ status }) {
  const { label, icon: Icon, className } = ORDER_STATUS[status] ?? {
    label: status,
    icon: CircleHelp,
    className: 'badge--neutral',
  };

  return (
    <span className={`badge ${className}`}>
      <Icon aria-hidden className="size-3.5" />
      {label}
    </span>
  );
}
