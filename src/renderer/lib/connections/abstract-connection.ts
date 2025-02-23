abstract class AbstractConnection<D, C> {
  protected db: D;
  protected config: C;

  constructor(config: C) {
    this.config = config;
    this.db = this.initDbDriver();
  }

  protected abstract initDbDriver(): D;

  abstract connect(): Promise<void>;

  abstract disconnect(): Promise<void>;
}

export { AbstractConnection };
