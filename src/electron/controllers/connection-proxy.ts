import type { IpcMainInvokeEvent as IpcEvent } from 'electron';
import { open } from 'sqlite';
import sqlite from 'sqlite3';

import { AbstractController } from '@/controllers/abstract-controller';
import type { ConnectionDrivers } from '@/shared/types';

/* eslint-disable @typescript-eslint/no-explicit-any */
class ConnectionProxy extends AbstractController {
  openConnections = new Map<string, unknown>();

  async createConnection(
    _: IpcEvent,
    id: string,
    connectionDriver: ConnectionDrivers,
    args: any,
  ) {
    if (this.openConnections.has(id)) {
      return false;
    }

    let connection: unknown;
    switch (connectionDriver) {
      case 'sqlite':
        connection = await open({ driver: sqlite.Database, ...args });
        break;
    }

    this.openConnections.set(id, connection);
    return true;
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
