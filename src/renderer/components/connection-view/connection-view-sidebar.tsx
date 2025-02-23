import { Portal } from '@radix-ui/react-portal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@radix-ui/react-tabs';
import {
  ClockIcon,
  FileClockIcon,
  SheetIcon,
  SquarePenIcon,
  Table2Icon,
} from 'lucide-react';
import { useLayoutEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { Connection } from '@/types';

import { useConnectionViewContext } from './connection-view-provider';

interface ConnectionViewSidebarProps {
  connection: Connection;
}

function ConnectionViewSidebar({ connection }: ConnectionViewSidebarProps) {
  const { openTab } = useConnectionViewContext();
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useLayoutEffect(() => {
    setIsVisible(ref.current?.offsetParent !== null);
  });

  const portalContainer = document.getElementById(
    'connection-view-sidebar-tab-list',
  );
  if (portalContainer === null) return null;

  return (
    <Tabs defaultValue='tables' ref={ref}>
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

          <Tooltip disableHoverableContent>
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

          <Tooltip disableHoverableContent>
            <TooltipTrigger
              asChild
              onClick={() => openTab('editor', <div>editor</div>)}
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
        </TabsList>
      </Portal>

      <TabsContent value='tables' className='flex flex-col gap-2'>
        {connection.tables.map((table) => (
          <div
            className='flex items-center gap-1'
            onClick={() => openTab(table, <div>{table} table</div>)}
          >
            <SheetIcon size={16} className='min-w-fit' />
            <p className='truncate'>{table}</p>
          </div>
        ))}
      </TabsContent>

      <TabsContent value='history' className='flex flex-col gap-2'>
        {connection.history.map((history) => (
          <div
            className='flex items-center gap-1'
            onClick={() => openTab(history, <div>{history} history</div>)}
          >
            <ClockIcon size={16} className='min-w-fit' />
            <p className='truncate'>{history}</p>
          </div>
        ))}
      </TabsContent>
    </Tabs>
  );
}

export { ConnectionViewSidebar };

export type { ConnectionViewSidebarProps };
