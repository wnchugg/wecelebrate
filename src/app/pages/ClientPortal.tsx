import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router';
import { 
  Clock, 
  Search, 
  AlertCircle, 
  Gift, 
  Calendar, 
  Heart, 
  MessageCircle, 
  ChevronRight, 
  Plus, 
  Loader2, 
  Lock, 
  Building2, 
  MapPin, 
  Users, 
  ArrowRight, 
  ExternalLink 
} from 'lucide-react';
import { toast } from 'sonner';
import { logger } from '../utils/logger';
import { getCurrentEnvironment } from '../config/deploymentEnvironments';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

interface Site {
  id: string;
  name: string;
  clientId: string;
  status: 'active' | 'inactive';
  description?: string;
  location?: string;
  employeeCount?: number;
  createdAt: string;
  settings?: {
    validationMethod?: string;
    logo?: string;
  };
}

interface Client {
  id: string;
  name: string;
  description?: string;
  contactEmail?: string;
  status: 'active' | 'inactive' | 'suspended';
}

export default function ClientPortal() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [sites, setSites] = useState<Site[]>([]);
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const token = searchParams.get('token') || '';

  // Check authentication - only client_admin role should access this
  useEffect(() => {
    if (!token) {
      toast.error('Please log in to access the client portal');
      navigate('/admin/login');
      return;
    }

    const fetchClientData = async () => {
      try {
        setLoading(true);
        setError(null);
        const env = getCurrentEnvironment();

        // For client_admin users, we need to get their client ID
        // This should be stored in the admin user data or we need to query it
        // For now, we'll fetch all clients and filter (in production, backend should return only their client)
        const clientsResponse = await fetch(
          `${env.supabaseUrl}/functions/v1/make-server-6fcaeea3/v2/clients`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
              'X-Access-Token': token,
              'X-Environment-ID': env.id,
            },
          }
        );

        if (!clientsResponse.ok) {
          throw new Error('Failed to fetch client data');
        }

        const clientsData = await clientsResponse.json();
        
        // TODO: In production, the backend should only return the client(s) this user has access to
        // For now, take the first active client
        const activeClient = clientsData.data?.find((c: Client) => c.status === 'active') || clientsData.data?.[0];
        
        if (!activeClient) {
          setError('No client found for your account');
          setLoading(false);
          return;
        }

        setClient(activeClient);

        // Fetch sites for this client
        const sitesResponse = await fetch(
          `${env.supabaseUrl}/functions/v1/make-server-6fcaeea3/v2/sites?client_id=${activeClient.id}`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
              'X-Access-Token': token,
              'X-Environment-ID': env.id,
            },
          }
        );

        if (!sitesResponse.ok) {
          throw new Error('Failed to fetch sites');
        }

        const sitesData = await sitesResponse.json();
        setSites(sitesData.data || []);
      } catch (err: any) {
        console.error('Error fetching client data:', err);
        setError(err.message || 'Failed to load client data');
        toast.error('Failed to load your sites');
      } finally {
        setLoading(false);
      }
    };

    fetchClientData();
  }, [searchParams, navigate]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-[#D91C81] animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading your portal...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !client) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            to="/admin/login"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#D91C81] text-white rounded-lg font-semibold hover:bg-[#B71569] transition-colors"
          >
            Return to Login
          </Link>
        </div>
      </div>
    );
  }

  // Main portal view
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Client Portal</h1>
              <p className="text-gray-600 mt-1">Welcome back{client ? `, ${client.name}` : ''}</p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/admin/dashboard"
                className="text-gray-600 hover:text-[#D91C81] transition-colors font-medium"
              >
                Admin Dashboard
              </Link>
              <Link
                to="/admin/logout"
                className="px-4 py-2 text-gray-600 hover:text-[#D91C81] transition-colors font-medium"
              >
                Logout
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Client Info */}
      {client && (
        <section className="bg-gradient-to-r from-[#D91C81] to-[#B71569] text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-start gap-6">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-shrink-0">
                <Building2 className="w-10 h-10 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-3xl font-bold mb-2">{client.name}</h2>
                {client.description && (
                  <p className="text-white/90 text-lg mb-3">{client.description}</p>
                )}
                <div className="flex flex-wrap gap-4 text-sm">
                  {client.contactEmail && (
                    <div className="flex items-center gap-2">
                      <span className="opacity-75">Contact:</span>
                      <span className="font-medium">{client.contactEmail}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="opacity-75">Sites:</span>
                    <span className="font-medium">{sites.length}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="opacity-75">Status:</span>
                    <span className="px-2 py-1 bg-white/20 rounded-full font-medium text-xs uppercase">
                      {client.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Sites Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Sites</h2>
          <p className="text-gray-600">
            Manage and access all sites under your organization
          </p>
        </div>

        {sites.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Sites Yet</h3>
            <p className="text-gray-600 mb-6">
              No sites have been configured for your organization yet.
            </p>
            <Link
              to="/admin/sites"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#D91C81] text-white rounded-lg font-semibold hover:bg-[#B71569] transition-colors"
            >
              Manage Sites
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sites.map((site) => (
              <Link
                key={site.id}
                to={`/site/${site.id}`}
                className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-[#D91C81]"
              >
                <div className="p-6">
                  {/* Site Icon */}
                  <div className="w-14 h-14 bg-gradient-to-br from-[#D91C81]/10 to-[#1B2A5E]/10 rounded-xl flex items-center justify-center mb-4 group-hover:from-[#D91C81]/20 group-hover:to-[#1B2A5E]/20 transition-colors">
                    <Building2 className="w-7 h-7 text-[#D91C81]" />
                  </div>

                  {/* Site Info */}
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#D91C81] transition-colors">
                      {site.name}
                    </h3>
                    {site.description && (
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {site.description}
                      </p>
                    )}
                  </div>

                  {/* Site Details */}
                  <div className="space-y-2 mb-4">
                    {site.location && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{site.location}</span>
                      </div>
                    )}
                    {site.employeeCount !== undefined && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="w-4 h-4 flex-shrink-0" />
                        <span>{site.employeeCount} employees</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4 flex-shrink-0" />
                      <span>Created {new Date(site.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        site.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {site.status}
                    </span>
                    <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-[#D91C81] transition-colors" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}