import { getCurrentEnvironment } from '../../config/deploymentEnvironments';
import { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  RefreshCw, 
  Download,
  ExternalLink,
  Server,
  Database,
  Shield,
  FileCheck,
  Mail,
  Users,
  Building2,
  Settings,
  Gift,
  ShoppingCart,
  Circle
} from 'lucide-react';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';
import { logger } from '../../utils/logger';
import { toast } from 'sonner';
 
interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  icon: any;
  category: string;
  status: 'pending' | 'in-progress' | 'complete';
  autoCheck?: () => Promise<boolean>;
}

export function DeploymentChecklist() {
  const [items, setItems] = useState<ChecklistItem[]>([
    {
      id: 'email-templates',
      title: 'Initialize Email Templates',
      description: 'Create all 5 email templates (magic-link, order-confirmation, shipping, delivery, etc.)',
      icon: Mail,
      category: 'Setup',
      status: 'pending',
      autoCheck: async () => {
        try {
          const env = getCurrentEnvironment();
          const token = sessionStorage.getItem('jala_access_token');
          const response = await fetch(
            `https://${env.supabaseUrl.match(/https:\/\/([^.]+)/)?.[1]}.supabase.co/functions/v1/make-server-6fcaeea3/email-templates`,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'X-Environment-ID': env.id
              }
            }
          );
          if (response.ok) {
            const data = await response.json();
            return data.templates && data.templates.length >= 3;
          }
          return false;
        } catch {
          return false;
        }
      }
    },
    {
      id: 'admin-user',
      title: 'Create Admin User',
      description: 'Bootstrap or signup your first admin user',
      icon: Users,
      category: 'Setup',
      status: 'pending',
      autoCheck: async () => {
        const token = sessionStorage.getItem('jala_access_token');
        return !!token;
      }
    },
    {
      id: 'test-client',
      title: 'Create Test Client',
      description: 'Add your first client company',
      icon: Building2,
      category: 'Data',
      status: 'pending',
      autoCheck: async () => {
        try {
          const env = getCurrentEnvironment();
          const token = sessionStorage.getItem('jala_access_token');
          const response = await fetch(
            `https://${env.supabaseUrl.match(/https:\/\/([^.]+)/)?.[1]}.supabase.co/functions/v1/make-server-6fcaeea3/clients`,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'X-Environment-ID': env.id
              }
            }
          );
          if (response.ok) {
            const data = await response.json();
            return data.clients && data.clients.length > 0;
          }
          return false;
        } catch {
          return false;
        }
      }
    },
    {
      id: 'test-site',
      title: 'Create Test Site',
      description: 'Create a branded site for your test client',
      icon: Settings,
      category: 'Data',
      status: 'pending',
      autoCheck: async () => {
        try {
          const env = getCurrentEnvironment();
          const token = sessionStorage.getItem('jala_access_token');
          const response = await fetch(
            `https://${env.supabaseUrl.match(/https:\/\/([^.]+)/)?.[1]}.supabase.co/functions/v1/make-server-6fcaeea3/sites`,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'X-Environment-ID': env.id
              }
            }
          );
          if (response.ok) {
            const data = await response.json();
            return data.sites && data.sites.length > 0;
          }
          return false;
        } catch {
          return false;
        }
      }
    },
    {
      id: 'test-gifts',
      title: 'Upload Test Gifts',
      description: 'Add at least 5 gifts to the catalog',
      icon: Gift,
      category: 'Data',
      status: 'pending',
      autoCheck: async () => {
        try {
          const env = getCurrentEnvironment();
          const token = sessionStorage.getItem('jala_access_token');
          const response = await fetch(
            `https://${env.supabaseUrl.match(/https:\/\/([^.]+)/)?.[1]}.supabase.co/functions/v1/make-server-6fcaeea3/admin/gifts`,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'X-Environment-ID': env.id
              }
            }
          );
          if (response.ok) {
            const data = await response.json();
            return data.gifts && data.gifts.length >= 5;
          }
          return false;
        } catch {
          return false;
        }
      }
    },
    {
      id: 'assign-gifts',
      title: 'Assign Gifts to Site',
      description: 'Make gifts available on your test site',
      icon: Settings,
      category: 'Data',
      status: 'pending'
    },
    {
      id: 'test-employees',
      title: 'Create Test Employees',
      description: 'Add at least 2 test employees',
      icon: Users,
      category: 'Data',
      status: 'pending',
      autoCheck: async () => {
        try {
          const env = getCurrentEnvironment();
          const token = sessionStorage.getItem('jala_access_token');
          const response = await fetch(
            `https://${env.supabaseUrl.match(/https:\/\/([^.]+)/)?.[1]}.supabase.co/functions/v1/make-server-6fcaeea3/employees`,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'X-Environment-ID': env.id
              }
            }
          );
          if (response.ok) {
            const data = await response.json();
            return data.employees && data.employees.length >= 2;
          }
          return false;
        } catch {
          return false;
        }
      }
    },
    {
      id: 'test-order',
      title: 'Place Test Order',
      description: 'Complete an end-to-end order as an employee',
      icon: ShoppingCart,
      category: 'Testing',
      status: 'pending',
      autoCheck: async () => {
        try {
          const env = getCurrentEnvironment();
          const token = sessionStorage.getItem('jala_access_token');
          const response = await fetch(
            `https://${env.supabaseUrl.match(/https:\/\/([^.]+)/)?.[1]}.supabase.co/functions/v1/make-server-6fcaeea3/orders`,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'X-Environment-ID': env.id
              }
            }
          );
          if (response.ok) {
            const data = await response.json();
            return data.orders && data.orders.length > 0;
          }
          return false;
        } catch {
          return false;
        }
      }
    },
    {
      id: 'test-emails',
      title: 'Verify Email Flow',
      description: 'Confirm order, shipping, and delivery emails are working',
      icon: Mail,
      category: 'Testing',
      status: 'pending'
    }
  ]);

  const [isChecking, setIsChecking] = useState(false);
  const [seedingTemplates, setSeedingTemplates] = useState(false);

  const checkAllStatuses = async () => {
    setIsChecking(true);
    const updatedItems = [...items];

    for (let i = 0; i < updatedItems.length; i++) {
      const item = updatedItems[i];
      if (item.autoCheck) {
        try {
          const isComplete = await item.autoCheck();
          updatedItems[i].status = isComplete ? 'complete' : 'pending';
        } catch (error) {
          logger.error(`Error checking ${item.id}:`, error);
        }
      }
    }

    setItems(updatedItems);
    setIsChecking(false);
    toast.success('Checklist updated!');
  };

  const toggleItem = (id: string) => {
    setItems(prev =>
      prev.map(item =>
        item.id === id
          ? {
              ...item,
              status: item.status === 'complete' ? 'pending' : 'complete'
            }
          : item
      )
    );
  };

  const seedEmailTemplates = async () => {
    setSeedingTemplates(true);
    try {
      const env = getCurrentEnvironment();
      const token = sessionStorage.getItem('jala_access_token');
      
      const response = await fetch(
        `https://${env.supabaseUrl.match(/https:\/\/([^.]+)/)?.[1]}.supabase.co/functions/v1/make-server-6fcaeea3/email-templates/seed-shipping`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-Environment-ID': env.id,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        toast.success('Email templates created successfully!');
        checkAllStatuses();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create email templates');
      }
    } catch (error: unknown) {
      logger.error('Seed email templates error:', error);
      toast.error('Failed to create email templates');
    } finally {
      setSeedingTemplates(false);
    }
  };

  useEffect(() => {
    checkAllStatuses();
  }, []);

  const categories = ['Setup', 'Data', 'Testing'];
  const completedCount = items.filter(i => i.status === 'complete').length;
  const totalCount = items.length;
  const progress = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Development Deployment Checklist
        </h1>
        <p className="text-gray-600">
          Complete these steps to deploy your JALA 2 platform to development
        </p>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Overall Progress</h3>
            <p className="text-sm text-gray-600">
              {completedCount} of {totalCount} steps complete
            </p>
          </div>
          <button
            onClick={checkAllStatuses}
            disabled={isChecking}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-medium transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
            Refresh Status
          </button>
        </div>
        
        <div className="relative w-full h-4 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-[#D91C81] to-[#B71569] transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-center text-2xl font-bold text-[#D91C81] mt-2">
          {progress}%
        </p>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl p-6 mb-6">
        <h3 className="font-semibold text-blue-900 mb-3">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={seedEmailTemplates}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-blue-200 rounded-lg text-blue-700 font-medium hover:bg-blue-50 transition-colors"
          >
            <Mail className="w-4 h-4" />
            Seed Email Templates
          </button>
          <a
            href="/admin/clients"
            className="flex items-center gap-2 px-4 py-2 bg-white border border-blue-200 rounded-lg text-blue-700 font-medium hover:bg-blue-50 transition-colors"
          >
            <Building2 className="w-4 h-4" />
            Create Client
          </a>
          <a
            href="/admin/sites"
            className="flex items-center gap-2 px-4 py-2 bg-white border border-blue-200 rounded-lg text-blue-700 font-medium hover:bg-blue-50 transition-colors"
          >
            <Settings className="w-4 h-4" />
            Create Site
          </a>
          <a
            href="/admin/gifts"
            className="flex items-center gap-2 px-4 py-2 bg-white border border-blue-200 rounded-lg text-blue-700 font-medium hover:bg-blue-50 transition-colors"
          >
            <Gift className="w-4 h-4" />
            Add Gifts
          </a>
        </div>
      </div>

      {/* Checklist by Category */}
      {categories.map((category) => (
        <div key={category} className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">{category}</h2>
          <div className="space-y-3">
            {items
              .filter((item) => item.category === category)
              .map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.id}
                    onClick={() => !item.autoCheck && toggleItem(item.id)}
                    className={`flex items-start gap-4 p-4 rounded-xl border-2 transition-all ${
                      item.status === 'complete'
                        ? 'bg-green-50 border-green-200'
                        : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                    } ${!item.autoCheck ? 'cursor-pointer' : ''}`}
                  >
                    <div className="flex-shrink-0 mt-1">
                      {item.status === 'complete' ? (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      ) : (
                        <Circle className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-shrink-0">
                      <Icon
                        className={`w-6 h-6 ${
                          item.status === 'complete' ? 'text-green-600' : 'text-gray-400'
                        }`}
                      />
                    </div>
                    <div className="flex-1">
                      <h3
                        className={`font-semibold mb-1 ${
                          item.status === 'complete' ? 'text-green-900' : 'text-gray-900'
                        }`}
                      >
                        {item.title}
                      </h3>
                      <p
                        className={`text-sm ${
                          item.status === 'complete' ? 'text-green-700' : 'text-gray-600'
                        }`}
                      >
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      ))}

      {/* Help Section */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-purple-900 mb-2">Need Help?</h3>
            <p className="text-sm text-purple-700 mb-3">
              Check the comprehensive deployment guide for step-by-step instructions.
            </p>
            <a
              href="/DEV_DEPLOYMENT_GUIDE.md"
              target="_blank"
              className="inline-block px-4 py-2 bg-white border border-purple-200 rounded-lg text-purple-700 font-medium hover:bg-purple-50 transition-colors text-sm"
            >
              View Deployment Guide
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}