export interface Connection {
  name: string;
  tables: string[];
  history: string[];
}

export interface QueryResult {
  columns: string[];
  rows: Record<string, unknown>[];
}
