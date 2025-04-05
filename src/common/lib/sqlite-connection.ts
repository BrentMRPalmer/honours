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
    const statement = this.db.prepare<[], T>(query);
    const rows = statement.all();
    const columns = statement.columns().map((c) => c.column) as (keyof T)[];

    return { rows, columns };
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
