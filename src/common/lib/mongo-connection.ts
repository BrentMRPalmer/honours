import { exec } from 'child_process';

import { AbstractConnection } from '@/common/lib/abstract-connection';
import type { ConnectionDriver, QueryResult } from '@/common/types';

class MongoConnection extends AbstractConnection<string> {
  get connectionDriver(): ConnectionDriver {
    return 'mongo';
  }

  async connect(): Promise<void> {
    const command = `mongosh "${this.db}" --quiet --eval "db.runCommand({ ping: 1 })"`;
    await this.execCommandRaw(command);
  }

  async disconnect(): Promise<void> {
    return Promise.resolve();
  }

  async query<T extends object>(query: string): Promise<QueryResult<T>> {
    const escapedQuery = query.replace(/'/g, "'\\''");
    const command = `mongosh "${this.db}" --quiet --eval '${escapedQuery}'`;
    
    const output = await this.execCommandRaw(command);
    let result: { rows: T[]; columns?: Array<keyof T> };

    try {
      const parsed = JSON.parse(output);
      if (
        parsed &&
        typeof parsed === 'object' &&
        parsed.hasOwnProperty('rows')
      ) {
        result = parsed;
      } else {
        result = { rows: [parsed] as T[] };
      }
    } catch (error) {
      console.error("Error parsing MongoDB output:", error, "Raw output:", output);
      result = { rows: [] };
    }

    if (!result.columns) {
      const columnsSet = new Set<string>();
      result.rows.forEach((row) => {
        if (row && typeof row === 'object') {
          Object.keys(row).forEach((key) => columnsSet.add(key));
        } else {
          columnsSet.add('value');
        }
      });
      result.columns = Array.from(columnsSet) as Array<keyof T>;
    }

    return result as QueryResult<T>;
  }

  async getTables(): Promise<string[]> {
    const result = await this.query(
      `print(JSON.stringify(db.getCollectionNames()))`,
    );
    if (result.rows.length === 1 && Array.isArray(result.rows[0])) {
      return result.rows[0] as unknown as string[];
    }
    return result.rows as unknown as string[];
  }

  async getTableSchema(table: string): Promise<QueryResult<object>> {
    const command = `mongosh "${this.db}" --quiet --eval 'const docs = db.getCollection("${table}").find().toArray(); const fieldsSet = new Set(); docs.forEach(doc => { Object.keys(doc).forEach(key => fieldsSet.add(key)); }); print(JSON.stringify({ rows: [{ fields: Array.from(fieldsSet) }] }));'`;
    const output = await this.execCommandRaw(command);
    try {
      const result = JSON.parse(output);
      return result;
    } catch (err) {
      throw err;
    }
  }

  async getPaginatedTableData(
    tableName: string,
    page: number = 1,
    pageSize: number = 400,
  ): Promise<QueryResult<any>> {
    const offset = (page - 1) * pageSize;
    const command = `db.getCollection("${tableName}").find().skip(${offset}).limit(${pageSize}).forEach(doc => { delete doc._id; }); const result = db.getCollection("${tableName}").find().skip(${offset}).limit(${pageSize}).toArray(); print(JSON.stringify({ rows: result }));`;
    return this.query(command);
  }

  async getTableCount(tableName: string): Promise<number> {
    const command = `const count = db.getCollection("${tableName}").countDocuments(); print(JSON.stringify({ rows: [{ count }] }));`;
    const result = await this.query<{ count: number }>(command);
    return result.rows[0].count;
  }

  private execCommandRaw(query: string): Promise<string> {
    return new Promise((resolve, reject) => {
      exec(query, (error, stdout, stderr) => {
        if (error) {
          return reject(stderr || error.message);
        }
        resolve(stdout.trim());
      });
    });
  }
}

export { MongoConnection };
