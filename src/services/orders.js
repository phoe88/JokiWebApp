import { supabase } from '../lib/SupabaseClient';

const ORDER_COLUMNS = 'id, service_id, status, created_at, service:services(id, title, category, price)';

export async function fetchMyOrders(userId) {
  const { data, error } = await supabase
    .from('orders')
    .select(ORDER_COLUMNS)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function createOrder(userId, serviceId) {
  const { error } = await supabase
    .from('orders')
    .insert({ user_id: userId, service_id: serviceId, status: 'pending' });

  if (error) throw error;
}

let channelSerial = 0;

/**
 * Streams changes to one user's orders. RLS is applied by Realtime as well, and
 * the filter narrows the stream to that user. Returns an unsubscribe function.
 */
export function subscribeToMyOrders(userId, { onChange, onConnection }) {
  channelSerial += 1;

  // A unique name per subscription: StrictMode remounts would otherwise reuse a
  // channel that has already been subscribed.
  const channel = supabase
    .channel(`orders:${userId}:${channelSerial}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'orders', filter: `user_id=eq.${userId}` },
      onChange,
    )
    .subscribe((status) => onConnection(status));

  return () => {
    supabase.removeChannel(channel);
  };
}
