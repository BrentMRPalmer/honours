import Editor from '@monaco-editor/react';
import { editor } from 'monaco-editor';
import { useRef, useState } from 'react';
import { useConnectionViewContext } from './connection-view/connection-view-provider';
import { ConnectionDriver } from '@/common/types';

type Language = 'sql' | 'javascript' | 'plaintext';

function MonacoEditor() {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const { connection } = useConnectionViewContext();
  const [value, setValue] = useState('');

  // Get the current connection driver name
  const connectionType: ConnectionDriver = connection.connectionDriver;

  // Use a record to establish which query highlighting syntax should
  // be used depending on the current database type
  const dbTypes: Record<ConnectionDriver, Language> = {
    "sqlite": "sql",
    "postgresql": "sql",
    "mysql": "sql",
    "maria": "sql",
    "mongo": "javascript",
    "redis": "plaintext"
  }

  const starterCode: Record<Language, string> = {
    "sql": `-- Type your query here`,
    "javascript": `// Type your query here`,
    "plaintext": `Type your query here`
  }

  // Extract the corresponding highlighting syntax from the record
  const connectionLanguage = dbTypes[connectionType];

  // Focus automatically places the user's cursor into the editor
  const onMount = (editorInstance: editor.IStandaloneCodeEditor) => {
    editorRef.current = editorInstance;
    editorRef.current.focus();
  };

  console.log('MonacoEditor component rendered!');

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
