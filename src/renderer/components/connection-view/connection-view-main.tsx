import { Tabs, TabsContent, TabsList, TabsTrigger } from '@radix-ui/react-tabs';
import { XIcon } from 'lucide-react';
import SortableList, { SortableItem } from 'react-easy-sort';

import { useConnectionViewContext } from './connection-view-provider';

function ConnectionViewMain() {
  const { connection, tabManager } = useConnectionViewContext();

  return (
    <Tabs
      value={tabManager.activeTabId}
      onValueChange={tabManager.activateTab}
      className='flex h-full flex-col overflow-hidden'
      activationMode='manual'
    >
      <TabsList>
        {tabManager.tabs.length > 0 && (
          <SortableList
            onSortEnd={(oldI, newI) =>
              tabManager.swapTabs(
                tabManager.tabs[oldI].id,
                tabManager.tabs[newI].id,
              )
            }
            lockAxis='x'
            className='scrollbar-thin flex overflow-x-auto'
            allowDrag={tabManager.tabs.length > 1}
          >
            {tabManager.tabs.map(({ id, title }) => (
              <SortableItem key={id}>
                <TabsTrigger
                  value={id}
                  className='data-[state=inactive]:bg-accent data-[state=inactive]:hover:bg-gray-200 hover:bg-gray-200 relative flex h-6 w-full min-w-40 items-center justify-center gap-2'
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
                    onClick={() => tabManager.closeTab(id)}
                    data-tab-close={true}
                  />
                </TabsTrigger>
              </SortableItem>
            ))}
          </SortableList>
        )}
      </TabsList>

      {tabManager.tabs.map(({ id, component }) => (
        <TabsContent key={id} value={id} className='overflow-hidden data-[state=inactive]:hidden' forceMount>
          {component}
        </TabsContent>
      ))}

      {tabManager.tabs.length === 0 && connection.name}
    </Tabs>
  );
}

export { ConnectionViewMain };
