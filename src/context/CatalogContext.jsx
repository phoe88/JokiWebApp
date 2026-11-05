import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { fetchCompletedCounts, fetchServices } from '../services/catalog';

const CatalogContext = createContext(null);

export function CatalogProvider({ children }) {
  const [services, setServices] = useState([]);
  const [counts, setCounts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const latestRequest = useRef(0);

  const load = useCallback(async () => {
    latestRequest.current += 1;
    const request = latestRequest.current;
    setLoading(true);
    setError(null);

    const [servicesResult, countsResult] = await Promise.allSettled([
      fetchServices(),
      fetchCompletedCounts(),
    ]);
    if (request !== latestRequest.current) return;

    if (servicesResult.status === 'fulfilled') setServices(servicesResult.value);
    else setError(servicesResult.reason);

    // A failed counter query leaves counts null, shown as a dash rather than a false zero.
    setCounts(countsResult.status === 'fulfilled' ? countsResult.value : null);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Counters only, with no loading state, so the cards don't flash. A failure
  // keeps the last known numbers.
  const refreshCounts = useCallback(async () => {
    try {
      setCounts(await fetchCompletedCounts());
    } catch {
      // The next refresh or page load corrects them.
    }
  }, []);

  const value = useMemo(
    () => ({ services, counts, loading, error, reload: load, refreshCounts }),
    [services, counts, loading, error, load, refreshCounts],
  );

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export const useCatalog = () => useContext(CatalogContext);
