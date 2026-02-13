import { useState } from 'react';
import { 
  Download, 
  Upload, 
  Settings, 
  Globe, 
  Building2, 
  LayoutDashboard,
  FileJson,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle,
  Info,
  RefreshCw,
  Eye,
  FileDown,
  FileUp,
  Loader2,
  ArrowDownToLine,
  ArrowUpFromLine,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import { Badge } from '../../components/ui/badge';
import { Separator } from '../../components/ui/separator';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Switch } from '../../components/ui/switch';
import { useSite } from '../../context/SiteContext';
import { 
  getGlobalConfig, 
  updateGlobalConfig,
  resetGlobalConfig,
  exportGlobalConfig,
  importGlobalConfig,
  GlobalConfig,
} from '../../config/globalConfig';
import {
  exportGlobalConfiguration,
  exportClientConfiguration,
  exportSiteConfiguration,
  exportFullConfiguration,
  downloadConfiguration,
  importConfiguration,
  parseImportData,
  processClientImport,
  processSiteImport,
  exportToCSV,
  downloadCSV,
  ImportResult,
} from '../../utils/configImportExport';
import buildEnv from '../../config/buildConfig';
import { toast } from 'sonner';

export function ImportExportSettings() {
  const { clients, sites, addClient, addSite, currentClient } = useSite();
  const [activeTab, setActiveTab] = useState('global');
  const [importData, setImportData] = useState('');
  const [validationResult, setValidationResult] = useState<ImportResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [generateNewIds, setGenerateNewIds] = useState(true);

  const globalConfig = getGlobalConfig();
  const envConfig = buildEnv.config;

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setImportData(content);
      setValidationResult(null);
    };
    reader.readAsText(file);
  };

  // Validate import data
  const handleValidate = () => {
    if (!importData.trim()) {
      toast.error('Please provide configuration data to validate');
      return;
    }

    setIsValidating(true);
    setTimeout(() => {
      const result = importConfiguration(importData, { validateOnly: true });
      setValidationResult(result);
      setIsValidating(false);

      if (result.success) {
        toast.success('Configuration is valid and ready to import');
      } else {
        toast.error('Configuration validation failed');
      }
    }, 500);
  };

  // Handle import
  const handleImport = () => {
    if (!importData.trim()) {
      toast.error('Please provide configuration data to import');
      return;
    }

    if (!validationResult?.success) {
      toast.error('Please validate the configuration first');
      return;
    }

    setIsImporting(true);

    setTimeout(() => {
      try {
        const data = parseImportData(importData);
        if (!data) {
          toast.error('Failed to parse configuration data');
          setIsImporting(false);
          return;
        }

        // Import global config
        if (data.data.global) {
          const result = importGlobalConfig(JSON.stringify(data.data.global));
          if (!result.success) {
            toast.error(`Global config import failed: ${result.error}`);
            setIsImporting(false);
            return;
          }
        }

        // Import clients
        const clientIdMap = new Map<string, string>();
        if (data.data.clients) {
          data.data.clients.forEach(client => {
            const processed = processClientImport(client, generateNewIds);
            if (generateNewIds) {
              clientIdMap.set(client.id, processed.id);
            }
            addClient(processed);
          });
        }

        // Import sites
        if (data.data.sites) {
          data.data.sites.forEach(site => {
            const newClientId = generateNewIds && clientIdMap.has(site.clientId)
              ? clientIdMap.get(site.clientId)!
              : site.clientId;
            const processed = processSiteImport(site, newClientId, generateNewIds);
            addSite(processed);
          });
        }

        toast.success('Configuration imported successfully!');
        setImportData('');
        setValidationResult(null);
      } catch (error) {
        toast.error('Import failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
      } finally {
        setIsImporting(false);
      }
    }, 1000);
  };

  // Export handlers
  const handleExportGlobal = () => {
    const json = exportGlobalConfiguration(globalConfig);
    const filename = `jala-global-config-${new Date().toISOString().split('T')[0]}.json`;
    downloadConfiguration(json, filename);
    toast.success('Global configuration exported');
  };

  const handleExportClient = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (!client) return;

    const json = exportClientConfiguration(client, sites);
    const filename = `jala-client-${client.name.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`;
    downloadConfiguration(json, filename);
    toast.success(`Client "${client.name}" configuration exported`);
  };

  const handleExportSite = (siteId: string) => {
    const site = sites.find(s => s.id === siteId);
    if (!site) return;

    const json = exportSiteConfiguration(site);
    const filename = `jala-site-${site.name.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`;
    downloadConfiguration(json, filename);
    toast.success(`Site "${site.name}" configuration exported`);
  };

  const handleExportFull = () => {
    const json = exportFullConfiguration(globalConfig, clients, sites);
    const filename = `jala-full-config-${new Date().toISOString().split('T')[0]}.json`;
    downloadConfiguration(json, filename);
    toast.success('Full configuration exported');
  };

  const handleExportClientsCSV = () => {
    const csv = exportToCSV(clients, 'client');
    const filename = `jala-clients-${new Date().toISOString().split('T')[0]}.csv`;
    downloadCSV(csv, filename);
    toast.success('Clients exported to CSV');
  };

  const handleExportSitesCSV = () => {
    const csv = exportToCSV(sites, 'site');
    const filename = `jala-sites-${new Date().toISOString().split('T')[0]}.csv`;
    downloadCSV(csv, filename);
    toast.success('Sites exported to CSV');
  };

  const handleResetGlobalConfig = () => {
    if (confirm('Are you sure you want to reset the global configuration to defaults? This cannot be undone.')) {
      resetGlobalConfig();
      toast.success('Global configuration reset to defaults');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Import/Export Settings</h1>
        <p className="text-muted-foreground mt-2">
          Import and export configurations for global settings, clients, and sites
        </p>
      </div>

      {/* Environment Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Environment Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">Environment</Label>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={buildEnv.isProduction ? 'destructive' : buildEnv.isStaging ? 'default' : 'secondary'}>
                  {buildEnv.current.toUpperCase()}
                </Badge>
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">API Base URL</Label>
              <p className="text-sm font-mono mt-1">{envConfig.apiBaseUrl}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Version</Label>
              <p className="text-sm mt-1">{globalConfig.version}</p>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Debug Logging</Label>
              <Badge variant={envConfig.enableDebugLogging ? 'default' : 'secondary'}>
                {envConfig.enableDebugLogging ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Analytics</Label>
              <Badge variant={envConfig.enableAnalytics ? 'default' : 'secondary'}>
                {envConfig.enableAnalytics ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Error Reporting</Label>
              <Badge variant={envConfig.enableErrorReporting ? 'default' : 'secondary'}>
                {envConfig.enableErrorReporting ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Session Timeout</Label>
              <p className="text-sm">{envConfig.sessionTimeout}m</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="global">
            <Settings className="h-4 w-4 mr-2" />
            Global Config
          </TabsTrigger>
          <TabsTrigger value="export">
            <ArrowDownToLine className="h-4 w-4 mr-2" />
            Export
          </TabsTrigger>
          <TabsTrigger value="import">
            <ArrowUpFromLine className="h-4 w-4 mr-2" />
            Import
          </TabsTrigger>
        </TabsList>

        {/* Global Configuration Tab */}
        <TabsContent value="global" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Global Configuration</CardTitle>
              <CardDescription>
                Application-wide settings that apply across all clients and sites
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Application Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Application Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Application Name</Label>
                    <p className="text-sm mt-1">{globalConfig.applicationName}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Support Email</Label>
                    <p className="text-sm mt-1">{globalConfig.supportEmail}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Features */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Features</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(globalConfig.features).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <Label className="text-xs capitalize">
                        {key.replace(/^enable/, '').replace(/([A-Z])/g, ' $1').trim()}
                      </Label>
                      <Badge variant={value ? 'default' : 'secondary'}>
                        {value ? 'On' : 'Off'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Security */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Security Settings</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Password Min Length</Label>
                    <p className="text-sm mt-1">{globalConfig.security.passwordMinLength}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Session Timeout</Label>
                    <p className="text-sm mt-1">{globalConfig.security.sessionTimeout}m</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Max Login Attempts</Label>
                    <p className="text-sm mt-1">{globalConfig.security.maxLoginAttempts}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Actions */}
              <div className="flex items-center gap-4">
                <Button onClick={handleExportGlobal}>
                  <FileDown className="h-4 w-4 mr-2" />
                  Export Global Config
                </Button>
                <Button variant="outline" onClick={handleResetGlobalConfig}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset to Defaults
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Export Tab */}
        <TabsContent value="export" className="space-y-4">
          {/* Full Export */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileJson className="h-5 w-5" />
                Full Configuration Export
              </CardTitle>
              <CardDescription>
                Export all configurations (global, clients, and sites) in one file
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleExportFull} size="lg" className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Export Full Configuration
              </Button>
            </CardContent>
          </Card>

          {/* Client Export */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Client Configurations
              </CardTitle>
              <CardDescription>
                Export individual client configurations (includes associated sites)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Button onClick={handleExportClientsCSV} variant="outline">
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Export All Clients (CSV)
                </Button>
              </div>

              <Separator />

              <div className="space-y-2">
                {clients.map(client => (
                  <div key={client.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{client.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {sites.filter(s => s.clientId === client.id).length} sites
                      </p>
                    </div>
                    <Button onClick={() => handleExportClient(client.id)} size="sm">
                      <Download className="h-3 w-3 mr-2" />
                      Export
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Site Export */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LayoutDashboard className="h-5 w-5" />
                Site Configurations
              </CardTitle>
              <CardDescription>
                Export individual site configurations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Button onClick={handleExportSitesCSV} variant="outline">
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Export All Sites (CSV)
                </Button>
              </div>

              <Separator />

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {sites.map(site => {
                  const client = clients.find(c => c.id === site.clientId);
                  return (
                    <div key={site.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{site.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {client?.name} • {site.domain}
                        </p>
                      </div>
                      <Button onClick={() => handleExportSite(site.id)} size="sm">
                        <Download className="h-3 w-3 mr-2" />
                        Export
                      </Button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Import Tab */}
        <TabsContent value="import" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Import Configuration
              </CardTitle>
              <CardDescription>
                Import configurations from JSON files
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* File Upload */}
              <div className="space-y-4">
                <Label htmlFor="config-file">Upload Configuration File</Label>
                <input
                  id="config-file"
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                />
              </div>

              <Separator />

              {/* Manual Input */}
              <div className="space-y-4">
                <Label htmlFor="config-json">Or Paste Configuration JSON</Label>
                <Textarea
                  id="config-json"
                  value={importData}
                  onChange={(e) => setImportData(e.target.value)}
                  placeholder="Paste your configuration JSON here..."
                  className="font-mono text-xs h-48"
                />
              </div>

              {/* Options */}
              <div className="flex items-center space-x-2">
                <Switch
                  id="generate-ids"
                  checked={generateNewIds}
                  onCheckedChange={setGenerateNewIds}
                />
                <Label htmlFor="generate-ids" className="text-sm">
                  Generate new IDs (recommended to avoid conflicts)
                </Label>
              </div>

              {/* Validation Result */}
              {validationResult && (
                <Alert variant={validationResult.success ? 'default' : 'destructive'}>
                  {validationResult.success ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <AlertTitle>
                    {validationResult.success ? 'Validation Successful' : 'Validation Failed'}
                  </AlertTitle>
                  <AlertDescription className="space-y-2">
                    <p>{validationResult.message}</p>
                    {validationResult.imported && (
                      <div className="text-xs space-y-1">
                        {validationResult.imported.global && <p>✓ Global configuration found</p>}
                        {!!validationResult.imported.clientsCount && (
                          <p>✓ {validationResult.imported.clientsCount} client(s) found</p>
                        )}
                        {!!validationResult.imported.sitesCount && (
                          <p>✓ {validationResult.imported.sitesCount} site(s) found</p>
                        )}
                      </div>
                    )}
                    {validationResult.errors && validationResult.errors.length > 0 && (
                      <ul className="text-xs space-y-1 mt-2">
                        {validationResult.errors.map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))}
                      </ul>
                    )}
                    {validationResult.warnings && validationResult.warnings.length > 0 && (
                      <div className="text-xs space-y-1 mt-2 text-yellow-600">
                        {validationResult.warnings.map((warning, index) => (
                          <p key={index}>⚠ {warning}</p>
                        ))}
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              {/* Actions */}
              <div className="flex items-center gap-4">
                <Button
                  onClick={handleValidate}
                  variant="outline"
                  disabled={!importData.trim() || isValidating}
                >
                  {isValidating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Validating...
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Validate
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleImport}
                  disabled={!validationResult?.success || isImporting}
                >
                  {isImporting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <FileUp className="h-4 w-4 mr-2" />
                      Import Configuration
                    </>
                  )}
                </Button>
              </div>

              {/* Info Alert */}
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Import Guidelines</AlertTitle>
                <AlertDescription className="text-xs space-y-1">
                  <p>• Always validate before importing</p>
                  <p>• Generate new IDs to avoid conflicts with existing data</p>
                  <p>• Back up existing configuration before importing</p>
                  <p>• Global config will overwrite current global settings</p>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
