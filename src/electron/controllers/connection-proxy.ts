import SqliteDatabase from 'better-sqlite3';
import type { IpcMainInvokeEvent as IpcEvent } from 'electron';

import type { AbstractConnection } from '@/common/lib/abstract-connection';
import { MongoConnection } from '@/common/lib/mongo-connection';
import { RedisConnection } from '@/common/lib/redis-connection';
import { SqliteConnection } from '@/common/lib/sqlite-connection';
import type { Connection } from '@/common/types';
import { AbstractController } from '@/controllers/abstract-controller';
import { createSqlAgent } from '@/lib/sql-agent';

class ConnectionProxy extends AbstractController {
  openConnections = new Map<string, AbstractConnection<unknown>>();

  async createConnection(_: IpcEvent, { id, driver, config }: Connection) {
    if (this.openConnections.has(id)) {
      return false;
    }

    try {
      switch (driver) {
        case 'sqlite': {
          const db = new SqliteDatabase(config.filename);
          this.openConnections.set(id, new SqliteConnection(db));
          break;
        }
        case 'postgresql': {
          // Mock implementation for PostgreSQL
          console.log('Creating PostgreSQL connection (mock):', config);
          this.openConnections.set(
            id,
            new SqliteConnection(new SqliteDatabase(':memory:')),
          );
          break;
        }
        case 'mysql': {
          // Mock implementation for MySQL
          console.log('Creating MySQL connection (mock):', config);
          this.openConnections.set(
            id,
            new SqliteConnection(new SqliteDatabase(':memory:')),
          );
          break;
        }
        case 'maria': {
          // Mock implementation for MariaDB
          console.log('Creating MariaDB connection (mock):', config);
          this.openConnections.set(
            id,
            new SqliteConnection(new SqliteDatabase(':memory:')),
          );
          break;
        }
        case 'mongo': {
          // Real MongoDB implementation
          // Use the URI and database separately
          const mongoUri = `${config.uri}/${config.database}`;
          try {
            const mongoConnection = new MongoConnection(mongoUri);
            // Test the connection before storing it
            await mongoConnection.connect();
            this.openConnections.set(id, mongoConnection);
          } catch (error) {
            console.error('Error connecting to MongoDB:', error);
            throw new Error(`Failed to connect to MongoDB: ${error.message}`);
          }
          break;
        }
        case 'redis': {
          // Real Redis implementation
          // Format proper Redis URI according to redis-cli standard
          let redisUri = `redis://`;

          // Add auth if password exists
          if (config.password && config.password.trim() !== '') {
            redisUri += `${encodeURIComponent(config.password)}@`;
          }

          // Add host and port
          redisUri += `${config.host}:${config.port}`;

          // Add database if specified
          if (config.database !== undefined) {
            redisUri += `/${config.database}`;
          }

          console.log(`Creating Redis connection with URI: ${redisUri}`);
          try {
            const redisConnection = new RedisConnection(redisUri);
            // Test the connection before storing it
            await redisConnection.connect();
            this.openConnections.set(id, redisConnection);
          } catch (error) {
            console.error('Error connecting to Redis:', error);
            throw new Error(`Failed to connect to Redis: ${error.message}`);
          }
          break;
        }
        default: {
          throw new Error(`Unsupported database driver: ${driver}`);
        }
      }

      return true;
    } catch (error) {
      console.error(`Error creating ${driver} connection:`, error);
      throw new Error(
        `Failed to create ${driver} connection: ${error.message}`,
      );
    }
  }

  async deleteConnection(_: IpcEvent, id: string) {
    const connection = this.openConnections.get(id);
    if (connection) {
      try {
        // Try to disconnect gracefully
        await connection.disconnect();
      } catch (error) {
        console.error(`Error disconnecting connection ${id}:`, error);
      }
    }
    return this.openConnections.delete(id);
  }

  async forwardCall(
    _: IpcEvent,
    id: string,
    methodName: keyof typeof AbstractConnection.prototype,
    args: unknown[],
  ) {
    const connection = this.openConnections.get(id);

    if (!connection) {
      throw new Error(`Connection \`${id}\` is not open.`);
    }

    try {
      const method = Reflect.get(connection, methodName) as (
        ...args: unknown[]
      ) => unknown;

      return Reflect.apply(method, connection, args);
    } catch (error) {
      console.error(`Error calling ${methodName} on connection ${id}:`, error);
      throw new Error(`Failed to execute ${methodName}: ${error.message}`);
    }
  }

  async agent(_: IpcEvent, id: string, query: string, selectedModel: string) {
    const connection = this.openConnections.get(id);

    if (!connection) {
      throw new Error(`Connection \`${id}\` is not open.`);
    }

    try {
      const a = createSqlAgent(connection, selectedModel);
      return (await a.chat({ message: query })).message.content;
    } catch (error) {
      console.error(`Error using agent on connection ${id}:`, error);
      throw new Error(`Failed to use agent: ${error.message}`);
    }
  }

  async testConnection(
    _: IpcEvent,
    { driver, config }: Omit<Connection, 'id' | 'name'>,
  ) {
    try {
      switch (driver) {
        case 'sqlite': {
          // Check if the file exists and can be opened
          const db = new SqliteDatabase(config.filename, { readonly: true });
          db.close();
          break;
        }
        // Mock tests for some drivers
        case 'postgresql':
        case 'mysql':
        case 'maria': {
          // Mock test that always succeeds
          console.log(`Testing ${driver} connection (mock):`, config);
          break;
        }
        case 'mongo': {
          // Real MongoDB connection test
          try {
            const mongoUri = `${config.uri}/${config.database}`;
            const mongoConnection = new MongoConnection(mongoUri);
            await mongoConnection.connect();
          } catch (error) {
            console.error(`Error testing MongoDB connection:`, error);
            return {
              success: false,
              message: `MongoDB connection failed: ${error.message}`,
            };
          }
          break;
        }
        case 'redis': {
          // Real Redis connection test
          try {
            const redisUri = `redis://${config.password ? `:${config.password}@` : ''}${config.host}:${config.port}${config.database !== undefined ? `/${config.database}` : ''}`;
            const redisConnection = new RedisConnection(redisUri);
            await redisConnection.connect();
          } catch (error) {
            console.error(`Error testing Redis connection:`, error);
            return {
              success: false,
              message: `Redis connection failed: ${error.message}`,
            };
          }
          break;
        }
        default: {
          throw new Error(`Unsupported database driver: ${driver}`);
        }
      }
      return { success: true, message: 'Connection successful' };
    } catch (error) {
      console.error(`Error testing ${driver} connection:`, error);
      return {
        success: false,
        message: `Connection failed: ${error.message}`,
      };
    }
  }
}

export { ConnectionProxy };
