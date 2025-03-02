import type { PropsWithChildren } from 'react';
import { createContext, useContext } from 'react';

import { useTabManager } from '@/hooks/use-tab-manager';
import type { AbstractConnection } from '@/lib/connections/abstract-connection';

const ConnectionViewContext = createContext<{
  connection: AbstractConnection<object, unknown>;
  tabManager: ReturnType<typeof useTabManager>;
} | null>(null);

function useConnectionViewContext() {
  const connectionViewContext = useContext(ConnectionViewContext);

  if (connectionViewContext === null) {
    throw new Error(
      '`useConnectionViewContext` must be used within `ConnectionViewProvider`',
    );
  }

  return connectionViewContext;
}

interface ConnectionViewProviderProps extends PropsWithChildren {
  connection: AbstractConnection<object, unknown>;
}

function ConnectionViewProvider({
  connection,
  children,
}: ConnectionViewProviderProps) {
  const tabManager = useTabManager();

  return (
    <ConnectionViewContext.Provider
      value={{ connection, tabManager: tabManager }}
    >
      {children}
    </ConnectionViewContext.Provider>
  );
}

export { ConnectionViewProvider, useConnectionViewContext };
