import type { App, IpcMainInvokeEvent as IpcEvent } from 'electron';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

import type { Connection, ConnectionDriver } from '@/common/types';
import { AbstractController } from '@/controllers/abstract-controller';

interface Settings {
  connections: {
    id: string;
    name: string;
    driver: ConnectionDriver;
    config: unknown;
  }[];
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

  async #readSettingsFile() {
    const settingsData = await fs.readFile(this.#settingsPath, 'utf-8');
    const settings: Settings = JSON.parse(settingsData);
    return settings;
  }

  async #writeSettingsFile(settings: Settings) {
    const settingsData = JSON.stringify(settings);
    await fs.writeFile(this.#settingsPath, settingsData, 'utf-8');
  }

  async getConnections() {
    // const settings = await this.#readSettingsFile();
    return [
      {
        id: '1',
        driver: 'sqlite',
        name: 'db1',
        config: {
          filename:
            'C:\\Season11\\Honours\\Data\\var\\www\\html\\database\\database.sqlite',
        },
      },
      {
        id: '2',
        driver: 'sqlite',
        name: 'db2',
        config: {
          filename:
            'C:\\Season11\\Honours\\Data\\var\\www\\html\\database\\database.sqlite',
        },
      },
    ] as Connection[];
  }

  async addConnections(
    _: IpcEvent,
    name: string,
    driver: ConnectionDriver,
    config: unknown,
  ) {
    const settings = await this.#readSettingsFile();
    const connection = { id: uuidv4(), name, driver, config };
    settings.connections.push(connection);
    await this.#writeSettingsFile(settings);
    return connection;
  }
}

export { SettingsController };
