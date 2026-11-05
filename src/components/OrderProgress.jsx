import { ORDER_STEPS } from '../config/catalog';

/** Three-step track for an order. Pair it with OrderStatusPill, which names the step. */
export default function OrderProgress({ status, className = '' }) {
  const current = ORDER_STEPS.indexOf(status);
  const done = status === 'completed';

  return (
    <div aria-hidden className={`flex gap-1 ${className}`}>
      {ORDER_STEPS.map((step, index) => (
        <span
          key={step}
          className={`progress-step ${index <= current ? 'progress-step--on' : ''} ${done ? 'progress-step--done' : ''}`}
        />
      ))}
    </div>
  );
}
