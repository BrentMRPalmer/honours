import { editor } from 'monaco-editor';
import { useEffect, useRef } from 'react';
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
  mongo: 'plaintext', // Using plaintext instead of javascript to avoid worker errors
  redis: 'plaintext',
};

const starterCode: Record<Language, string> = {
  sql: `-- Type your query here`,
  javascript: `// Type your query here`,
  plaintext: `// Type your query here`, 
};

function MonacoEditor({ editorRef }: MonacoEditorInputProps) {
  const { connection } = useConnectionViewContext();
  const connectionType: ConnectionDriver = connection.connectionDriver;
  const connectionLanguage = dbTypes[connectionType];
  
  // Use a local ref to check if editor has been mounted
  const isMountedRef = useRef(false);
  // Use a ref to store the container for the editor
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Skip if already mounted or container not ready
    if (isMountedRef.current || !containerRef.current) {
      return;
    }
    isMountedRef.current = true;
    
    import('monaco-editor').then(monaco => {
      if (!containerRef.current) return;
      
      // For MongoDB, create custom syntax highlighting for plaintext mode
      if (connectionType === 'mongo') {
        // This is a simple solution that gives JavaScript-like syntax highlighting
        // without causing worker errors
        monaco.editor.defineTheme('mongo-js-theme', {
          base: 'vs',
          inherit: true,
          rules: [
            { token: 'comment', foreground: '008800' },
            { token: 'keyword', foreground: '0000ff' },
            { token: 'string', foreground: 'a31515' },
            { token: 'number', foreground: '098658' },
          ],
          colors: {}
        });
        
        // Register syntax highlighting for plaintext mode that resembles JavaScript
        monaco.languages.register({ id: 'mongodb-js' });
        monaco.languages.setMonarchTokensProvider('mongodb-js', {
          defaultToken: '',
          tokenPostfix: '',
          keywords: [
            'db', 'find', 'aggregate', 'insertOne', 'insertMany',
            'updateOne', 'updateMany', 'deleteOne', 'deleteMany', 
            'function', 'var', 'let', 'const', 'if', 'else'
          ],
          
          // Regular expressions
          symbols: /[=><!~?:&|+\-*\/\^%]+/,
          escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,
          
          // The main tokenizer for our languages
          tokenizer: {
            root: [
              // Comments
              [/\/\/.*$/, 'comment'],
              [/\/\*/, { token: 'comment.quote', next: '@comment' }],
              
              // Strings
              [/"([^"\\]|\\.)*$/, 'string.invalid'],
              [/'([^'\\]|\\.)*$/, 'string.invalid'],
              [/"/, { token: 'string.quote', next: '@string_double' }],
              [/'/, { token: 'string.quote', next: '@string_single' }],
              
              // Numbers
              [/\d*\.\d+([eE][\-+]?\d+)?/, 'number.float'],
              [/0[xX][0-9a-fA-F]+/, 'number.hex'],
              [/\d+/, 'number'],
              
              // Keywords
              [/[a-zA-Z_]\w*/, { 
                cases: { 
                  '@keywords': 'keyword',
                  '@default': 'identifier' 
                }
              }],
            ],
            
            comment: [
              [/[^/*]+/, 'comment'],
              [/\*\//, { token: 'comment.quote', next: '@pop' }],
              [/[/*]/, 'comment']
            ],
            
            string_double: [
              [/[^\\"]+/, 'string'],
              [/\\./, 'string.escape'],
              [/"/, { token: 'string.quote', next: '@pop' }]
            ],
            
            string_single: [
              [/[^\\']+/, 'string'],
              [/\\./, 'string.escape'],
              [/'/, { token: 'string.quote', next: '@pop' }]
            ],
          }
        });
      }
      
      // Create a model with the starter code
      // For MongoDB, use our custom language
      const model = monaco.editor.createModel(
        starterCode[connectionLanguage],
        connectionType === 'mongo' ? 'mongodb-js' : connectionLanguage
      );
      
      // Create editor with options
      const monacoEditor = monaco.editor.create(containerRef.current, {
        model,
        automaticLayout: true,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        lineNumbers: 'on',
        wordWrap: 'on',
        theme: connectionType === 'mongo' ? 'mongo-js-theme' : 'vs'
      });
      
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
  }, [connectionLanguage, connectionType]);

  return (
    <div 
      ref={containerRef} 
      className="h-[90vh] w-full border-0" 
      data-testid="monaco-editor-container"
    />
  );
}

export { MonacoEditor };
