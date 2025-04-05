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
    const currentPosition = editorRef.current.getPosition()
    if (!currentPosition) return;

    // Find the row and column of the previous delimiter
    let startRow = currentPosition.lineNumber;
    let prevDelimIndex = -1;

    while (prevDelimIndex === -1 && startRow >= 2){
      startRow--;
      let currentLine = editorModel.getLineContent(startRow);
      prevDelimIndex = currentLine.lastIndexOf(";");
    }
    const startCol = prevDelimIndex + 2
    console.log("start row: " + startRow + " start column: " + startCol);

    // Find the row and column of the next delimiter
    let endRow = currentPosition.lineNumber - 1;
    let endDelimIndex = -1;

    while (endDelimIndex === -1 && endRow <= editorModel.getLineCount() - 1){
      endRow++;
      let currentLine = editorModel.getLineContent(endRow);
      endDelimIndex = currentLine.lastIndexOf(";");
    }
    const endCol = (endDelimIndex === -1) ? editorModel.getLineLength(editorModel.getLineCount()) + 1 : endDelimIndex + 1
    console.log("end row: " + endRow + " end column: " + endCol);

    // Extact the text for the current line's query
    const sourceCode = editorModel.getValueInRange({ startLineNumber: startRow, startColumn: startCol, endLineNumber: endRow, endColumn: endCol});
    if (!sourceCode) return;
    console.log(sourceCode)

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

      <Tooltip>
        <TooltipTrigger asChild onClick={runLine}>
          <Button variant='ghost' size='icon' asChild>
            <div>
              <PlaySquare strokeWidth={1.5} />
            </div>
          </Button>
        </TooltipTrigger>
        <TooltipContent side='bottom' sideOffset={2}>
          Run Current Line
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild onClick={runSelection}>
          <Button variant='ghost' size='icon' asChild>
            <div>
              <PlayCircle strokeWidth={1.5} />
            </div>
          </Button>
        </TooltipTrigger>
        <TooltipContent side='bottom' sideOffset={2}>
          Run Highlighted Query
        </TooltipContent>
      </Tooltip>
    </div>
  );
};

export { EditorToolbar };
