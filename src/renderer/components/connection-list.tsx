import { Tabs, TabsContent, TabsList, TabsTrigger } from '@radix-ui/react-tabs';
import { DatabaseIcon, Plus, Settings } from 'lucide-react';
import { useEffect, useState } from 'react';
import SortableList, { SortableItem } from 'react-easy-sort';

import { ConnectionManager } from '@/components/connection-manager';
import { ConnectionView } from '@/components/connection-view/connection-view';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { useConnections } from '@/hooks/use-connections';

function ConnectionList() {
  const { activeConnectionId, connections, changeConnection, getConnections } =
    useConnections();
  const [showManage, setShowManage] = useState(false);

  useEffect(() => {
    getConnections();
  }, [getConnections]);

  if (connections.length === 0) {
    return (
      <div className='flex h-full flex-col items-center justify-center'>
        <h2 className='mb-4 text-xl font-medium'>No Database Connections</h2>
        <p className='mb-6 max-w-md text-center text-gray-500'>
          You don't have any database connections yet. Add a connection to get
          started.
        </p>
        <Dialog open={showManage} onOpenChange={setShowManage}>
          <DialogTrigger asChild>
            <Button>
              <Plus className='mr-2 h-4 w-4' />
              Add Connection
            </Button>
          </DialogTrigger>
          <DialogContent className='max-w-4xl'>
            <ConnectionManager />
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <Tabs
      className='flex h-full overflow-hidden'
      orientation='vertical'
      value={activeConnectionId}
      onValueChange={(connectionId: string) => {
        changeConnection(connectionId);
      }}
    >
      <TabsList className='relative h-full p-0'>
        <SortableList
          onSortEnd={() => {}}
          lockAxis='y'
          className='flex min-w-20 flex-col gap-4 py-3 pr-2 pl-0'
        >
          {connections.map((connection) => (
            <SortableItem key={connection.id}>
              <TabsTrigger
                value={connection.id}
                className='data-[state=active]:bg-accent flex w-full flex-col items-center gap-1.5 rounded-r-md px-2 py-2 hover:bg-gray-200 data-[state=active]:hover:bg-gray-200'
              >
                <DatabaseIcon size={22} strokeWidth={1} />
                <span className='text-center text-xs'>{connection.name}</span>
              </TabsTrigger>
            </SortableItem>
          ))}
        </SortableList>

        <Dialog open={showManage} onOpenChange={setShowManage}>
          <DialogTrigger asChild>
            <Button
              variant='ghost'
              size='icon'
              className='absolute bottom-4 left-1/2 h-8 w-8 -translate-x-1/2 p-0'
            >
              <Settings size={16} />
            </Button>
          </DialogTrigger>
          <DialogContent className='max-w-4xl'>
            <ConnectionManager />
          </DialogContent>
        </Dialog>
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
