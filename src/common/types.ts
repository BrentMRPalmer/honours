type ConnectionDriver = 'sqlite' | 'postgresql';

type Connection = {
  id: string;
  name: string;
} & { driver: 'sqlite'; config: { filename: string } };

type QueryResult<T extends object> = {
  columns: Array<keyof T>;
  rows: T[];
};

export type { Connection, ConnectionDriver, QueryResult };
