import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, DatabaseZap, Info } from 'lucide-react';
import DemoTag from '../components/DemoTag';
import Notice from '../components/Notice';
import OrderButton from '../components/OrderButton';
import OrderStatusPill from '../components/OrderStatusPill';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import { CATEGORIES, ORDER_STEPS } from '../config/catalog';
import { useCatalog } from '../context/CatalogContext';
import { useOrderAction } from '../hooks/useOrderAction';
import { formatIDR, formatIDRCompact } from '../lib/format';
import { pricingTiers } from '../lib/orderMetrics';
import { isDemoMode } from '../lib/SupabaseClient';

const TIER_LIST_LIMIT = 5;

const TIER_NOTES = {
  Essentials: 'The lowest-priced packages in the catalog.',
  Standard: 'The mid-range packages in the catalog.',
  Flagship: 'The highest-priced packages in the catalog.',
};

const STEP_NOTES = {
  pending: 'Your order is saved and waiting for the team to pick it up.',
  in_progress: 'The work has started. Follow it in your Dashboard.',
  completed: 'Delivered, and counted on the service card.',
};

function TierCard({ tier, focal, index }) {
  const listed = tier.services.slice(0, TIER_LIST_LIMIT);
  const hidden = tier.services.length - listed.length;

  return (
    <div className={`tier-stack ${focal ? 'tier-stack--focal' : ''}`}>
      <article
        style={{ animationDelay: `${index * 70}ms` }}
        className={`glass animate__animated animate__fadeInUp animate__faster flex h-full flex-col p-6 ${focal ? 'tier--focal' : ''}`}
      >
        <h2 className="font-display text-xl font-bold text-ink">{tier.name}</h2>
        <p className="mt-1 text-sm text-ink-muted">{TIER_NOTES[tier.name]}</p>

        <p className="mt-5 font-display text-3xl font-bold tracking-tight text-ink">{formatIDRCompact(tier.from)}</p>
        <p className="figures text-sm text-ink-dim">
          {tier.from === tier.to ? 'list price' : `up to ${formatIDRCompact(tier.to)}`}
        </p>

        <ul className="mt-5 flex flex-1 flex-col gap-2.5 border-t border-white/10 pt-4">
          {listed.map((service) => (
            <li key={service.id} className="flex items-baseline justify-between gap-3 text-sm">
              <span className="min-w-0 text-ink-muted">{service.title}</span>
              <span className="figures shrink-0 font-semibold text-ink">{formatIDRCompact(service.price)}</span>
            </li>
          ))}
          {hidden > 0 && <li className="text-sm text-ink-dim">and {hidden} more</li>}
        </ul>

        <Link to="/services" className={`btn mt-6 w-full ${focal ? 'btn-primary' : 'btn-ghost'}`}>
          Browse Services
        </Link>
      </article>
    </div>
  );
}

function CategoryCard({ category, services }) {
  const Icon = category.icon;
  const prices = services.map((service) => Number(service.price));

  return (
    <Link
      to={`/services?category=${encodeURIComponent(category.name)}`}
      className="glass lift group flex flex-col rounded-2xl p-4"
    >
      <span className="icon-chip icon-chip--cyber">
        <Icon aria-hidden className="size-4" />
      </span>
      <span className="mt-3 text-sm font-semibold text-ink">{category.name}</span>
      <span className="mt-3 text-xs text-ink-dim">From</span>
      <span className="figures font-display text-lg font-bold text-ink">
        {prices.length ? formatIDR(Math.min(...prices)) : '-'}
      </span>
      <span className="mt-2 flex items-center gap-1 text-xs text-ink-muted group-hover:text-ink">
        {services.length} packages
        <ArrowRight aria-hidden className="size-3.5" />
      </span>
    </Link>
  );
}

export default function Pricing() {
  const { services, loading, error } = useCatalog();
  const { placeOrder, busyId } = useOrderAction();

  const tiers = useMemo(() => pricingTiers(services), [services]);

  const byCategory = useMemo(
    () =>
      CATEGORIES.map((category) => ({
        category,
        services: services
          .filter((service) => service.category === category.name)
          .sort((a, b) => Number(a.price) - Number(b.price)),
      })),
    [services],
  );

  return (
    <div className="pt-6">
      <PageHeader
        eyebrow="Rates"
        title="Pricing"
        description="List prices in Indonesian rupiah, taken straight from the service catalog."
        aside={isDemoMode ? <DemoTag /> : null}
      />

      {error && <p className="mt-6 px-1 text-sm text-danger">Prices could not be loaded: {error.message}</p>}
      {loading && <p className="mt-6 px-1 text-sm text-ink-dim">Loading prices</p>}

      {!loading && !error && services.length === 0 && (
        <Notice
          icon={DatabaseZap}
          title="Catalog is empty"
          body="The services table has no rows yet. Run supabase/seed.sql to load the catalog."
        />
      )}

      {!loading && !error && services.length > 0 && (
        <>
          <section aria-label="Price tiers" className="mt-6 grid items-stretch gap-4 lg:mt-10 lg:grid-cols-3">
            {tiers.map((tier, index) => (
              <TierCard key={tier.name} tier={tier} index={index} focal={tiers.length === 3 && index === 1} />
            ))}
          </section>
          <p className="mt-6 px-1 text-sm text-ink-dim lg:mt-8">
            Tiers are price bands worked out from the catalog, so each one lists real packages.
          </p>

          <section aria-labelledby="category-heading" className="mt-10">
            <h2 id="category-heading" className="px-1 font-display text-2xl font-bold tracking-tight text-ink">
              By category
            </h2>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-5">
              {byCategory.map(({ category, services: items }) => (
                <CategoryCard key={category.name} category={category} services={items} />
              ))}
            </div>
          </section>

          <section aria-labelledby="packages-heading" className="mt-10">
            <h2 id="packages-heading" className="px-1 font-display text-2xl font-bold tracking-tight text-ink">
              All packages
            </h2>
            <div className="mt-4 grid gap-4 2xl:grid-cols-2">
              {byCategory
                .filter(({ services: items }) => items.length > 0)
                .map(({ category, services: items }) => (
                  <div key={category.name} className="glass min-w-0 p-4 sm:p-5">
                    <h3 className="panel-title">{category.name}</h3>
                    <ul className="mt-2 flex flex-col">
                      {items.map((service) => (
                        <li
                          key={service.id}
                          className="grid items-center gap-x-4 gap-y-2 border-t border-white/[0.06] py-3 first:border-t-0 sm:grid-cols-[minmax(0,1fr)_auto] md:grid-cols-[minmax(0,1fr)_7.5rem_8rem_12rem]"
                        >
                          <span className="min-w-0 text-sm font-medium text-ink">{service.title}</span>
                          <span className="hidden md:block">
                            <StatusBadge status={service.status} />
                          </span>
                          <span className="figures text-sm font-semibold text-ink md:text-right">
                            {formatIDR(service.price)}
                          </span>
                          <OrderButton
                            service={service}
                            busy={busyId === service.id}
                            onOrder={placeOrder}
                            className="px-3 py-2 text-[13px] sm:col-span-2 md:col-span-1"
                          />
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
            </div>
          </section>
        </>
      )}

      <section aria-labelledby="flow-heading" className="mt-10">
        <h2 id="flow-heading" className="px-1 font-display text-2xl font-bold tracking-tight text-ink">
          How an order moves
        </h2>
        <ol className="mt-4 grid gap-4 md:grid-cols-3">
          {ORDER_STEPS.map((step) => (
            <li key={step} className="glass p-5">
              <OrderStatusPill status={step} />
              <p className="mt-3 text-sm leading-relaxed text-ink-muted">{STEP_NOTES[step]}</p>
            </li>
          ))}
        </ol>
        <p className="glass-soft mt-4 flex items-start gap-2.5 p-3.5 text-sm leading-relaxed text-ink-muted">
          <Info aria-hidden className="mt-0.5 size-4 shrink-0 text-cyber-soft" />
          Placing an order takes no payment on this site. Prices shown are list prices.
        </p>
      </section>
    </div>
  );
}
