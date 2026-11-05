import { LoaderCircle } from 'lucide-react';
import { ctaLabel } from '../config/catalog';

/** The catalog CTA. `primary` is for the one card the eye should land on. */
export default function OrderButton({ service, busy, onOrder, primary = false, className = '' }) {
  const label = ctaLabel(service);

  return (
    <button
      type="button"
      disabled={busy}
      onClick={() => onOrder(service)}
      aria-label={`${label}: ${service.title}`}
      className={`btn ${primary ? 'btn-primary' : 'btn-cyber'} ${className}`}
    >
      {busy && <LoaderCircle aria-hidden className="size-4 animate-spin" />}
      {label}
    </button>
  );
}
