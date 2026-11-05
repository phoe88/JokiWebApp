import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCatalog } from '../context/CatalogContext';
import { createDemoOrders } from '../data/demoOrders';
import { isDemoMode } from '../lib/SupabaseClient';
import { fetchMyOrders, subscribeToMyOrders } from '../services/orders';

/**
 * The signed-in user's orders, kept live over Realtime. `onEvent` receives
 * { order, from, to, isNew } for every status change that arrives on the channel.
 * `from` is null when the previous status isn't known, and `order.service` is
 * missing on rows that came straight off the channel.
 */
export function useMyOrders({ onEvent } = {}) {
  const { user } = useAuth();
  const { refreshCounts } = useCatalog();
  const userId = user?.id ?? null;

  const [orders, setOrders] = useState(() => (isDemoMode ? createDemoOrders() : []));
  const [loading, setLoading] = useState(!isDemoMode);
  const [error, setError] = useState(null);
  const [connection, setConnection] = useState('CONNECTING');

  const onEventRef = useRef(onEvent);
  const ordersRef = useRef(orders);
  const latestRequest = useRef(0);

  useEffect(() => {
    onEventRef.current = onEvent;
  });

  const applyOrders = useCallback((next) => {
    ordersRef.current = next;
    setOrders(next);
  }, []);

  const load = useCallback(async () => {
    if (!userId) return;
    latestRequest.current += 1;
    const request = latestRequest.current;
    try {
      const rows = await fetchMyOrders(userId);
      if (request !== latestRequest.current) return;
      applyOrders(rows);
      setError(null);
    } catch (loadError) {
      if (request === latestRequest.current) setError(loadError);
    } finally {
      if (request === latestRequest.current) setLoading(false);
    }
  }, [userId, applyOrders]);

  useEffect(() => {
    if (isDemoMode) return undefined;

    if (!userId) {
      applyOrders([]);
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    load();

    const handleChange = ({ eventType, new: row, old }) => {
      const current = ordersRef.current;

      if (eventType === 'DELETE') {
        applyOrders(current.filter((order) => order.id !== old.id));
        return;
      }

      const known = current.find((order) => order.id === row.id);

      if (row.status === 'completed' && known?.status !== 'completed') refreshCounts();

      if (known) {
        applyOrders(current.map((order) => (order.id === row.id ? { ...order, ...row } : order)));
        if (known.status !== row.status) {
          onEventRef.current?.({ order: { ...known, ...row }, from: known.status, to: row.status });
        }
        return;
      }

      // Realtime rows carry no joined service, so fetch the list again. An UPDATE
      // can land here too, if it arrives before the first load finishes.
      onEventRef.current?.({ order: row, from: null, to: row.status, isNew: eventType === 'INSERT' });
      load();
    };

    return subscribeToMyOrders(userId, {
      onChange: handleChange,
      onConnection: (status) => {
        setConnection(status);
        // Also runs after a reconnect, which covers changes missed while offline.
        if (status === 'SUBSCRIBED') load();
      },
    });
  }, [userId, load, applyOrders, refreshCounts]);

  return { orders, loading, error, connection, reload: load };
}
