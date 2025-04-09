import type { Client as PostgresqlDatabase } from 'pg';

import { AbstractConnection } from '@/common/lib/abstract-connection';
import type { ConnectionDriver } from '@/common/types';

class PostgresqlConnection extends AbstractConnection<PostgresqlDatabase> {
  get connectionDriver(): ConnectionDriver {
    return 'postgresql';
  }

  async connect() {
    await this.db.connect();
  }

  async disconnect() {
    await this.db.end();
  }

  async query<T extends object>(query: string) {
    const result = await this.db.query<T>(query);

    return {
      rows: result.rows,
      columns: result.fields.map(({ name }) => name) as (keyof T)[],
    };
  }

  async getTables() {
    const result = await this.db.query<{ tablename: string }>(
      "SELECT tablename FROM pg_tables WHERE schemaname = 'public';",
    );
    return result.rows.map(({ tablename }) => tablename);
  }

  async getTableSchema(table: string) {
    return this.query(`SELECT * FROM information_schema.columns WHERE table_name = '${table}';`);
  }
}

export { PostgresqlConnection };
