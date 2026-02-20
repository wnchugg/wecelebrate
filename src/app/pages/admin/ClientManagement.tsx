import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Building2, CheckCircle, XCircle, Globe, Mail, Phone, MapPin, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router';
import { apiRequest, getAccessToken } from '../../utils/api';
import { showErrorToast, showSuccessToast } from '../../utils/errorHandling';
import { useAdmin } from '../../context/AdminContext';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import type { Client as ApiClient } from '../../types/api.types';
import { ClientModal } from './ClientModal';

// ===== Validation Utilities =====

/**
 * Validates email format
 * Requirements: 4.1, 4.2, 4.3, 4.4
 */
export function validateEmail(email: string): { valid: boolean; error?: string } {
  if (!email || email.trim() === '') {
    return { valid: true }; // Empty is valid for optional fields
  }
  
  // More permissive regex that accepts special characters in local part per RFC 5322
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Please enter a valid email address' };
  }
  
  return { valid: true };
}

/**
 * Validates phone format
 * Accepts digits, spaces, hyphens, parentheses, and plus sign
 */
export function validatePhone(phone: string): { valid: boolean; error?: string } {
  if (!phone || phone.trim() === '') {
    return { valid: true }; // Empty is valid for optional fields
  }
  
  const phoneRegex = /^[\d\s\-()+]+$/;
  if (!phoneRegex.test(phone)) {
    return { valid: false, error: 'Please enter a valid phone number' };
  }
  
  // Check minimum length (at least 7 digits)
  const digitCount = phone.replace(/\D/g, '').length;
  if (digitCount < 7) {
    return { valid: false, error: 'Phone number must contain at least 7 digits' };
  }
  
  return { valid: true };
}

/**
 * Validates URL format
 * Must start with http:// or https://
 */
export function validateUrl(url: string): { valid: boolean; error?: string } {
  if (!url || url.trim() === '') {
    return { valid: true }; // Empty is valid for optional fields
  }
  
  try {
    const urlObj = new URL(url);
    if (!urlObj.protocol.startsWith('http')) {
      return { valid: false, error: 'Please enter a valid URL (must start with http:// or https://)' };
    }
    return { valid: true };
  } catch {
    return { valid: false, error: 'Please enter a valid URL (must start with http:// or https://)' };
  }
}

/**
 * Validates required fields
 * Checks that the field is not empty
 */
export function validateRequired(value: string | undefined | null, fieldName: string): { valid: boolean; error?: string } {
  if (!value || value.trim() === '') {
    return { valid: false, error: `${fieldName} is required` };
  }
  
  return { valid: true };
}

// Use the API Client type with additional UI fields
interface Client extends ApiClient {
  isActive?: boolean; // Legacy field for backward compatibility (optional)
  description?: string;
  contactPhone?: string;
  address?: string;
}

interface Site {
  id: string;
  name: string;
  clientId: string;
  status: string;
}

// Helper function to generate client URL using slug or ID
function getClientUrl(client: Client): string {
  return `/admin/clients/${client.clientCode || client.id}`;
}

export function ClientManagement() {
  const navigate = useNavigate();
  const { isAdminAuthenticated, isLoading: isAuthLoading } = useAdmin();
  const [clients, setClients] = useState<Client[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showClientModal, setShowClientModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  useEffect(() => {
    // Only load data if:
    // 1. Auth check is complete (not loading)
    // 2. User is authenticated
    if (!isAuthLoading && isAdminAuthenticated) {
      loadData();
    } else if (!isAuthLoading && !isAdminAuthenticated) {
      // Auth check complete but not authenticated - don't load data
      setIsLoading(false);
    }
  }, [isAdminAuthenticated, isAuthLoading]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      console.warn('[ClientManagement] Loading data...');
      console.warn('[ClientManagement] Current environment:', localStorage.getItem('deployment_environment') || 'development');
      
      const [clientsRes, sitesRes] = await Promise.all([
        apiRequest<{ success: boolean; data: Client[] }>('/v2/clients'),
        apiRequest<{ success: boolean; data: Site[] }>('/v2/sites')
      ]);
      
      console.warn('[ClientManagement] Clients response:', clientsRes);
      console.warn('[ClientManagement] Sites response:', sitesRes);
      console.warn('[ClientManagement] Clients count:', clientsRes.data?.length || 0);
      console.warn('[ClientManagement] Sites count:', sitesRes.data?.length || 0);
      
      setClients(clientsRes.data || []);
      setSites(sitesRes.data || []);
    } catch (error: unknown) {
      console.error('[ClientManagement] Load error:', error);
      
      // Handle network errors gracefully
      // Requirements: 4.6, 6.6, 7.6
      const hasStatus = typeof error === 'object' && error !== null && ('code' in error || 'status' in error);
      const errorCode = hasStatus && 'code' in error ? (error as { code: number }).code : undefined;
      const errorStatus = hasStatus && 'status' in error ? (error as { status: number }).status : undefined;
      
      // Don't show error toast for 401 errors (not authenticated)
      // The AdminLayoutWrapper will redirect to login
      if (errorCode !== 401 && errorStatus !== 401) {
        // Check if it's a network error
        if (error instanceof TypeError && error.message.includes('fetch')) {
          showErrorToast('Network error: Unable to connect to the server. Please check your connection and try again.');
        } else if (error && typeof error === 'object' && 'error' in error) {
          // Handle structured error response
          const structuredError = error.error as { code?: string; message?: string };
          showErrorToast(structuredError.message || 'Failed to load data');
        } else {
          showErrorToast(error, { operation: 'load data' });
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getSitesByClient = (clientId: string) => {
    return sites.filter(site => site.clientId === clientId);
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         client.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Check status field first, fallback to isActive for backward compatibility
    const isClientActive = client.status === 'active' || (client.status === undefined && client.isActive);
    
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'active' && isClientActive) ||
                         (filterStatus === 'inactive' && !isClientActive);
    return matchesSearch && matchesFilter;
  });

  const handleAddClient = () => {
    setEditingClient(null);
    setShowClientModal(true);
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setShowClientModal(true);
  };

  const handleDeleteClient = async (clientId: string, clientName: string) => {
    const clientSites = getSitesByClient(clientId);
    if (clientSites.length > 0) {
      showErrorToast(
        new Error('Cannot delete client with active sites. Please delete or reassign all sites first.'),
        { action: 'delete_client', clientId }
      );
      return;
    }
    
    if (!confirm(`Are you sure you want to delete "${clientName}"? This action cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      await apiRequest(`/v2/clients/${clientId}`, { method: 'DELETE' });
      showSuccessToast('Client deleted successfully');
      loadData();
    } catch (error: unknown) {
      showErrorToast('Failed to delete client', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveClient = async (clientData: Partial<Client>) => {
    try {
      if (editingClient) {
        // Update existing client - send only changed fields
        // Filter out undefined/null values but keep empty strings and false booleans
        const changedFields = Object.entries(clientData).reduce((acc, [key, value]) => {
          if (value !== undefined && value !== null) {
            acc[key] = value;
          }
          return acc;
        }, {} as Record<string, any>);
        
        await apiRequest(`/v2/clients/${editingClient.id}`, {
          method: 'PUT',
          body: JSON.stringify(changedFields)
        });
        showSuccessToast('Client updated successfully');
      } else {
        // Create new client - send all populated fields
        // Filter out undefined/null values but keep empty strings and false booleans
        const populatedFields = Object.entries(clientData).reduce((acc, [key, value]) => {
          if (value !== undefined && value !== null) {
            acc[key] = value;
          }
          return acc;
        }, {} as Record<string, any>);
        
        await apiRequest('/v2/clients', {
          method: 'POST',
          body: JSON.stringify(populatedFields)
        });
        showSuccessToast('Client created successfully');
      }
      setShowClientModal(false);
      loadData();
    } catch (error: unknown) {
      // Handle structured error responses from backend
      // Requirements: 4.6, 6.6, 7.6
      if (error && typeof error === 'object') {
        // Check for structured error response with error object
        if ('error' in error && typeof error.error === 'object' && error.error !== null) {
          const structuredError = error.error as { code?: string; message?: string; field?: string; details?: any };
          
          // Build user-friendly error message
          let errorMessage = structuredError.message || 'An error occurred';
          
          if (structuredError.field) {
            errorMessage = `${structuredError.field}: ${errorMessage}`;
          }
          
          // Add error code for debugging if available
          if (structuredError.code) {
            console.error(`[ClientManagement] API Error Code: ${structuredError.code}`, structuredError.details);
          }
          
          showErrorToast(errorMessage);
        } 
        // Fallback for legacy error format
        else if ('error' in error && typeof error.error === 'string') {
          const apiError = error as { error: string; message?: string; field?: string };
          const errorMessage = apiError.field 
            ? `${apiError.field}: ${apiError.message || apiError.error}`
            : apiError.message || apiError.error;
          showErrorToast(errorMessage);
        }
        // Handle network errors
        else if ('message' in error && typeof error.message === 'string') {
          showErrorToast(
            editingClient ? 'Failed to update client' : 'Failed to create client',
            error.message
          );
        }
        else {
          showErrorToast(
            editingClient ? 'Failed to update client' : 'Failed to create client',
            'Unknown error'
          );
        }
      } else {
        showErrorToast(
          editingClient ? 'Failed to update client' : 'Failed to create client',
          error instanceof Error ? error.message : 'Unknown error'
        );
      }
    }
  };

  const handleViewClientSites = (clientId: string) => {
    navigate(`/admin/sites?client=${clientId}`);
  };

  const handleSeedDatabase = async () => {
    setIsSeeding(true);
    try {
      const baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-6fcaeea3`;
      const accessToken = getAccessToken();
      
      if (!accessToken) {
        showErrorToast('You must be logged in to seed the database');
        return;
      }

      const response = await fetch(`${baseUrl}/dev/reseed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Access-Token': accessToken,
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        showSuccessToast('Database seeded successfully! Reloading data...');
        await loadData(); // Reload the data
      } else {
        showErrorToast(data.error || 'Failed to seed database');
      }
    } catch (error: unknown) {
      showErrorToast('Failed to seed database', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsSeeding(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D91C81] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading clients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Client Management</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Manage your clients and their site configurations</p>
        </div>
        <Button
          onClick={handleAddClient}
          className="bg-[#D91C81] hover:bg-[#B01669] text-white w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Client
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <Building2 className="w-8 h-8 text-[#D91C81]" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{clients.length}</p>
          <p className="text-sm text-gray-600">Total Clients</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {clients.filter(c => c.status === 'active' || (c.status === undefined && c.isActive)).length}
          </p>
          <p className="text-sm text-gray-600">Active Clients</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <Globe className="w-8 h-8 text-[#00B4CC]" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{sites.length}</p>
          <p className="text-sm text-gray-600">Total Sites</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <XCircle className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {clients.filter(c => c.status === 'inactive' || (c.status === undefined && !c.isActive)).length}
          </p>
          <p className="text-sm text-gray-600">Inactive Clients</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Search Clients
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Filter by Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
            >
              <option value="all">All Clients</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Clients List */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">
            All Clients ({filteredClients.length})
          </h2>
        </div>

        {filteredClients.length === 0 ? (
          <div className="text-center py-12 px-6">
            {clients.length === 0 && !searchQuery && filterStatus === 'all' ? (
              // No data at all - show initialize database option
              <>
                <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
                <p className="text-xl font-semibold text-gray-900 mb-2">No Clients Found</p>
                <p className="text-gray-600 mb-6">
                  It looks like your database is empty. Initialize the database with demo data to get started.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                  <Button
                    onClick={handleSeedDatabase}
                    disabled={isSeeding}
                    className="bg-amber-500 hover:bg-amber-600 text-white"
                  >
                    {isSeeding ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Initializing Database...
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 mr-2" />
                        Initialize Database with Demo Data
                      </>
                    )}
                  </Button>
                  <span className="text-gray-400">or</span>
                  <Button
                    onClick={handleAddClient}
                    className="bg-[#D91C81] hover:bg-[#B01669] text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Client Manually
                  </Button>
                </div>
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-2xl mx-auto text-left">
                  <p className="text-sm text-blue-900 font-semibold mb-2">💡 What will happen when you initialize?</p>
                  <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                    <li>Creates 3 demo clients (Acme Corp, Global Enterprises, Tech Innovations)</li>
                    <li>Sets up 6 demo sites with different configurations</li>
                    <li>Adds sample products and gift catalogs</li>
                    <li>All demo data can be edited or deleted later</li>
                  </ul>
                </div>
              </>
            ) : (
              // Filtered/searched but found nothing
              <>
                <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 mb-2">No clients found</p>
                <p className="text-sm text-gray-500 mb-4">
                  Try adjusting your filters or search query
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredClients.map(client => {
              const clientSites = getSitesByClient(client.id);
              const activeSites = clientSites.filter(s => s.status === 'active');
              
              return (
                <div
                  key={client.id}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 bg-[#D91C81] rounded-lg flex items-center justify-center text-white font-bold text-lg">
                          {client.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => navigate(getClientUrl(client))}
                              className="text-lg font-bold text-gray-900 hover:text-[#D91C81] transition-colors"
                            >
                              {client.name}
                            </button>
                            {(client.status === 'active' || (client.status === undefined && client.isActive)) ? (
                              <Badge className="bg-green-100 text-green-800 border border-green-200">Active</Badge>
                            ) : (
                              <Badge className="bg-gray-100 text-gray-800 border border-gray-200">Inactive</Badge>
                            )}
                          </div>
                          {client.description && (
                            <p className="text-sm text-gray-600">{client.description}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 ml-15 text-sm">
                        <button
                          onClick={() => handleViewClientSites(client.id)}
                          className="flex items-center gap-2 text-[#D91C81] hover:text-[#B01669] font-medium"
                        >
                          <Globe className="w-4 h-4" />
                          <span>
                            {clientSites.length} {clientSites.length === 1 ? 'Site' : 'Sites'}
                            {activeSites.length > 0 && ` (${activeSites.length} active)`}
                          </span>
                        </button>

                        {client.contactEmail && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span>{client.contactEmail}</span>
                          </div>
                        )}

                        {client.contactPhone && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span>{client.contactPhone}</span>
                          </div>
                        )}

                        {client.address && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span>{client.address}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(getClientUrl(client))}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClient(client.id, client.name)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        disabled={isDeleting}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Client Sites Preview */}
                  {clientSites.length > 0 && (
                    <div className="mt-4 ml-15 pt-4 border-t border-gray-200">
                      <p className="text-sm font-semibold text-gray-700 mb-2">Sites:</p>
                      <div className="flex flex-wrap gap-2">
                        {clientSites.slice(0, 5).map(site => (
                          <Badge
                            key={site.id}
                            className={
                              site.status === 'active'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-gray-50 text-gray-700 border border-gray-200'
                            }
                          >
                            {site.name}
                          </Badge>
                        ))}
                        {clientSites.length > 5 && (
                          <Badge className="bg-gray-100 text-gray-600">
                            +{clientSites.length - 5} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Client Modal */}
      <ClientModal
        open={showClientModal}
        onClose={() => setShowClientModal(false)}
        client={editingClient as any}
        onSave={handleSaveClient}
      />
    </div>
  );
}