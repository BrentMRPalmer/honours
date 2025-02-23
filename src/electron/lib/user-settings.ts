import {} from 'node:fs/promises';

import type { App } from 'electron';
import { ipcMain, ipcRenderer } from 'electron';

enum UserSettingChannels {
  SettingsUpdate = 'user-settings:update',
  SettingsSetItem = 'user-settings:set-item',
  SettingsGetItem = 'user-settings:get-item',
  SettingsRemoveItem = 'user-settings:remove-item',
}

function userSettingsController(app: App) {
  const userSettings = { hello: 'a' };

  app.on('quit', () => {});

  ipcMain.handle(UserSettingChannels.SettingsSetItem, (_event, key: string) => {
    return userSettings[key as 'hello'];
  });

  ipcMain.handle(UserSettingChannels.SettingsGetItem, (_event, key: string) => {
    return userSettings[key as 'hello'];
  });
}

const userSettingsClient = {
  getItem<T>(key: string) {
    return ipcRenderer.invoke(
      UserSettingChannels.SettingsGetItem,
      key,
    ) as Promise<T>;
  },
};

export { userSettingsClient, userSettingsController };
