import type { Connection as MariaDatabase } from 'mariadb';

import { AbstractConnection } from '@/common/lib/abstract-connection';
import type { ConnectionDriver } from '@/common/types';

class MysqlConnection extends AbstractConnection<MariaDatabase> {
  get connectionDriver(): ConnectionDriver {
    return 'mysql';
  }

  async connect() {
    await this.db.ping();
  }

  async disconnect() {
    await this.db.destroy();
  }

  async query<T extends object>(query: string) {
    try {
      // Detect if this is a read query (SELECT, PRAGMA, etc.) or a write query (INSERT, UPDATE, etc.)
      const isReadQuery = /^\s*(SELECT|PRAGMA|EXPLAIN|WITH)\s/i.test(query);

      if (isReadQuery) {
        const result = await this.db.query<T[]>(query);
        return {
          rows: result,
          columns: (result as any).meta.map((col: any) => col.name()),
        };
      } else {
        // For INSERT, CREATE, UPDATE, DELETE, etc.
        const result = await this.db.query<T[]>(query);

        return {
          rows: [
            {
              affectedRows: result.affectedRows,
              insertId: result.insertId,
              warningStatus: result.warningStatus,
            } as unknown as T,
          ],
          columns: ['affectedRows', 'insertId', 'warningStatus'] as Array<
            keyof T
          >,
        };
      }
    } catch (error) {
      // Return SQL errors in a standard format
      console.error('SQLite query error:', error);
      return {
        rows: [{ error: error.message } as unknown as T],
        columns: ['error'] as Array<keyof T>,
      };
    }
  }

  async getTables() {
    const statement = await this.db.query('SHOW TABLES;');

    return statement.map((row: object) => Object.values(row)[0]);
  }

  async getTableSchema(table: string) {
    return this.query(`DESCRIBE (${table});`);
  }
}

export { MysqlConnection };
