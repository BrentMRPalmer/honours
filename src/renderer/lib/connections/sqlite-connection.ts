import type { Database as SqliteDatabase, ISqlite } from 'sqlite';

import type { ConnectionDrivers } from '@/shared/types';

import { AbstractSqlConnection } from './abstract-sql-connection';

type SqliteConnectionConfig = Omit<ISqlite.Config, 'driver'>;

class SqliteConnection extends AbstractSqlConnection<
  SqliteDatabase,
  SqliteConnectionConfig
> {
  get connectionDriver(): ConnectionDrivers {
    return 'sqlite';
  }

  protected async _connect() {
    // Sqlite driver automatically connects to db
    return Promise.resolve();
  }

  protected async _disconnect() {
    await this._db.close();
  }

  async getTables() {
    const rows = await this._db.all<{ name: string }[]>(
      "SELECT name FROM sqlite_master WHERE type='table'",
    );

    return rows.map(({ name }) => name);
  }

  async executeQuery<T>(query: string) {
    const rows = await this._db.all<Record<string, T>[]>(query);
    return rows;
  }
}

export { SqliteConnection };

export type { SqliteConnectionConfig };
