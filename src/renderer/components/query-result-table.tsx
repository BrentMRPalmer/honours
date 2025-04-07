import { useEffect, useState } from 'react';

import { QueryResult } from '@/common/types';

interface QueryResultTableProps {
  query: Promise<QueryResult<object>>;
}

function QueryResultTable({ query }: QueryResultTableProps) {
  const [result, setResult] = useState<QueryResult<object> | undefined>();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    query
      .then((r) => {
        // Add a safety check to ensure rows is always an array
        if (!r.rows || !Array.isArray(r.rows)) {
          console.error('Invalid result format. Rows is not an array:', r);
          r.rows = r.rows ? [r.rows] : [];
        }
        setResult(r);
        setError(null);
      })
      .catch((err) => {
        console.error('Error fetching query result:', err);
        setError(err.message || 'An error occurred while fetching data');
      });
  }, [query]);

  if (error) {
    return <div className='p-4 text-red-600'>Error: {error}</div>;
  }

  if (result === undefined) {
    return <div className='p-4 text-gray-500'>Loading...</div>;
  }

  // Safety check - ensure rows is an array
  const rows = Array.isArray(result.rows) ? result.rows : [];
  const columns = result.columns || [];

  if (rows.length === 0) {
    return <div className='p-4 text-gray-500'>No data available</div>;
  }

  return (
    <div className='h-full w-full overflow-auto'>
      <table className='h-max w-max border-collapse'>
        <thead>
          <tr className='bg-muted/50'>
            {columns.map((column, columnIndex) => (
              <th
                key={columnIndex}
                className='text-muted-foreground border-border border px-3 py-2 text-left text-sm font-medium'
              >
                {String(column)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className='hover:bg-muted/50 transition-colors'>
              {columns.map((column, columnIndex) => (
                <td
                  key={columnIndex}
                  className='border-border h-min max-w-80 truncate border px-3 py-2 text-sm'
                >
                  {row && typeof row === 'object'
                    ? String(row[column] || '')
                    : String(row)}
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
