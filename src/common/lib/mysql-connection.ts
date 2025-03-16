import type { Connection as MariaDatabase } from 'mariadb';

import { AbstractConnection } from '@/common/lib/abstract-connection';
import type { ConnectionDriver } from '@/common/types';

class MysqlConnection extends AbstractConnection<MariaDatabase> {
  get connectionDriver(): ConnectionDriver {
    return 'postgresql';
  }

  async connect() {
    // Connection is opened when creating connection object
    return Promise.resolve();
  }

  async disconnect() {
    await this.db.destroy();
  }

  async query<T extends object>(query: string) {
    const statement = this.db.query<T[]>(query);
    const rows = statement.all();
    const columns = statement.columns().map((c) => c.column) as (keyof T)[];

    return { rows, columns };
  }

  async getTables() {
    const statement = this.db.query('SHOW TABLES;');

    return statement.all().map(({ name }) => name);
  }

  async getTableSchema(table: string) {
    return this.query(`pragma table_info(${table});`);
  }
}

export { MysqlConnection };
