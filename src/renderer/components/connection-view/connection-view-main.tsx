import { Tabs, TabsContent, TabsList, TabsTrigger } from '@radix-ui/react-tabs';
import { XIcon } from 'lucide-react';
import SortableList, { SortableItem } from 'react-easy-sort';
import { useConnectionViewContext } from './connection-view-provider';

// Function to display connection details based on connection type
function ConnectionDetails({ connection }) {
  // Function to get details based on connection type
  const getConnectionInfo = () => {
    const driver = connection.connectionDriver;
    
    switch(driver) {
      case 'sqlite':
        return { 
          label: 'Database file',
          value: 'SQLite database'
        };
      case 'postgresql':
        return { 
          label: 'PostgreSQL',
          value: 'PostgreSQL database'
        };
      case 'mysql':
      case 'maria':
        return { 
          label: 'MySQL/MariaDB',
          value: 'MySQL compatible database'
        };
      case 'mongo':
        return { 
          label: 'MongoDB',
          value: 'MongoDB database'
        };
      case 'redis':
        return { 
          label: 'Redis',
          value: 'Redis key-value store'
        };
      default:
        return { label: 'Database', value: 'Unknown database type' };
    }
  };
  
  const info = getConnectionInfo();
  
  return (
    <div className="text-center text-sm text-muted-foreground">
      <p>{info.value}</p>
    </div>
  );
}

function ConnectionViewMain() {
  const { connection, tabManager } = useConnectionViewContext();

  return (
    <Tabs
      value={tabManager.activeTabId}
      onValueChange={tabManager.activateTab}
      className='flex h-full flex-col overflow-hidden no-bottom-border'
      activationMode='manual'
    >
      <TabsList className="border-b-0">
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
                  className='data-[state=inactive]:bg-accent relative flex h-8 w-full min-w-40 items-center justify-center gap-2 hover:bg-gray-200 data-[state=inactive]:hover:bg-gray-200 text-sm'
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
                  <span className="truncate pr-5 font-semibold">{title}</span>
                  <XIcon
                    size={16}
                    className='absolute right-2.5'
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
        <TabsContent
          key={id}
          value={id}
          className='overflow-hidden data-[state=inactive]:hidden'
          forceMount
        >
          {component}
        </TabsContent>
      ))}

      {tabManager.tabs.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full">
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl tracking-tight mb-2">
              <span className="font-light tracking-normal">Working with</span> <span className="font-bold">{connection.name}</span>
            </h2>
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm mb-4">
              <span className="uppercase font-medium">{connection.connectionDriver}</span>
            </div>
            <ConnectionDetails connection={connection} />
          </div>
        </div>
      )}
      
    </Tabs>
  );
}

export { ConnectionViewMain };
