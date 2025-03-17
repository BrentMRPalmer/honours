import { Portal } from '@radix-ui/react-portal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@radix-ui/react-tabs';
import { BotIcon, SheetIcon, SquarePenIcon, Table2Icon } from 'lucide-react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import { Chat } from '@/components/chat';
import { EditorContainer } from '@/components/editor';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

import { QueryResultTable } from '../query-result-table';
import { useConnectionViewContext } from './connection-view-provider';

function ConnectionViewSidebar() {
  const { connection } = useConnectionViewContext();
  const { tabManager } = useConnectionViewContext();
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [tables, setTables] = useState<string[]>([]);

  useLayoutEffect(() => {
    setIsVisible(ref.current?.offsetParent !== null);
  });

  // Get tables from the current connection
  useEffect(() => {
    connection.getTables().then(setTables);
  }, [connection]);

  const portalContainer = document.getElementById(
    'connection-view-sidebar-tab-list',
  );
  if (portalContainer === null) return null;

  return (
    <Tabs defaultValue='tables' className='h-full' ref={ref}>
      <Portal
        container={portalContainer}
        className={cn(
          'flex h-full items-center gap-0.5',
          !isVisible && 'hidden',
        )}
        asChild
      >
        <TabsList>
          <Tooltip disableHoverableContent>
            <TooltipTrigger>
              <TabsTrigger
                value='tables'
                className='data-[state=active]:bg-accent'
                asChild
              >
                <Button variant='ghost' size='icon' asChild>
                  <div>
                    <Table2Icon strokeWidth={1.5} />
                  </div>
                </Button>
              </TabsTrigger>
            </TooltipTrigger>
            <TooltipContent side='bottom' sideOffset={2}>
              Tables
            </TooltipContent>
          </Tooltip>

          {/* <Tooltip disableHoverableContent>
            <TooltipTrigger>
              <TabsTrigger
                value='history'
                className='data-[state=active]:bg-accent'
                asChild
              >
                <Button variant='ghost' size='icon' asChild>
                  <div>
                    <FileClockIcon strokeWidth={1.5} />
                  </div>
                </Button>
              </TabsTrigger>
            </TooltipTrigger>
            <TooltipContent side='bottom' sideOffset={2}>
              Query history
            </TooltipContent>
          </Tooltip>
          */}

          <Tooltip disableHoverableContent>
            <TooltipTrigger
              asChild
              onClick={() =>
                tabManager.createTab('editor', <EditorContainer />)
              }
            >
              <Button variant='ghost' size='icon' asChild>
                <div>
                  <SquarePenIcon strokeWidth={1.5} />
                </div>
              </Button>
            </TooltipTrigger>
            <TooltipContent side='bottom' sideOffset={2}>
              Editor
            </TooltipContent>
          </Tooltip>

          <Tooltip disableHoverableContent>
            <TooltipTrigger
              asChild
              onClick={() => tabManager.createTab('AI Chat', <Chat />)}
            >
              <Button variant='ghost' size='icon' asChild>
                <div>
                  <BotIcon strokeWidth={1.5} />
                </div>
              </Button>
            </TooltipTrigger>
            <TooltipContent side='bottom' sideOffset={2}>
              AI Chat
            </TooltipContent>
          </Tooltip>
        </TabsList>
      </Portal>

      <TabsContent
        value='tables'
        className='flex h-full flex-col gap-2 overflow-y-auto py-2'
      >
        {tables.map((table) => (
          <div
            key={table}
            className='hover:bg-primary/10 flex cursor-pointer items-center gap-1 rounded px-2 py-1'
            onClick={() =>
              tabManager.createTab(
                table,
                <QueryResultTable
                  query={connection.getPaginatedTableData(table)}
                />,
              )
            }
          >
            <SheetIcon size={16} className='min-w-fit' />
            <p className='truncate'>{table}</p>
          </div>
        ))}
      </TabsContent>

      {/* Commented out history content for now
      <TabsContent value='history' className='flex flex-col gap-2'>
        {history.map((history) => (
          <div
            key={history}
            className='flex items-center gap-1'
            onClick={() => openTab(history, <div>{history} history</div>)}
          >
            <ClockIcon size={16} className='min-w-fit' />
            <p className='truncate'>{history}</p>
          </div>
        ))}
      </TabsContent>
      */}
    </Tabs>
  );
}

export { ConnectionViewSidebar };
