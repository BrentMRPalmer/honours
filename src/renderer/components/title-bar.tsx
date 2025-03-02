import type { CSSProperties } from 'react';

function TitleBar() {
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
    </header>
  );
}

export { TitleBar };
