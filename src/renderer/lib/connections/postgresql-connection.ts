import type {
  Client as PostgresqlDatabase,
  ConnectionConfig as PostgresqlConnectionConfig,
} from 'pg';

import { ConnectionTypes } from '@/shared/types';

import { AbstractSqlConnection } from './abstract-sql-connection';

class PostgresqlConnection extends AbstractSqlConnection<
  PostgresqlDatabase,
  PostgresqlConnectionConfig
> {
  get connectionType(): ConnectionTypes {
    return 'postgresql';
  }

  protected async _connect() {
    return this.db.connect();
  }

  protected async _disconnect() {
    return this.db.end();
  }

  async getTables() {
    const result = await this.db.query<{ tablename: string }>(
      "SELECT tablename FROM pg_tables WHERE schemaname = 'public';",
    );

    return result.rows.map(({ tablename }) => tablename);
  }
}

export { PostgresqlConnection };

export type { PostgresqlConnectionConfig };
