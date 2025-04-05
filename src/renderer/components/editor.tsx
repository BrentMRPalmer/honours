import { MonacoEditor } from '@/components/monaco-editor';
import { QueryResultTable } from './query-result-table';
import { Allotment } from 'allotment';
import { EditorToolbar } from './editor-toolbar';
import { useRef, useState } from 'react';
import { editor } from 'monaco-editor';
import type { QueryResult } from '@/common/types';

function EditorContainer() {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const [queryResult, setQueryResult] = useState<Promise<QueryResult<any>> | null>(null);

  return (
    <div style={{ height: '90vh' }}>
      <Allotment vertical>
        <Allotment.Pane minSize={100}>
          <EditorToolbar editorRef={editorRef} setQueryResult={setQueryResult}/>
          <MonacoEditor editorRef={editorRef} />
        </Allotment.Pane>
        <Allotment.Pane minSize={100}>
          {queryResult ? 
            <QueryResultTable query={queryResult}/> : 
            <p>Click the run button to see the query output here.</p>}
        </Allotment.Pane>
      </Allotment>
    </div>
  );
}

export { EditorContainer };
