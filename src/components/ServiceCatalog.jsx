import { useMemo, useState } from 'react';
import { DatabaseZap, SearchX, TriangleAlert } from 'lucide-react';
import { ALL_CATEGORY, CATEGORY_TABS } from '../config/catalog';
import { useCatalog } from '../context/CatalogContext';
import { useGridColumns } from '../hooks/useGridColumns';
import { useOrderAction } from '../hooks/useOrderAction';
import { catalogLayout } from '../lib/catalogLayout';
import Notice from './Notice';
import ServiceCard from './ServiceCard';

const GRID = 'mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4';

function matchesQuery(service, terms) {
  const haystack = `${service.title} ${service.description} ${service.category} ${service.status}`.toLowerCase();
  return terms.every((term) => haystack.includes(term));
}

function CardSkeleton() {
  return (
    <div className="glass h-[25rem] animate-pulse p-2">
      <div className="h-28 rounded-[1.125rem] bg-white/5" />
      <div className="mt-6 h-4 w-2/3 rounded-full bg-white/10" />
      <div className="mt-3 h-3 w-full rounded-full bg-white/5" />
      <div className="mt-2 h-3 w-5/6 rounded-full bg-white/5" />
    </div>
  );
}

export default function ServiceCatalog({ query, onQueryChange, initialCategory = ALL_CATEGORY, id }) {
  const { services, counts, loading, error, reload } = useCatalog();
  const { placeOrder, busyId } = useOrderAction();
  const [category, setCategory] = useState(initialCategory);
  const columns = useGridColumns();

  const visible = useMemo(() => {
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    return services.filter(
      (service) =>
        (category === ALL_CATEGORY || service.category === category) && matchesQuery(service, terms),
    );
  }, [services, category, query]);

  const layout = useMemo(() => catalogLayout(visible.length, columns), [visible.length, columns]);

  const resetFilters = () => {
    setCategory(ALL_CATEGORY);
    onQueryChange('');
  };

  return (
    <section id={id} aria-label="Service catalog" className="mt-6 scroll-mt-24">
      <div
        role="group"
        aria-label="Filter by category"
        className="no-scrollbar -mx-3 flex gap-2 overflow-x-auto px-3 py-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0"
      >
        {CATEGORY_TABS.map((tab) => (
          <button key={tab} type="button" aria-pressed={category === tab} onClick={() => setCategory(tab)} className="pill">
            {tab}
          </button>
        ))}
      </div>

      <p role="status" className="mt-3 min-h-5 px-1 text-sm text-ink-dim">
        {!loading && !error && `Showing ${visible.length} of ${services.length} services`}
      </p>

      {error ? (
        <Notice
          icon={TriangleAlert}
          tone="error"
          title="Catalog unavailable"
          body={error.message ?? 'The service list could not be loaded.'}
          action={
            <button type="button" onClick={reload} className="btn btn-ghost mt-5">
              Retry
            </button>
          }
        />
      ) : loading ? (
        <div className={GRID}>
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : services.length === 0 ? (
        <Notice
          icon={DatabaseZap}
          title="Catalog is empty"
          body="The services table has no rows yet. Run supabase/seed.sql to load the catalog."
        />
      ) : visible.length === 0 ? (
        <Notice
          icon={SearchX}
          title="No matches found"
          body="Nothing fits this search and category. Try fewer words or another category."
          action={
            <button type="button" onClick={resetFilters} className="btn btn-ghost mt-5">
              Reset Filters
            </button>
          }
        />
      ) : (
        <div className={GRID}>
          {visible.map((service, index) => (
            <ServiceCard
              key={service.id}
              service={service}
              index={index}
              layout={layout[index]}
              completed={counts ? (counts.get(service.id) ?? 0) : null}
              busy={busyId === service.id}
              onOrder={placeOrder}
            />
          ))}
        </div>
      )}
    </section>
  );
}
