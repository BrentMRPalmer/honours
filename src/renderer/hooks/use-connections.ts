import { create } from 'zustand';

import { AbstractConnection } from '@/lib/connections/abstract-connection';
import { PostgresqlConnection } from '@/lib/connections/postgresql-connection';
import { SqliteConnection } from '@/lib/connections/sqlite-connection';

interface UseConnections {
  activeConnectionId: string;
  connections: AbstractConnection<object, unknown>[];
  getConnections: () => Promise<void>;
  changeConnection: (connectionId: string) => Promise<void>;
}

const useConnections = create<UseConnections>()((set) => ({
  activeConnectionId: '',
  connections: [],

  async getConnections() {
    const connections = (await window.SettingsController.getConnections()).map(
      (connection) => {
        switch (connection.driver) {
          case 'sqlite':
            return new SqliteConnection(
              connection.id,
              connection.name,
              connection.config,
            );
          case 'postgresql':
            return new PostgresqlConnection(
              connection.id,
              connection.name,
              connection.config,
            );
        }
      },
    );

    await Promise.all(
      connections.map((connection) => connection.createProxiedConnection()),
    );

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
