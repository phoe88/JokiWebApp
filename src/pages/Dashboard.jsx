import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { CheckCheck, ClipboardList, Hourglass, ReceiptText, RefreshCw, TriangleAlert, WalletCards } from 'lucide-react';
import CategoryPanel from '../components/dashboard/CategoryPanel';
import CompletionPanel from '../components/dashboard/CompletionPanel';
import OrdersPanel from '../components/dashboard/OrdersPanel';
import StatTile from '../components/dashboard/StatTile';
import TrendPanel from '../components/dashboard/TrendPanel';
import DemoNotice from '../components/DemoNotice';
import Notice from '../components/Notice';
import PageHeader from '../components/PageHeader';
import SignInGate from '../components/SignInGate';
import { useAuth } from '../context/AuthContext';
import { useCatalog } from '../context/CatalogContext';
import { useReportConnection } from '../context/ConnectionContext';
import { useMyOrders } from '../hooks/useMyOrders';
import { formatCount, formatIDRCompact, formatPercent } from '../lib/format';
import {
  categoryBreakdown,
  focusOrder,
  periodChange,
  resolveOrders,
  summarizeOrders,
  weeklySeries,
} from '../lib/orderMetrics';
import { isDemoMode } from '../lib/SupabaseClient';

const orderValue = (order) => order.value ?? 0;
const isOpen = (order) => order.status === 'pending' || order.status === 'in_progress';
const wholeCount = (value) => formatCount(Math.round(value));

function SkeletonPanel({ className = '' }) {
  return <div className={`glass animate-pulse ${className}`} />;
}

function DashboardSkeleton() {
  return (
    <div role="status" aria-label="Loading orders" className="mt-5 grid gap-4 lg:grid-cols-12">
      <SkeletonPanel className="h-44 lg:col-span-3" />
      <SkeletonPanel className="h-44 lg:col-span-3" />
      <SkeletonPanel className="h-44 lg:col-span-3" />
      <SkeletonPanel className="h-44 lg:col-span-3" />
      <SkeletonPanel className="h-96 lg:col-span-8" />
      <SkeletonPanel className="h-96 lg:col-span-4" />
    </div>
  );
}

function Overview({ orders }) {
  const metrics = useMemo(() => {
    const now = new Date();
    const series = (measure) => weeklySeries(orders, { now, measure });
    const completed = (order) => (order.status === 'completed' ? 1 : 0);

    return {
      summary: summarizeOrders(orders),
      categories: categoryBreakdown(orders),
      focus: focusOrder(orders),
      valueChange: periodChange(orders, { now, measure: orderValue }),
      countChange: periodChange(orders, { now }),
      valueSeries: series(orderValue),
      countSeries: series(() => 1),
      openSeries: series((order) => (isOpen(order) ? 1 : 0)),
      completedSeries: series(completed),
    };
  }, [orders]);

  const { summary } = metrics;

  return (
    <>
      <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatTile
          index={0}
          icon={WalletCards}
          tone="cyber"
          label="Estimated value"
          value={summary.value}
          format={formatIDRCompact}
          hint="At current prices"
          change={metrics.valueChange}
          series={metrics.valueSeries}
          seriesLabel="Estimated order value per week, last 12 weeks"
        />
        <StatTile
          index={1}
          icon={ReceiptText}
          tone="cyber"
          label="Orders placed"
          value={summary.count}
          format={wholeCount}
          change={metrics.countChange}
          series={metrics.countSeries}
          seriesLabel="Orders placed per week, last 12 weeks"
        />
        <StatTile
          index={2}
          icon={Hourglass}
          tone="cyber"
          label="Open orders"
          value={summary.open}
          format={wholeCount}
          hint={`${summary.pending} pending, ${summary.inProgress} in progress`}
          series={metrics.openSeries}
          seriesLabel="Open orders by the week they were placed, last 12 weeks"
        />
        <StatTile
          index={3}
          icon={CheckCheck}
          tone="live"
          label="Completed"
          value={summary.completed}
          format={wholeCount}
          hint={`${formatPercent(summary.completionShare)} of all orders`}
          series={metrics.completedSeries}
          seriesLabel="Completed orders by the week they were placed, last 12 weeks"
        />
      </div>

      <div className="mt-3 grid gap-3 sm:mt-4 sm:gap-4 lg:grid-cols-12">
        <TrendPanel orders={orders} className="lg:col-span-8 2xl:col-span-6" />
        <CompletionPanel summary={summary} focus={metrics.focus} className="lg:col-span-4 2xl:col-span-3" />
        <CategoryPanel
          categories={metrics.categories}
          unpriced={summary.unpriced}
          className="lg:col-span-4 2xl:col-span-3"
        />
        <OrdersPanel orders={orders} className="lg:col-span-8 2xl:col-span-12" />
      </div>
    </>
  );
}

function OrdersView({ orders, loading, error, reload }) {
  if (error) {
    return (
      <Notice
        icon={TriangleAlert}
        tone="error"
        title="Orders unavailable"
        body={error.message ?? 'Your orders could not be loaded.'}
        action={
          <button type="button" onClick={reload} className="btn btn-ghost mt-5">
            <RefreshCw aria-hidden className="size-4" />
            Retry
          </button>
        }
      />
    );
  }

  if (loading) return <DashboardSkeleton />;

  if (orders.length === 0) {
    return (
      <Notice
        icon={ClipboardList}
        title="No orders yet"
        body="Orders you place appear here and update as their status changes."
        action={
          <Link to="/services" className="btn btn-primary mt-6">
            Browse Services
          </Link>
        }
      />
    );
  }

  return <Overview orders={orders} />;
}

function Orders() {
  const { orders, loading, error, connection, reload } = useMyOrders();
  const { services } = useCatalog();
  const resolved = useMemo(() => resolveOrders(orders, services), [orders, services]);

  useReportConnection(isDemoMode ? null : connection);

  return (
    <>
      {isDemoMode && (
        <DemoNotice tag="DEMO DATA">
          Sample orders for preview only. No account or real order is behind them.
        </DemoNotice>
      )}
      <OrdersView orders={resolved} loading={loading} error={error} reload={reload} />
    </>
  );
}

export default function Dashboard() {
  const { user, loading } = useAuth();

  return (
    <div className="pt-6">
      <PageHeader
        eyebrow="Overview"
        title="Dashboard"
        description="Your orders and where each one stands, updated as they change."
      />
      {isDemoMode || user ? (
        <Orders />
      ) : loading ? (
        <DashboardSkeleton />
      ) : (
        <SignInGate body="Sign in to see your orders." />
      )}
    </div>
  );
}
