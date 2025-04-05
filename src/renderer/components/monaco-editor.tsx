import Editor from '@monaco-editor/react';
import { editor } from 'monaco-editor';
import { useState } from 'react';
import { useConnectionViewContext } from './connection-view/connection-view-provider';
import { ConnectionDriver } from '@/common/types';

type Language = 'sql' | 'javascript' | 'plaintext';

interface MonacoEditorInputProps {
  editorRef: React.RefObject<editor.IStandaloneCodeEditor | null>;
}

function MonacoEditor({ editorRef }: MonacoEditorInputProps) {
  const { connection } = useConnectionViewContext();
  const [value, setValue] = useState('');

  // Get the current connection driver name
  const connectionType: ConnectionDriver = connection.connectionDriver;

  // Use a record to establish which query highlighting syntax should
  // be used depending on the current database type
  const dbTypes: Record<ConnectionDriver, Language> = {
    sqlite: 'sql',
    postgresql: 'sql',
    mysql: 'sql',
    maria: 'sql',
    mongo: 'javascript',
    redis: 'plaintext',
  };

  // Use a record to establish starter code for each database
  const starterCode: Record<Language, string> = {
    sql: `-- Type your query here`,
    javascript: `// Type your query here`,
    plaintext: `Type your query here`,
  };

  // Extract the corresponding highlighting syntax from the record
  const connectionLanguage = dbTypes[connectionType];

  // Focus automatically places the user's cursor into the editor
  const onMount = (editorInstance: editor.IStandaloneCodeEditor) => {
    // Save a reference to the current editor instance
    editorRef.current = editorInstance;

    // Get the model for the current editor, allowing for accessing the text
    const editorModel = editorRef.current.getModel();
    if (editorModel) {
      // Extact the number of lines, and the length of the last line
      const lineCount = editorModel.getLineCount();
      const lineLength = editorModel.getLineLength(lineCount);

      // Set the cursor to the end of the first line
      editorRef.current.setPosition({
        column: lineLength + 1,
        lineNumber: lineCount,
      });
    }

    // Focus the editor
    editorRef.current.focus();
  };

  return (
    <Editor
      height='90vh'
      defaultLanguage={connectionLanguage}
      defaultValue={starterCode[connectionLanguage]}
      onMount={onMount}
      value={value}
      onChange={(value) => setValue(value ?? '')}
    />
  );
}

export { MonacoEditor };
