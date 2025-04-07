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
import { useEffect, useState } from 'react';

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
  const [hasContent, setHasContent] = useState(false);

  // Check if the editor has user-entered content
  useEffect(() => {
    const checkContent = () => {
      if (!editorRef.current) return;

      const sourceCode = editorRef.current.getValue() || '';
      const starterCodePatterns = [
        /^\s*--\s*Type your query here\s*$/, // SQL
        /^\s*\/\/\s*Type your query here\s*$/, // JavaScript
        /^\s*Type your query here\s*$/, // Plaintext
      ];

      // Check if content is empty or just contains starter code
      const isEmpty =
        !sourceCode.trim() ||
        starterCodePatterns.some((pattern) => pattern.test(sourceCode));

      setHasContent(!isEmpty);
    };

    // Initial check
    checkContent();

    // Set up listener for content changes
    const interval = setInterval(checkContent, 300);

    return () => {
      clearInterval(interval);
    };
  }, [editorRef]);

  const runQuery = async () => {
    if (!editorRef.current) return;

    const sourceCode = editorRef.current.getValue();
    if (!sourceCode) return;

    setQueryResult(connection.query(sourceCode));
  };

  return (
    <div className='mt-2 mr-3 mb-2 flex justify-end'>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant='default'
            size='sm'
            className='bg-background border-border text-foreground hover:bg-accent hover:text-accent-foreground h-8 min-w-[75px] border px-3.5 py-0 disabled:cursor-not-allowed disabled:border-gray-400 disabled:bg-gray-200 disabled:text-gray-600 disabled:shadow-inner'
            onClick={runQuery}
            disabled={!hasContent}
          >
            <span className='flex items-center'>
              <Play size={12} strokeWidth={2} />
              <span className='ml-1.5 font-semibold'>Run</span>
            </span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side='bottom' sideOffset={2}>
          <span className='font-semibold'>Execute Query (Ctrl+Enter)</span>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};

export { EditorToolbar };
