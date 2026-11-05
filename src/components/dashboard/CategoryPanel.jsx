import { formatIDR } from '../../lib/format';
import { isDemoMode } from '../../lib/SupabaseClient';
import CategoryBars from '../charts/CategoryBars';
import DemoTag from '../DemoTag';

export default function CategoryPanel({ categories, unpriced, className = '' }) {
  return (
    <section
      aria-labelledby="category-title"
      style={{ animationDelay: '240ms' }}
      className={`glass animate__animated animate__fadeInUp animate__faster flex min-w-0 flex-col p-5 sm:p-6 ${className}`}
    >
      <h2 id="category-title" className="panel-title flex items-center gap-2">
        Value by category
        {isDemoMode && <DemoTag>DEMO</DemoTag>}
      </h2>
      <p className="mt-1 text-sm text-ink-dim">Estimated at current prices</p>

      {categories.length >= 2 ? (
        <CategoryBars categories={categories} />
      ) : categories.length === 1 ? (
        <p className="glass-inset mt-4 p-4 text-sm leading-relaxed text-ink-muted">
          Every order so far is in <span className="font-semibold text-ink">{categories[0].name}</span>, worth{' '}
          <span className="figures font-semibold text-ink">{formatIDR(categories[0].value)}</span>.
        </p>
      ) : (
        <p className="glass-inset mt-4 p-4 text-sm text-ink-muted">No category data for these orders yet.</p>
      )}

      {unpriced > 0 && (
        <p className="mt-3 text-xs leading-relaxed text-ink-dim">
          {unpriced} {unpriced === 1 ? 'order has' : 'orders have'} no known price and {unpriced === 1 ? 'is' : 'are'} left
          out of the estimates.
        </p>
      )}
    </section>
  );
}
