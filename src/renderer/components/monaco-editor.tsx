import Editor from '@monaco-editor/react';
import { editor } from 'monaco-editor';
import { useEffect, useRef, useState } from 'react';
import { useConnectionViewContext } from './connection-view/connection-view-provider';
import { ConnectionDriver } from '@/common/types';

type Language = 'sql' | 'javascript' | 'plaintext';

interface MonacoEditorInputProps {
  editorRef: React.RefObject<editor.IStandaloneCodeEditor | null>;
}

// Define language configurations
const dbTypes: Record<ConnectionDriver, Language> = {
  sqlite: 'sql',
  postgresql: 'sql',
  mysql: 'sql',
  maria: 'sql',
  mongo: 'javascript',
  redis: 'plaintext',
};

// Define starter code templates
const starterCode: Record<Language, string> = {
  sql: `-- Type your query here`,
  javascript: `// Type your query here`,
  plaintext: `Type your query here`,
};

// Create a stable editor wrapper component
function MonacoEditor({ editorRef }: MonacoEditorInputProps) {
  const { connection } = useConnectionViewContext();
  const connectionType: ConnectionDriver = connection.connectionDriver;
  const connectionLanguage = dbTypes[connectionType];
  
  // Use a local ref to check if editor has been mounted
  const isMountedRef = useRef(false);
  
  // Store the container div reference
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Setup the editor
  useEffect(() => {
    // Skip if already mounted or container not ready
    if (isMountedRef.current || !containerRef.current) {
      return;
    }
    
    // Set mounted flag
    isMountedRef.current = true;
    
    // Create editor directly
    import('monaco-editor').then(monaco => {
      if (!containerRef.current) return;
      
      // Create a custom editor model with the language
      const model = monaco.editor.createModel(
        starterCode[connectionLanguage],
        connectionLanguage
      );
      
      // Create editor instance with the container and model
      const monacoEditor = monaco.editor.create(containerRef.current, {
        model,
        automaticLayout: true,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        lineNumbers: 'on',
        wordWrap: 'on',
        theme: 'vs-light'  // Light theme instead of dark
      });
      
      // Save reference to parent component
      if (editorRef) {
        editorRef.current = monacoEditor;
      }
      
      // Position cursor and focus
      monacoEditor.setPosition({
        lineNumber: 1,
        column: starterCode[connectionLanguage].length + 1
      });
      monacoEditor.focus();
      
      // Cleanup function - crucial to prevent memory leaks
      return () => {
        model.dispose();
        monacoEditor.dispose();
        isMountedRef.current = false;
      };
    });
  }, [connectionLanguage]);

  // Create a stable container that won't be recreated
  return (
    <div 
      ref={containerRef} 
      className="h-[90vh] w-full border-0" 
      data-testid="monaco-editor-container"
    />
  );
}

export { MonacoEditor };
