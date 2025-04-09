import type { Database } from 'better-sqlite3';

import { AbstractConnection } from '@/common/lib/abstract-connection';
import type { ConnectionDriver } from '@/common/types';

class SqliteConnection extends AbstractConnection<Database> {
  get connectionDriver(): ConnectionDriver {
    return 'sqlite';
  }

  async connect() {
    // Sqlite driver is sync
    return Promise.resolve();
  }

  async disconnect() {
    this.db.close();
  }

  async query<T extends object>(query: string) {
    try {
      // Detect if this is a read query (SELECT, PRAGMA, etc.) or a write query (INSERT, UPDATE, etc.)
      const isReadQuery = /^\s*(SELECT|PRAGMA|EXPLAIN|WITH)\s/i.test(query);
      
      if (isReadQuery) {
        // For SELECT and similar queries
        const statement = this.db.prepare<[], T>(query);
        const rows = statement.all();
        const columns = statement.columns().map((c) => c.column) as (keyof T)[];
        return { rows, columns };
      } else {
        // For INSERT, CREATE, UPDATE, DELETE, etc.
        const statement = this.db.prepare(query);
        const result = statement.run();
        
        // Determine which information to show based on the query type
        const isInsert = /^\s*(INSERT)\s/i.test(query);
        
        if (isInsert && result.lastInsertRowid) {
          // For INSERT operations with lastInsertRowid
          return { 
            rows: [{ 
              changes: result.changes,
              lastInsertRowid: result.lastInsertRowid 
            } as unknown as T], 
            columns: ['changes', 'lastInsertRowid'] as Array<keyof T>
          };
        } else {
          // For other write operations (CREATE, UPDATE, DELETE)
          return { 
            rows: [{ 
              changes: result.changes,
              message: `Operation completed successfully (${result.changes} ${result.changes === 1 ? 'row' : 'rows'} affected)`
            } as unknown as T], 
            columns: ['changes', 'message'] as Array<keyof T>
          };
        }
      }
    } catch (error) {
      // Return SQL errors in a standard format
      console.error("SQLite query error:", error);
      return {
        rows: [{ error: error.message } as unknown as T],
        columns: ['error'] as Array<keyof T>
      };
    }
  }

  async getTables() {
    const statement = this.db.prepare<[], { name: string }>(
      "SELECT name FROM sqlite_master WHERE type='table'",
    );

    return statement.all().map(({ name }) => name);
  }

  async getTableSchema(table: string) {
    return this.query(`pragma table_info(${table});`);
  }
}

export { SqliteConnection };
