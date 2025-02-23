import { AbstractConnection } from './abstract-connection';

abstract class AbstractSqlConnection<D, C> extends AbstractConnection<D, C> {
  abstract getTables(): Promise<string[]>;
}

export { AbstractSqlConnection };
