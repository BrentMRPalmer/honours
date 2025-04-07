import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from './ui/button';
import { Play, PlayCircle, PlaySquare } from 'lucide-react';
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
    // Return if there is no current editor
    if (!editorRef.current) return;

    // Extract everything from the editor
    const sourceCode = editorRef.current.getValue();
    if (!sourceCode) return;

    // Execute the query, returning a promise
    setQueryResult(connection.query(sourceCode));
  };

  const runLine = async () => {
    // Return if there is no current editor
    if (!editorRef.current) return;

    // Get the model for the current editor, allowing for accessing the text
    const editorModel = editorRef.current.getModel();
    if (!editorModel) return;

    // Extract the current line the cursor is on
    const currentPosition = editorRef.current.getPosition();
    if (!currentPosition) return;

    // Find the row and column of the previous delimiter
    let startRow = currentPosition.lineNumber;
    let prevDelimIndex = -1;

    while (prevDelimIndex === -1 && startRow >= 2) {
      startRow--;
      let currentLine = editorModel.getLineContent(startRow);
      prevDelimIndex = currentLine.lastIndexOf(';');
    }
    const startCol = prevDelimIndex + 2;
    console.log('start row: ' + startRow + ' start column: ' + startCol);

    // Find the row and column of the next delimiter
    let endRow = currentPosition.lineNumber - 1;
    let endDelimIndex = -1;

    while (endDelimIndex === -1 && endRow <= editorModel.getLineCount() - 1) {
      endRow++;
      let currentLine = editorModel.getLineContent(endRow);
      endDelimIndex = currentLine.lastIndexOf(';');
    }
    const endCol =
      endDelimIndex === -1
        ? editorModel.getLineLength(editorModel.getLineCount()) + 1
        : endDelimIndex + 1;
    console.log('end row: ' + endRow + ' end column: ' + endCol);

    // Extact the text for the current line's query
    const sourceCode = editorModel.getValueInRange({
      startLineNumber: startRow,
      startColumn: startCol,
      endLineNumber: endRow,
      endColumn: endCol,
    });
    if (!sourceCode) return;
    console.log(sourceCode);

    // Execute the query, returning a promise
    setQueryResult(connection.query(sourceCode));
  };

  const runSelection = async () => {
    // Return if there is no current editor
    if (!editorRef.current) return;

    // Get the model for the current editor, allowing for accessing the text
    const editorModel = editorRef.current.getModel();
    if (!editorModel) return;

    // Extract the current selection
    const currentSelection = editorRef.current.getSelection();
    if (!currentSelection) return;

    // Extact the text in the selection
    const sourceCode = editorModel.getValueInRange(currentSelection);
    if (!sourceCode) return;

    // Execute the query, returning a promise
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
              <Play size={14} strokeWidth={2} />
              <span className='ml-1.5 font-semibold'>Run Query</span>
            </span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side='bottom' sideOffset={2}>
          <span className='font-semibold'>Execute Query (Ctrl+Enter)</span>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant='default'
            size='sm'
            className='bg-background border-border text-foreground hover:bg-accent hover:text-accent-foreground h-8 ml-2 px-3 py-0 border disabled:cursor-not-allowed disabled:border-gray-400 disabled:bg-gray-200 disabled:text-gray-600 disabled:shadow-inner'
            onClick={runLine}
            disabled={!hasContent}
          >
            <span className='flex items-center'>
              <PlaySquare size={14} strokeWidth={2} />
              <span className='ml-1.5 font-semibold text-xs'>Run Line</span>
            </span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side='bottom' sideOffset={2}>
          <span className='font-semibold'>Run Current Line</span>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant='default'
            size='sm'
            className='bg-background border-border text-foreground hover:bg-accent hover:text-accent-foreground h-8 ml-2 px-3 py-0 border disabled:cursor-not-allowed disabled:border-gray-400 disabled:bg-gray-200 disabled:text-gray-600 disabled:shadow-inner'
            onClick={runSelection}
            disabled={!hasContent}
          >
            <span className='flex items-center'>
              <PlayCircle size={14} strokeWidth={2} />
              <span className='ml-1.5 font-semibold text-xs'>Run Selected</span>
            </span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side='bottom' sideOffset={2}>
          <span className='font-semibold'>Run Highlighted Query</span>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};

export { EditorToolbar };
