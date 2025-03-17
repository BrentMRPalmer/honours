import { DropdownMenuRadioGroupDemo } from '@/components/language-selector';
import { MonacoEditor } from '@/components/monaco-editor';

import { useConnectionViewContext } from './connection-view/connection-view-provider';

function EditorContainer() {
  const { connection } = useConnectionViewContext();

  // let result = await connection.query("SELECT * FROM professors")

  return (
    <div>
      <p> {connection.connectionDriver} </p>
      {/* <QueryResultTable
        query={connection.getPaginatedTableData('professors')}
      /> */}
      <DropdownMenuRadioGroupDemo />
      <MonacoEditor />
    </div>
  );
}

export { EditorContainer };
