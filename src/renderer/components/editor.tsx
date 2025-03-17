import { MonacoEditor } from '@/components/monaco-editor';
import { QueryResultTable } from './query-result-table';
import { Allotment } from 'allotment';
import { useConnectionViewContext } from './connection-view/connection-view-provider';
import { EditorToolbar } from './editor-toolbar';

function EditorContainer() {
  const { connection } = useConnectionViewContext();

  return (
    <div style={{ height: "90vh" }}>
      <Allotment vertical>
        <Allotment.Pane minSize={100}>
          <EditorToolbar />
          <MonacoEditor />
        </Allotment.Pane>
        <Allotment.Pane minSize={100}>
          <QueryResultTable
            query={connection.getPaginatedTableData('professors')}
          />
        </Allotment.Pane>
      </Allotment>
    </div>

    

  );
}

export { EditorContainer };
