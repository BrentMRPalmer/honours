import SqliteDatabase from 'better-sqlite3';
import type { IpcMainInvokeEvent as IpcEvent } from 'electron';

import type { AbstractConnection } from '@/common/lib/abstract-connection';
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
          this.openConnections.set(id, new SqliteConnection(db));
        }
        break;
    }

    return true;
  }

  async deleteConnection(_: IpcEvent, id: string) {
    return this.openConnections.delete(id);
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
