import type { Database as SqliteDatabase, ISqlite } from 'sqlite';

import type { ConnectionTypes } from '@/shared/types';

import { AbstractSqlConnection } from './abstract-sql-connection';

interface SqliteConnectionConfig {
  file: string;
}

class SqliteConnection extends AbstractSqlConnection<
  SqliteDatabase,
  Omit<ISqlite.Config, 'driver'>
> {
  get connectionType(): ConnectionTypes {
    return 'sqlite';
  }

  protected async _connect() {
    // Sqlite driver automatically connects to db
    return Promise.resolve();
  }

  protected async _disconnect() {
    await this.db.close();
  }

  async getTables() {
    const rows = await this.db.all<{ name: string }[]>(
      "SELECT name FROM sqlite_master WHERE type='table'",
    );

    return rows.map(({ name }) => name);
  }
}

export { SqliteConnection };

export type { SqliteConnectionConfig };
