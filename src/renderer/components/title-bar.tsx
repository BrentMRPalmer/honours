import type { CSSProperties } from 'react';

import { useActiveConnection } from '@/hooks/use-active-connection';

function TitleBar() {
  const { connectionName } = useActiveConnection();

  return (
    <header
      className='relative flex h-10 w-full'
      style={{ WebkitAppRegion: 'drag' } as CSSProperties}
    >
      <div
        id='connection-view-sidebar-tab-list'
        className='absolute left-20 h-full w-fit'
        style={{ WebkitAppRegion: 'no-drag' } as CSSProperties}
      />
      <div className='border-muted absolute flex h-full w-full items-center justify-center border'>
        {connectionName}
      </div>
    </header>
  );
}

export { TitleBar };
