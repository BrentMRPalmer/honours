import { Tabs, TabsContent, TabsList, TabsTrigger } from '@radix-ui/react-tabs';
import { XIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import SortableList, { SortableItem } from 'react-easy-sort';

import type { Connection } from '@/types';

import { useConnectionViewContext } from './connection-view-provider';

interface ConnectionViewMainProps {
  connection: Connection;
}

function ConnectionViewMain({ connection }: ConnectionViewMainProps) {
  const { tabs, closeTab, swapTabs } = useConnectionViewContext();
  const [selectedTab, setSelectedTab] = useState<undefined | string>();

  useEffect(() => {
    if (selectedTab === undefined && tabs.length > 0) {
      setSelectedTab(tabs[0].id);
    }
  }, [selectedTab, tabs]);

  const handleTabClose = (id: string) => () => {
    const tabIndex = tabs.findIndex((tab) => tab.id === id);

    if (id === selectedTab) {
      if (tabs.length === 1) {
        setSelectedTab(undefined);
      } else if (tabIndex === tabs.length - 1) {
        setSelectedTab(tabs[tabIndex - 1].id);
      } else {
        setSelectedTab(tabs[tabIndex + 1].id);
      }
    }

    closeTab(id);
  };

  return (
    <Tabs
      value={selectedTab}
      onValueChange={setSelectedTab}
      activationMode='manual'
    >
      <TabsList>
        {tabs.length > 0 && (
          <SortableList
            onSortEnd={(oldI, newI) => swapTabs(tabs[oldI].id, tabs[newI].id)}
            lockAxis='x'
            className='scrollbar-thin flex overflow-x-auto'
            allowDrag={tabs.length > 1}
          >
            {tabs.map(({ id, title }) => (
              <SortableItem key={id}>
                <TabsTrigger
                  value={id}
                  className='data-[state=active]:bg-accent relative flex h-6 w-full min-w-40 items-center justify-center gap-2'
                  onMouseDown={(event) => {
                    // Prevents tab switching when clicking close button
                    const fromTabClose = (event.target as HTMLElement)
                      .closest('svg')
                      ?.hasAttribute('data-tab-close');

                    if (fromTabClose) {
                      event.preventDefault();
                    }
                  }}
                >
                  {title}
                  <XIcon
                    size={12}
                    className='absolute right-2'
                    onClick={handleTabClose(id)}
                    data-tab-close={true}
                  />
                </TabsTrigger>
              </SortableItem>
            ))}
          </SortableList>
        )}
      </TabsList>

      {tabs.map(({ id, component }) => (
        <TabsContent key={id} value={id}>
          {component}
        </TabsContent>
      ))}

      {tabs.length === 0 && connection.name}
    </Tabs>
  );
}

export { ConnectionViewMain };

export type { ConnectionViewMainProps };
