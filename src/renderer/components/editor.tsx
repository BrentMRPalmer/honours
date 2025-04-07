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
            <div className='bg-secondary/20 m-4 flex h-full flex-col items-center justify-center rounded-md'>
              <div className='max-w-md px-6 py-8 text-center'>
                <div className='bg-secondary mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='24'
                    height='24'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    className='text-secondary-foreground'
                  >
                    <polyline points='9 10 4 15 9 20'></polyline>
                    <path d='M20 4v7a4 4 0 0 1-4 4H4'></path>
                  </svg>
                </div>
                <h3 className='mb-2 text-lg font-medium'>Query Results</h3>
                <p className='text-muted-foreground text-sm'>
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
