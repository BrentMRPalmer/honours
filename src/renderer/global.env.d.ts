/// <reference types="vite/client" />

import { sqliteClient } from '../electron/lib/sqlite';
import { userSettingsClient } from '../electron/lib/user-settings';

export declare global {
  interface Window {
    userSettings: typeof userSettingsClient;
    sqlite: typeof sqliteClient;
  }
}
