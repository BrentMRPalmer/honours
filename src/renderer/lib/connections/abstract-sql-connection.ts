import { AbstractConnection } from './abstract-connection';

abstract class AbstractSqlConnection<
  D extends object,
  C,
> extends AbstractConnection<D, C> {
  abstract getTables(): Promise<string[]>;
  abstract executeQuery<T>(query: string): Promise<Record<string, T>[]>;

  async getPaginatedTableData(
    tableName: string,
    page: number = 1,
    pageSize: number = 400,
  ) {
    const offset = (page - 1) * pageSize;
    return this.executeQuery(
      `SELECT * FROM ${tableName} LIMIT ${pageSize} OFFSET ${offset}`,
    );
  }

  async getTableCount(tableName: string) {
    const result = await this.executeQuery<Record<string, number>[]>(
      `SELECT COUNT(*) as count FROM ${tableName}`,
    );

    return result[0]['count'];
  }
}

export { AbstractSqlConnection };
