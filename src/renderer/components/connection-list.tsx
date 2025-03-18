import { Tabs, TabsContent, TabsList, TabsTrigger } from '@radix-ui/react-tabs';
import { DatabaseIcon } from 'lucide-react';
import { useEffect } from 'react';
import SortableList, { SortableItem } from 'react-easy-sort';

import { ConnectionView } from '@/components/connection-view/connection-view';
import { useConnections } from '@/hooks/use-connections';

function ConnectionList() {
  const { activeConnectionId, connections, changeConnection, getConnections } =
    useConnections();

  useEffect(() => {
    getConnections();
  }, [getConnections]);

  if (connections.length === 0) return null;

  return (
    <Tabs
      className='flex h-full'
      orientation='vertical'
      value={activeConnectionId}
      onValueChange={(connectionId: string) => {
        changeConnection(connectionId);
      }}
    >
      <TabsList>
        <SortableList
          onSortEnd={() => {}}
          lockAxis='y'
          className='flex min-w-20 flex-col gap-4'
        >
          {connections.map((connection) => (
            <SortableItem key={connection.id}>
              <TabsTrigger
                value={connection.id}
                className='data-[state=active]:bg-accent data-[state=active]:hover:bg-gray-200 hover:bg-gray-200 text-2xs rounded-r-md px-2 py-1 flex flex-col items-center gap-1'
              >
                <DatabaseIcon size={25} strokeWidth={1} />
                {connection.name}
              </TabsTrigger>
            </SortableItem>
          ))}
        </SortableList>
      </TabsList>

      {connections.map((connection) => (
        <TabsContent
          key={connection.id}
          value={connection.id}
          className='w-full data-[state=inactive]:hidden'
          forceMount
        >
          <ConnectionView connection={connection} />
        </TabsContent>
      ))}
    </Tabs>
  );
}

export { ConnectionList };
