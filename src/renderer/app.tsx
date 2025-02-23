import './index.css';
import 'allotment/dist/style.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { ConnectionList } from '@/components/connection-list';
import { TitleBar } from '@/components/title-bar';
import { TooltipProvider } from '@/components/ui/tooltip';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TooltipProvider delayDuration={500} skipDelayDuration={300}>
      <div className='flex h-full flex-col'>
        <TitleBar />
        <div className='flex-1'>
          <ConnectionList />
        </div>
      </div>
    </TooltipProvider>
  </StrictMode>,
);
