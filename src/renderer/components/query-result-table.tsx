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
        // Convert the error to a standardized format that matches our table structure
        console.error('Error fetching query result:', err);
        
        // Create a result with a single column error display for MongoDB
        // This makes MongoDB errors display in the same format as SQLite
        const errorResult: QueryResult<object> = {
          rows: [{ error: err.message || 'An error occurred while fetching data' }],
          columns: ['error']
        };
        
        setResult(errorResult);
        setError(null); // We're handling errors in the table format now
      });
  }, [query]);

  if (result === undefined) {
    return <div className='p-4 text-gray-500'>Loading...</div>;
  }

  // Safety check - ensure rows is an array
  const rows = Array.isArray(result.rows) ? result.rows : [];
  const columns = result.columns || [];

  if (rows.length === 0) {
    return <div className='p-4 text-gray-500'>No data available</div>;
  }

  // Check if the entire result is an error
  const hasErrorRows = rows.some(row => 
    row && 
    typeof row === 'object' && 
    (row.key === 'error' || 
    (row.value && typeof row.value === 'string' && 
      (row.value.toString().toLowerCase().includes('error') || 
       row.value.toString().includes('failed to execute')))));


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
          {rows.map((row, rowIndex) => {
            // Error detection for all database types: 
            // - Redis/MongoDB use key-value pairs with key='error'
            // - SQLite uses a direct 'error' property
            const isErrorRow = row && 
              typeof row === 'object' && 
              (row.error !== undefined || // SQLite error format
               row.key === 'error' || // Redis/MongoDB error format
               (row.value && typeof row.value === 'string' && 
                (String(row.value).toLowerCase().includes('error') || 
                 String(row.value).includes('Failed to execute') ||
                 String(row.value).startsWith('ERR') ||
                 String(row.value).startsWith('WRONGTYPE'))));
            
            return (
              <tr key={rowIndex} className={`hover:bg-muted/50 transition-colors ${isErrorRow ? 'bg-red-50' : ''}`}>
                {columns.map((column, columnIndex) => {
                  // Detection for error cells and message cells:
                  // - For Redis/MongoDB: highlight the 'value' column when key='error'
                  // - For SQLite: highlight the 'error' column directly
                  // - For SQLite: don't truncate 'message' column
                  const isErrorCell = 
                    column === 'error' || // SQLite error column 
                    (isErrorRow && (column === 'value' || column === 'message'));
                    
                  // Don't truncate success message cells either
                  const isMessageCell = column === 'message';
                  
                  // Cell content
                  const cellContent = row && typeof row === 'object'
                    ? String(row[column] || '')
                    : String(row);
                  
                  return (
                    <td
                      key={columnIndex}
                      className={`border-border border px-3 py-2 text-sm ${
                        isErrorCell
                          ? 'bg-red-50 text-red-800 whitespace-pre-wrap break-words' 
                          : isMessageCell
                            ? 'whitespace-normal break-words'
                            : isErrorRow 
                              ? 'bg-red-50 max-w-80'
                              : 'max-w-80 truncate'
                      }`}
                    >
                      {cellContent}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export { QueryResultTable };
