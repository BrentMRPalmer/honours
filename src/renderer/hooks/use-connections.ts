import { create } from 'zustand';

import { ProxyConnection } from '@/lib/proxy-connection';

interface UseConnections {
  activeConnectionId: string;
  connections: ProxyConnection[];
  getConnections: () => Promise<void>;
  changeConnection: (connectionId: string) => Promise<void>;
}

const useConnections = create<UseConnections>()((set) => ({
  activeConnectionId: '',
  connections: [],

  async getConnections() {
    const connections = (await window.SettingsController.getConnections()).map(
      (connection) => new ProxyConnection(connection),
    );

    await Promise.all(connections.map((connection) => connection.connect()));

    set({ connections });
  },

  async changeConnection(connectionId: string) {
    // const { activeConnectionId, connections } = get();
    // const oldConnection = connections.find(
    //   (connection) => connection.id === activeConnectionId,
    // );
    // const newConnection = connections.find(
    //   (connection) => connection.id === connectionId,
    // );
    // if (newConnection === undefined) {
    //   throw new Error(`\'${connectionId}\' connection id does not exist`);
    // } else if (oldConnection) {
    //   await oldConnection.deleteProxiedConnection();
    // }
    // await newConnection.createProxiedConnection();
    set({ activeConnectionId: connectionId });
  },
}));

export { useConnections };
