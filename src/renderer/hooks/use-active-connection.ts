import { create } from 'zustand';

interface UseActiveConnection {
  connectionName: string;
  // connection: AbstractSqlConnection<unknown, unknown>;
  changeConnection: (id: string) => Promise<void>;
}

const useActiveConnection = create<UseActiveConnection>()((set) => ({
  connectionName: 'current connection',
  // connection: new PostgresqlConnection({
  // }),
  async changeConnection(id: string) {
    // if (this.connection) {
    //   await this.connection.disconnect();
    // }

    // const newConnection = new SqliteConnection({
    //   file: '/Users/alex/Programming/a/uo.zone/backend/database/database.sqlite',
    // });

    set({ connectionName: id });

    // await newConnection.connect();
  },
}));

export { useActiveConnection };
