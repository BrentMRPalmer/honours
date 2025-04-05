import type { ConnectionConfig as MariaConnectionConfig } from 'mariadb';
import type { ConnectionConfig as PgConnectionConfig } from 'pg';


type ConnectionDriver =
  | 'sqlite'
  | 'postgresql'
  | 'mysql'
  | 'maria'
  | 'mongo'
  | 'redis';

type Connection = {
  id: string;
  name: string;
} & (
  | { driver: 'sqlite'; config: { filename: string } }
  | { driver: 'postgresql'; config: PgConnectionConfig }
  | { driver: 'mysql'; config: MariaConnectionConfig }
  | { driver: 'maria'; config: MariaConnectionConfig }
);

type QueryResult<T extends object> = {
  columns: Array<keyof T>;
  rows: T[];
};

export type { Connection, ConnectionDriver, QueryResult };
