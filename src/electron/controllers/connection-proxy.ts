import SqliteDatabase from 'better-sqlite3';
import type { IpcMainInvokeEvent as IpcEvent } from 'electron';
import MariaDB from 'mariadb';
import { Client as PostgresqlDatabase } from 'pg';

import type { AbstractConnection } from '@/common/lib/abstract-connection';
import { MysqlConnection } from '@/common/lib/mysql-connection';
import { PostgresqlConnection } from '@/common/lib/pg-connection';
import { SqliteConnection } from '@/common/lib/sqlite-connection';
import type { Connection } from '@/common/types';
import { AbstractController } from '@/controllers/abstract-controller';
import { createSqlAgent } from '@/lib/sql-agent';

class ConnectionProxy extends AbstractController {
  openConnections = new Map<string, AbstractConnection<unknown>>();

  async createConnection(_: IpcEvent, { id, driver, config }: Connection) {
    if (this.openConnections.has(id)) {
      return false;
    }
    switch (driver) {
      case 'sqlite':
        {
          const db = new SqliteDatabase(config.filename);
          const connection = new SqliteConnection(db);
          await connection.connect();

          this.openConnections.set(id, connection);
        }
        break;
      case 'postgresql':
        {
          const db = new PostgresqlDatabase(config);
          const connection = new PostgresqlConnection(db);
          await connection.connect();

          this.openConnections.set(id, connection);
        }
        break;
      case 'mysql':
      case 'maria':
        {
          const db = await MariaDB.createConnection(config);
          const connection = new MysqlConnection(db);
          await connection.connect();

          this.openConnections.set(id, connection);
        }
        break;
    }

    return true;
  }

  async deleteConnection(_: IpcEvent, id: string) {
    const connection = this.openConnections.get(id);

    if (connection) {
      await connection.disconnect();
      this.openConnections.delete(id);

      return true;
    }

    return false;
  }

  async forwardCall(
    _: IpcEvent,
    id: string,
    methodName: keyof typeof AbstractConnection.prototype,
    args: unknown[],
  ) {
    const connection = this.openConnections.get(id);

    if (!connection) {
      throw new Error(`Connection \`${id}\` is not open.`);
    }

    const method = Reflect.get(connection, methodName) as (
      ...args: unknown[]
    ) => unknown;

    return Reflect.apply(method, connection, args);
  }

  async agent(_: IpcEvent, id: string, query: string) {
    const connection = this.openConnections.get(id);

    if (!connection) {
      throw new Error(`Connection \`${id}\` is not open.`);
    }

    const a = createSqlAgent(connection);
    return (await a.chat({ message: query })).message.content;
  }
}

export { ConnectionProxy };
