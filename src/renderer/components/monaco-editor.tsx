import { editor } from 'monaco-editor';
import { useEffect, useRef } from 'react';
import { useConnectionViewContext } from './connection-view/connection-view-provider';
import { ConnectionDriver } from '@/common/types';

type Language = 'sql' | 'javascript' | 'plaintext';

interface MonacoEditorInputProps {
  editorRef: React.RefObject<editor.IStandaloneCodeEditor | null>;
}

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

// Use a record to establish starter code for each type of highlighting syntax
const starterCode: Record<Language, string> = {
  sql: `-- Type your query here`,
  javascript: `// Type your query here`,
  plaintext: `Type your query here`,
};

function MonacoEditor({ editorRef }: MonacoEditorInputProps) {
  // Get the current connection driver name
  const { connection } = useConnectionViewContext();
  const connectionType: ConnectionDriver = connection.connectionDriver;

  // Extract the corresponding highlighting syntax from the record
  const connectionLanguage = dbTypes[connectionType];
  
  const isMountedRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {

    if (isMountedRef.current || !containerRef.current) {
      return;
    }
    
    isMountedRef.current = true;
    
    import('monaco-editor').then(monaco => {
      if (!containerRef.current) return;
      
      // Create a model with the starter code
      const model = monaco.editor.createModel(
        starterCode[connectionLanguage],
        connectionLanguage
      );
      

      // Load the editor into the container, and store a reference to the editor
      const monacoEditor = monaco.editor.create(containerRef.current, {
        model,
        automaticLayout: true,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        lineNumbers: 'on',
        wordWrap: 'on',
        theme: 'vs-light'  
      });
      
      // Save reference to parent component
      if (editorRef) {
        editorRef.current = monacoEditor;
      }
      
      // Set the initial position of the cursor
      monacoEditor.setPosition({
        lineNumber: 1,
        column: starterCode[connectionLanguage].length + 1
      });
      monacoEditor.focus();
      
      return () => {
        model.dispose();
        monacoEditor.dispose();
        isMountedRef.current = false;
      };
    });
  }, [connectionLanguage]);

  return (
    <div 
      ref={containerRef} 
      className="h-[90vh] w-full border-0" 
      data-testid="monaco-editor-container"
    />
  );
}

export { MonacoEditor };
