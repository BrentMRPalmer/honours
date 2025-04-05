import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from './ui/button';
import { Play } from 'lucide-react';
import { editor } from 'monaco-editor';
import { useConnectionViewContext } from './connection-view/connection-view-provider';
import { QueryResult } from '@/common/types';

interface EditorToolbarInputProps {
  editorRef: React.RefObject<editor.IStandaloneCodeEditor | null>;
  setQueryResult: React.Dispatch<
    React.SetStateAction<Promise<QueryResult<any>> | null>
  >;
}

const EditorToolbar = ({
  editorRef,
  setQueryResult,
}: EditorToolbarInputProps) => {
  const { connection } = useConnectionViewContext();

  const runQuery = async () => {
    if (!editorRef.current) return;

    const sourceCode = editorRef.current.getValue();
    if (!sourceCode) return;

    setQueryResult(connection.query(sourceCode));
  };

  return (
    <div>
      <Tooltip disableHoverableContent>
        <TooltipTrigger asChild onClick={runQuery}>
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
