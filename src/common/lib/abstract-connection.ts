import type { ConnectionDriver, QueryResult } from '@/common/types';

abstract class AbstractConnection<D> {
  db: D;

  constructor(db: D) {
    this.db = db;
  }

  abstract get connectionDriver(): ConnectionDriver;

  abstract connect(): Promise<void>;

  abstract disconnect(): Promise<void>;

  abstract query<T extends object>(query: string): Promise<QueryResult<T>>;

  abstract getTables(): Promise<string[]>;

  abstract getTableSchema(table: string): Promise<QueryResult<object>>;

  async getPaginatedTableData(
    tableName: string,
    page: number = 1,
    pageSize: number = 400,
  ) {
    const offset = (page - 1) * pageSize;
    return this.query(
      `SELECT * FROM ${tableName} LIMIT ${pageSize} OFFSET ${offset}`,
    );
  }

  async getTableCount(tableName: string) {
    const result = await this.query<{ count: number }>(
      `SELECT COUNT(*) as count FROM ${tableName}`,
    );

    return result.rows[0]['count'];
  }
}

export { AbstractConnection };
