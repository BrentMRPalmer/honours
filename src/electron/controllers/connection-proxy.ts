import type { IpcMainInvokeEvent as IpcEvent } from 'electron';
import pg from 'pg';
import { open } from 'sqlite';
import sqlite from 'sqlite3';
import { v4 as uuidv4 } from 'uuid';

import type { ConnectionTypes } from '@/shared/types';

/* eslint-disable @typescript-eslint/no-explicit-any */
class ConnectionProxy {
  openConnections = new Map<string, unknown>();

  async createConnection(
    _: IpcEvent,
    connectionType: ConnectionTypes,
    args: any,
  ) {
    let connection: unknown;

    switch (connectionType) {
      case 'sqlite':
        connection = await open({ driver: sqlite.Database, ...args });
        break;
      case 'postgresql':
        connection = new pg.Client(args);
        break;
    }

    const id = uuidv4();
    this.openConnections.set(id, connection);
    return id;
  }

  async deleteConnection(_: IpcEvent, id: string) {
    return this.openConnections.delete(id);
  }

  async forwardCall(
    _: IpcEvent,
    id: string,
    methodName: string,
    ...args: any[]
  ) {
    const connection = this.openConnections.get(id);
    if (!connection) {
      throw new Error(`Connection \`${id}\` does not exist or was closed.`);
    }

    const method = Reflect.get(connection, methodName);
    return Reflect.apply(method, connection, args);
  }
}

export { ConnectionProxy };

export type { ConnectionTypes };
