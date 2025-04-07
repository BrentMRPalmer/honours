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
    const isWindows = process.platform === 'win32';
    
    let command;
    if (isWindows) {
      // For Windows: Use double quotes and escape double quotes in the query
      const escapedQuery = query.replace(/"/g, '\\"');
      command = `mongosh "${this.db}" --quiet --eval "${escapedQuery}"`;
    } else {
      // For Unix/Mac: Use single quotes and escape single quotes in the query
      const escapedQuery = query.replace(/'/g, "'\\''");
      command = `mongosh "${this.db}" --quiet --eval '${escapedQuery}'`;
    }
    
    const output = await this.execCommandRaw(command);
    let result: { rows: T[]; columns?: Array<keyof T> };
    if (!output || output.trim() === '') {
      console.log("Empty MongoDB output");
      result = { rows: [], columns: [] as Array<keyof T> };
    } else {
      try {
        const parsedOutput = this.parseMongoOutput(output);
        if (parsedOutput && typeof parsedOutput === 'object' && parsedOutput.rows) {
          // Object with rows property - use directly
          result = parsedOutput;
        } else if (Array.isArray(parsedOutput)) {
          // Array - create rows wrapper
          result = { rows: parsedOutput as T[] };
        } else {
          result = { rows: [parsedOutput] as T[] };
        }
      } catch (err) {
        console.error("MongoDB output parsing error:", err.message);
        console.log("Raw output:", output);
        result = { rows: [], columns: [] as Array<keyof T> };
      }
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
      const result = this.parseMongoOutput(output);
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
  
  private parseMongoOutput<T>(output: string): T {
    try {
      // First attempt: direct JSON parsing
      return JSON.parse(output);
    } catch (jsonError) {
      try {
        // Convert JavaScript notation to valid JSON by evaluating it in a controlled way
        // Use Function constructor to create a safe evaluation environment
        // This approach handles unquoted keys, single quotes, and ObjectId references
        const safeEval = new Function(
          'ObjectId', 
          `const result = ${output}; return JSON.stringify(result);`
        );
        
        // Execute with a simple ObjectId replacement function
        const jsonString = safeEval(id => id);
        return JSON.parse(jsonString);
      } catch (evalError) {
        console.error("Failed to parse MongoDB output with all methods:", evalError);
        throw new Error(`Could not parse MongoDB output: ${output}`);
      }
    }
  }
}

export { MongoConnection };
