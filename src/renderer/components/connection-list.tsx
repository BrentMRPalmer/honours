import { Tabs, TabsContent, TabsList, TabsTrigger } from '@radix-ui/react-tabs';
import { DatabaseIcon } from 'lucide-react';
import { useState } from 'react';
import SortableList, { SortableItem } from 'react-easy-sort';

import { ConnectionView } from '@/components/connection-view/connection-view';
import { useActiveConnection } from '@/hooks/use-active-connection';
import type { Connection } from '@/types';

const CONNECTIONS: Connection[] = [
  {
    name: 'uozone db',
    tables: ['professors', 'course_sections'],
    history: ['prof query'],
  },
  {
    name: 'spotify db',
    tables: ['songs', 'artists'],
    history: ['song query'],
  },
];

function ConnectionList() {
  const [openConnection, setOpenConnection] = useState(CONNECTIONS[0].name);
  const { changeConnection } = useActiveConnection();

  return (
    <Tabs
      className='flex h-full'
      orientation='vertical'
      value={openConnection}
      onValueChange={(value) => {
        setOpenConnection(value);
        changeConnection('hello').then(() => {
          console.log('goodby');
        });
      }}
    >
      <TabsList>
        <SortableList
          onSortEnd={() => {}}
          lockAxis='y'
          className='flex min-w-20 flex-col gap-4'
        >
          {CONNECTIONS.map((connection) => (
            <SortableItem>
              <TabsTrigger
                value={connection.name}
                className='text-2xs flex flex-col items-center gap-1'
              >
                <DatabaseIcon size={25} strokeWidth={1} />
                {connection.name}
              </TabsTrigger>
            </SortableItem>
          ))}
        </SortableList>
      </TabsList>

      {CONNECTIONS.map((connection) => (
        <TabsContent
          value={connection.name}
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
