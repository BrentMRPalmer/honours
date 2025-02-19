import { AbstractConnection } from './abstract-connection';

class SqliteConnection extends AbstractConnection {
  constructor() {
    super();
  }

  connect() {
    return Promise.resolve();
  }

  disconnect() {
    return Promise.resolve();
  }
}

export { SqliteConnection };
