import { Tabs, TabsContent, TabsList, TabsTrigger } from '@radix-ui/react-tabs';
import { DatabaseIcon, Plus, Settings } from 'lucide-react';
import { useEffect, useState } from 'react';
import SortableList, { SortableItem } from 'react-easy-sort';

import { ConnectionManager } from '@/components/connection-manager';
import { ConnectionView } from '@/components/connection-view/connection-view';
import { Button } from '@/components/ui/button';
import { 
  Dialog,
  DialogContent,
  DialogTrigger 
} from '@/components/ui/dialog';
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
      <div className="flex flex-col items-center justify-center h-full">
        <h2 className="text-xl font-medium mb-4">No Database Connections</h2>
        <p className="text-gray-500 mb-6 text-center max-w-md">
          You don't have any database connections yet. Add a connection to get started.
        </p>
        <Dialog open={showManage} onOpenChange={setShowManage}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Connection
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
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
      <TabsList className="relative p-0 h-full">
        <SortableList
          onSortEnd={() => {}}
          lockAxis='y'
          className='flex min-w-20 flex-col gap-4 py-3 pl-0 pr-2'
        >
          {connections.map((connection) => (
            <SortableItem key={connection.id}>
              <TabsTrigger
                value={connection.id}
                className='data-[state=active]:bg-accent flex flex-col items-center gap-1.5 rounded-r-md px-2 py-2 hover:bg-gray-200 data-[state=active]:hover:bg-gray-200 w-full'
              >
                <DatabaseIcon size={22} strokeWidth={1} />
                <span className="text-center text-xs">{connection.name}</span>
              </TabsTrigger>
            </SortableItem>
          ))}
        </SortableList>
        
        <Dialog open={showManage} onOpenChange={setShowManage}>
          <DialogTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute bottom-4 left-1/2 -translate-x-1/2 w-8 h-8 p-0"
            >
              <Settings size={16} />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
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
