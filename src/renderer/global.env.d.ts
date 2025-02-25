/// <reference types="vite/client" />

import type { IpcMainInvokeEvent } from 'electron';

import type controllers from '../electron/controllers';

type FilterNever<T> = {
  [K in keyof T as T[K] extends never ? never : K]: T[K];
};

type InstanceType<T> = T extends new (...args: infer A) => infer R ? R : never;

type ControllerClient<T> = FilterNever<{
  [K in keyof T]: T[K] extends (event: infer E, ...args: infer A) => infer R
    ? E extends IpcMainInvokeEvent
      ? (...args: A) => R
      : never
    : never;
}>;

type ControllerClients<T> = {
  [K in keyof T]: ControllerClient<InstanceType<T[K]>>;
};

export declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface Window extends ControllerClients<typeof controllers> {}
}
