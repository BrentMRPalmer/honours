import { useEffect, useState } from 'react';
import { QueryResult } from '@/common/types';
import { Button } from '@/components/ui/button';
import { QueryResultTable } from '@/components/query-result-table';
import type { ProxyConnection } from '@/lib/proxy-connection';

interface PaginatedQueryResultTableProps {
  table: string;
  connection: ProxyConnection;
}

function PaginatedQueryResultTable({
  table,
  connection,
}: PaginatedQueryResultTableProps) {
  const [tableCount, setTableCount] = useState<number>();
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    connection.getTableCount(table).then((count) => setTableCount(count));
  }, []);

  if (tableCount === undefined) return;

  const totalPages = Math.max(1, Math.ceil(tableCount / 400));

  const startIdx = (currentPage - 1) * 400 + 1;
  const endIdx = Math.min(currentPage * 400, tableCount);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className='flex h-full w-full flex-col'>
      <div className='flex-1 overflow-hidden'>
        <QueryResultTable
          query={connection.getPaginatedTableData(table, currentPage, 400)}
        />
      </div>

      <div className='border-border border-t p-2'>
        <div className='flex items-center justify-between text-sm'>
          <div>
            {tableCount > 0
              ? `Showing ${startIdx}-${endIdx} of ${tableCount} results`
              : 'No results'}
          </div>

          <div className='flex items-center gap-2'>
            <Button
              size='sm'
              variant='outline'
              disabled={currentPage === 1}
              onClick={handlePrevPage}
            >
              Previous
            </Button>

            <div className='mx-2'>
              Page {currentPage} of {totalPages}
            </div>

            <Button
              size='sm'
              variant='outline'
              disabled={currentPage >= totalPages}
              onClick={handleNextPage}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export { PaginatedQueryResultTable };
