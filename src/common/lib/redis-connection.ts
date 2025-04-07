import { exec } from 'child_process';

import { AbstractConnection } from '@/common/lib/abstract-connection';
import type { ConnectionDriver, QueryResult } from '@/common/types';

class RedisConnection extends AbstractConnection<string> {
  get connectionDriver(): ConnectionDriver {
    return 'redis';
  }

  async connect(): Promise<void> {
    console.log(`Redis connection string: ${this.db}`);
    const command = `redis-cli -u "${this.db}" --raw PING`;
    console.log(`Testing Redis connection: ${command}`);

    const result = await this.execCommandRaw(command);
    if (result !== 'PONG') {
      throw new Error('Failed to connect to Redis');
    }
  }

  async disconnect(): Promise<void> {
    return Promise.resolve();
  }

  async query<T extends object>(query: string): Promise<QueryResult<T>> {
    const trimmed = query.trim();

    // If the command is a GET, wrap it in a Lua script to return both key and value.
    if (trimmed.toUpperCase().startsWith('GET ')) {
      const parts = trimmed.split(/\s+/);
      if (parts.length >= 2) {
        const key = parts[1];
        // Build a Lua script that retrieves the value and returns a JSON object.
        const luaScript = `local v = redis.call("GET", "${key}"); return cjson.encode({ key = "${key}", value = v })`;
        const command = `redis-cli -u "${this.db}" --raw EVAL '${luaScript}' 0`;
        const output = await this.execCommandRaw(command);
        try {
          const parsed = JSON.parse(output);
          return {
            rows: [parsed],
            columns: ['key', 'value'],
          } as QueryResult<T>;
        } catch (error) {
          return { rows: [], columns: ['key', 'value'] } as QueryResult<T>;
        }
      }
    }

    if (trimmed.toUpperCase().startsWith('KEYS ')) {
      const command = `redis-cli -u "${this.db}" --raw ${query}`;
      const output = await this.execCommandRaw(command);
      // Split the output by newline and filter out empty lines.
      const keys = output.split('\n').filter((key) => key.trim() !== '');
      // Map each key to an object with key and a null value (or you can adjust as needed).
      const rows = keys.map((key) => ({ key, value: null }));
      return { rows, columns: ['key', 'value'] } as QueryResult<T>;
    }

    const listingCommands = ['HGETALL', 'SCAN', 'LRANGE', 'SMEMBERS', 'ZRANGE'];
    for (const cmd of listingCommands) {
      if (trimmed.toUpperCase().startsWith(cmd)) {
        return {
          rows: [
            {
              key: 'Not implemented',
              value: `${cmd} output formatting not implemented`,
            },
          ],
          columns: ['key', 'value'],
        } as QueryResult<T>;
      }
    }

    // For all other commands, simply execute them raw.
    const command = `redis-cli -u "${this.db}" --raw ${query}`;
    const output = await this.execCommandRaw(command);
    let result: { rows: T[]; columns?: Array<keyof T> };
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(output);
      if (
        parsed &&
        typeof parsed === 'object' &&
        parsed.hasOwnProperty('rows')
      ) {
        result = parsed;
      } else {
        // Ensure we're always returning an array of objects
        result = { rows: [parsed] as T[] };
      }
    } catch (error) {
      // If not JSON, treat as plain text output
      if (output && output.trim()) {
        // For plain text, wrap in an object with result as value
        result = { rows: [{ value: output } as unknown as T] };
      } else {
        // Empty result
        result = { rows: [] };
      }
    }
    // Force columns to always be ['key', 'value'].
    result.columns = ['key', 'value'] as Array<keyof T>;
    return result as QueryResult<T>;
  }

  async getTables(): Promise<string[]> {
    // Redis doesn't have tables; return a literal.
    return ['global'];
  }

  async getTableSchema(key: string): Promise<QueryResult<object>> {
    // Hardcoded schema: always return { key: "key", value: "value" }.
    return {
      rows: [{ key: 'key', value: 'value' }],
      columns: ['key', 'value'],
    };
  }

  async getPaginatedTableData(
    tableName: string,
    page: number = 1,
    pageSize: number = 400,
  ): Promise<QueryResult<any>> {
    const offset = (page - 1) * pageSize;
    // Lua script to get all keys, sort them, and return paginated key/value pairs.
    const luaScript = `local keys = redis.call("KEYS", "*")
table.sort(keys)
local offset = tonumber(ARGV[1])
local limit = tonumber(ARGV[2])
local result = {}
for i = offset+1, math.min(offset+limit, #keys) do
  local k = keys[i]
  local v = redis.call("GET", k)
  result[#result+1] = { key = k, value = v }
end
return cjson.encode(result)`;
    const command = `redis-cli -u "${this.db}" --raw EVAL '${luaScript}' 0 ${offset} ${pageSize}`;
    const output = await this.execCommandRaw(command);
    try {
      const rows = JSON.parse(output);
      return { rows, columns: ['key', 'value'] };
    } catch (error) {
      return { rows: [], columns: ['key', 'value'] };
    }
  }

  async getTableCount(tableName: string): Promise<number> {
    const command = `redis-cli -u "${this.db}" --raw DBSIZE`;
    const output = await this.execCommandRaw(command);
    try {
      return parseInt(output, 10);
    } catch (error) {
      return 0;
    }
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

export { RedisConnection };
