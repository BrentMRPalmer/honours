import Editor from '@monaco-editor/react';
import { editor } from 'monaco-editor';
import { useRef } from 'react';

function MonacoEditor() {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  // const [value, setValue] = useState('');

  const onMount = (editorInstance: editor.IStandaloneCodeEditor) => {
    editorRef.current = editorInstance;
    editorRef.current.focus();
  };

  console.log('MonacoEditor component rendered!');

  return (
    <Editor
      height='90vh'
      defaultLanguage='sql'
      defaultValue='-- Type your query here'
      onMount={onMount}
      // onChange={(value) => setValue(value ?? '')}
    />
  );
}

export { MonacoEditor };
