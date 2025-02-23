import { Allotment } from 'allotment';

import type { Connection } from '@/types';

import { ConnectionViewMain } from './connection-view-main';
import { ConnectionViewProvider } from './connection-view-provider';
import { ConnectionViewSidebar } from './connection-view-sidebar';

interface ConnectionViewProps {
  connection: Connection;
}

function ConnectionView({ connection }: ConnectionViewProps) {
  return (
    <ConnectionViewProvider>
      <Allotment>
        <Allotment.Pane minSize={100}>
          <ConnectionViewSidebar connection={connection} />
        </Allotment.Pane>
        <Allotment.Pane minSize={100}>
          <ConnectionViewMain connection={connection} />
        </Allotment.Pane>
      </Allotment>
    </ConnectionViewProvider>
  );
}

export { ConnectionView };
