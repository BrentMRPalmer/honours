import { exec } from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

import { AbstractConnection } from '@/common/lib/abstract-connection';
import type { ConnectionDriver, QueryResult } from '@/common/types';

// We're now using the Lua script approach for all commands

// Helper function to build platform-specific Redis commands (legacy)
const buildRedisCommand = (
  connectionUri: string,
  command: string,
  isLuaScript: boolean = false
): string => {
  const isWindows = process.platform === 'win32';
  
  if (isLuaScript) {
    if (isWindows) {
      // Windows: Use double quotes and escape internal double quotes
      const escapedScript = command.replace(/"/g, '\\"');
      return `redis-cli -u "${connectionUri}" --raw EVAL "${escapedScript}"`;
    } else {
      // Unix/Mac: Use single quotes
      return `redis-cli -u "${connectionUri}" --raw EVAL '${command}'`;
    }
  } else {
    // Handle regular Redis commands
    if (isWindows) {
      // On Windows, don't wrap the command in quotes to avoid syntax errors
      // Just escape any quotes in the command but keep the command arguments separate
      const escapedCommand = command.replace(/"/g, '\\"');
      return `redis-cli -u "${connectionUri}" --raw ${escapedCommand}`;
    } else {
      // Unix/Mac: No special handling needed
      return `redis-cli -u "${connectionUri}" --raw ${command}`;
    }
  }
};

// Helper function to safely execute Redis EVAL commands on any platform
const execRedisEval = (
  connectionUri: string, 
  luaScript: string, 
  ...args: (string | number)[]
): Promise<string> => {
  // We'll write the script to a file as is - no need to flatten it
  // This preserves proper script formatting and line numbers for error messages
  
  return new Promise((resolve, reject) => {
    try {
      // Write to file approach - more reliable across platforms
      // Use path.join for proper cross-platform path handling
      const tempFile = path.join(os.tmpdir(), `redis-lua-${Date.now()}.lua`);
      fs.writeFileSync(tempFile, luaScript, 'utf8');
      
      // Build command - explicitly load script from file
      // Construct the command differently based on platform
      let command;
      if (process.platform === 'win32') {
        // On Windows, we pass arguments differently
        command = `redis-cli -u "${connectionUri}" --raw --eval ${tempFile} 0`;
        // Add each argument individually to avoid space parsing issues
        if (args.length > 0) {
          command += ' ' + args.map(arg => `"${arg}"`).join(' ');
        }
      } else {
        // On Mac/Unix, this works fine
        command = `redis-cli -u "${connectionUri}" --raw --eval ${tempFile} 0`;
        if (args.length > 0) {
          command += ' ' + args.join(' ');
        }
      }
      
      console.log('Executing Redis command:', command);
      
      // Use exec which is more consistent across platforms
      exec(command, (error, stdout, stderr) => {
        // Create a helper to run with a delay to avoid race conditions
        const safelyDeleteFile = () => {
          // Use setTimeout to ensure the file is fully released before deletion
          setTimeout(() => {
            try {
              if (fs.existsSync(tempFile)) {
                fs.unlinkSync(tempFile);
              }
            } catch (e) {
              // Just log the error but don't impact the result
              console.warn('Failed to delete temporary Lua script file:', e);
            }
          }, 100); // Small delay to avoid race conditions
        };
        
        if (error) {
          // Real error occurred
          safelyDeleteFile();
          return reject(stderr || error.message);
        }
        
        // Handle redis-cli password warnings (not actual errors)
        if (stderr && stderr.trim() && !stderr.includes("Warning: Using a password")) {
          // Only reject if it's a real error, not the password warning
          safelyDeleteFile();
          return reject(new Error(stderr.trim()));
        }
        
        // Success case
        safelyDeleteFile();
        resolve(stdout.trim());
      });
    } catch (error) {
      reject(error);
    }
  });
};

class RedisConnection extends AbstractConnection<string> {
  get connectionDriver(): ConnectionDriver {
    return 'redis';
  }

  async connect(): Promise<void> {
    console.log(`Redis connection string: ${this.db}`);
    
    try {
      // Use the Lua script approach for the PING command
      const luaScript = `return redis.call("PING")`;
      console.log("PING as Lua script:", luaScript);
      
      const result = await execRedisEval(this.db, luaScript);
      console.log(`Redis PING result: ${result}`);
      
      if (result !== 'PONG') {
        throw new Error('Failed to connect to Redis');
      }
    } catch (error) {
      console.error("Redis connection error:", error);
      throw new Error(`Failed to connect to Redis: ${error.message}`);
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
        const luaScript = `
local v = redis.call("GET", "${key}")
return cjson.encode({ key = "${key}", value = v })
`;
        
        let output;
        
        try {
          // Use our cross-platform Redis EVAL helper
          output = await execRedisEval(this.db, luaScript);
          
          // Check for Redis error messages
          if (output.startsWith('ERR') || output.startsWith('WRONGTYPE')) {
            console.error("Redis error:", output);
            return { 
              rows: [{ key: 'error', value: output } as unknown as T],
              columns: ['key', 'value'],
            } as QueryResult<T>;
          }
        } catch (error) {
          console.error("Redis EVAL error:", error);
          // If this is not the password warning, treat as a real error
          if (!error.message?.includes("Warning: Using a password")) {
            return { 
              rows: [{ key: 'error', value: `Redis error: ${error.message}` } as unknown as T],
              columns: ['key', 'value'],
            } as QueryResult<T>;
          }
          // Otherwise continue with empty output
          output = "";
        }
        
        // Handle empty output case
        if (!output || output.trim() === "") {
          return { 
            rows: [], 
            columns: ['key', 'value'] 
          } as QueryResult<T>;
        }
        
        try {
          // Clean the output string to handle potential Windows line ending issues
          const cleanedOutput = output.trim().replace(/\r/g, '');
          const parsed = JSON.parse(cleanedOutput);
          
          return {
            rows: [parsed],
            columns: ['key', 'value'],
          } as QueryResult<T>;
        } catch (jsonError) {
          console.error("Error parsing Redis GET JSON response:", jsonError);
          return { 
            rows: [{ key: 'error', value: `Failed to parse response: ${output}` } as unknown as T],
            columns: ['key', 'value'] 
          } as QueryResult<T>;
        }
      }
    }

    if (trimmed.toUpperCase().startsWith('KEYS ')) {
      // Extract the pattern from the KEYS command
      const pattern = trimmed.substring(5).trim();
      
      // Build a Lua script that executes KEYS and returns the result
      const luaScript = `return redis.call("KEYS", "${pattern.replace(/"/g, '\\"')}")`;
      console.log("KEYS as Lua script:", luaScript);
      
      // Execute using the proven eval approach
      const output = await execRedisEval(this.db, luaScript);
      
      // Process the output - it will be a JSON array from Lua
      try {
        // Clean and parse the output
        const cleanedOutput = output.trim().replace(/\r/g, '');
        const keys = JSON.parse(cleanedOutput);
        
        // Map each key to an object with key and a null value
        const rows = keys.map((key) => ({ key, value: null }));
        return { rows, columns: ['key', 'value'] } as QueryResult<T>;
      } catch (error) {
        console.error("Error parsing KEYS response:", error);
        // If parsing fails, use the old approach as fallback
        const keys = output.split(/\r?\n/).filter((key) => key.trim() !== '');
        const rows = keys.map((key) => ({ key, value: null }));
        return { rows, columns: ['key', 'value'] } as QueryResult<T>;
      }
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

    // For all other commands, convert to Lua script and use the working eval approach
    // Parse the command to get the command name and arguments
    const parts = trimmed.split(/\s+/);
    const command = parts[0];
    const args = parts.slice(1);
    
    // Build a Lua script that executes the command and returns the result
    const luaScript = `return redis.call("${command.toUpperCase()}"${args.length > 0 ? ', ' : ''}${args.map(arg => `"${arg.replace(/"/g, '\\"')}"`).join(', ')})`;
    console.log("Command as Lua script:", luaScript);
    
    // Execute using the proven eval approach
    const output = await execRedisEval(this.db, luaScript);
    let result: { rows: T[]; columns?: Array<keyof T> };
    try {
      // Clean the output string to handle potential Windows line ending issues
      const cleanedOutput = output.trim().replace(/\r/g, '');
      
      // Try to parse as JSON first
      const parsed = JSON.parse(cleanedOutput);
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
        const cleanedValue = output.replace(/\r/g, '');
        result = { rows: [{ value: cleanedValue } as unknown as T] };
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
    // Make sure to handle nil values for offset and limit
    const luaScript = `
local keys = redis.call("KEYS", "*")
table.sort(keys)
local offset = tonumber(ARGV[1]) or 0
local limit = tonumber(ARGV[2]) or 10
local result = {}
for i = offset+1, math.min(offset+limit, #keys) do
  local k = keys[i]
  local v = redis.call("GET", k)
  result[#result+1] = { key = k, value = v }
end
return cjson.encode(result)
`;

    let output;
    
    try {
      // Use our cross-platform Redis EVAL helper
      output = await execRedisEval(this.db, luaScript, offset, pageSize);
      
      // Check for Redis error messages
      if (output.startsWith('ERR') || output.startsWith('WRONGTYPE')) {
        console.error("Redis error:", output);
        return { 
          rows: [{ key: 'error', value: output }],
          columns: ['key', 'value']
        };
      }
    } catch (error) {
      console.error("Redis EVAL error:", error);
      // If this is not the password warning, treat as a real error
      if (!error.message?.includes("Warning: Using a password")) {
        return { 
          rows: [{ key: 'error', value: `Redis error: ${error.message}` }],
          columns: ['key', 'value']
        };
      }
      // Otherwise continue with empty output
      output = "";
    }
      
      // Clean the output string to handle potential Windows line ending issues  
      if (!output || output.trim() === "") {
        // Handle empty output case
        return { 
          rows: [], 
          columns: ['key', 'value'] 
        };
      }
      
      try {
        const cleanedOutput = output.trim().replace(/\r/g, '');
        const rows = JSON.parse(cleanedOutput);
        return { rows, columns: ['key', 'value'] };
      } catch (jsonError) {
        console.error("Error parsing Redis JSON response:", jsonError);
        return { 
          rows: [{ key: 'error', value: `Failed to parse response: ${output}` }], 
          columns: ['key', 'value'] 
        };
      }
  }

  async getTableCount(tableName: string): Promise<number> {
    try {
      // Use the Lua script approach for the DBSIZE command
      const luaScript = `return redis.call("DBSIZE")`;
      console.log("DBSIZE as Lua script:", luaScript);
      
      const output = await execRedisEval(this.db, luaScript);
      return parseInt(output, 10) || 0;
    } catch (error) {
      console.error("Error getting Redis DB size:", error);
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
