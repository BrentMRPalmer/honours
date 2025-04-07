import { create } from 'zustand';

import type { ConnectionDriver } from '@/common/types';
import { ProxyConnection } from '@/lib/proxy-connection';

interface UseConnections {
  activeConnectionId: string;
  connections: ProxyConnection[];
  getConnections: () => Promise<void>;
  changeConnection: (connectionId: string) => Promise<void>;
  addConnection: (
    name: string,
    driver: ConnectionDriver,
    config: unknown,
  ) => Promise<void>;
  updateConnection: (
    id: string,
    name: string,
    driver: ConnectionDriver,
    config: unknown,
  ) => Promise<void>;
  deleteConnection: (id: string) => Promise<void>;
  testConnection: (
    driver: ConnectionDriver,
    config: unknown,
  ) => Promise<{ success: boolean; message: string }>;
}

const useConnections = create<UseConnections>()((set, get) => ({
  activeConnectionId: '',
  connections: [],

  async getConnections() {
    const connections = (await window.SettingsController.getConnections()).map(
      (connection) => new ProxyConnection(connection),
    );

    await Promise.all(connections.map((connection) => connection.connect()));

    set({
      connections,
      activeConnectionId:
        connections.length > 0
          ? get().activeConnectionId || connections[0].id
          : '',
    });
  },

  async changeConnection(connectionId: string) {
    set({ activeConnectionId: connectionId });
  },

  async addConnection(name: string, driver: ConnectionDriver, config: unknown) {
    try {
      const connection = await window.SettingsController.addConnection(
        name,
        driver,
        config,
      );
      const proxyConnection = new ProxyConnection(connection);
      await proxyConnection.connect();

      set((state) => ({
        connections: [...state.connections, proxyConnection],
        activeConnectionId:
          state.connections.length === 0
            ? proxyConnection.id
            : state.activeConnectionId,
      }));
    } catch (error) {
      console.error('Error adding connection:', error);
    }
  },

  async updateConnection(
    id: string,
    name: string,
    driver: ConnectionDriver,
    config: unknown,
  ) {
    try {
      const updatedConnection =
        await window.SettingsController.updateConnection(
          id,
          name,
          driver,
          config,
        );
      const proxyConnection = new ProxyConnection(updatedConnection);
      await proxyConnection.connect();

      set((state) => ({
        connections: state.connections.map((conn) =>
          conn.id === id ? proxyConnection : conn,
        ),
      }));
    } catch (error) {
      console.error('Error updating connection:', error);
      // Refresh connections to ensure consistency
      await get().getConnections();
    }
  },

  async deleteConnection(id: string) {
    try {
      const { connections, activeConnectionId } = get();
      const connection = connections.find((conn) => conn.id === id);

      if (connection) {
        await connection.disconnect();
      }

      const success = await window.SettingsController.deleteConnection(id);

      if (success) {
        const updatedConnections = connections.filter((conn) => conn.id !== id);
        const newActiveId =
          id === activeConnectionId
            ? updatedConnections.length > 0
              ? updatedConnections[0].id
              : ''
            : activeConnectionId;

        set({
          connections: updatedConnections,
          activeConnectionId: newActiveId,
        });
      }
    } catch (error) {
      console.error('Error deleting connection:', error);
    }
  },

  async testConnection(driver: ConnectionDriver, config: unknown) {
    try {
      return await window.ConnectionProxy.testConnection({ driver, config });
    } catch (error) {
      console.error('Error testing connection:', error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : 'Connection test failed',
      };
    }
  },
}));

export { useConnections };
