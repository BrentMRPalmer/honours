import type { Connection as MariaDatabase } from 'mariadb';

import { AbstractConnection } from '@/common/lib/abstract-connection';
import type { ConnectionDriver } from '@/common/types';

class MysqlConnection extends AbstractConnection<MariaDatabase> {
  get connectionDriver(): ConnectionDriver {
    return 'mysql';
  }

  async connect() {
    // Connection is opened when creating connection object
    return Promise.resolve();
  }

  async disconnect() {
    await this.db.destroy();
  }

  async query<T extends object>(query: string) {
    const result = await this.db.query<T[]>(query);
    return { rows: result, columns: (result as any).meta.map((col: any) => col.name()) };
  }

  async getTables() {
    const statement = await this.db.query('SHOW TABLES;');

    return statement.map((row: object) => Object.values(row)[0]);
  }

  async getTableSchema(table: string) {
    return this.query(`DESCRIBE (${table});`);
  }
}

export { MysqlConnection };
