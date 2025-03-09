import { AbstractConnection } from '@/common/lib/abstract-connection';
import type { Connection, QueryResult } from '@/common/types';

class ProxyConnection extends AbstractConnection<undefined> {
  #connection: Connection;

  constructor(connection: Connection) {
    super(undefined);
    this.#connection = connection;
  }

  get id() {
    return this.#connection.id;
  }

  get name() {
    return this.#connection.name;
  }

  get connectionDriver() {
    return this.#connection.driver;
  }

  async connect() {
    await window.ConnectionProxy.createConnection(this.#connection);
  }

  async disconnect() {
    await window.ConnectionProxy.deleteConnection(this.#connection.id);
  }

  async query<T extends object>(query: string) {
    return (await window.ConnectionProxy.forwardCall(
      this.#connection.id,
      'query',
      [query],
    )) as QueryResult<T>;
  }

  async getTables() {
    return (await window.ConnectionProxy.forwardCall(
      this.#connection.id,
      'getTables',
      [],
    )) as string[];
  }

  async getTableSchema(table: string) {
    return (await window.ConnectionProxy.forwardCall(
      this.#connection.id,
      'getTableSchema',
      [table],
    )) as QueryResult<object>;
  }
}

export { ProxyConnection };
