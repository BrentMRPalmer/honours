import { arrayMoveImmutable } from 'array-move';
import type { PropsWithChildren, ReactNode } from 'react';
import { createContext, useContext, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

type Tab = { id: string; title: string; component: ReactNode };

const ConnectionViewContext = createContext<{
  tabs: Tab[];
  openTab: (title: string, component: ReactNode) => Tab;
  closeTab: (id: string) => void;
  swapTabs: (id1: string, id2: string) => void;
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

function ConnectionViewProvider({ children }: PropsWithChildren) {
  const [tabs, setTabs] = useState<Tab[]>([]);

  const openTab = (title: string, component: ReactNode) => {
    const newTab = { id: uuidv4(), title, component };
    setTabs(tabs.concat(newTab));
    return newTab;
  };

  const closeTab = (id: string) => {
    setTabs(tabs.filter((tab) => tab.id !== id));
  };

  const swapTabs = (id1: string, id2: string) => {
    const index1 = tabs.findIndex((tab) => tab.id === id1);
    const index2 = tabs.findIndex((tab) => tab.id === id2);

    if (index1 === -1 || index2 === -1) {
      throw Error('`swapTabs` called with non-existent tab id');
    }

    setTabs(arrayMoveImmutable(tabs, index1, index2));
  };

  return (
    <ConnectionViewContext.Provider
      value={{ tabs, openTab, closeTab, swapTabs }}
    >
      {children}
    </ConnectionViewContext.Provider>
  );
}

export { ConnectionViewProvider, useConnectionViewContext };
