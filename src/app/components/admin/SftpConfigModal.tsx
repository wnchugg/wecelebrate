import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Server, 
  Key, 
  Folder, 
  CheckCircle, 
  XCircle,
  Eye,
  EyeOff,
  Clock,
  Shield,
  TestTube
} from 'lucide-react';
import { toast } from 'sonner';
import type { SftpConfig as SftpConfigType, SftpConfigValue, SftpSchedule } from '../../types/admin';

export type { SftpConfigType as SftpConfig };

interface SftpConfigModalProps {
  open: boolean;
  onClose: () => void;
  config?: SftpConfigType;
  onSave: (config: SftpConfigType) => void;
}

export function SftpConfigModal({ open, onClose, config, onSave }: SftpConfigModalProps) {
  const [formData, setFormData] = useState<SftpConfigType>({
    enabled: false,
    host: '',
    port: 22,
    username: '',
    password: '',
    authMethod: 'password',
    remotePath: '/uploads/employee-data',
    filePattern: '*.csv',
    schedule: 'daily',
    scheduleTime: '02:00',
    autoProcess: true,
    deleteAfterImport: false,
    status: 'disconnected'
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (config) {
      setFormData(config);
    }
  }, [config]);

  const handleChange = (field: keyof SftpConfigType, value: SftpConfigValue) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setTestResult(null); // Clear test result when config changes
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);

    // Simulate API call to test SFTP connection
    setTimeout(() => {
      const success = formData.host && formData.username && (formData.password || formData.privateKey);
      setTestResult({
        success: !!success,
        message: success 
          ? 'Connection successful! SFTP server is reachable.' 
          : 'Connection failed. Please check your credentials.'
      });
      setTesting(false);
      
      if (success) {
        toast.success('SFTP connection test successful');
      } else {
        toast.error('SFTP connection test failed');
      }
    }, 2000);
  };

  const handleSave = () => {
    // Validation
    if (!formData.host || !formData.username) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.authMethod === 'password' && !formData.password) {
      toast.error('Password is required for password authentication');
      return;
    }

    if (formData.authMethod === 'key' && !formData.privateKey) {
      toast.error('Private key is required for key authentication');
      return;
    }

    onSave(formData);
    toast.success('SFTP configuration saved successfully');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Server className="w-5 h-5 text-[#D91C81]" />
            SFTP Automation Configuration
          </DialogTitle>
          <DialogDescription>
            Configure automated employee data import via SFTP file transfer
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Enable/Disable */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <Label className="text-base font-semibold">Enable SFTP Automation</Label>
              <p className="text-sm text-gray-600 mt-1">
                Automatically import employee data from SFTP server
              </p>
            </div>
            <Switch
              checked={formData.enabled}
              onCheckedChange={(checked) => handleChange('enabled', checked)}
            />
          </div>

          {/* Server Configuration */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Server className="w-4 h-4" />
              Server Configuration
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="host">
                  Host / Server Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="host"
                  type="text"
                  placeholder="sftp.example.com"
                  value={formData.host}
                  onChange={(e) => handleChange('host', e.target.value)}
                  disabled={!formData.enabled}
                />
              </div>

              <div>
                <Label htmlFor="port">
                  Port <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="port"
                  type="number"
                  placeholder="22"
                  value={formData.port}
                  onChange={(e) => handleChange('port', parseInt(e.target.value))}
                  disabled={!formData.enabled}
                />
              </div>

              <div>
                <Label htmlFor="username">
                  Username <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="your-username"
                  value={formData.username}
                  onChange={(e) => handleChange('username', e.target.value)}
                  disabled={!formData.enabled}
                />
              </div>
            </div>
          </div>

          {/* Authentication */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Key className="w-4 h-4" />
              Authentication
            </h3>

            <div>
              <Label htmlFor="authMethod">Authentication Method</Label>
              <Select
                value={formData.authMethod}
                onValueChange={(value: 'password' | 'key') => handleChange('authMethod', value)}
                disabled={!formData.enabled}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="password">Password</SelectItem>
                  <SelectItem value="key">SSH Private Key</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.authMethod === 'password' ? (
              <div>
                <Label htmlFor="password">
                  Password <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter password"
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    disabled={!formData.enabled}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <Label htmlFor="privateKey">
                  SSH Private Key <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <textarea
                    id="privateKey"
                    placeholder="-----BEGIN RSA PRIVATE KEY-----&#10;...&#10;-----END RSA PRIVATE KEY-----"
                    value={formData.privateKey || ''}
                    onChange={(e) => handleChange('privateKey', e.target.value)}
                    disabled={!formData.enabled}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-xs resize-y min-h-[120px] focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Paste your SSH private key in PEM format
                </p>
              </div>
            )}
          </div>

          {/* File Configuration */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Folder className="w-4 h-4" />
              File Configuration
            </h3>

            <div>
              <Label htmlFor="remotePath">Remote Path</Label>
              <Input
                id="remotePath"
                type="text"
                placeholder="/uploads/employee-data"
                value={formData.remotePath}
                onChange={(e) => handleChange('remotePath', e.target.value)}
                disabled={!formData.enabled}
              />
              <p className="text-xs text-gray-500 mt-1">
                Directory path on the SFTP server where files will be uploaded
              </p>
            </div>

            <div>
              <Label htmlFor="filePattern">File Pattern</Label>
              <Input
                id="filePattern"
                type="text"
                placeholder="*.csv"
                value={formData.filePattern}
                onChange={(e) => handleChange('filePattern', e.target.value)}
                disabled={!formData.enabled}
              />
              <p className="text-xs text-gray-500 mt-1">
                Pattern to match files (e.g., *.csv, employees_*.xlsx, data_*.csv)
              </p>
            </div>
          </div>

          {/* Schedule Configuration */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Schedule Configuration
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="schedule">Import Frequency</Label>
                <Select
                  value={formData.schedule}
                  onValueChange={(value: SftpSchedule) => handleChange('schedule', value)}
                  disabled={!formData.enabled}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="manual">Manual Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.schedule !== 'manual' && formData.schedule !== 'hourly' && (
                <div>
                  <Label htmlFor="scheduleTime">Run Time</Label>
                  <Input
                    id="scheduleTime"
                    type="time"
                    value={formData.scheduleTime}
                    onChange={(e) => handleChange('scheduleTime', e.target.value)}
                    disabled={!formData.enabled}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Processing Options */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Processing Options
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <Label className="text-sm font-medium">Auto-process Files</Label>
                  <p className="text-xs text-gray-600 mt-1">
                    Automatically import data when new files are detected
                  </p>
                </div>
                <Switch
                  checked={formData.autoProcess}
                  onCheckedChange={(checked) => handleChange('autoProcess', checked)}
                  disabled={!formData.enabled}
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <Label className="text-sm font-medium">Delete After Import</Label>
                  <p className="text-xs text-gray-600 mt-1">
                    Remove files from SFTP server after successful import
                  </p>
                </div>
                <Switch
                  checked={formData.deleteAfterImport}
                  onCheckedChange={(checked) => handleChange('deleteAfterImport', checked)}
                  disabled={!formData.enabled}
                />
              </div>
            </div>
          </div>

          {/* Test Connection */}
          {formData.enabled && (
            <div>
              <Button
                onClick={handleTestConnection}
                disabled={testing || !formData.host || !formData.username}
                variant="outline"
                className="w-full"
              >
                {testing ? (
                  <>
                    <TestTube className="w-4 h-4 mr-2 animate-pulse" />
                    Testing Connection...
                  </>
                ) : (
                  <>
                    <TestTube className="w-4 h-4 mr-2" />
                    Test Connection
                  </>
                )}
              </Button>

              {testResult && (
                <Alert className={`mt-3 ${testResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                  {testResult.success ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <AlertDescription className={testResult.success ? 'text-green-900' : 'text-red-900'}>
                    {testResult.message}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Last Sync Info */}
          {formData.lastSync && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Last Sync:</span>
                <span className="text-sm text-blue-700">{new Date(formData.lastSync).toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            className="bg-[#D91C81] hover:bg-[#B01669] text-white"
          >
            Save Configuration
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}