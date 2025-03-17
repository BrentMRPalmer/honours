import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from './ui/button';
import { Play } from 'lucide-react';

const EditorToolbar = () => {
//   const runQuery = async () {
    
//   }

  return (
    <div>
      <Tooltip disableHoverableContent>
        <TooltipTrigger
          asChild
          onClick={() => {
            console.log('Hello');
          }}
        >
          <Button variant='ghost' size='icon' asChild>
            <div>
              <Play strokeWidth={1.5} />
            </div>
          </Button>
        </TooltipTrigger>
        <TooltipContent side='bottom' sideOffset={2}>
          Run
        </TooltipContent>
      </Tooltip>
    </div>
  );
};

export { EditorToolbar };
