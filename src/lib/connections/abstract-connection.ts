abstract class AbstractConnection {
  abstract connect(): Promise<void>;

  abstract disconnect(): Promise<void>;
}

export { AbstractConnection };
