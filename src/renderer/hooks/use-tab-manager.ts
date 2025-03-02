import { arrayMoveImmutable } from 'array-move';
import type { ReactNode } from 'react';
import { useCallback, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

type Tab = { id: string; title: string; component: ReactNode };

function useTabManager() {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string>();

  const createTab = useCallback((title: string, component: ReactNode) => {
    const newTab = { id: uuidv4(), title, component };
    setActiveTabId(newTab.id);
    setTabs((tabs) => tabs.concat(newTab));
    return newTab;
  }, []);

  const activateTab = useCallback(
    (id: string) => {
      const tabIndex = tabs.findIndex((tab) => tab.id === id);
      if (tabIndex === -1) {
        throw new Error(`Tab with id \`${id}\` does not exist`);
      }

      setActiveTabId(id);
    },
    [tabs],
  );

  const closeTab = useCallback(
    (id: string) => {
      const tabIndex = tabs.findIndex((tab) => tab.id === id);
      if (tabIndex === -1) {
        throw new Error(`Tab with id \`${id}\` does not exist`);
      }

      if (id === activeTabId) {
        if (tabs.length === 1) {
          setActiveTabId(undefined);
        } else if (tabIndex === tabs.length - 1) {
          setActiveTabId(tabs[tabIndex - 1].id);
        } else {
          setActiveTabId(tabs[tabIndex + 1].id);
        }
      }

      setTabs(tabs.filter((tab) => tab.id !== id));
    },
    [activeTabId, tabs],
  );

  const swapTabs = useCallback(
    (id1: string, id2: string) => {
      const index1 = tabs.findIndex((tab) => tab.id === id1);
      const index2 = tabs.findIndex((tab) => tab.id === id2);

      if (index1 === -1 || index2 === -1) {
        throw Error('`swapTabs` called with non-existent tab id');
      }

      setTabs(arrayMoveImmutable(tabs, index1, index2));
    },
    [tabs],
  );

  return {
    tabs,
    activeTabId,
    createTab,
    activateTab,
    closeTab,
    swapTabs,
  };
}

export { useTabManager };

export type { Tab };
