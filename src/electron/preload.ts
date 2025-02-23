// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge } from 'electron';

import { userSettingsClient } from './lib/user-settings';
// import { sqliteClient } from './lib/sqlite';

contextBridge.exposeInMainWorld('userSettings', userSettingsClient);
// contextBridge.exposeInMainWorld('sqlite', sqliteClient);
