import { useCallback, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { isDemoMode } from '../lib/SupabaseClient';
import { createOrder } from '../services/orders';

const FOREIGN_KEY_VIOLATION = '23503';

function describeOrderError(error) {
  if (error?.code === FOREIGN_KEY_VIOLATION) {
    if (error.message?.includes('orders_service_id_fkey')) {
      return 'This service is no longer available. Reload the page and choose another.';
    }
    // Nothing on the client can create a missing profile, so retrying won't help.
    return 'Your account has no profile record, so orders cannot be saved. Signing in again will not fix this. Please contact support with your account email.';
  }
  return error?.message ?? 'The order could not be created. Please try again.';
}

export function useOrderAction() {
  const { user, loading, openLogin } = useAuth();
  const { notify } = useToast();
  const [busyId, setBusyId] = useState(null);
  const busyRef = useRef(false);

  const placeOrder = useCallback(
    async (service) => {
      if (isDemoMode) {
        notify({
          tone: 'info',
          title: 'Demo mode: no order created',
          body: `Supabase is not configured, so "${service.title}" was not ordered and nothing was saved.`,
        });
        return;
      }

      if (loading || busyRef.current) return;

      if (!user) {
        openLogin(`Sign in to order "${service.title}".`);
        return;
      }

      busyRef.current = true;
      setBusyId(service.id);
      try {
        await createOrder(user.id, service.id);
        notify({
          tone: 'success',
          title: 'Order queued',
          body: `"${service.title}" is now pending. No payment was taken.`,
          link: { to: '/dashboard', label: 'Track it in Dashboard' },
        });
      } catch (error) {
        notify({ tone: 'error', title: 'Order failed', body: describeOrderError(error) });
      } finally {
        busyRef.current = false;
        setBusyId(null);
      }
    },
    [user, loading, openLogin, notify],
  );

  return { placeOrder, busyId };
}
