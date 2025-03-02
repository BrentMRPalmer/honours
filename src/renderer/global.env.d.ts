/// <reference types="vite/client" />

import type { IpcMainInvokeEvent } from 'electron';

import type controllers from '../electron/controllers';

type InstanceType<T> = T extends new (...args: infer A) => infer R ? R : never;

type ControllerClient<T> = {
  [K in keyof T]: T[K] extends (
    event: IpcMainInvokeEvent,
    ...args: infer Args
  ) => infer Return
    ? (...args: Args) => Return
    : T[K];
};

type ControllerClients<T> = {
  [K in keyof T]: ControllerClient<InstanceType<T[K]>>;
};

export declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface Window extends ControllerClients<typeof controllers> {}
}
