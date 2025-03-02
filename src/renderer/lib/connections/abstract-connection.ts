import type { ConnectionDrivers } from '@/shared/types';

abstract class AbstractConnection<D extends object, C> {
  id: string;
  name: string;

  protected _connectionOpen: boolean = false;
  protected _config: C;
  protected _db: D;
  abstract readonly connectionDriver: ConnectionDrivers;

  constructor(id: string, name: string, config: C) {
    this.id = id;
    this.name = name;

    this._config = config;
    this._db = new Proxy({} as D, {
      get(_, property: string) {
        return window.ConnectionProxy.forwardCall.bind(undefined, id, property);
      },
    });

    return new Proxy<this>(this, {
      get(target, property, receiver) {
        const member = Reflect.get(target, property, receiver);
        const isFunction = typeof member === 'function';

        if (
          property !== 'createProxiedConnection' &&
          !target._connectionOpen &&
          isFunction
        ) {
          throw new Error(
            'Proxy connection not established. Call `createProxiedConnection` to set it up.',
          );
        }

        return member;
      },
    });
  }

  async createProxiedConnection() {
    if (this._connectionOpen) {
      return;
    }

    await window.ConnectionProxy.createConnection(
      this.id,
      this.connectionDriver,
      this._config,
    );
    this._connectionOpen = true;

    await this._connect();
  }

  async deleteProxiedConnection() {
    if (!this._connectionOpen) {
      return;
    }

    await this._disconnect();

    await window.ConnectionProxy.deleteConnection(this.id);
    this._connectionOpen = false;
  }

  protected abstract _connect(): Promise<void>;

  protected abstract _disconnect(): Promise<void>;
}

export { AbstractConnection };
