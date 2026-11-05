import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const ConnectionContext = createContext(null);

/**
 * The header shows the Realtime state, but the subscription belongs to whichever
 * page is using useMyOrders. Those pages report here, and `connection` is null
 * while no page holds a channel open.
 */
export function ConnectionProvider({ children }) {
  const [connection, setConnection] = useState(null);
  const value = useMemo(() => ({ connection, setConnection }), [connection]);
  return <ConnectionContext.Provider value={value}>{children}</ConnectionContext.Provider>;
}

export const useConnection = () => useContext(ConnectionContext).connection;

export function useReportConnection(connection) {
  const { setConnection } = useContext(ConnectionContext);

  useEffect(() => {
    setConnection(connection);
    return () => setConnection(null);
  }, [connection, setConnection]);
}
