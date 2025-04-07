import type { App, IpcMainInvokeEvent as IpcEvent } from 'electron';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

import type { Connection, ConnectionDriver } from '@/common/types';
import { AbstractController } from '@/controllers/abstract-controller';

interface Settings {
  connections: Connection[];
}

class SettingsController extends AbstractController {
  #settingsPath: string;

  constructor(app: App) {
    super(app);

    this.#settingsPath = path.join(
      this.app.getPath('userData'),
      'settings.json',
    );
  }

  async #readSettingsFile(): Promise<Settings> {
    try {
      const settingsData = await fs.readFile(this.#settingsPath, 'utf-8');
      const settings: Settings = JSON.parse(settingsData);
      return settings;
    } catch (error) {
      // Return default settings if file doesn't exist or is invalid
      return { connections: [] };
    }
  }

  async #writeSettingsFile(settings: Settings): Promise<void> {
    const settingsData = JSON.stringify(settings, null, 2);
    await fs.writeFile(this.#settingsPath, settingsData, 'utf-8');
  }

  async getConnections(): Promise<Connection[]> {
    try {
      const settings = await this.#readSettingsFile();
      return settings.connections;
    } catch (error) {
      console.error('Error getting connections:', error);
      return [];
    }
  }

  async addConnection(
    _: IpcEvent,
    name: string,
    driver: ConnectionDriver,
    config: unknown,
  ): Promise<Connection> {
    try {
      const settings = await this.#readSettingsFile();
      const connection = { id: uuidv4(), name, driver, config } as Connection;
      settings.connections.push(connection);
      await this.#writeSettingsFile(settings);
      return connection;
    } catch (error) {
      console.error('Error adding connection:', error);
      throw new Error('Failed to add connection');
    }
  }

  async updateConnection(
    _: IpcEvent,
    id: string,
    name: string,
    driver: ConnectionDriver,
    config: unknown,
  ): Promise<Connection> {
    try {
      const settings = await this.#readSettingsFile();
      const connectionIndex = settings.connections.findIndex(
        (conn) => conn.id === id,
      );

      if (connectionIndex === -1) {
        throw new Error(`Connection with id ${id} not found`);
      }

      const updatedConnection = {
        id,
        name,
        driver,
        config,
      } as Connection;

      settings.connections[connectionIndex] = updatedConnection;
      await this.#writeSettingsFile(settings);

      return updatedConnection;
    } catch (error) {
      console.error('Error updating connection:', error);
      throw new Error('Failed to update connection');
    }
  }

  async deleteConnection(_: IpcEvent, id: string): Promise<boolean> {
    try {
      const settings = await this.#readSettingsFile();
      const initialLength = settings.connections.length;

      settings.connections = settings.connections.filter(
        (conn) => conn.id !== id,
      );

      if (settings.connections.length !== initialLength) {
        await this.#writeSettingsFile(settings);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error deleting connection:', error);
      throw new Error('Failed to delete connection');
    }
  }

  async searchConnections(_: IpcEvent, query: string): Promise<Connection[]> {
    try {
      const settings = await this.#readSettingsFile();

      if (!query || query.trim() === '') {
        return settings.connections;
      }

      const lowerQuery = query.toLowerCase();
      return settings.connections.filter(
        (conn) =>
          conn.name.toLowerCase().includes(lowerQuery) ||
          conn.driver.toLowerCase().includes(lowerQuery),
      );
    } catch (error) {
      console.error('Error searching connections:', error);
      return [];
    }
  }
}

export { SettingsController };
