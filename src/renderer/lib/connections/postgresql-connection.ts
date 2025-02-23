import type { ConnectionConfig as PostgresqlConnectionConfig } from 'pg';
import { Client as PostgresqlDatabase } from 'pg';

import { AbstractSqlConnection } from './abstract-sql-connection';

class PostgresqlConnection extends AbstractSqlConnection<
  PostgresqlDatabase,
  PostgresqlConnectionConfig
> {
  protected initDbDriver() {
    return new PostgresqlDatabase({
      database: 'postgres',
      user: 'postgres',
      password: 'mysecretpassword',
      host: 'localhost',
      port: 5432,
    });
  }

  async connect() {
    return this.db.connect();
  }

  async disconnect() {
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
