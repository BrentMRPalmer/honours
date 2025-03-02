import { use } from 'react';

interface QueryResultTableProps {
  query: Promise<Record<string, unknown>[]>;
}

function QueryResultTable({ query }: QueryResultTableProps) {
  const result = use(query);

  if (result.length === 0) {
    return <div>The table is empty</div>;
  }

  const columns = Object.keys(result[0]);

  return (
    <div className='h-full w-full overflow-auto'>
      <table className='h-max w-max border-collapse'>
        <thead>
          <tr className='bg-muted/50'>
            {columns.map((column) => (
              <th
                key={column}
                className='text-muted-foreground border-border border px-3 py-2 text-left text-sm font-medium'
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {result.map((row, rowIndex) => (
            <tr key={rowIndex} className='hover:bg-muted/50 transition-colors'>
              {Object.entries(row).map(([column, value]) => (
                <td
                  key={`${rowIndex}-${column}`}
                  className='border-border h-min max-w-80 truncate border px-3 py-2 text-sm'
                >
                  {String(value)}
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
