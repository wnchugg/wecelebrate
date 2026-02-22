import { useState } from 'react';
import { Link } from 'react-router';
import { 
  Code, 
  Server, 
  Shield, 
  Lock, 
  Database,
  Layers,
  Zap,
  CheckCircle,
  AlertCircle,
  Home,
  Eye,
  Terminal,
  Globe,
  Key,
  Box,
  FileCode,
  Workflow,
  Settings,
  Package,
  GitBranch,
  Activity,
  BarChart,
  Mail,
  Cloud,
  Network,
  Monitor,
  Smartphone,
  Accessibility,
  Wrench,
  Palette,
  FileText,
  UserPlus,
  Users,
  Building2
} from 'lucide-react';

type TabType = 'overview' | 'frontend' | 'backend' | 'api' | 'security' | 'accessibility' | 'deployment' | 'documentation';

export function TechnicalReview() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const primaryColor = '#D91C81';
  const secondaryColor = '#1B2A5E';
  const tertiaryColor = '#00B4CC';

  const tabs = [
    { id: 'overview', label: 'Technical Overview', icon: Eye },
    { id: 'frontend', label: 'Frontend Architecture', icon: Monitor },
    { id: 'backend', label: 'Backend Architecture', icon: Server },
    { id: 'api', label: 'API Documentation', icon: Terminal },
    { id: 'security', label: 'Security & Auth', icon: Shield },
    { id: 'accessibility', label: 'Accessibility & UX', icon: Accessibility },
    { id: 'deployment', label: 'Deployment & DevOps', icon: Cloud },
    { id: 'documentation', label: 'Developer Docs', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#1B2A5E] to-[#0F1942] text-white shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold flex items-center gap-3">
                <Code className="w-10 h-10" />
                Technical Architecture Review
              </h1>
              <p className="text-blue-200 mt-2 text-lg">
                Comprehensive Technical Documentation for Engineering Teams
              </p>
            </div>
            <Link
              to="/"
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-6 py-3 rounded-lg transition-all backdrop-blur-sm"
            >
              <Home className="w-5 h-5" />
              <span className="font-semibold">Back to Home</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium transition-all whitespace-nowrap border-b-2 ${
                    activeTab === tab.id
                      ? 'border-[#D91C81] text-[#D91C81] bg-pink-50'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'frontend' && <FrontendTab />}
        {activeTab === 'backend' && <BackendTab />}
        {activeTab === 'api' && <APITab />}
        {activeTab === 'security' && <SecurityTab />}
        {activeTab === 'accessibility' && <AccessibilityTab />}
        {activeTab === 'deployment' && <DeploymentTab />}
        {activeTab === 'documentation' && <DocumentationTab />}
      </div>
    </div>
  );
}

// ===== OVERVIEW TAB =====
function OverviewTab() {
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-[#D91C81]">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">wecelebrate Platform - Technical Status</h2>
        <p className="text-lg text-gray-700 leading-relaxed">
          Modern event gifting platform built with React, TypeScript, Tailwind CSS v4, and Supabase. 
          The platform implements a three-tier architecture with comprehensive security, authentication, 
          and multi-tenant support.
        </p>
      </div>

      {/* Tech Stack */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <Monitor className="w-12 h-12 mb-4" />
          <h3 className="text-xl font-bold mb-2">Frontend</h3>
          <ul className="space-y-1 text-sm text-blue-50">
            <li>• React 18 with TypeScript</li>
            <li>• React Router v7</li>
            <li>• Tailwind CSS v4</li>
            <li>• Context API State Management</li>
            <li>• Lucide React Icons</li>
          </ul>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <Server className="w-12 h-12 mb-4" />
          <h3 className="text-xl font-bold mb-2">Backend</h3>
          <ul className="space-y-1 text-sm text-green-50">
            <li>• Supabase Edge Functions</li>
            <li>• Hono Web Framework</li>
            <li>• Deno Runtime</li>
            <li>• PostgreSQL Database</li>
            <li>• KV Store Pattern</li>
          </ul>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <Shield className="w-12 h-12 mb-4" />
          <h3 className="text-xl font-bold mb-2">Security</h3>
          <ul className="space-y-1 text-sm text-purple-50">
            <li>• Custom HS256 JWT</li>
            <li>• Role-Based Access Control</li>
            <li>• Bcrypt Password Hashing</li>
            <li>• HTTPS/TLS Encryption</li>
            <li>• CORS Protection</li>
          </ul>
        </div>
      </div>

      {/* Architecture Diagram */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Layers className="w-7 h-7 text-[#D91C81]" />
          Three-Tier Architecture
        </h3>
        
        <div className="space-y-6">
          {/* Frontend Layer */}
          <div className="border-2 border-blue-200 rounded-lg p-6 bg-blue-50">
            <div className="flex items-center gap-3 mb-3">
              <Monitor className="w-6 h-6 text-blue-600" />
              <h4 className="text-xl font-bold text-blue-900">Frontend Layer</h4>
            </div>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-semibold text-blue-700">Pages:</span>
                <p className="text-gray-700">/src/app/pages/</p>
              </div>
              <div>
                <span className="font-semibold text-blue-700">Components:</span>
                <p className="text-gray-700">/src/app/components/</p>
              </div>
              <div>
                <span className="font-semibold text-blue-700">Context:</span>
                <p className="text-gray-700">/src/app/context/</p>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-green-500"></div>
          </div>

          {/* API Layer */}
          <div className="border-2 border-green-200 rounded-lg p-6 bg-green-50">
            <div className="flex items-center gap-3 mb-3">
              <Server className="w-6 h-6 text-green-600" />
              <h4 className="text-xl font-bold text-green-900">API/Server Layer</h4>
            </div>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-semibold text-green-700">Framework:</span>
                <p className="text-gray-700">Hono (Express-like)</p>
              </div>
              <div>
                <span className="font-semibold text-green-700">Location:</span>
                <p className="text-gray-700">/supabase/functions/server/</p>
              </div>
              <div>
                <span className="font-semibold text-green-700">Prefix:</span>
                <p className="text-gray-700 font-mono text-xs">/make-server-6fcaeea3</p>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="w-1 h-8 bg-gradient-to-b from-green-500 to-purple-500"></div>
          </div>

          {/* Database Layer */}
          <div className="border-2 border-purple-200 rounded-lg p-6 bg-purple-50">
            <div className="flex items-center gap-3 mb-3">
              <Database className="w-6 h-6 text-purple-600" />
              <h4 className="text-xl font-bold text-purple-900">Database Layer</h4>
            </div>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-semibold text-purple-700">Type:</span>
                <p className="text-gray-700">PostgreSQL (Supabase)</p>
              </div>
              <div>
                <span className="font-semibold text-purple-700">Primary Table:</span>
                <p className="text-gray-700 font-mono text-xs">kv_store_6fcaeea3</p>
              </div>
              <div>
                <span className="font-semibold text-purple-700">Pattern:</span>
                <p className="text-gray-700">Key-Value Store</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Current Status */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-green-600" />
            Completed Features
          </h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">✓</span>
              <span>Custom JWT authentication system (HS256)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">✓</span>
              <span>Complete admin interface with auth</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">✓</span>
              <span>Client/Site hierarchical data model</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">✓</span>
              <span>Multi-environment support (Dev/Prod)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">✓</span>
              <span>React Router v7 implementation</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">✓</span>
              <span>Tailwind CSS v4 theming</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">✓</span>
              <span>Developer tools and diagnostics</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">✓</span>
              <span>Deployment to Figma Make hosting</span>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-green-600" />
            Recently Completed
          </h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">✓</span>
              <span>Employee Management System (Manual CSV, SFTP, HRIS)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">✓</span>
              <span>Intelligent Site Mapping Rules (Country, Department, Region)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">✓</span>
              <span>HRIS Integration (Workday, BambooHR, ADP, SAP)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">✓</span>
              <span>SFTP Automated Employee Sync</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">✓</span>
              <span>Employee validation flows (5 methods)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">✓</span>
              <span>Gift catalog with site assignments</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">✓</span>
              <span>Order management system</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">✓</span>
              <span>Shopping cart functionality</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">✓</span>
              <span>Email notification system</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">✓</span>
              <span>WIX-like Page Editor (Landing & Welcome pages)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">✓</span>
              <span>Celebration System with eCards</span>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="w-6 h-6 text-orange-600" />
            Planned Features
          </h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-orange-600 mt-1">→</span>
              <span>Payment gateway integration (Stripe/PayPal)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-600 mt-1">→</span>
              <span>Shipping provider APIs (UPS/FedEx/USPS)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-600 mt-1">→</span>
              <span>Advanced analytics and reporting</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-600 mt-1">→</span>
              <span>SSO provider expansion (Google, Azure AD, Okta)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-600 mt-1">→</span>
              <span>Inventory management system</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-600 mt-1">→</span>
              <span>Public API for external systems</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Environment Info */}
      <div className="bg-gradient-to-r from-[#1B2A5E] to-[#0F1942] rounded-xl p-6 text-white">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Cloud className="w-6 h-6" />
          Environment Configuration
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <h4 className="font-semibold mb-2 text-lg">Production Environment</h4>
            <div className="space-y-2 text-sm font-mono">
              <div>
                <span className="text-blue-300">Project ID:</span>
                <p className="text-white">lmffeqwhrnbsbhdztwyv</p>
              </div>
              <div>
                <span className="text-blue-300">Purpose:</span>
                <p className="text-white">Live data only</p>
              </div>
              <div>
                <span className="text-blue-300">URL:</span>
                <p className="text-white break-all">lmffeqwhrnbsbhdztwyv.supabase.co</p>
              </div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <h4 className="font-semibold mb-2 text-lg">Development Environment</h4>
            <div className="space-y-2 text-sm font-mono">
              <div>
                <span className="text-green-300">Project ID:</span>
                <p className="text-white">wjfcqqrlhwdvvjmefxky</p>
              </div>
              <div>
                <span className="text-green-300">Purpose:</span>
                <p className="text-white">Testing & development</p>
              </div>
              <div>
                <span className="text-green-300">URL:</span>
                <p className="text-white break-all">wjfcqqrlhwdvvjmefxky.supabase.co</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== FRONTEND TAB =====
function FrontendTab() {
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-[#D91C81]">
        <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
          <Monitor className="w-8 h-8 text-[#D91C81]" />
          Frontend Architecture
        </h2>
        <p className="text-lg text-gray-700">
          Modern React application with TypeScript, Context API for state management, 
          and Tailwind CSS v4 for styling.
        </p>
      </div>

      {/* Tech Stack Details */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Package className="w-6 h-6 text-blue-600" />
            Core Dependencies
          </h3>
          <div className="space-y-3">
            <div className="flex items-start justify-between border-b pb-2">
              <span className="font-mono text-sm text-gray-700">react</span>
              <span className="text-sm text-gray-500">v18.x</span>
            </div>
            <div className="flex items-start justify-between border-b pb-2">
              <span className="font-mono text-sm text-gray-700">react-router</span>
              <span className="text-sm text-gray-500">v7.x (not react-router-dom)</span>
            </div>
            <div className="flex items-start justify-between border-b pb-2">
              <span className="font-mono text-sm text-gray-700">typescript</span>
              <span className="text-sm text-gray-500">Latest</span>
            </div>
            <div className="flex items-start justify-between border-b pb-2">
              <span className="font-mono text-sm text-gray-700">tailwindcss</span>
              <span className="text-sm text-gray-500">v4.0 (CSS-based config)</span>
            </div>
            <div className="flex items-start justify-between border-b pb-2">
              <span className="font-mono text-sm text-gray-700">lucide-react</span>
              <span className="text-sm text-gray-500">Icon library</span>
            </div>
            <div className="flex items-start justify-between">
              <span className="font-mono text-sm text-gray-700">@supabase/supabase-js</span>
              <span className="text-sm text-gray-500">Client SDK</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FileCode className="w-6 h-6 text-purple-600" />
            Project Structure
          </h3>
          <div className="font-mono text-sm space-y-1 text-gray-700">
            <div className="flex items-center gap-2">
              <span className="text-blue-600">📁</span>
              <span>/src/app/</span>
            </div>
            <div className="ml-6 flex items-center gap-2">
              <span className="text-blue-600">📁</span>
              <span>pages/ - Page components</span>
            </div>
            <div className="ml-6 flex items-center gap-2">
              <span className="text-blue-600">📁</span>
              <span>components/ - Reusable UI</span>
            </div>
            <div className="ml-6 flex items-center gap-2">
              <span className="text-blue-600">📁</span>
              <span>context/ - State management</span>
            </div>
            <div className="ml-6 flex items-center gap-2">
              <span className="text-blue-600">📁</span>
              <span>utils/ - Helper functions</span>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <span className="text-green-600">📁</span>
              <span>/src/styles/</span>
            </div>
            <div className="ml-6 flex items-center gap-2">
              <span className="text-green-600">📄</span>
              <span>theme.css - Tailwind theme</span>
            </div>
            <div className="ml-6 flex items-center gap-2">
              <span className="text-green-600">📄</span>
              <span>fonts.css - Font imports</span>
            </div>
          </div>
        </div>
      </div>

      {/* State Management */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Workflow className="w-7 h-7 text-[#D91C81]" />
          State Management - Context API
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="border-2 border-pink-200 rounded-lg p-6 bg-pink-50">
            <h4 className="text-lg font-bold text-pink-900 mb-3">AdminContext</h4>
            <p className="text-sm text-gray-700 mb-3">
              Manages admin user authentication state, role, and permissions
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-pink-600">•</span>
                <span className="font-mono text-xs">adminUser: AdminUser | null</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-pink-600">•</span>
                <span className="font-mono text-xs">adminLogin(credentials)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-pink-600">•</span>
                <span className="font-mono text-xs">adminLogout()</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-pink-600">•</span>
                <span className="font-mono text-xs">isAuthenticated: boolean</span>
              </div>
            </div>
          </div>

          <div className="border-2 border-blue-200 rounded-lg p-6 bg-blue-50">
            <h4 className="text-lg font-bold text-blue-900 mb-3">SiteContext</h4>
            <p className="text-sm text-gray-700 mb-3">
              Manages client/site selection and data caching
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span className="font-mono text-xs">currentSite: Site | null</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span className="font-mono text-xs">currentClient: Client | null</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span className="font-mono text-xs">sites: Site[]</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span className="font-mono text-xs">setCurrentSite(siteId)</span>
              </div>
            </div>
          </div>

          <div className="border-2 border-green-200 rounded-lg p-6 bg-green-50">
            <h4 className="text-lg font-bold text-green-900 mb-3">AuthContext</h4>
            <p className="text-sm text-gray-700 mb-3">
              Employee authentication and validation flow
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-green-600">•</span>
                <span className="font-mono text-xs">employee: Employee | null</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600">•</span>
                <span className="font-mono text-xs">validateEmployee(method)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600">•</span>
                <span className="font-mono text-xs">logout()</span>
              </div>
            </div>
          </div>

          <div className="border-2 border-purple-200 rounded-lg p-6 bg-purple-50">
            <h4 className="text-lg font-bold text-purple-900 mb-3">OrderContext & CartContext</h4>
            <p className="text-sm text-gray-700 mb-3">
              Shopping cart and order management for employees
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-purple-600">•</span>
                <span className="font-mono text-xs">cart: CartItem[]</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-purple-600">•</span>
                <span className="font-mono text-xs">orders: Order[]</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-purple-600">•</span>
                <span className="font-mono text-xs">addToCart(item)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-purple-600">•</span>
                <span className="font-mono text-xs">placeOrder()</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Routing */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <GitBranch className="w-7 h-7 text-[#D91C81]" />
          Routing - React Router v7
        </h3>
        
        <div className="space-y-6">
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
            <h4 className="font-bold text-blue-900 mb-2">Important: Using react-router, NOT react-router-dom</h4>
            <p className="text-sm text-blue-800">
              The project uses <code className="bg-blue-100 px-2 py-1 rounded">react-router</code> v7, 
              not react-router-dom. This is a Figma Make environment requirement.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-bold text-gray-900 mb-3">Public Routes</h4>
              <div className="space-y-2 text-sm font-mono bg-gray-50 p-4 rounded-lg">
                <div>/ - Landing page</div>
                <div>/access - Employee validation</div>
                <div>/welcome - Employee welcome</div>
                <div>/celebration - Celebration module</div>
                <div>/stakeholder-review - Stakeholder demo</div>
                <div>/technical-review - Tech review (new)</div>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 mb-3">Admin Routes (Protected)</h4>
              <div className="space-y-2 text-sm font-mono bg-gray-50 p-4 rounded-lg">
                <div>/admin/login - Admin login</div>
                <div>/admin/dashboard - Site dashboard</div>
                <div>/admin/clients - Client management</div>
                <div>/admin/sites - Site management</div>
                <div>/admin/gifts - Gift catalog</div>
                <div>/admin/orders - Order management</div>
                <div className="text-gray-500">+ 20 more admin routes</div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
            <h4 className="font-bold text-yellow-900 mb-2">Route Protection</h4>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• <code className="bg-yellow-100 px-2 py-1 rounded">ProtectedRoute</code> - Requires employee authentication</li>
              <li>• <code className="bg-yellow-100 px-2 py-1 rounded">AdminProtectedRoute</code> - Requires admin JWT token</li>
              <li>• Routes use lazy loading for code splitting</li>
              <li>• Suspense fallbacks for loading states</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Tailwind CSS */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Palette className="w-7 h-7 text-[#D91C81]" />
          Styling - Tailwind CSS v4
        </h3>
        
        <div className="space-y-6">
          <div className="bg-purple-50 border-l-4 border-purple-500 p-4">
            <h4 className="font-bold text-purple-900 mb-2">Tailwind v4 Configuration</h4>
            <p className="text-sm text-purple-800 mb-3">
              Using Tailwind CSS v4 which uses CSS-based configuration instead of tailwind.config.js
            </p>
            <div className="font-mono text-sm bg-purple-100 p-3 rounded">
              /src/styles/theme.css - Custom theme tokens
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-[#D91C81] to-[#B71569] rounded-lg p-6 text-white">
              <h4 className="font-bold mb-2">Primary Color</h4>
              <div className="font-mono text-2xl mb-2">#D91C81</div>
              <p className="text-sm text-pink-100">Magenta/Pink - Main brand color</p>
            </div>

            <div className="bg-gradient-to-br from-[#1B2A5E] to-[#0F1942] rounded-lg p-6 text-white">
              <h4 className="font-bold mb-2">Secondary Color</h4>
              <div className="font-mono text-2xl mb-2">#1B2A5E</div>
              <p className="text-sm text-blue-100">Deep Blue - Secondary brand</p>
            </div>

            <div className="bg-gradient-to-br from-[#00B4CC] to-[#0090A6] rounded-lg p-6 text-white">
              <h4 className="font-bold mb-2">Tertiary Color</h4>
              <div className="font-mono text-2xl mb-2">#00B4CC</div>
              <p className="text-sm text-cyan-100">Cyan/Teal - Accent color</p>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-3">Design System Features</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                  <span>RecHUB Design System compliance</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                  <span>Responsive mobile-first design</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                  <span>Consistent spacing and typography</span>
                </li>
              </ul>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                  <span>Dark mode support (planned)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                  <span>Custom component patterns</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                  <span>Utility-first approach</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== BACKEND TAB =====
function BackendTab() {
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-[#D91C81]">
        <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
          <Server className="w-8 h-8 text-[#D91C81]" />
          Backend Architecture
        </h2>
        <p className="text-lg text-gray-700">
          Serverless architecture using Supabase Edge Functions with Hono web framework, 
          running on Deno runtime with PostgreSQL database.
        </p>
      </div>

      {/* Server Stack */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <Server className="w-12 h-12 mb-4" />
          <h3 className="text-xl font-bold mb-2">Hono Framework</h3>
          <p className="text-sm text-green-50">
            Fast, lightweight web framework similar to Express. Optimized for edge computing with TypeScript support.
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <Cloud className="w-12 h-12 mb-4" />
          <h3 className="text-xl font-bold mb-2">Supabase Edge</h3>
          <p className="text-sm text-blue-50">
            Serverless functions running on globally distributed edge network. Auto-scaling and high availability.
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <Database className="w-12 h-12 mb-4" />
          <h3 className="text-xl font-bold mb-2">PostgreSQL</h3>
          <p className="text-sm text-purple-50">
            Supabase-hosted PostgreSQL with KV store pattern. Optimized for key-value operations and JSON storage.
          </p>
        </div>
      </div>

      {/* File Structure */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <FileCode className="w-7 h-7 text-[#D91C81]" />
          Server File Structure
        </h3>
        
        <div className="font-mono text-sm bg-gray-50 p-6 rounded-lg space-y-2">
          <div className="flex items-center gap-2 text-blue-600">
            <span>📁</span>
            <span className="font-bold">/supabase/functions/server/</span>
          </div>
          <div className="ml-6 flex items-center gap-2">
            <span className="text-green-600">📄</span>
            <span>index.tsx - Main server file (Hono app)</span>
          </div>
          <div className="ml-6 flex items-center gap-2">
            <span className="text-green-600">📄</span>
            <span>kv_store.tsx - Database utility (protected)</span>
          </div>
          <div className="ml-6 text-gray-500 text-xs mt-2">
            Note: Cannot create subdirectories, only files in this directory
          </div>
        </div>

        <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-500 p-4">
          <h4 className="font-bold text-yellow-900 mb-2">Important Constraints</h4>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• All server code must be in <code>/supabase/functions/server/</code></li>
            <li>• Cannot create subdirectories</li>
            <li>• Cannot import from outside this directory</li>
            <li>• Must use <code>Deno.serve(app.fetch)</code> to start server</li>
            <li>• Import external packages via <code>npm:</code> or <code>jsr:</code></li>
            <li>• Node built-ins require <code>node:</code> specifier</li>
          </ul>
        </div>
      </div>

      {/* Database */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Database className="w-7 h-7 text-[#D91C81]" />
          Database - KV Store Pattern
        </h3>
        
        <div className="space-y-6">
          <div className="bg-purple-50 border-l-4 border-purple-500 p-4">
            <h4 className="font-bold text-purple-900 mb-2">Primary Table: kv_store_6fcaeea3</h4>
            <p className="text-sm text-purple-800">
              Key-value store for flexible data storage. All entities stored as JSON values with structured keys.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-bold text-gray-900 mb-3">Key Patterns</h4>
              <div className="space-y-2 text-sm font-mono bg-gray-50 p-4 rounded-lg">
                <div className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>client:{'{id}'} - Client records</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>site:{'{id}'} - Site records</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>gift:{'{id}'} - Gift products</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>admin:{'{id}'} - Admin users</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>order:{'{id}'} - Orders</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>employee:{'{id}'} - Employees</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 mb-3">KV Store Operations</h4>
              <div className="space-y-3 text-sm">
                <div className="bg-green-50 p-3 rounded">
                  <code className="font-mono text-xs">kvStore.get(key)</code>
                  <p className="text-gray-600 mt-1">Get single value by key</p>
                </div>
                <div className="bg-blue-50 p-3 rounded">
                  <code className="font-mono text-xs">kvStore.mget([keys])</code>
                  <p className="text-gray-600 mt-1">Get multiple values</p>
                </div>
                <div className="bg-purple-50 p-3 rounded">
                  <code className="font-mono text-xs">kvStore.getByPrefix(prefix)</code>
                  <p className="text-gray-600 mt-1">Query by key pattern</p>
                </div>
                <div className="bg-yellow-50 p-3 rounded">
                  <code className="font-mono text-xs">kvStore.set(key, value)</code>
                  <p className="text-gray-600 mt-1">Set single value</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <h4 className="font-bold text-red-900 mb-2">⚠️ Important: No Migrations or DDL</h4>
            <ul className="text-sm text-red-800 space-y-1">
              <li>• Cannot write migration files or DDL statements</li>
              <li>• Cannot create new tables via code</li>
              <li>• KV store is flexible enough for prototyping</li>
              <li>• Users can modify DB via Supabase UI (we don't have access)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Middleware & Configuration */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Settings className="w-7 h-7 text-[#D91C81]" />
          Middleware & Configuration
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="border-2 border-green-200 rounded-lg p-6 bg-green-50">
            <h4 className="text-lg font-bold text-green-900 mb-3">CORS Configuration</h4>
            <p className="text-sm text-gray-700 mb-3">
              Open CORS for cross-origin requests
            </p>
            <div className="text-sm font-mono bg-green-100 p-3 rounded">
              import {`{`} cors {`}`} from 'npm:hono/cors'
            </div>
            <p className="text-xs text-gray-500 mt-2">Not from hono/middleware!</p>
          </div>

          <div className="border-2 border-blue-200 rounded-lg p-6 bg-blue-50">
            <h4 className="text-lg font-bold text-blue-900 mb-3">Logger Middleware</h4>
            <p className="text-sm text-gray-700 mb-3">
              Console logging for all requests
            </p>
            <div className="text-sm font-mono bg-blue-100 p-3 rounded">
              import {`{`} logger {`}`} from 'npm:hono/logger'
            </div>
            <p className="text-xs text-gray-500 mt-2">app.use('*', logger(console.log))</p>
          </div>

          <div className="border-2 border-purple-200 rounded-lg p-6 bg-purple-50">
            <h4 className="text-lg font-bold text-purple-900 mb-3">Route Prefix</h4>
            <p className="text-sm text-gray-700 mb-3">
              All routes prefixed for Figma Make
            </p>
            <div className="text-sm font-mono bg-purple-100 p-3 rounded break-all">
              /make-server-6fcaeea3
            </div>
            <p className="text-xs text-gray-500 mt-2">Required prefix for all endpoints</p>
          </div>

          <div className="border-2 border-yellow-200 rounded-lg p-6 bg-yellow-50">
            <h4 className="text-lg font-bold text-yellow-900 mb-3">Error Handling</h4>
            <p className="text-sm text-gray-700 mb-3">
              Global error handler with logging
            </p>
            <div className="text-sm font-mono bg-yellow-100 p-3 rounded">
              try/catch with console.error
            </div>
            <p className="text-xs text-gray-500 mt-2">Detailed error messages for debugging</p>
          </div>
        </div>
      </div>

      {/* Recent Backend Improvements */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl shadow-lg p-8 border-2 border-green-200">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <CheckCircle className="w-7 h-7 text-green-600" />
          Recent Backend Improvements (Feb 10, 2026)
        </h3>
        
        <div className="space-y-6">
          <div className="bg-white rounded-lg p-6">
            <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              CRUD Factory Pattern Migration - Phase 3.2 Complete
            </h4>
            <p className="text-gray-700 mb-4">
              Successfully migrated all 11 resource types to use a standardized CRUD factory pattern, 
              eliminating duplicate code and improving maintainability.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="font-bold text-blue-900 mb-2">11 Migrated Resources</div>
                <div className="text-sm text-blue-800 grid grid-cols-2 gap-1">
                  <div>• Clients</div>
                  <div>• Sites</div>
                  <div>• Gifts</div>
                  <div>• Orders</div>
                  <div>• Employees</div>
                  <div>• Admin Users</div>
                  <div>• Roles</div>
                  <div>• Access Groups</div>
                  <div>• Celebrations</div>
                  <div>• Email Templates</div>
                  <div>• Brands</div>
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="font-bold text-green-900 mb-2">Code Cleanup Results</div>
                <div className="text-sm text-green-800 space-y-2">
                  <div>✅ <strong>~326 lines</strong> of duplicate code removed</div>
                  <div>✅ <strong>21% reduction</strong> in route definitions</div>
                  <div>✅ <strong>Single source of truth</strong> for all CRUD</div>
                  <div>✅ <strong>7 files fixed</strong> for auth errors</div>
                  <div>✅ <strong>Improved diagnostics</strong> & error handling</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6">
            <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <FileCode className="w-5 h-5 text-purple-500" />
              What Was Kept (Business Logic)
            </h4>
            <p className="text-gray-700 mb-3">
              Special business logic routes not suitable for factory pattern were preserved:
            </p>
            <div className="grid md:grid-cols-2 gap-3 text-sm">
              <div className="bg-purple-50 p-3 rounded">
                <strong>Public Endpoints</strong><br/>
                <span className="text-gray-600">No-auth site/gift access for employees</span>
              </div>
              <div className="bg-purple-50 p-3 rounded">
                <strong>Employee CSV Import</strong><br/>
                <span className="text-gray-600">Complex validation & deduplication</span>
              </div>
              <div className="bg-purple-50 p-3 rounded">
                <strong>Mapping Rules</strong><br/>
                <span className="text-gray-600">Site assignment with conditions</span>
              </div>
              <div className="bg-purple-50 p-3 rounded">
                <strong>SFTP Configuration</strong><br/>
                <span className="text-gray-600">Connection testing & sync</span>
              </div>
              <div className="bg-purple-50 p-3 rounded">
                <strong>Order Processing</strong><br/>
                <span className="text-gray-600">Rate limiting & email notifications</span>
              </div>
              <div className="bg-purple-50 p-3 rounded">
                <strong>Bulk Import</strong><br/>
                <span className="text-gray-600">Product batch processing</span>
              </div>
            </div>
          </div>

          <div className="bg-cyan-50 border-l-4 border-cyan-500 p-4">
            <h4 className="font-bold text-cyan-900 mb-2">📚 Documentation</h4>
            <p className="text-sm text-cyan-800">
              Complete cleanup documentation available at <code className="bg-white px-2 py-1 rounded">/supabase/functions/server/CLEANUP_SUMMARY.md</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== API TAB =====
function APITab() {
  const apiEndpoints = [
    {
      category: 'Authentication',
      color: 'from-red-500 to-red-600',
      endpoints: [
        { method: 'POST', path: '/admin/login', description: 'Admin login with JWT generation', auth: false },
        { method: 'POST', path: '/admin/signup', description: 'Create new admin user', auth: false },
        { method: 'POST', path: '/admin/bootstrap', description: 'Bootstrap first system admin', auth: false },
        { method: 'GET', path: '/admin/me', description: 'Get current admin user info', auth: true },
      ]
    },
    {
      category: 'Clients',
      color: 'from-blue-500 to-blue-600',
      endpoints: [
        { method: 'GET', path: '/clients', description: 'List all clients', auth: true },
        { method: 'GET', path: '/clients/:id', description: 'Get client by ID', auth: true },
        { method: 'POST', path: '/clients', description: 'Create new client', auth: true },
        { method: 'PUT', path: '/clients/:id', description: 'Update client', auth: true },
        { method: 'DELETE', path: '/clients/:id', description: 'Delete client', auth: true },
      ]
    },
    {
      category: 'Sites',
      color: 'from-green-500 to-green-600',
      endpoints: [
        { method: 'GET', path: '/sites', description: 'List all sites', auth: true },
        { method: 'GET', path: '/sites/:id', description: 'Get site by ID', auth: true },
        { method: 'POST', path: '/sites', description: 'Create new site', auth: true },
        { method: 'PUT', path: '/sites/:id', description: 'Update site', auth: true },
        { method: 'DELETE', path: '/sites/:id', description: 'Delete site', auth: true },
      ]
    },
    {
      category: 'Gifts',
      color: 'from-purple-500 to-purple-600',
      endpoints: [
        { method: 'GET', path: '/gifts', description: 'List all gifts (global catalog)', auth: true },
        { method: 'GET', path: '/gifts/:id', description: 'Get gift by ID', auth: true },
        { method: 'POST', path: '/gifts', description: 'Create new gift', auth: true },
        { method: 'PUT', path: '/gifts/:id', description: 'Update gift', auth: true },
        { method: 'DELETE', path: '/gifts/:id', description: 'Delete gift', auth: true },
        { method: 'GET', path: '/sites/:id/gifts', description: 'Get gifts assigned to site', auth: true },
      ]
    },
    {
      category: 'Orders',
      color: 'from-orange-500 to-orange-600',
      endpoints: [
        { method: 'GET', path: '/orders', description: 'List all orders', auth: true },
        { method: 'GET', path: '/orders/:id', description: 'Get order by ID', auth: true },
        { method: 'POST', path: '/orders', description: 'Create new order', auth: false },
        { method: 'PUT', path: '/orders/:id', description: 'Update order status', auth: true },
        { method: 'GET', path: '/sites/:id/orders', description: 'Get orders for site', auth: true },
      ]
    },
    {
      category: 'Utilities',
      color: 'from-cyan-500 to-cyan-600',
      endpoints: [
        { method: 'GET', path: '/health', description: 'Health check endpoint', auth: false },
        { method: 'POST', path: '/seed', description: 'Seed database with test data', auth: false },
        { method: 'POST', path: '/reseed', description: 'Clear and reseed database', auth: false },
      ]
    },
  ];

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-[#D91C81]">
        <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
          <Terminal className="w-8 h-8 text-[#D91C81]" />
          API Documentation
        </h2>
        <p className="text-lg text-gray-700 mb-4">
          RESTful API with JWT authentication. All routes prefixed with <code className="bg-gray-100 px-2 py-1 rounded font-mono text-sm">/make-server-6fcaeea3</code>
        </p>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-green-50 border-l-4 border-green-500 p-4">
            <h4 className="font-bold text-green-900 mb-2">Production Base URL</h4>
            <code className="text-sm font-mono text-green-700 break-all">
              https://lmffeqwhrnbsbhdztwyv.supabase.co/functions/v1/make-server-6fcaeea3
            </code>
          </div>
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
            <h4 className="font-bold text-blue-900 mb-2">Development Base URL</h4>
            <code className="text-sm font-mono text-blue-700 break-all">
              https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3
            </code>
          </div>
        </div>
      </div>

      {/* Authentication */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Key className="w-7 h-7 text-[#D91C81]" />
          Authentication
        </h3>
        
        <div className="space-y-4">
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
            <h4 className="font-bold text-yellow-900 mb-2">Admin Authentication (JWT)</h4>
            <p className="text-sm text-yellow-800 mb-3">
              Protected routes require JWT token in Authorization header
            </p>
            <div className="bg-yellow-100 p-3 rounded font-mono text-sm">
              Authorization: Bearer {'{token}'}
            </div>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
            <h4 className="font-bold text-blue-900 mb-2">Public Endpoints</h4>
            <p className="text-sm text-blue-800 mb-3">
              Some endpoints use public anon key instead
            </p>
            <div className="bg-blue-100 p-3 rounded font-mono text-sm">
              Authorization: Bearer {'{publicAnonKey}'}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="border-2 border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Token Generation</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• HS256 algorithm (HMAC + SHA256)</li>
                <li>• Signed with JWT_SECRET</li>
                <li>• Contains: userId, username, role</li>
                <li>• Default expiration: 24 hours</li>
              </ul>
            </div>
            <div className="border-2 border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Token Validation</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Verified on every protected route</li>
                <li>• Returns 401 if invalid/expired</li>
                <li>• Extracts user info from payload</li>
                <li>• No refresh token (yet)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* API Endpoints */}
      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Network className="w-7 h-7 text-[#D91C81]" />
          API Endpoints
        </h3>

        {apiEndpoints.map((category, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className={`bg-gradient-to-r ${category.color} p-4`}>
              <h4 className="text-xl font-bold text-white">{category.category}</h4>
            </div>
            <div className="divide-y divide-gray-200">
              {category.endpoints.map((endpoint, endIdx) => (
                <div key={endIdx} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-3 py-1 rounded font-bold text-sm ${
                          endpoint.method === 'GET' ? 'bg-blue-100 text-blue-700' :
                          endpoint.method === 'POST' ? 'bg-green-100 text-green-700' :
                          endpoint.method === 'PUT' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {endpoint.method}
                        </span>
                        <code className="font-mono text-sm text-gray-700">
                          /make-server-6fcaeea3{endpoint.path}
                        </code>
                      </div>
                      <p className="text-sm text-gray-600">{endpoint.description}</p>
                    </div>
                    <div>
                      {endpoint.auth ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                          <Lock className="w-3 h-3" />
                          Auth Required
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                          <Globe className="w-3 h-3" />
                          Public
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Request/Response Examples */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <FileCode className="w-7 h-7 text-[#D91C81]" />
          Example Request/Response
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-bold text-gray-900 mb-3">Request Example</h4>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-xs overflow-x-auto">
              <pre>{`POST /make-server-6fcaeea3/admin/login
Content-Type: application/json

{
  "username": "admin@example.com",
  "password": "SecurePassword123!"
}`}</pre>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-3">Response Example</h4>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-xs overflow-x-auto">
              <pre>{`HTTP/1.1 200 OK
Content-Type: application/json

{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "admin_001",
    "username": "admin@example.com",
    "role": "system_admin"
  }
}`}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== SECURITY TAB =====
function SecurityTab() {
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-[#D91C81]">
        <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
          <Shield className="w-8 h-8 text-[#D91C81]" />
          Security & Authentication
        </h2>
        <p className="text-lg text-gray-700">
          Comprehensive security implementation with custom JWT authentication, role-based access control, 
          and industry-standard encryption.
        </p>
      </div>

      {/* JWT Implementation */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Key className="w-7 h-7 text-[#D91C81]" />
          Custom JWT Implementation
        </h3>
        
        <div className="space-y-6">
          <div className="bg-blue-50 border-l-4 border-blue-500 p-6">
            <h4 className="font-bold text-blue-900 mb-3 text-lg">✓ Production-Ready & Tested</h4>
            <p className="text-blue-800 mb-3">
              Custom HS256 JWT solution fully implemented and extensively tested. Confirmed stable across 
              all admin routes and deployment environments.
            </p>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Using jose library for JWT operations</li>
              <li>• HS256 algorithm (HMAC with SHA-256)</li>
              <li>• Secret key stored in JWT_SECRET environment variable</li>
              <li>• Tokens include user ID, username, role, and expiration</li>
            </ul>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="border-2 border-green-200 rounded-lg p-6 bg-green-50">
              <h4 className="text-lg font-bold text-green-900 mb-3">Token Generation</h4>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-semibold text-green-800">Algorithm:</span>
                  <p className="text-gray-700">HS256 (HMAC + SHA256)</p>
                </div>
                <div>
                  <span className="font-semibold text-green-800">Payload:</span>
                  <div className="font-mono text-xs bg-green-100 p-2 rounded mt-1">
                    {`{`} userId, username, role, exp {`}`}
                  </div>
                </div>
                <div>
                  <span className="font-semibold text-green-800">Expiration:</span>
                  <p className="text-gray-700">24 hours default</p>
                </div>
                <div>
                  <span className="font-semibold text-green-800">Secret:</span>
                  <p className="text-gray-700">JWT_SECRET env variable</p>
                </div>
              </div>
            </div>

            <div className="border-2 border-purple-200 rounded-lg p-6 bg-purple-50">
              <h4 className="text-lg font-bold text-purple-900 mb-3">Token Validation</h4>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-semibold text-purple-800">Verification:</span>
                  <p className="text-gray-700">Every protected route</p>
                </div>
                <div>
                  <span className="font-semibold text-purple-800">Storage:</span>
                  <p className="text-gray-700">localStorage (frontend)</p>
                </div>
                <div>
                  <span className="font-semibold text-purple-800">Header:</span>
                  <div className="font-mono text-xs bg-purple-100 p-2 rounded mt-1">
                    Authorization: Bearer {`{token}`}
                  </div>
                </div>
                <div>
                  <span className="font-semibold text-purple-800">Error Response:</span>
                  <p className="text-gray-700">401 Unauthorized</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Role-Based Access Control */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Users className="w-7 h-7 text-[#D91C81]" />
          Role-Based Access Control (RBAC)
        </h3>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold mb-2">System Admin</h4>
            <p className="text-sm text-red-50 mb-3">Full platform access</p>
            <ul className="text-xs space-y-1 text-red-50">
              <li>• Manage all clients & sites</li>
              <li>• Access developer tools</li>
              <li>• User management</li>
              <li>• System configuration</li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4">
              <Building2 className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold mb-2">Client Admin</h4>
            <p className="text-sm text-blue-50 mb-3">Client-level access</p>
            <ul className="text-xs space-y-1 text-blue-50">
              <li>• Manage client sites</li>
              <li>• View client reports</li>
              <li>• Configure sites</li>
              <li>• Limited to assigned client</li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4">
              <Globe className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold mb-2">Site Manager</h4>
            <p className="text-sm text-green-50 mb-3">Site-specific access</p>
            <ul className="text-xs space-y-1 text-green-50">
              <li>• Manage single site</li>
              <li>• Order management</li>
              <li>• Employee access</li>
              <li>• Limited to assigned site</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Password Security */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Lock className="w-7 h-7 text-[#D91C81]" />
          Password Security
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="border-2 border-purple-200 rounded-lg p-6 bg-purple-50">
            <h4 className="text-lg font-bold text-purple-900 mb-4">Bcrypt Hashing</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5" />
                <span>10 salt rounds for hashing</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5" />
                <span>Industry-standard bcrypt algorithm</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5" />
                <span>Passwords never stored in plain text</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5" />
                <span>Resistant to rainbow table attacks</span>
              </li>
            </ul>
          </div>

          <div className="border-2 border-yellow-200 rounded-lg p-6 bg-yellow-50">
            <h4 className="text-lg font-bold text-yellow-900 mb-4">Password Requirements</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                <span>Minimum 8 characters</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                <span>Must include uppercase & lowercase</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                <span>Must include numbers</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                <span>Special characters recommended</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Additional Security Measures */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Shield className="w-7 h-7 text-[#D91C81]" />
          Additional Security Measures
        </h3>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="border-l-4 border-blue-500 pl-4">
            <h4 className="font-bold text-blue-900 mb-2">HTTPS/TLS</h4>
            <p className="text-sm text-gray-700">
              All traffic encrypted in transit with TLS 1.2+
            </p>
          </div>

          <div className="border-l-4 border-green-500 pl-4">
            <h4 className="font-bold text-green-900 mb-2">CORS Protection</h4>
            <p className="text-sm text-gray-700">
              Configured allowed origins to prevent unauthorized access
            </p>
          </div>

          <div className="border-l-4 border-purple-500 pl-4">
            <h4 className="font-bold text-purple-900 mb-2">Database Encryption</h4>
            <p className="text-sm text-gray-700">
              Supabase provides encryption at rest for all data
            </p>
          </div>

          <div className="border-l-4 border-yellow-500 pl-4">
            <h4 className="font-bold text-yellow-900 mb-2">Audit Logging</h4>
            <p className="text-sm text-gray-700">
              All admin actions logged for security auditing
            </p>
          </div>

          <div className="border-l-4 border-red-500 pl-4">
            <h4 className="font-bold text-red-900 mb-2">Input Validation</h4>
            <p className="text-sm text-gray-700">
              Server-side validation on all API endpoints
            </p>
          </div>

          <div className="border-l-4 border-indigo-500 pl-4">
            <h4 className="font-bold text-indigo-900 mb-2">Session Management</h4>
            <p className="text-sm text-gray-700">
              Automatic logout on token expiration
            </p>
          </div>
        </div>
      </div>

      {/* Employee Validation */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <UserPlus className="w-7 h-7 text-[#D91C81]" />
          Employee Validation Methods
        </h3>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-blue-50 rounded-lg p-6">
            <Mail className="w-8 h-8 text-blue-600 mb-3" />
            <h4 className="font-bold text-blue-900 mb-2">Email Validation</h4>
            <p className="text-sm text-gray-700">
              Domain-based validation (e.g., @company.com)
            </p>
          </div>

          <div className="bg-green-50 rounded-lg p-6">
            <Key className="w-8 h-8 text-green-600 mb-3" />
            <h4 className="font-bold text-green-900 mb-2">Employee ID</h4>
            <p className="text-sm text-gray-700">
              Lookup from imported employee database
            </p>
          </div>

          <div className="bg-purple-50 rounded-lg p-6">
            <Box className="w-8 h-8 text-purple-600 mb-3" />
            <h4 className="font-bold text-purple-900 mb-2">Serial Cards</h4>
            <p className="text-sm text-gray-700">
              Pre-generated unique card numbers
            </p>
          </div>

          <div className="bg-yellow-50 rounded-lg p-6">
            <Mail className="w-8 h-8 text-yellow-600 mb-3" />
            <h4 className="font-bold text-yellow-900 mb-2">Magic Links</h4>
            <p className="text-sm text-gray-700">
              Email-based one-time access links
            </p>
          </div>

          <div className="bg-red-50 rounded-lg p-6">
            <Shield className="w-8 h-8 text-red-600 mb-3" />
            <h4 className="font-bold text-red-900 mb-2">SSO Integration</h4>
            <p className="text-sm text-gray-700">
              OAuth/SAML with corporate identity providers
            </p>
          </div>

          <div className="bg-indigo-50 rounded-lg p-6">
            <Settings className="w-8 h-8 text-indigo-600 mb-3" />
            <h4 className="font-bold text-indigo-900 mb-2">Configurable</h4>
            <p className="text-sm text-gray-700">
              Each site can choose validation methods
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== ACCESSIBILITY TAB =====
function AccessibilityTab() {
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-[#D91C81]">
        <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
          <Accessibility className="w-8 h-8 text-[#D91C81]" />
          Accessibility & User Experience
        </h2>
        <p className="text-lg text-gray-700">
          WCAG 2.0 Level AA compliance with comprehensive accessibility features 
          and mobile-responsive design.
        </p>
      </div>

      {/* WCAG Compliance */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <CheckCircle className="w-7 h-7 text-[#D91C81]" />
          WCAG 2.0 Level AA Compliance
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="border-2 border-blue-200 rounded-lg p-6 bg-blue-50">
            <h4 className="text-lg font-bold text-blue-900 mb-4">Color Contrast</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                <span>Minimum 4.5:1 contrast ratio for normal text</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                <span>Minimum 3:1 contrast ratio for large text</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                <span>Tested against WCAG guidelines</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                <span>Color not sole indicator of information</span>
              </li>
            </ul>
          </div>

          <div className="border-2 border-green-200 rounded-lg p-6 bg-green-50">
            <h4 className="text-lg font-bold text-green-900 mb-4">Keyboard Navigation</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                <span>All interactive elements keyboard accessible</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                <span>Visible focus indicators on all elements</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                <span>Logical tab order throughout interface</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                <span>Skip navigation links for main content</span>
              </li>
            </ul>
          </div>

          <div className="border-2 border-purple-200 rounded-lg p-6 bg-purple-50">
            <h4 className="text-lg font-bold text-purple-900 mb-4">Screen Reader Support</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5" />
                <span>ARIA labels on all form inputs</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5" />
                <span>Semantic HTML structure throughout</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5" />
                <span>Alt text for all images</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5" />
                <span>Descriptive link text (no "click here")</span>
              </li>
            </ul>
          </div>

          <div className="border-2 border-yellow-200 rounded-lg p-6 bg-yellow-50">
            <h4 className="text-lg font-bold text-yellow-900 mb-4">Focus Management</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                <span>Focus trapped in modal dialogs</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                <span>Focus returned after modal close</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                <span>No keyboard traps</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                <span>Clear focus indicators (ring styles)</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Responsive Design */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Smartphone className="w-7 h-7 text-[#D91C81]" />
          Responsive Design
        </h3>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <Monitor className="w-12 h-12 mb-4" />
            <h4 className="text-lg font-bold mb-2">Desktop</h4>
            <p className="text-sm text-blue-50 mb-3">1024px and above</p>
            <ul className="text-xs space-y-1 text-blue-50">
              <li>• Full navigation sidebar</li>
              <li>• Multi-column layouts</li>
              <li>• Enhanced data tables</li>
              <li>• Hover interactions</li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
            <Box className="w-12 h-12 mb-4" />
            <h4 className="text-lg font-bold mb-2">Tablet</h4>
            <p className="text-sm text-green-50 mb-3">768px - 1023px</p>
            <ul className="text-xs space-y-1 text-green-50">
              <li>• Collapsible sidebar</li>
              <li>• Responsive grids</li>
              <li>• Touch-friendly targets</li>
              <li>• Optimized forms</li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
            <Smartphone className="w-12 h-12 mb-4" />
            <h4 className="text-lg font-bold mb-2">Mobile</h4>
            <p className="text-sm text-purple-50 mb-3">Below 768px</p>
            <ul className="text-xs space-y-1 text-purple-50">
              <li>• Hamburger menu</li>
              <li>• Single column layout</li>
              <li>• 44px minimum touch targets</li>
              <li>• Simplified navigation</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-500 p-4">
          <h4 className="font-bold text-yellow-900 mb-2">Mobile-First Approach</h4>
          <p className="text-sm text-yellow-800">
            All components designed mobile-first with progressive enhancement for larger screens. 
            Tailwind's responsive utilities ensure consistent behavior across breakpoints.
          </p>
        </div>
      </div>

      {/* Internationalization */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Globe className="w-7 h-7 text-[#D91C81]" />
          Internationalization (i18n)
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="border-2 border-indigo-200 rounded-lg p-6 bg-indigo-50">
            <h4 className="text-lg font-bold text-indigo-900 mb-4">Multi-Language Support</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-indigo-600 mt-0.5" />
                <span>LanguageContext for current language</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-indigo-600 mt-0.5" />
                <span>Translation key system</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-indigo-600 mt-0.5" />
                <span>Dynamic language switching</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-indigo-600 mt-0.5" />
                <span>Locale-aware formatting</span>
              </li>
            </ul>
          </div>

          <div className="border-2 border-pink-200 rounded-lg p-6 bg-pink-50">
            <h4 className="text-lg font-bold text-pink-900 mb-4">Localization Features</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-pink-600 mt-0.5" />
                <span>Date formatting per locale</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-pink-600 mt-0.5" />
                <span>Number formatting (currency, decimals)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-pink-600 mt-0.5" />
                <span>RTL support (planned)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-pink-600 mt-0.5" />
                <span>Timezone handling</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Performance */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Zap className="w-7 h-7 text-[#D91C81]" />
          Performance Optimization
        </h3>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="border-l-4 border-green-500 pl-4">
            <h4 className="font-bold text-green-900 mb-2">Code Splitting</h4>
            <p className="text-sm text-gray-700">
              React.lazy() for route-based code splitting
            </p>
          </div>

          <div className="border-l-4 border-blue-500 pl-4">
            <h4 className="font-bold text-blue-900 mb-2">Lazy Loading</h4>
            <p className="text-sm text-gray-700">
              Components loaded on-demand with Suspense
            </p>
          </div>

          <div className="border-l-4 border-purple-500 pl-4">
            <h4 className="font-bold text-purple-900 mb-2">Image Optimization</h4>
            <p className="text-sm text-gray-700">
              Optimized images with proper sizing
            </p>
          </div>

          <div className="border-l-4 border-yellow-500 pl-4">
            <h4 className="font-bold text-yellow-900 mb-2">Context Caching</h4>
            <p className="text-sm text-gray-700">
              Client and site data cached in contexts
            </p>
          </div>

          <div className="border-l-4 border-red-500 pl-4">
            <h4 className="font-bold text-red-900 mb-2">Minimal Bundle</h4>
            <p className="text-sm text-gray-700">
              Tree-shaking and minimal dependencies
            </p>
          </div>

          <div className="border-l-4 border-indigo-500 pl-4">
            <h4 className="font-bold text-indigo-900 mb-2">Edge Functions</h4>
            <p className="text-sm text-gray-700">
              Low-latency serverless architecture
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== DEPLOYMENT TAB =====
function DeploymentTab() {
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-[#D91C81]">
        <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
          <Cloud className="w-8 h-8 text-[#D91C81]" />
          Deployment & DevOps
        </h2>
        <p className="text-lg text-gray-700">
          Multi-environment deployment strategy with Figma Make hosting and Supabase infrastructure.
        </p>
      </div>

      {/* Environments */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 text-white">
            <div className="flex items-center gap-3 mb-2">
              <Cloud className="w-8 h-8" />
              <h3 className="text-2xl font-bold">Production Environment</h3>
            </div>
            <p className="text-green-50">Live deployment for end users</p>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Supabase Project</h4>
              <code className="text-sm font-mono bg-gray-100 px-3 py-2 rounded block">
                lmffeqwhrnbsbhdztwyv
              </code>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Frontend Hosting</h4>
              <p className="text-sm text-gray-700">Figma Make hosting (auto-deployed)</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Backend</h4>
              <code className="text-xs font-mono bg-gray-100 px-2 py-1 rounded block break-all">
                https://lmffeqwhrnbsbhdztwyv.supabase.co/functions/v1/make-server-6fcaeea3
              </code>
            </div>
            <div className="bg-red-50 border-l-4 border-red-500 p-3">
              <p className="text-sm text-red-800 font-semibold">⚠️ Live data only - no testing!</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
            <div className="flex items-center gap-3 mb-2">
              <Code className="w-8 h-8" />
              <h3 className="text-2xl font-bold">Development Environment</h3>
            </div>
            <p className="text-blue-50">Safe testing and development</p>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Supabase Project</h4>
              <code className="text-sm font-mono bg-gray-100 px-3 py-2 rounded block">
                wjfcqqrlhwdvvjmefxky
              </code>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Frontend Hosting</h4>
              <p className="text-sm text-gray-700">Same Figma Make instance (env switcher)</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Backend</h4>
              <code className="text-xs font-mono bg-gray-100 px-2 py-1 rounded block break-all">
                https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3
              </code>
            </div>
            <div className="bg-green-50 border-l-4 border-green-500 p-3">
              <p className="text-sm text-green-800 font-semibold">✓ Safe for testing and experimentation</p>
            </div>
          </div>
        </div>
      </div>

      {/* Environment Switching */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Settings className="w-7 h-7 text-[#D91C81]" />
          Environment Switching
        </h3>
        
        <div className="space-y-6">
          <div className="bg-blue-50 border-l-4 border-blue-500 p-6">
            <h4 className="font-bold text-blue-900 mb-3">How It Works</h4>
            <p className="text-sm text-blue-800 mb-4">
              The platform includes an environment switcher in the admin interface that allows 
              seamless toggling between Development and Production environments.
            </p>
            <ul className="space-y-2 text-sm text-blue-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span>Environment selection stored in localStorage</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span>Automatic API endpoint configuration based on selection</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span>Visual environment badge in admin interface</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span>Located in Admin → Developer Tools → Environment Management</span>
              </li>
            </ul>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-green-50 rounded-lg p-6">
              <h4 className="font-bold text-green-900 mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Best Practices
              </h4>
              <ul className="space-y-2 text-sm text-green-800">
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Always test in Development first</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Verify changes work before switching to Production</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Use seed data in Development for testing</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Check environment badge before making changes</span>
                </li>
              </ul>
            </div>

            <div className="bg-red-50 rounded-lg p-6">
              <h4 className="font-bold text-red-900 mb-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Important Warnings
              </h4>
              <ul className="space-y-2 text-sm text-red-800">
                <li className="flex items-start gap-2">
                  <span className="text-red-600">⚠</span>
                  <span>Never test experimental features in Production</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600">⚠</span>
                  <span>Double-check environment before data operations</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600">⚠</span>
                  <span>Production data is live - handle with care</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600">⚠</span>
                  <span>No automated rollback - verify before deploy</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Developer Tools */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Wrench className="w-7 h-7 text-[#D91C81]" />
          Developer Tools
        </h3>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-blue-50 rounded-lg p-6">
            <Activity className="w-8 h-8 text-blue-600 mb-3" />
            <h4 className="font-bold text-blue-900 mb-2">Connection Test</h4>
            <p className="text-sm text-gray-700">
              Verify API connectivity and authentication
            </p>
          </div>

          <div className="bg-green-50 rounded-lg p-6">
            <Database className="w-8 h-8 text-green-600 mb-3" />
            <h4 className="font-bold text-green-900 mb-2">Data Diagnostic</h4>
            <p className="text-sm text-gray-700">
              Test endpoints and seed database with test data
            </p>
          </div>

          <div className="bg-purple-50 rounded-lg p-6">
            <FileCode className="w-8 h-8 text-purple-600 mb-3" />
            <h4 className="font-bold text-purple-900 mb-2">Test Data Reference</h4>
            <p className="text-sm text-gray-700">
              Sample credentials and data structures
            </p>
          </div>

          <div className="bg-yellow-50 rounded-lg p-6">
            <Server className="w-8 h-8 text-yellow-600 mb-3" />
            <h4 className="font-bold text-yellow-900 mb-2">Environment Manager</h4>
            <p className="text-sm text-gray-700">
              Switch between Dev and Production
            </p>
          </div>

          <div className="bg-red-50 rounded-lg p-6">
            <BarChart className="w-8 h-8 text-red-600 mb-3" />
            <h4 className="font-bold text-red-900 mb-2">System Dashboard</h4>
            <p className="text-sm text-gray-700">
              Platform-wide metrics and monitoring
            </p>
          </div>

          <div className="bg-indigo-50 rounded-lg p-6">
            <FileText className="w-8 h-8 text-indigo-600 mb-3" />
            <h4 className="font-bold text-indigo-900 mb-2">Audit Logs</h4>
            <p className="text-sm text-gray-700">
              Track all admin actions and changes
            </p>
          </div>
        </div>
      </div>

      {/* Deployment Status */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <CheckCircle className="w-7 h-7 text-[#D91C81]" />
          Current Deployment Status
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <div>
              <h4 className="font-bold text-green-900">Frontend Deployed</h4>
              <p className="text-sm text-green-700">Successfully deployed to Figma Make hosting</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <div>
              <h4 className="font-bold text-green-900">Backend Deployed</h4>
              <p className="text-sm text-green-700">Supabase Edge Functions running successfully</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <div>
              <h4 className="font-bold text-green-900">JWT Authentication</h4>
              <p className="text-sm text-green-700">Custom JWT system tested and confirmed stable</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <div>
              <h4 className="font-bold text-green-900">Multi-Environment Support</h4>
              <p className="text-sm text-green-700">Dev/Prod switching working as expected</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
            <Activity className="w-6 h-6 text-blue-600" />
            <div>
              <h4 className="font-bold text-blue-900">Active Development</h4>
              <p className="text-sm text-blue-700">Ongoing feature development and enhancements</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== DOCUMENTATION TAB =====
function DocumentationTab() {
  const primaryColor = '#D91C81';
  const secondaryColor = '#1B2A5E';
  const tertiaryColor = '#00B4CC';

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <FileText className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Developer Documentation</h2>
            <p className="text-gray-700">
              Comprehensive technical documentation covering architecture, APIs, deployment, testing, and recent platform updates.
            </p>
          </div>
        </div>
      </div>

      {/* Latest Technical Updates */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <GitBranch className="w-5 h-5" style={{ color: primaryColor }} />
          Latest Technical Updates (February 13, 2026)
        </h3>
        <div className="space-y-4">
          <div className="border-l-4 border-green-500 pl-4">
            <h4 className="font-semibold text-gray-900">Site-Aware Navigation Implementation</h4>
            <p className="text-sm text-gray-600">Complete routing refactor with site context preservation and 24 automated tests</p>
            <a href="/SITE_AWARE_NAVIGATION_COMPLETE.md" target="_blank" className="text-sm text-blue-600 hover:underline">View Technical Details →</a>
          </div>
          <div className="border-l-4 border-green-500 pl-4">
            <h4 className="font-semibold text-gray-900">Backend API Enhancements</h4>
            <p className="text-sm text-gray-600">New site update endpoint, consistent session headers, enhanced logging</p>
          </div>
          <div className="border-l-4 border-green-500 pl-4">
            <h4 className="font-semibold text-gray-900">Context Management Improvements</h4>
            <p className="text-sm text-gray-600">Cache invalidation, API integration, type safety enhancements</p>
          </div>
          <div className="border-l-4 border-green-500 pl-4">
            <h4 className="font-semibold text-gray-900">Component Architecture Updates</h4>
            <p className="text-sm text-gray-600">ConfigurableHeader reusability, header navigation fixes, progress steps</p>
            <a href="/HEADER_LOGO_NAVIGATION_FIX.md" target="_blank" className="text-sm text-blue-600 hover:underline">View Documentation →</a>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t">
          <a href="/LATEST_UPDATES_SUMMARY.md" target="_blank" className="text-blue-600 hover:underline font-medium">
            View Complete Technical Update Summary →
          </a>
        </div>
      </div>

      {/* Core Technical Documentation */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Layers className="w-5 h-5" style={{ color: primaryColor }} />
            Architecture & Design
          </h3>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="/ARCHITECTURE.md" target="_blank" className="text-blue-600 hover:underline">
                System Architecture Documentation
              </a>
              <p className="text-gray-600 text-xs">Three-tier architecture, design patterns, data flow</p>
            </li>
            <li>
              <a href="/ACCESS_MANAGEMENT_ARCHITECTURE.md" target="_blank" className="text-blue-600 hover:underline">
                Access Management Architecture
              </a>
              <p className="text-gray-600 text-xs">Authentication flows, validation methods, security model</p>
            </li>
            <li>
              <a href="/ACCESS_MANAGEMENT_BACKEND_INTEGRATION.md" target="_blank" className="text-blue-600 hover:underline">
                Backend Integration Guide
              </a>
              <p className="text-gray-600 text-xs">API integration patterns and implementation details</p>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Terminal className="w-5 h-5" style={{ color: secondaryColor }} />
            API Documentation
          </h3>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="/BACKEND_API_README.md" target="_blank" className="text-blue-600 hover:underline">
                Backend API Reference
              </a>
              <p className="text-gray-600 text-xs">Complete endpoint documentation with examples</p>
            </li>
            <li>
              <a href="/API_REFERENCE_MIGRATED_RESOURCES.md" target="_blank" className="text-blue-600 hover:underline">
                API Migration Resources
              </a>
              <p className="text-gray-600 text-xs">Migration guides and resource mapping</p>
            </li>
            <li>
              <a href="/API_TYPES_IMPORT_FIX_COMPLETE.md" target="_blank" className="text-blue-600 hover:underline">
                API Types Documentation
              </a>
              <p className="text-gray-600 text-xs">TypeScript types and interfaces</p>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Cloud className="w-5 h-5" style={{ color: tertiaryColor }} />
            Deployment & Configuration
          </h3>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="/NETLIFY_DEPLOYMENT_SETUP.md" target="_blank" className="text-blue-600 hover:underline">
                Netlify Deployment Guide
              </a>
              <p className="text-gray-600 text-xs">Frontend deployment and CI/CD setup</p>
            </li>
            <li>
              <a href="/BACKEND_CONFIG.md" target="_blank" className="text-blue-600 hover:underline">
                Backend Configuration
              </a>
              <p className="text-gray-600 text-xs">Supabase setup, Edge Functions, environment variables</p>
            </li>
            <li>
              <a href="/ADMIN_ENVIRONMENT_CONFIG_GUIDE.md" target="_blank" className="text-blue-600 hover:underline">
                Environment Configuration Guide
              </a>
              <p className="text-gray-600 text-xs">Multi-environment setup and management</p>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" style={{ color: primaryColor }} />
            Testing & Quality Assurance
          </h3>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="/AUTOMATED_TEST_EXAMPLES.md" target="_blank" className="text-blue-600 hover:underline">
                Automated Test Examples
              </a>
              <p className="text-gray-600 text-xs">Test patterns, examples, and best practices</p>
            </li>
            <li>
              <a href="/HEADER_WELCOME_STEP_TESTS.md" target="_blank" className="text-blue-600 hover:underline">
                Header Component Tests
              </a>
              <p className="text-gray-600 text-xs">45 tests covering header navigation and steps</p>
            </li>
            <li>
              <a href="/ACCESSIBILITY.md" target="_blank" className="text-blue-600 hover:underline">
                Accessibility Guidelines
              </a>
              <p className="text-gray-600 text-xs">WCAG compliance and accessibility testing</p>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5" style={{ color: secondaryColor }} />
            Security & Authentication
          </h3>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="/ADMIN_AUTH_DEBUG_GUIDE.md" target="_blank" className="text-blue-600 hover:underline">
                Admin Authentication Debug Guide
              </a>
              <p className="text-gray-600 text-xs">Troubleshooting authentication issues</p>
            </li>
            <li>
              <a href="/ADMIN_LOGIN_SOLUTION_COMPLETE.md" target="_blank" className="text-blue-600 hover:underline">
                Admin Login Implementation
              </a>
              <p className="text-gray-600 text-xs">Complete login flow documentation</p>
            </li>
            <li>
              <a href="/401_ERROR_FIX_COMPLETE.md" target="_blank" className="text-blue-600 hover:underline">
                Authentication Error Fixes
              </a>
              <p className="text-gray-600 text-xs">Common auth errors and solutions</p>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Wrench className="w-5 h-5" style={{ color: tertiaryColor }} />
            Developer Setup & Tools
          </h3>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="/ADMIN_SETUP.md" target="_blank" className="text-blue-600 hover:underline">
                Admin Portal Setup
              </a>
              <p className="text-gray-600 text-xs">Local development setup for admin features</p>
            </li>
            <li>
              <a href="/ADMIN_INTERFACES_COMPLETE.md" target="_blank" className="text-blue-600 hover:underline">
                Admin Interface Documentation
              </a>
              <p className="text-gray-600 text-xs">Admin UI components and patterns</p>
            </li>
            <li>
              <a href="/ANALYTICS_CODE_REVIEW_SUMMARY.md" target="_blank" className="text-blue-600 hover:underline">
                Analytics Implementation
              </a>
              <p className="text-gray-600 text-xs">Analytics integration and tracking</p>
            </li>
          </ul>
        </div>
      </div>

      {/* Recent Fixes & Improvements */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5" style={{ color: primaryColor }} />
          Recent Technical Fixes
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Navigation & Routing</h4>
            <ul className="space-y-1 text-sm">
              <li>
                <a href="/SITE_AWARE_NAVIGATION_COMPLETE.md" target="_blank" className="text-blue-600 hover:underline">
                  Site-Aware Navigation Complete
                </a>
              </li>
              <li>
                <a href="/HEADER_LOGO_NAVIGATION_FIX.md" target="_blank" className="text-blue-600 hover:underline">
                  Header Logo Navigation Fix
                </a>
              </li>
              <li>
                <a href="/LANDING_PAGE_NAVIGATION_VALIDATION.md" target="_blank" className="text-blue-600 hover:underline">
                  Landing Page Navigation Validation
                </a>
              </li>
              <li>
                <a href="/NAVIGATION_AND_GIFTS_FIX.md" target="_blank" className="text-blue-600 hover:underline">
                  Navigation and Gifts Fix
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Component & UI Fixes</h4>
            <ul className="space-y-1 text-sm">
              <li>
                <a href="/ADDITIONAL_FIXES.md" target="_blank" className="text-blue-600 hover:underline">
                  Additional Platform Fixes
                </a>
              </li>
              <li>
                <a href="/ANALYTICS_TYPESCRIPT_FIXES.md" target="_blank" className="text-blue-600 hover:underline">
                  Analytics TypeScript Fixes
                </a>
              </li>
              <li>
                <a href="/ACCESSIBILITY_AUDIT_SUMMARY.md" target="_blank" className="text-blue-600 hover:underline">
                  Accessibility Audit Summary
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Quick Developer Links */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Developer Links</h3>
        <div className="grid md:grid-cols-4 gap-4">
          <a href="/stakeholder-review" className="flex items-center gap-2 text-blue-600 hover:underline font-medium">
            <Eye className="w-4 h-4" />
            Stakeholder Review
          </a>
          <a href="/admin/login" className="flex items-center gap-2 text-blue-600 hover:underline font-medium">
            <Lock className="w-4 h-4" />
            Admin Portal
          </a>
          <a href="/site/demo-site" className="flex items-center gap-2 text-blue-600 hover:underline font-medium">
            <Globe className="w-4 h-4" />
            Demo Site
          </a>
          <a href="/APPLICATION_DOCUMENTATION.md" target="_blank" className="flex items-center gap-2 text-blue-600 hover:underline font-medium">
            <FileText className="w-4 h-4" />
            App Documentation
          </a>
        </div>
      </div>

      {/* Development Status */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5" style={{ color: primaryColor }} />
          Current Development Status
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-green-50 border-l-4 border-green-500 p-4">
            <h4 className="font-semibold text-green-900 mb-2">✅ Completed</h4>
            <ul className="space-y-1 text-sm text-green-800">
              <li>• Site-aware navigation with 24 tests</li>
              <li>• Backend API enhancements</li>
              <li>• Configuration persistence</li>
              <li>• Header component improvements</li>
              <li>• Cache management fixes</li>
            </ul>
          </div>
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
            <h4 className="font-semibold text-blue-900 mb-2">🔄 In Progress</h4>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>• Enhanced analytics dashboard</li>
              <li>• Performance optimizations</li>
              <li>• Additional test coverage</li>
              <li>• Documentation updates</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TechnicalReview;
