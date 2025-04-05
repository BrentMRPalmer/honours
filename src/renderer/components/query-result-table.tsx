import { useEffect, useState } from 'react';

import { QueryResult } from '@/common/types';

interface QueryResultTableProps {
  query: Promise<QueryResult<object>>;
}

function QueryResultTable({ query }: QueryResultTableProps) {
  const [result, setResult] = useState<QueryResult<object> | undefined>();

  useEffect(() => {
    query.then((r) => setResult(r));
  });

  if (result === undefined) return;

  return (
    <div className='h-full w-full overflow-auto'>
      <table className='h-max w-max border-collapse'>
        <thead>
          <tr className='bg-muted/50'>
            {result.columns.map((column, columnIndex) => (
              <th
                key={columnIndex}
                className='text-muted-foreground border-border border px-3 py-2 text-left text-sm font-medium'
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {result.rows.map((row, rowIndex) => (
            <tr key={rowIndex} className='hover:bg-muted/50 transition-colors'>
              {result.columns.map((column, columnIndex) => (
                <td
                  key={columnIndex}
                  className='border-border h-min max-w-80 truncate border px-3 py-2 text-sm'
                >
                  {String(row[column])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export { QueryResultTable };
