import type { ConnectionTypes } from '@/shared/types';

abstract class AbstractConnection<D, C> {
  private id?: string;
  protected config: C;
  protected db: D;
  abstract readonly connectionType: ConnectionTypes;

  constructor(config: C) {
    this.id = undefined;
    this.config = config;
    this.db = new Proxy<this>(this, {
      get(target, property: string) {
        return (...args: unknown[]) => {
          return window.ConnectionProxy.forwardCall(
            target.id as string,
            property,
            ...args,
          );
        };
      },
    }) as unknown as D;

    return new Proxy<this>(this, {
      get(target, p, receiver) {
        const property = Reflect.get(target, p, receiver);
        const isFunction = typeof property === 'function';

        if (
          target.id === undefined &&
          isFunction &&
          p !== 'createProxiedConnection'
        ) {
          throw new Error(
            'Proxy connection not established. Call `createProxiedConnection` to set it up.',
          );
        }

        return property;
      },
    });
  }

  async createProxiedConnection() {
    this.id = await window.ConnectionProxy.createConnection(
      this.connectionType,
      this.config,
    );
    await this._connect();
  }

  async deleteProxiedConnection() {
    if (this.id === undefined) {
      return;
    }

    await this._disconnect();
    await window.ConnectionProxy.deleteConnection(this.id);
    this.id = undefined;
  }

  protected abstract _connect(): Promise<void>;

  protected abstract _disconnect(): Promise<void>;
}

export { AbstractConnection };
