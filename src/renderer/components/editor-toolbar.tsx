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
import { KeyCode } from 'monaco-editor';

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
    const dbType = connection.connectionDriver;

    if (dbType === "sqlite"){
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
      
      // Find the last ";" in the current line before the cursor
      let currentColumn = currentPosition.column;
      let currentLine = editorModel.getLineContent(startRow);
      console.log(currentLine.substring(0, currentColumn - 1))
      prevDelimIndex = currentLine.substring(0, currentColumn - 1).lastIndexOf(';');
      console.log(prevDelimIndex)

      while (prevDelimIndex === -1 && startRow >= 2) {
        startRow--;
        currentLine = editorModel.getLineContent(startRow);
        prevDelimIndex = currentLine.lastIndexOf(';');
      }
      const startCol = prevDelimIndex + 2;
      console.log('start row: ' + startRow + ' start column: ' + startCol);

      // Find the row and column of the next delimiter
      let endRow = currentPosition.lineNumber;
      let endDelimIndex = -1;

      // Find the first ";" in the current line after the cursor
      currentColumn = currentPosition.column;
      currentLine = editorModel.getLineContent(endRow);
      endDelimIndex = currentLine.substring(currentColumn - 1).indexOf(';');

      if (endDelimIndex !== -1 ){
        endDelimIndex = endDelimIndex + currentColumn - 1;
      }
      console.log(endDelimIndex)

      while (endDelimIndex === -1 && endRow <= editorModel.getLineCount() - 1) {
        endRow++;
        let currentLine = editorModel.getLineContent(endRow);
        endDelimIndex = currentLine.indexOf(';');
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
    } else {
      // Return if there is no current editor
      if (!editorRef.current) return;

      // Get the model for the current editor, allowing for accessing the text
      const editorModel = editorRef.current.getModel();
      if (!editorModel) return;

      // Extract the current line the cursor is on
      const currentLine = editorRef.current.getPosition()?.lineNumber;
      if (!currentLine) return;

      // Extract the query on the current line
      const sourceCode = editorModel.getLineContent(currentLine)
      if (!sourceCode) return;
      console.log(sourceCode)

      // Execute the query, returning a promise
      setQueryResult(connection.query(sourceCode));
    }
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

  useEffect(() => {
    if (!editorRef.current) return;
    const editorInstance = editorRef.current;
  
    const disposable = editorInstance.onKeyDown((e) => {
      // Run Query: Ctrl/Cmd+Enter
      if ((e.ctrlKey || e.metaKey) && e.keyCode === KeyCode.Enter && !e.shiftKey && !e.altKey) {
        e.preventDefault();
        e.stopPropagation();
        runQuery();
      }

      // Run Current Line: Shift+Enter
      else if (e.shiftKey && !e.ctrlKey && !e.metaKey && !e.altKey && e.keyCode === KeyCode.Enter) {
        e.preventDefault();
        e.stopPropagation();
        runLine();
      }

      // Run Highlighted Text: Ctrl/Cmd+Shift+Enter
      else if ((e.ctrlKey || e.metaKey) && e.shiftKey && !e.altKey && e.keyCode === KeyCode.Enter) {
        e.preventDefault();
        e.stopPropagation();
        runSelection();
      }
    });
  
    return () => {
      disposable.dispose();
    };
  }, [editorRef, runQuery, runLine, runSelection]);

  return (
    <div className='mt-2 mr-3 mb-2 flex justify-end'>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant='default'
            size='sm'
            className='bg-background border-border text-foreground hover:bg-accent hover:text-accent-foreground h-7 border px-2.5 py-0 rounded-md shadow-[0_1px_2px_rgba(0,0,0,0.05)] disabled:cursor-not-allowed disabled:border-gray-400 disabled:bg-gray-200 disabled:text-gray-600 disabled:shadow-inner'
            onClick={runQuery}
            disabled={!hasContent}
          >
            <span className='flex items-center gap-1'>
              <Play size={14} strokeWidth={2} />
              <span className='font-medium text-xs'>Execute Query</span>
            </span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side='bottom' sideOffset={2}>
          <span className='font-medium'>Execute Query (Ctrl/Cmd+Enter)</span>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant='default'
            size='sm'
            className='bg-background border-border text-foreground hover:bg-accent hover:text-accent-foreground ml-2 h-7 w-7 border p-0 rounded-md shadow-[0_1px_2px_rgba(0,0,0,0.05)] disabled:cursor-not-allowed disabled:border-gray-400 disabled:bg-gray-200 disabled:text-gray-600 disabled:shadow-inner'
            onClick={runLine}
            disabled={!hasContent}
          >
            <PlaySquare size={16} strokeWidth={2} />
          </Button>
        </TooltipTrigger>
        <TooltipContent side='bottom' sideOffset={2}>
          <span className='font-medium'>Run Current Line (Shift+Enter)</span>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant='default'
            size='sm'
            className='bg-background border-border text-foreground hover:bg-accent hover:text-accent-foreground ml-2 h-7 w-7 border p-0 rounded-md shadow-[0_1px_2px_rgba(0,0,0,0.05)] disabled:cursor-not-allowed disabled:border-gray-400 disabled:bg-gray-200 disabled:text-gray-600 disabled:shadow-inner'
            onClick={runSelection}
            disabled={!hasContent}
          >
            <PlayCircle size={16} strokeWidth={2} />
          </Button>
        </TooltipTrigger>
        <TooltipContent side='bottom' sideOffset={2}>
          <span className='font-medium'>Run Highlighted Query (Ctrl/Cmd+Shift+Enter)</span>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};

export { EditorToolbar };
