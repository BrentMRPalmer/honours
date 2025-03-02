import type {
  Client as PostgresqlDatabase,
  ConnectionConfig as PostgresqlConnectionConfig,
} from 'pg';

import { ConnectionDrivers } from '@/shared/types';

import { AbstractSqlConnection } from './abstract-sql-connection';

class PostgresqlConnection extends AbstractSqlConnection<
  PostgresqlDatabase,
  PostgresqlConnectionConfig
> {
  get connectionDriver(): ConnectionDrivers {
    return 'postgresql';
  }

  protected async _connect() {
    return this._db.connect();
  }

  protected async _disconnect() {
    return this._db.end();
  }

  // async getTables() {
  //   const result = await this._db.query<{ tablename: string }>(
  //     "SELECT tablename FROM pg_tables WHERE schemaname = 'public';",
  //   );

  //   return result.rows.map(({ tablename }) => tablename);
  // }

  // async executeQuery(query: string): Promise<QueryResult> {
  // }
}

export { PostgresqlConnection };

export type { PostgresqlConnectionConfig };
