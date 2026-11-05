import { SERVICE_STATUS } from '../config/catalog';

export default function StatusBadge({ status }) {
  const { icon: Icon, className } = SERVICE_STATUS[status] ?? SERVICE_STATUS.ONLINE;
  return (
    <span className={`badge ${className}`}>
      <Icon aria-hidden className="size-3.5" />
      {status}
    </span>
  );
}
