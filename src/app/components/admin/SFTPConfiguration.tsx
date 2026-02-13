import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';
import { 
  Save, 
  TestTube, 
  Server, 
  Key, 
  Folder, 
  User, 
  Lock,
  RefreshCw,
  CheckCircle,
  XCircle,
  FolderOpen,
  Clock
} from 'lucide-react';
import { logger } from '../../utils/logger';
import { apiRequest } from '../../utils/api';

interface Client {
  id: string;
  name: string;
}

interface SFTPConfig {
  id?: string;
  clientId: string;
  enabled: boolean;
  host: string;
  port: number;
  username: string;
  password?: string;
  privateKey?: string;
  authMethod: 'password' | 'key';
  remotePath: string;
  filePattern: string;
  schedule: {
    enabled: boolean;
    frequency: 'hourly' | 'daily' | 'weekly';
    time?: string;
    dayOfWeek?: number;
  };
  processing: {
    archivePath: string;
    deleteAfterImport: boolean;
    notifyOnSuccess: boolean;
    notifyOnFailure: boolean;
  };
  lastSync?: string;
  status: 'active' | 'inactive' | 'error';
}

interface SFTPConfigurationProps {
  client: Client;
  onConfigUpdated: () => void;
}

export function SFTPConfiguration({ client, onConfigUpdated }: SFTPConfigurationProps) {
  const [config, setConfig] = useState<SFTPConfig>({
    clientId: client.id,
    enabled: false,
    host: '',
    port: 22,
    username: '',
    authMethod: 'password',
    remotePath: '/employee-data',
    filePattern: 'employees-*.csv',
    schedule: {
      enabled: false,
      frequency: 'daily',
      time: '02:00'
    },
    processing: {
      archivePath: '/employee-data/archive',
      deleteAfterImport: false,
      notifyOnSuccess: true,
      notifyOnFailure: true
    },
    status: 'inactive'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message?: string } | null>(null);

  useEffect(() => {
    loadConfig();
  }, [client.id]);

  const loadConfig = async () => {
    setIsLoading(true);
    try {
      const data = await apiRequest<{ config: SFTPConfig }>(`/clients/${client.id}/sftp-config`);
      if (data.config) {
        setConfig(data.config);
      }
    } catch (error: unknown) {
      // No config exists yet, use defaults
      logger.log('No SFTP config found, using defaults');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveConfig = async () => {
    try {
      setIsSaving(true);
      await apiRequest(`/erp/connections/${client.id}/sftp-config`, {
        method: 'PUT',
        body: JSON.stringify(config),
      });
      toast.success('SFTP configuration saved successfully');
      onConfigUpdated();
      loadConfig();
    } catch (error: unknown) {
      toast.error(`Failed to save configuration: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async () => {
    try {
      setIsTesting(true);
      setTestResult(null);

      const result = await apiRequest<{ success: boolean; message?: string }>(
        `/erp/connections/${client.id}/sftp-test`,
        { method: 'POST' }
      );

      setTestResult(result);

      if (result.success) {
        toast.success('SFTP connection successful!');
      } else {
        toast.error(`Connection failed: ${result.message}`);
      }
    } catch (error: unknown) {
      setTestResult({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
      toast.error(`Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsTesting(false);
    }
  };

  const handleSyncNow = async () => {
    try {
      toast.info('Starting SFTP sync...');
      await apiRequest(`/erp/connections/${client.id}/sync`, {
        method: 'POST',
        body: JSON.stringify({ method: 'sftp' }),
      });
      onConfigUpdated();
    } catch (error: unknown) {
      toast.error(`Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-[#D91C81] mx-auto mb-2" />
          <p className="text-gray-600">Loading configuration...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <Server className="w-6 h-6 text-[#D91C81] mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">SFTP Automated Import</h3>
                <p className="text-sm text-gray-600">
                  Configure automated employee data imports from your SFTP server
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={config.enabled}
                onCheckedChange={(enabled) => setConfig({ ...config, enabled })}
              />
              <Badge className={config.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                {config.enabled ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Connection Settings */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Connection Settings</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="host">SFTP Host</Label>
              <Input
                id="host"
                value={config.host}
                onChange={(e) => setConfig({ ...config, host: e.target.value })}
                placeholder="sftp.example.com"
              />
            </div>

            <div>
              <Label htmlFor="port">Port</Label>
              <Input
                id="port"
                type="number"
                value={config.port}
                onChange={(e) => setConfig({ ...config, port: parseInt(e.target.value) || 22 })}
              />
            </div>

            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={config.username}
                onChange={(e) => setConfig({ ...config, username: e.target.value })}
                placeholder="sftp-user"
              />
            </div>

            <div>
              <Label htmlFor="authMethod">Authentication Method</Label>
              <select
                id="authMethod"
                value={config.authMethod}
                onChange={(e) => setConfig({ ...config, authMethod: e.target.value as 'password' | 'key' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
              >
                <option value="password">Password</option>
                <option value="key">Private Key</option>
              </select>
            </div>

            {config.authMethod === 'password' ? (
              <div className="md:col-span-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={config.password || ''}
                  onChange={(e) => setConfig({ ...config, password: e.target.value })}
                  placeholder="••••••••"
                />
              </div>
            ) : (
              <div className="md:col-span-2">
                <Label htmlFor="privateKey">Private Key</Label>
                <textarea
                  id="privateKey"
                  value={config.privateKey || ''}
                  onChange={(e) => setConfig({ ...config, privateKey: e.target.value })}
                  placeholder="-----BEGIN RSA PRIVATE KEY-----"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none font-mono text-sm"
                  rows={6}
                />
              </div>
            )}
          </div>

          <div className="mt-4">
            <Button
              onClick={handleTestConnection}
              variant="outline"
              disabled={isTesting || !config.host || !config.username}
              className="gap-2"
            >
              {isTesting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <TestTube className="w-4 h-4" />
                  Test Connection
                </>
              )}
            </Button>
          </div>

          {testResult && (
            <div className={`mt-4 p-4 rounded-lg flex items-start gap-3 ${
              testResult.success 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              {testResult.success ? (
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
              )}
              <div>
                <p className={`text-sm font-medium ${
                  testResult.success ? 'text-green-900' : 'text-red-900'
                }`}>
                  {testResult.success ? 'Connection Successful' : 'Connection Failed'}
                </p>
                <p className={`text-xs mt-1 ${
                  testResult.success ? 'text-green-700' : 'text-red-700'
                }`}>
                  {testResult.message}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* File Settings */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">File Settings</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="remotePath">Remote Path</Label>
              <div className="relative">
                <FolderOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="remotePath"
                  value={config.remotePath}
                  onChange={(e) => setConfig({ ...config, remotePath: e.target.value })}
                  placeholder="/employee-data"
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="filePattern">File Pattern</Label>
              <Input
                id="filePattern"
                value={config.filePattern}
                onChange={(e) => setConfig({ ...config, filePattern: e.target.value })}
                placeholder="employees-*.csv"
              />
              <p className="text-xs text-gray-600 mt-1">Use * as wildcard (e.g., employees-*.csv)</p>
            </div>

            <div>
              <Label htmlFor="archivePath">Archive Path</Label>
              <Input
                id="archivePath"
                value={config.processing.archivePath}
                onChange={(e) => setConfig({
                  ...config,
                  processing: { ...config.processing, archivePath: e.target.value }
                })}
                placeholder="/employee-data/archive"
              />
            </div>

            <div className="flex items-center gap-2 pt-6">
              <Switch
                checked={config.processing.deleteAfterImport}
                onCheckedChange={(checked) => setConfig({
                  ...config,
                  processing: { ...config.processing, deleteAfterImport: checked }
                })}
              />
              <Label>Delete files after import</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Settings */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Sync Schedule</h3>
            <div className="flex items-center gap-2">
              <Switch
                checked={config.schedule.enabled}
                onCheckedChange={(checked) => setConfig({
                  ...config,
                  schedule: { ...config.schedule, enabled: checked }
                })}
              />
              <span className="text-sm text-gray-600">
                {config.schedule.enabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>

          {config.schedule.enabled && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="frequency">Frequency</Label>
                <select
                  id="frequency"
                  value={config.schedule.frequency}
                  onChange={(e) => setConfig({
                    ...config,
                    schedule: { ...config.schedule, frequency: e.target.value as 'hourly' | 'daily' | 'weekly' }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
                >
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>

              {config.schedule.frequency !== 'hourly' && (
                <div>
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={config.schedule.time || ''}
                    onChange={(e) => setConfig({
                      ...config,
                      schedule: { ...config.schedule, time: e.target.value }
                    })}
                  />
                </div>
              )}

              {config.schedule.frequency === 'weekly' && (
                <div>
                  <Label htmlFor="dayOfWeek">Day of Week</Label>
                  <select
                    id="dayOfWeek"
                    value={config.schedule.dayOfWeek || 1}
                    onChange={(e) => setConfig({
                      ...config,
                      schedule: { ...config.schedule, dayOfWeek: parseInt(e.target.value) }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
                  >
                    <option value={1}>Monday</option>
                    <option value={2}>Tuesday</option>
                    <option value={3}>Wednesday</option>
                    <option value={4}>Thursday</option>
                    <option value={5}>Friday</option>
                    <option value={6}>Saturday</option>
                    <option value={0}>Sunday</option>
                  </select>
                </div>
              )}
            </div>
          )}

          {config.lastSync && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-900">
                Last sync: {new Date(config.lastSync).toLocaleString()}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Notifications</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Notify on successful sync</Label>
              <Switch
                checked={config.processing.notifyOnSuccess}
                onCheckedChange={(checked) => setConfig({
                  ...config,
                  processing: { ...config.processing, notifyOnSuccess: checked }
                })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Notify on sync failure</Label>
              <Switch
                checked={config.processing.notifyOnFailure}
                onCheckedChange={(checked) => setConfig({
                  ...config,
                  processing: { ...config.processing, notifyOnFailure: checked }
                })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          onClick={handleSaveConfig}
          disabled={isSaving}
          className="bg-[#D91C81] hover:bg-[#B01669] text-white"
        >
          {isSaving ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Configuration
            </>
          )}
        </Button>

        <Button
          onClick={handleSyncNow}
          variant="outline"
          disabled={!config.enabled || !testResult?.success}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Run Manual Sync
        </Button>
      </div>
    </div>
  );
}