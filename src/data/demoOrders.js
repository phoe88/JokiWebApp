import { seedServices } from './seedServices';

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const sample = (serial, seedIndex, status, age) => ({
  id: `de${String(serial).padStart(6, '0')}-0000-4000-8000-000000000000`,
  service_id: seedServices[seedIndex].id,
  status,
  created_at: new Date(Date.now() - age).toISOString(),
  service: seedServices[seedIndex],
});

/**
 * Sample rows for /dashboard in demo mode: about six months of a client's orders,
 * so the charts have a shape. Everything derived from them carries a demo label.
 */
export const createDemoOrders = () => [
  sample(18, 7, 'pending', 12 * MINUTE),
  sample(17, 3, 'pending', 2 * DAY),
  sample(16, 0, 'in_progress', 26 * HOUR),
  sample(15, 13, 'in_progress', 6 * DAY),
  sample(14, 8, 'in_progress', 11 * DAY),
  sample(13, 10, 'completed', 19 * DAY),
  sample(12, 4, 'completed', 27 * DAY),
  sample(11, 12, 'completed', 38 * DAY),
  sample(10, 6, 'completed', 49 * DAY),
  sample(9, 1, 'completed', 63 * DAY),
  sample(8, 2, 'in_progress', 71 * DAY),
  sample(7, 9, 'completed', 84 * DAY),
  sample(6, 14, 'completed', 97 * DAY),
  sample(5, 5, 'completed', 112 * DAY),
  sample(4, 11, 'completed', 128 * DAY),
  sample(3, 0, 'completed', 141 * DAY),
  sample(2, 7, 'completed', 158 * DAY),
  sample(1, 3, 'completed', 173 * DAY),
];

const NEXT_STATUS = { pending: 'in_progress', in_progress: 'completed' };

let simulatedSerial = 0;

/**
 * Builds the demo Live Feed. It walks invented orders through their statuses and
 * returns one event per step. It never depicts other customers or purchases.
 */
export function createFeedSimulator() {
  let orders = [];

  const newOrder = () => {
    simulatedSerial += 1;
    const service = seedServices[(simulatedSerial * 4) % seedServices.length];
    return {
      id: `sim-${String(simulatedSerial).padStart(4, '0')}`,
      service,
      status: 'pending',
    };
  };

  return function step() {
    const active = orders.filter((order) => order.status !== 'completed');

    if (active.length < 2) {
      const order = newOrder();
      orders = [...active, order];
      return { orderId: order.id, service: order.service, from: null, to: 'pending' };
    }

    const order = active[0];
    const from = order.status;
    order.status = NEXT_STATUS[from];
    return { orderId: order.id, service: order.service, from, to: order.status };
  };
}
