type ConnectionDriver =
  | 'sqlite'
  | 'postgresql'
  | 'mysql'
  | 'maria'
  | 'mongo'
  | 'redis';

// Base connection type with common properties
type BaseConnection = {
  id: string;
  name: string;
  driver: ConnectionDriver;
};

// SQLite connection configuration
type SqliteConfig = {
  filename: string;
};

// PostgreSQL connection configuration
type PostgresqlConfig = {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl?: boolean;
};

// MySQL/MariaDB connection configuration
type MySQLConfig = {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
};

// MongoDB connection configuration
type MongoConfig = {
  uri: string;
  database: string;
  username?: string;
  password?: string;
};

// Redis connection configuration
type RedisConfig = {
  host: string;
  port: number;
  password?: string;
  database?: number;
};

// Union type for all connection types
type Connection =
  | (BaseConnection & { driver: 'sqlite'; config: SqliteConfig })
  | (BaseConnection & { driver: 'postgresql'; config: PostgresqlConfig })
  | (BaseConnection & { driver: 'mysql'; config: MySQLConfig })
  | (BaseConnection & { driver: 'maria'; config: MySQLConfig })
  | (BaseConnection & { driver: 'mongo'; config: MongoConfig })
  | (BaseConnection & { driver: 'redis'; config: RedisConfig });

type QueryResult<T extends object> = {
  columns: Array<keyof T>;
  rows: T[];
};

export type {
  Connection,
  ConnectionDriver,
  QueryResult,
  BaseConnection,
  SqliteConfig,
  PostgresqlConfig,
  MySQLConfig,
  MongoConfig,
  RedisConfig,
};
