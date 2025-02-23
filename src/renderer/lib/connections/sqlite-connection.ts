import type { Database as SqliteDatabase } from 'sqlite3';

import { AbstractSqlConnection } from './abstract-sql-connection';

interface SqliteConnectionConfig {
  file: string;
}

class SqliteConnection extends AbstractSqlConnection<
  SqliteDatabase,
  SqliteConnectionConfig
> {
  protected initDbDriver() {
    return window.sqlite.connect(this.config.file);
  }

  async connect() {
    // Sqlite driver automatically connects to db
    return Promise.resolve();
  }

  async disconnect() {
    return new Promise<void>((resolve, reject) => {
      this.db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  async getTables() {
    return new Promise<string[]>((resolve, reject) => {
      this.db.all<{ name: string }>(
        "SELECT name FROM sqlite_master WHERE type='table'",
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows.map(({ name }) => name));
        },
      );
    });
  }
}

export { SqliteConnection };

export type { SqliteConnectionConfig };
