import { Allotment } from 'allotment';

import type { AbstractConnection } from '@/lib/connections/abstract-connection';

import { ConnectionViewMain } from './connection-view-main';
import { ConnectionViewProvider } from './connection-view-provider';
import { ConnectionViewSidebar } from './connection-view-sidebar';

interface ConnectionViewProps {
  connection: AbstractConnection<object, unknown>;
}

function ConnectionView({ connection }: ConnectionViewProps) {
  return (
    <ConnectionViewProvider connection={connection}>
      <div className='border-border h-full overflow-hidden rounded-md border'>
        <Allotment defaultSizes={[200, 800]}>
          <Allotment.Pane minSize={100}>
            <ConnectionViewSidebar />
          </Allotment.Pane>
          <Allotment.Pane minSize={100}>
            <ConnectionViewMain />
          </Allotment.Pane>
        </Allotment>
      </div>
    </ConnectionViewProvider>
  );
}

export { ConnectionView };

export type { ConnectionViewProps };
