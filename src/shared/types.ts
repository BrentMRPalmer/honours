import type { PostgresqlConnectionConfig } from '@/lib/connections/postgresql-connection';
import type { SqliteConnectionConfig } from '@/lib/connections/sqlite-connection';

type ConnectionDrivers = 'sqlite' | 'postgresql';

type Connection = {
  id: string;
  name: string;
} & (
  | { driver: 'sqlite'; config: SqliteConnectionConfig }
  | { driver: 'postgresql'; config: PostgresqlConnectionConfig }
);

export type { Connection, ConnectionDrivers };
