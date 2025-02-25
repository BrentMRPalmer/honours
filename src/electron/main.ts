import { app, BrowserWindow, ipcMain } from 'electron';
import started from 'electron-squirrel-startup';
import path from 'path';

import controllers from '@/controllers';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const createWindow = () => {
  const titleBarWindowControls =
    process.platform !== 'darwin'
      ? { titleBarOverlay: true }
      : { trafficLightPosition: { x: 15, y: 10 } };

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    titleBarStyle: 'hidden',
    ...titleBarWindowControls,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }

  // Register IPC controllers
  const registeredChannels: string[] = [];
  for (const controllerName in controllers) {
    const controller = controllers[controllerName as keyof typeof controllers];
    const controllerMethods = Object.getOwnPropertyNames(
      controller.prototype,
    ).filter((method) => method !== 'constructor');

    const controllerInstance = new controller();

    for (const methodName of controllerMethods) {
      const channelName = `${controllerName}:${methodName}`;
      registeredChannels.push(channelName);

      ipcMain.handle(channelName, (...args: unknown[]) => {
        const method = Reflect.get(controllerInstance, methodName);
        return Reflect.apply(method, controllerInstance, args);
      });
    }
  }

  ipcMain.handle('registered-channels', () => {
    return registeredChannels;
  });

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
