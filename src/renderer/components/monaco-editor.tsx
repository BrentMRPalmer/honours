import Editor from '@monaco-editor/react';
import { editor } from 'monaco-editor';
import { useEffect, useRef, useState } from 'react';
import { useConnectionViewContext } from './connection-view/connection-view-provider';
import { ConnectionDriver } from '@/common/types';

type Language = 'sql' | 'javascript' | 'plaintext';

interface MonacoEditorInputProps {
  editorRef: React.RefObject<editor.IStandaloneCodeEditor | null>;
}

const dbTypes: Record<ConnectionDriver, Language> = {
  sqlite: 'sql',
  postgresql: 'sql',
  mysql: 'sql',
  maria: 'sql',
  mongo: 'javascript',
  redis: 'plaintext',
};

const starterCode: Record<Language, string> = {
  sql: `-- Type your query here`,
  javascript: `// Type your query here`,
  plaintext: `Type your query here`,
};

function MonacoEditor({ editorRef }: MonacoEditorInputProps) {
  const { connection } = useConnectionViewContext();
  const connectionType: ConnectionDriver = connection.connectionDriver;
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
      
      const model = monaco.editor.createModel(
        starterCode[connectionLanguage],
        connectionLanguage
      );
      
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
