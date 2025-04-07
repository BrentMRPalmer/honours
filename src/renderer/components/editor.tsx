import { MonacoEditor } from '@/components/monaco-editor';
import { QueryResultTable } from './query-result-table';
import { Allotment } from 'allotment';
import { EditorToolbar } from './editor-toolbar';
import { useRef, useState } from 'react';
import { editor } from 'monaco-editor';
import type { QueryResult } from '@/common/types';

function EditorContainer() {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const [queryResult, setQueryResult] = useState<Promise<
    QueryResult<any>
  > | null>(null);

  return (
    <div style={{ height: '90vh' }}>
      <Allotment vertical>
        <Allotment.Pane minSize={100}>
          <EditorToolbar
            editorRef={editorRef}
            setQueryResult={setQueryResult}
          />
          <MonacoEditor editorRef={editorRef} />
        </Allotment.Pane>
        <Allotment.Pane minSize={100}>
          {queryResult ? (
            <QueryResultTable query={queryResult} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full bg-secondary/20 rounded-md m-4">
              <div className="max-w-md text-center px-6 py-8">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-secondary mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-secondary-foreground">
                    <polyline points="9 10 4 15 9 20"></polyline>
                    <path d="M20 4v7a4 4 0 0 1-4 4H4"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-2">Query Results</h3>
                <p className="text-muted-foreground text-sm">
                  Execute a query using the run button to view the results here
                </p>
              </div>
            </div>
          )}
        </Allotment.Pane>
      </Allotment>
    </div>
  );
}

export { EditorContainer };
