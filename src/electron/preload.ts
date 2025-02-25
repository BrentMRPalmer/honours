// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from 'electron';

type Clients = {
  [c: string]: { [m: string]: () => void };
};

ipcRenderer.invoke('registered-channels').then((channels) => {
  const clients: Clients = {};

  for (const channel of channels) {
    const [controller, method] = channel.split(':');

    if (!(controller in clients)) {
      clients[controller] = {};
    }
    console.log(controller, method, channel);
    clients[controller][method] = (...args: unknown[]) => {
      return ipcRenderer.invoke(channel, ...args);
    };
  }

  for (const controller in clients) {
    contextBridge.exposeInMainWorld(controller, clients[controller]);
  }
});
