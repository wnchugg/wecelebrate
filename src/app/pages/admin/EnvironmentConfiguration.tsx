import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  AlertCircle, 
  CheckCircle, 
  Copy, 
  Database, 
  Edit2, 
  Eye, 
  EyeOff, 
  Plus, 
  RefreshCw, 
  Save, 
  Trash2, 
  X 
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '../../components/ui/dialog';
import { logger } from '../../utils/logger';
import { apiRequest } from '../../utils/api';
import { SetupWizard } from '../../components/SetupWizard';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog';

interface EnvironmentConfig {
  id: string;
  name: string;
  label: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  description: string;
  color: string;
  badge: string;
  isDefault?: boolean;
  status?: 'active' | 'inactive' | 'testing';
  lastTested?: string;
  createdAt: string;
  updatedAt: string;
}

const DEFAULT_ENVIRONMENTS = [
  {
    id: 'development',
    name: 'Development',
    label: 'DEV',
    color: '#10B981',
    badge: 'bg-green-100 text-green-800 border-green-300',
    description: 'Development environment for testing new features',
    isDefault: true,
  },
  {
    id: 'production',
    name: 'Production',
    label: 'PROD',
    color: '#EF4444',
    badge: 'bg-red-100 text-red-800 border-red-300',
    description: 'Production environment - live data',
    isDefault: false,
  },
];

export function EnvironmentConfiguration() {
  const [environments, setEnvironments] = useState<EnvironmentConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingEnv, setEditingEnv] = useState<EnvironmentConfig | null>(null);
  const [deletingEnv, setDeletingEnv] = useState<EnvironmentConfig | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [testingEnvId, setTestingEnvId] = useState<string | null>(null);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    label: '',
    supabaseUrl: '',
    supabaseAnonKey: '',
    description: '',
    color: '#10B981',
  });

  useEffect(() => {
    loadEnvironments();
  }, []);

  const loadEnvironments = async () => {
    try {
      setLoading(true);
      
      const response = await apiRequest<{ environments: EnvironmentConfig[] }>('/config/environments', {
        method: 'GET',
      });

      if (response.environments && response.environments.length > 0) {
        setEnvironments(response.environments);
      } else {
        // Initialize with default environments if none exist
        await initializeDefaultEnvironments();
      }
    } catch (error: unknown) {
      logger.warn('[Environment Config] Could not load environments from backend:', error instanceof Error ? error.message : 'Unknown error');
      // Continue to create defaults locally
    } finally {
      setLoading(false);
    }
  };

  const initializeDefaultEnvironments = async () => {
    // First, try to load existing environments from backend
    try {
      const response = await apiRequest<{ environments: EnvironmentConfig[] }>('/config/environments', {
        method: 'GET',
      });
      
      if (response.environments && response.environments.length > 0) {
        setEnvironments(response.environments);
        return; // Successfully loaded from backend, we're done
      }
    } catch (error: unknown) {
      console.warn('[Environment Config] Could not load environments from backend:', error instanceof Error ? error.message : 'Unknown error');
      // Continue to create defaults locally
    }
    
    // No environments exist on backend, create local defaults
    const defaultEnvs = DEFAULT_ENVIRONMENTS.map(env => ({
      ...env,
      supabaseUrl: '',
      supabaseAnonKey: '',
      status: 'inactive' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    // Display them immediately (local only, not saved to backend yet)
    setEnvironments(defaultEnvs);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.supabaseUrl || !formData.supabaseAnonKey) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate Supabase URL format
    if (!formData.supabaseUrl.match(/^https:\/\/[a-z0-9]+\.supabase\.co$/)) {
      toast.error('Invalid Supabase URL format. Should be: https://[project-id].supabase.co');
      return;
    }

    try {
      const envId = editingEnv?.id || formData.name.toLowerCase().replace(/\s+/g, '-');
      
      const envData = {
        ...formData,
        id: envId,
        badge: (formData as any).badge || `bg-green-100 text-green-800 border-green-300`,
        status: editingEnv?.status || ('inactive' as const),
        isDefault: editingEnv?.isDefault || false,
        createdAt: editingEnv?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // For editing existing environments that exist in the backend, use PUT
      // For new environments or local-only defaults, use POST
      let method = 'POST';
      const endpoint = '/config/environments';
      
      if (editingEnv) {
        // Check if this environment exists in backend by trying to update it
        // If it doesn't exist (404), we'll catch and create it with POST instead
        method = 'PUT';
      }

      try {
        const response: any = await apiRequest(endpoint, {
          method,
          body: JSON.stringify(envData),
        });

        if (response.success) {
          toast.success(editingEnv ? 'Environment updated successfully' : 'Environment created successfully');
          setShowDialog(false);
          setEditingEnv(null);
          resetForm();
          loadEnvironments();
        } else {
          toast.error(response.error || 'Failed to save environment');
        }
      } catch (saveError: unknown) {
        logger.error('[Environment Config] Save error:', saveError);
        
        // If PUT failed with 404, the environment doesn't exist in backend yet
        // Try creating it with POST instead
        if (method === 'PUT' && (saveError instanceof Error) && saveError.message?.includes('Environment not found')) {
          // Environment not found in backend, creating with POST
          
          const createResponse = await apiRequest<{ success?: boolean; error?: string }>('/config/environments', {
            method: 'POST',
            body: JSON.stringify(envData),
          });

          if (createResponse.success) {
            toast.success('Environment created successfully');
            setShowDialog(false);
            setEditingEnv(null);
            resetForm();
            loadEnvironments();
          } else {
            throw new Error(createResponse.error || 'Failed to create environment');
          }
        } else {
          throw saveError;
        }
      }
    } catch (error: unknown) {
      logger.error('[Environment Config] Failed to save environment:', error);
      
      // Show specific error message from backend
      const errorMessage = (error instanceof Error ? error.message : null) || 'Failed to save environment configuration';
      toast.error(errorMessage);
    }
  };

  const handleDelete = async () => {
    if (!deletingEnv) return;

    if (deletingEnv.isDefault) {
      toast.error('Cannot delete default environments');
      return;
    }

    try {
      const response = await apiRequest(`/config/environments/${deletingEnv.id}`, {
        method: 'DELETE',
      }) as any;

      if (response.success) {
        toast.success('Environment deleted successfully');
        setDeletingEnv(null);
        loadEnvironments();
      }
    } catch (error) {
      logger.error('Failed to delete environment:', error);
      toast.error('Failed to delete environment');
    }
  };

  const testConnection = async (env: EnvironmentConfig) => {
    // Validate environment configuration
    if (!env.supabaseUrl || !env.supabaseAnonKey) {
      toast.error('Please configure Supabase URL and Anon Key first');
      return;
    }

    // Validate URL format
    if (!env.supabaseUrl.startsWith('https://') || !env.supabaseUrl.includes('.supabase.co')) {
      toast.error('Invalid Supabase URL format. Must be https://YOUR_PROJECT.supabase.co');
      return;
    }

    setTestingEnvId(env.id);

    try {
      const healthUrl = `${env.supabaseUrl}/functions/v1/make-server-6fcaeea3/health`;
      
      // Create an AbortController with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      try {
        const response = await fetch(healthUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${env.supabaseAnonKey}`,
            'Content-Type': 'application/json',
          },
          mode: 'cors',
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          
          if (data.status === 'ok') {
            toast.success(`${env.name} environment is online!`);
            
            // Update environment status
            await apiRequest(`/config/environments/${env.id}/status`, {
              method: 'PATCH',
              body: JSON.stringify({ 
                status: 'active',
                lastTested: new Date().toISOString(),
              }),
            });
            
            loadEnvironments();
          } else {
            toast.error(`${env.name} returned unexpected response: ${JSON.stringify(data)}`);
          }
        } else {
          const errorText = await response.text();
          logger.warn('[Connection Check] Non-OK response:', response.status, errorText);
          
          if (response.status === 404) {
            toast.error(
              `${env.name} Edge Function not found. ` +
              `Please deploy with: ./scripts/deploy-to-environment.sh ${env.id === 'production' ? 'prod' : 'dev'}`
            );
          } else if (response.status === 401 || response.status === 403) {
            toast.error(`${env.name} authentication failed. Check your Anon Key.`);
          } else {
            toast.error(`${env.name} health check failed: ${response.status} - ${errorText}`);
          }
        }
      } catch (fetchError: unknown) {
        clearTimeout(timeoutId);
        
        if (fetchError instanceof DOMException && fetchError.name === 'AbortError') {
          logger.warn('[Connection Check] Timeout after 10 seconds');
          toast.error(
            `${env.name} connection timeout. ` +
            `The backend may not be deployed or is taking too long to respond.`
          );
        } else {
          throw fetchError;
        }
      }
    } catch (error: unknown) {
      // Don't log as error if it's just a "backend not deployed" scenario (expected)
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        logger.info(`[Connection Check] ℹ️ ${env.name} not reachable - Backend may not be deployed yet (expected)`);
        toast.error(
          `❌ Cannot reach ${env.name} backend - Edge Function not deployed`,
          { duration: 10000 }
        );
        
        // Show detailed steps in a separate toast
        setTimeout(() => {
          toast.info(
            `To fix: Run deployment script in terminal:\\n./scripts/deploy-to-environment.sh ${env.id === 'production' ? 'prod' : 'dev'}`,
            { duration: 15000 }
          );
        }, 500);
      } else {
        // Only log as error for unexpected errors
        logger.error('[Connection Check] Unexpected error:', error);
        
        const errMsg = error instanceof Error ? error.message : 'Unknown error';
        if (errMsg.includes('CORS')) {
          toast.error(
            `❌ CORS error: Check ALLOWED_ORIGINS in Supabase secrets`,
            { duration: 8000 }
          );
        } else {
          toast.error(
            `❌ ${env.name} connection failed: ${errMsg}`,
            { duration: 8000 }
          );
        }
      }
    } finally {
      setTestingEnvId(null);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const openEditDialog = (env: EnvironmentConfig) => {
    setEditingEnv(env);
    setFormData({
      name: env.name,
      label: env.label,
      supabaseUrl: env.supabaseUrl,
      supabaseAnonKey: env.supabaseAnonKey,
      description: env.description,
      color: env.color,
    });
    setShowDialog(true);
  };

  const openCreateDialog = () => {
    setEditingEnv(null);
    resetForm();
    setShowDialog(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      label: '',
      supabaseUrl: '',
      supabaseAnonKey: '',
      description: '',
      color: '#10B981',
    });
  };

  const toggleShowKey = (envId: string) => {
    setShowKeys(prev => ({ ...prev, [envId]: !prev[envId] }));
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'testing':
        return <Badge className="bg-yellow-100 text-yellow-800">Testing</Badge>;
      case 'inactive':
      default:
        return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D91C81]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Environment Configuration</h2>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Manage Supabase backend environments for Development and Production
          </p>
        </div>
        <Button
          onClick={openCreateDialog}
          className="bg-gradient-to-r from-[#D91C81] to-[#B71569] text-white w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Environment
        </Button>
      </div>

      {/* Information Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-900">
              <p className="font-semibold mb-1">About Environment Configuration</p>
              <p className="mb-2">
                Configure separate Supabase projects for different deployment environments. Each environment
                should point to a different Supabase project to ensure data isolation.
              </p>
              <ul className="list-disc list-inside space-y-1 text-blue-800">
                <li><strong>Development:</strong> For testing and development (required)</li>
                <li><strong>Production:</strong> For live production data (required)</li>
                <li><strong>Test/UAT:</strong> Optional additional environments</li>
              </ul>
              <p className="mt-3 text-xs font-semibold text-blue-900">
                💡 Tip: The default environments below use your current Supabase project. 
                Edit them to configure separate projects for Dev and Production.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Troubleshooting Banner - Show if any environment is not configured */}
      {environments.some(env => !env.supabaseUrl || !env.supabaseAnonKey) && (
        <>
          {/* Setup Wizard for first-time users */}
          <SetupWizard />
          
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-yellow-900">
                  <p className="font-semibold mb-1">⚠️ Environments Not Configured</p>
                  <p className="mb-2">
                    Before you can test connections, you need to:
                  </p>
                  <ol className="list-decimal list-inside space-y-1 text-yellow-800 mb-3">
                    <li><strong>Create Supabase projects</strong> for Dev and Production</li>
                    <li><strong>Deploy the Edge Function</strong> to each project</li>
                    <li><strong>Add credentials</strong> to each environment below</li>
                    <li><strong>Test connections</strong> to verify they work</li>
                  </ol>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="font-semibold">📚 Need help?</span>
                    <a 
                      href="/docs/OPTION_B_START_HERE.md" 
                      target="_blank"
                      className="text-yellow-800 underline hover:text-yellow-900"
                    >
                      View Deployment Guide
                    </a>
                    <span>•</span>
                    <a 
                      href="/docs/FAILED_TO_FETCH_TROUBLESHOOTING.md" 
                      target="_blank"
                      className="text-yellow-800 underline hover:text-yellow-900"
                    >
                      Troubleshooting "Failed to Fetch"
                    </a>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Environments Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {environments.map((env) => {
          const hasCredentials = env.supabaseUrl && env.supabaseAnonKey;
          const isShowingKey = showKeys[env.id];

          return (
            <Card key={env.id} className="relative">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-xl">{env.name}</CardTitle>
                      <Badge 
                        className={env.badge}
                        style={{ backgroundColor: `${env.color}20`, color: env.color }}
                      >
                        {env.label}
                      </Badge>
                      {getStatusBadge(env.status)}
                    </div>
                    <CardDescription>{env.description}</CardDescription>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(env)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    {!env.isDefault && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeletingEnv(env)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {hasCredentials ? (
                  <>
                    {/* Supabase URL */}
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-gray-700">Supabase URL</Label>
                      <div className="flex items-center gap-2">
                        <Input 
                          value={env.supabaseUrl} 
                          readOnly 
                          className="bg-gray-50 text-sm font-mono"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(env.supabaseUrl, 'URL')}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Anon Key */}
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-gray-700">Anon Key</Label>
                      <div className="flex items-center gap-2">
                        <Input 
                          type={isShowingKey ? "text" : "password"}
                          value={env.supabaseAnonKey} 
                          readOnly 
                          className="bg-gray-50 text-sm font-mono"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleShowKey(env.id)}
                        >
                          {isShowingKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(env.supabaseAnonKey, 'Anon Key')}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Last Tested */}
                    {env.lastTested && (
                      <div className="text-xs text-gray-500">
                        Last tested: {new Date(env.lastTested).toLocaleString()}
                      </div>
                    )}

                    {/* Test Connection Button */}
                    <Button
                      onClick={() => testConnection(env)}
                      disabled={testingEnvId === env.id}
                      className="w-full"
                      variant="outline"
                    >
                      {testingEnvId === env.id ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Testing Connection...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Test Connection
                        </>
                      )}
                    </Button>
                  </>
                ) : (
                  <div className="py-8 text-center">
                    <Database className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm font-medium text-gray-600 mb-1">Not Configured</p>
                    <p className="text-xs text-gray-500 mb-4">
                      Add Supabase credentials to activate this environment
                    </p>
                    <Button
                      onClick={() => openEditDialog(env)}
                      variant="outline"
                      size="sm"
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      Configure Now
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingEnv ? `Edit ${editingEnv.name}` : 'Create New Environment'}
            </DialogTitle>
            <DialogDescription>
              Configure Supabase connection details for this environment
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Environment Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Development"
                  disabled={editingEnv?.isDefault}
                />
              </div>

              <div>
                <Label htmlFor="label">Label (Badge) *</Label>
                <Input
                  id="label"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  placeholder="e.g., DEV"
                  disabled={editingEnv?.isDefault}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of this environment"
              />
            </div>

            <div>
              <Label htmlFor="color">Badge Color</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="color"
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-20 h-10"
                />
                <span className="text-sm text-gray-600">{formData.color}</span>
              </div>
            </div>

            <div className="border-t pt-4 mt-4">
              <h4 className="font-semibold text-sm mb-4">Supabase Configuration</h4>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="supabaseUrl">Supabase Project URL *</Label>
                  <Input
                    id="supabaseUrl"
                    value={formData.supabaseUrl}
                    onChange={(e) => setFormData({ ...formData, supabaseUrl: e.target.value })}
                    placeholder="https://[project-id].supabase.co"
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500">
                    Find this in Supabase Dashboard → Settings → API
                  </p>
                </div>

                <div>
                  <Label htmlFor="supabaseAnonKey">Anon (Public) Key *</Label>
                  <Input
                    id="supabaseAnonKey"
                    value={formData.supabaseAnonKey}
                    onChange={(e) => setFormData({ ...formData, supabaseAnonKey: e.target.value })}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500">
                    This is the public "anon" key, safe to use in frontend
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              className="bg-gradient-to-r from-[#D91C81] to-[#B71569] text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              {editingEnv ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingEnv} onOpenChange={() => setDeletingEnv(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Environment?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the <strong>{deletingEnv?.name}</strong> environment?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default EnvironmentConfiguration;