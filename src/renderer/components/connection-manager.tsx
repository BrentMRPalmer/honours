import { 
  Database, 
  DatabaseIcon, 
  Edit, 
  Plus, 
  ServerCog, 
  Trash2,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  ConnectionDriver, 
  SqliteConfig, 
  PostgresqlConfig, 
  MySQLConfig, 
  MongoConfig, 
  RedisConfig 
} from '@/common/types';
import { useConnections } from '@/hooks/use-connections';

export function ConnectionManager() {
  const { connections, addConnection, updateConnection, deleteConnection } = useConnections();
  const [isOpen, setIsOpen] = useState(false);
  const [editingConnection, setEditingConnection] = useState<string | null>(null);
  
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold tracking-tight">Database Connections</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="default" size="sm" onClick={() => setEditingConnection(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Connection
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <ConnectionForm 
              onSave={(data) => {
                if (editingConnection) {
                  updateConnection(
                    editingConnection,
                    data.name,
                    data.driver,
                    data.config
                  );
                } else {
                  addConnection(
                    data.name,
                    data.driver,
                    data.config
                  );
                }
                setIsOpen(false);
              }}
              editingConnection={editingConnection ? 
                connections.find(c => c.id === editingConnection) : null}
            />
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {connections.map((connection) => (
          <div
            key={connection.id}
            className="flex flex-col p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center mb-2">
              <DatabaseIcon className="mr-2 h-5 w-5" />
              <div className="flex-1 font-medium tracking-tight">{connection.name}</div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setEditingConnection(connection.id);
                    setIsOpen(true);
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteConnection(connection.id)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>

            <div className="text-xs text-muted-foreground mb-2 flex items-center">
              <ServerCog className="mr-1 h-3 w-3" />
              {connection.driver && (
                <>
                  {getDriverIcon(connection.driver)}
                  {connection.driver.toUpperCase()}
                </>
              )}
            </div>

            <div className="text-xs text-gray-500 overflow-hidden">
              {connection.driver && renderConnectionDetails(connection.driver, connection.config)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function getDriverIcon(driver: ConnectionDriver | undefined) {
  if (!driver) return <Database className="mr-1 h-3 w-3" />;
  
  switch (driver) {
    case 'sqlite':
      return <Database className="mr-1 h-3 w-3" />;
    case 'postgresql':
      return <Database className="mr-1 h-3 w-3" />;
    case 'mysql':
      return <Database className="mr-1 h-3 w-3" />;
    case 'maria':
      return <Database className="mr-1 h-3 w-3" />;
    case 'mongo':
      return <Database className="mr-1 h-3 w-3" />;
    case 'redis':
      return <Database className="mr-1 h-3 w-3" />;
    default:
      return <Database className="mr-1 h-3 w-3" />;
  }
}

function renderConnectionDetails(driver: ConnectionDriver, config: any) {
  if (!config) return 'No configuration provided';
  
  switch (driver) {
    case 'sqlite':
      return `File: ${(config as SqliteConfig)?.filename || 'unknown'}`;
    case 'postgresql':
      const pgConfig = config as PostgresqlConfig;
      return `${pgConfig?.host || 'localhost'}:${pgConfig?.port || '5432'}/${pgConfig?.database || 'unknown'}`;
    case 'mysql':
    case 'maria':
      const mysqlConfig = config as MySQLConfig;
      return `${mysqlConfig?.host || 'localhost'}:${mysqlConfig?.port || '3306'}/${mysqlConfig?.database || 'unknown'}`;
    case 'mongo':
      const mongoConfig = config as MongoConfig;
      return `${mongoConfig?.uri || 'mongodb://localhost:27017'}/${mongoConfig?.database || 'unknown'}`;
    case 'redis':
      const redisConfig = config as RedisConfig;
      return `${redisConfig?.host || 'localhost'}:${redisConfig?.port || '6379'}`;
    default:
      return 'Unknown connection type';
  }
}

interface ConnectionFormProps {
  onSave: (data: {
    name: string;
    driver: ConnectionDriver;
    config: any;
  }) => void;
  editingConnection: any | null;
}

// Helper function to generate default configurations based on driver type
function getDefaultConfig(driver: ConnectionDriver): any {
  switch (driver) {
    case 'sqlite':
      return { filename: '' };
    case 'postgresql':
      return { host: 'localhost', port: 5432, database: '', username: '', password: '' };
    case 'mysql':
    case 'maria':
      return { host: 'localhost', port: 3306, database: '', username: '', password: '' };
    case 'mongo':
      return { uri: 'mongodb://localhost:27017', database: '' };
    case 'redis':
      return { host: 'localhost', port: 6379, password: '' };
    default:
      return {};
  }
}

function ConnectionForm({ onSave, editingConnection }: ConnectionFormProps) {
  const { testConnection } = useConnections();
  const [name, setName] = useState(editingConnection?.name || '');
  const [driver, setDriver] = useState<ConnectionDriver>(
    editingConnection?.driver || 'sqlite'
  );
  const [config, setConfig] = useState<any>(() => {
    // If we're editing, use the existing config, otherwise get default config
    return editingConnection?.config ? {...editingConnection.config} : getDefaultConfig(editingConnection?.driver || 'sqlite');
  });
  const [testStatus, setTestStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  
  // Update form fields when driver changes
  const updateConfigField = (field: string, value: any) => {
    // Ensure we're storing the value even if it's an empty string
    setConfig(prev => ({ ...prev, [field]: value }));
  };
  
  // Validation functions
  const isConfigValid = (): boolean => {
    switch (driver) {
      case 'sqlite':
        return !!config.filename?.trim();
      case 'postgresql':
        return !!config.database?.trim() && !!config.username?.trim();
      case 'mysql':
      case 'maria':
        return !!config.database?.trim() && !!config.username?.trim();
      case 'mongo':
        return !!config.database?.trim();
      case 'redis':
        return true; // Redis can connect with defaults
      default:
        return false;
    }
  };
  
  const getValidationError = (): string => {
    switch (driver) {
      case 'sqlite':
        return 'Filename is required for SQLite connections';
      case 'postgresql':
        return 'Database name and username are required for PostgreSQL connections';
      case 'mysql':
      case 'maria':
        return 'Database name and username are required for MySQL/MariaDB connections';
      case 'mongo':
        return 'Database name is required for MongoDB connections';
      default:
        return 'Invalid configuration';
    }
  };
  
  const handleTestConnection = async () => {
    setTestStatus(null);
    setIsTestingConnection(true);
    
    if (!isConfigValid()) {
      setTestStatus({ success: false, message: getValidationError() });
      setIsTestingConnection(false);
      return;
    }
    
    try {
      const result = await testConnection(driver, config);
      setTestStatus(result);
    } catch (error) {
      setTestStatus({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Connection test failed' 
      });
    } finally {
      setIsTestingConnection(false);
    }
  };
  
  const handleSave = () => {
    if (!name.trim()) {
      alert('Connection name is required');
      return;
    }
    
    if (!isConfigValid()) {
      alert(getValidationError());
      return;
    }
    
    onSave({ name, driver, config });
  };
  
  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {editingConnection ? 'Edit Connection' : 'Add New Connection'}
        </DialogTitle>
        <DialogDescription>
          Configure your database connection details below.
        </DialogDescription>
      </DialogHeader>
      
      <div className="grid gap-4 py-4">
        {/* Common fields */}
        <div className="grid grid-cols-4 items-center gap-4">
          <label htmlFor="name" className="text-right text-sm">
            Name
          </label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My Database"
            className="col-span-3"
          />
        </div>
        
        <div className="grid grid-cols-4 items-center gap-4">
          <label htmlFor="driver" className="text-right text-sm">
            Database Type
          </label>
          <Select
            value={driver}
            onValueChange={(value: ConnectionDriver) => {
              // Keep any existing values in the config but add new defaults as needed
              const newDefaults = getDefaultConfig(value);
              setConfig(prev => {
                // Only replace fields that don't exist in current config
                const mergedConfig = {...newDefaults};
                // Copy over any non-empty user-entered fields
                Object.keys(prev).forEach(key => {
                  if (prev[key] !== undefined && prev[key] !== null && prev[key] !== '') {
                    mergedConfig[key] = prev[key];
                  }
                });
                return mergedConfig;
              });
              setDriver(value);
            }}
          >
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Select database type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sqlite">SQLite</SelectItem>
              <SelectItem value="postgresql">PostgreSQL</SelectItem>
              <SelectItem value="mysql">MySQL</SelectItem>
              <SelectItem value="maria">MariaDB</SelectItem>
              <SelectItem value="mongo">MongoDB</SelectItem>
              <SelectItem value="redis">Redis</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Render the appropriate fields based on the selected driver */}
        {driver === 'sqlite' && (
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="filename" className="text-right text-sm">
              Database File
            </label>
            <Input
              id="filename"
              value={config.filename}
              onChange={(e) => updateConfigField('filename', e.target.value)}
              placeholder="/path/to/database.db"
              className="col-span-3"
            />
          </div>
        )}
        
        {(driver === 'postgresql' || driver === 'mysql' || driver === 'maria') && (
          <>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="host" className="text-right text-sm">
                Host
              </label>
              <Input
                id="host"
                value={config.host}
                onChange={(e) => updateConfigField('host', e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="port" className="text-right text-sm">
                Port
              </label>
              <Input
                id="port"
                value={config.port}
                onChange={(e) => updateConfigField('port', parseInt(e.target.value, 10))}
                className="col-span-3"
                type="number"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="database" className="text-right text-sm">
                Database
              </label>
              <Input
                id="database"
                value={config.database}
                onChange={(e) => updateConfigField('database', e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="username" className="text-right text-sm">
                Username
              </label>
              <Input
                id="username"
                value={config.username}
                onChange={(e) => updateConfigField('username', e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="password" className="text-right text-sm">
                Password
              </label>
              <Input
                id="password"
                value={config.password}
                onChange={(e) => updateConfigField('password', e.target.value)}
                className="col-span-3"
                type="password"
              />
            </div>
          </>
        )}
        
        {driver === 'mongo' && (
          <>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="uri" className="text-right text-sm">
                Connection URI
              </label>
              <Input
                id="uri"
                value={config.uri}
                onChange={(e) => updateConfigField('uri', e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="database" className="text-right text-sm">
                Database
              </label>
              <Input
                id="database"
                value={config.database}
                onChange={(e) => updateConfigField('database', e.target.value)}
                className="col-span-3"
              />
            </div>
          </>
        )}
        
        {driver === 'redis' && (
          <>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="host" className="text-right text-sm">
                Host
              </label>
              <Input
                id="host"
                value={config.host}
                onChange={(e) => updateConfigField('host', e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="port" className="text-right text-sm">
                Port
              </label>
              <Input
                id="port"
                value={config.port}
                onChange={(e) => updateConfigField('port', parseInt(e.target.value, 10))}
                className="col-span-3"
                type="number"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="password" className="text-right text-sm">
                Password
              </label>
              <Input
                id="password"
                value={config.password}
                onChange={(e) => updateConfigField('password', e.target.value)}
                className="col-span-3"
                type="password"
              />
            </div>
          </>
        )}
      </div>
      
      <DialogFooter className="flex gap-2 justify-between">
        <div className="flex-1">
          {testStatus && (
            <div className={`text-sm flex items-center ${testStatus.success ? 'text-green-600' : 'text-red-600'}`}>
              {testStatus.success ? (
                <CheckCircle className="mr-1 h-4 w-4" />
              ) : (
                <AlertCircle className="mr-1 h-4 w-4" />
              )}
              {testStatus.message}
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleTestConnection}
            disabled={isTestingConnection}
          >
            {isTestingConnection ? 'Testing...' : 'Test Connection'}
          </Button>
          <Button type="submit" onClick={handleSave}>
            {editingConnection ? 'Update Connection' : 'Add Connection'}
          </Button>
        </div>
      </DialogFooter>
    </>
  );
}