import { useState } from 'react';
import { Link } from 'react-router';
import { 
  Gift, 
  Shield, 
  Award, 
  Users, 
  MessageCircle, 
  Globe, 
  CheckCircle, 
  AlertCircle,
  Play,
  Home,
  PartyPopper,
  Package,
  Truck,
  Eye,
  Code,
  Settings,
  BarChart,
  Mail,
  Database,
  Lock,
  Palette,
  Zap,
  ArrowRight,
  Info,
  Clock,
  AlertTriangle,
  Store,
  UserPlus,
  Calendar,
  Building2,
  Briefcase,
  type LucideIcon
} from 'lucide-react';

type TabType = 'overview' | 'features' | 'demos' | 'use-cases' | 'gaps' | 'roadmap';

interface UseCase {
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  demoSlug: string;
  scenario: string;
  configuration: {
    landing: string;
    validation: string;
    welcome: string;
    catalog: string;
    shipping: string;
    celebration: string;
  };
  features: string[];
  benefits: string[];
  authInstructions: string;
}

export function StakeholderReview() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const primaryColor = '#D91C81';
  const secondaryColor = '#1B2A5E';
  const tertiaryColor = '#00B4CC';

  const tabs = [
    { id: 'overview', label: 'Platform Overview', icon: Eye },
    { id: 'features', label: 'Features & Capabilities', icon: CheckCircle },
    { id: 'demos', label: 'Interactive Demos', icon: Play },
    { id: 'use-cases', label: 'Use Cases', icon: Briefcase },
    { id: 'gaps', label: 'Current Gaps', icon: AlertCircle },
    { id: 'roadmap', label: 'Development Status', icon: Clock }
  ];

  const coreFeatures = [
    {
      category: 'User Experience Flow',
      icon: Home,
      color: primaryColor,
      status: 'complete',
      items: [
        { name: 'Branded Landing Page', status: 'complete', description: 'Customizable welcome experience with logo, colors, messaging' },
        { name: 'Multi-Site Selection', status: 'complete', description: 'Support for organizations with multiple gift programs' },
        { name: 'Access Validation (5 methods)', status: 'complete', description: 'Email, Employee ID, Serial Card, Magic Link, SSO' },
        { name: 'Welcome Message Page', status: 'complete', description: 'Letter layout with CEO photo or video message' },
        { name: 'Gift Catalog & Selection', status: 'complete', description: 'Searchable, filterable product catalog with smart UI controls' },
        { name: 'Shipping & Address Management', status: 'complete', description: 'Multiple delivery options (ship, pickup, digital)' },
        { name: 'Order Confirmation', status: 'complete', description: 'Confirmation page with order tracking' },
        { name: 'Shopping Cart with Line Items', status: 'complete', description: 'Full cart functionality supporting multiple gift selections' }
      ]
    },
    {
      category: 'Celebration Module',
      icon: Award,
      color: tertiaryColor,
      status: 'complete',
      items: [
        { name: 'Milestone Celebrations', status: 'complete', description: 'Birthday, work anniversary, achievement tracking' },
        { name: 'eCard Creation & Sending', status: 'complete', description: 'Customizable digital cards with templates' },
        { name: 'Team Messages & Wall', status: 'complete', description: 'Collaborative celebration messages' },
        { name: 'Photo Uploads', status: 'complete', description: 'Add personal photos to celebrations' },
        { name: 'Recipient Notifications', status: 'complete', description: 'Email notifications for new messages' }
      ]
    },
    {
      category: 'Admin Portal',
      icon: Settings,
      color: secondaryColor,
      status: 'complete',
      items: [
        { name: 'Client Management', status: 'complete', description: 'Multi-tenant client organization' },
        { name: 'Site Configuration', status: 'complete', description: 'Unified configuration with Header/Footer, Branding, and Gift Selection tabs' },
        { name: 'Multi-Catalog Management', status: 'complete', description: 'Support for multiple catalogs from different ERP sources and external vendors' },
        { name: 'Gift Catalog Management', status: 'complete', description: 'Add, edit, categorize products across multiple catalogs' },
        { name: 'Site-Gift Assignment', status: 'complete', description: 'Control which gifts appear per site' },
        { name: 'Employee Management', status: 'complete', description: 'Three data loading methods: Manual CSV, SFTP, HRIS integration with intelligent site mapping' },
        { name: 'Order Management', status: 'complete', description: 'View and track all orders' },
        { name: 'Brand Management', status: 'complete', description: 'Logo, colors, fonts customization' },
        { name: 'Email Templates', status: 'complete', description: 'Customizable transactional emails' },
        { name: 'Analytics Dashboard', status: 'complete', description: 'Usage metrics and insights' },
        { name: 'Security Dashboard', status: 'complete', description: 'Access logs and security monitoring' },
        { name: 'Admin Authentication', status: 'complete', description: 'Secure admin login without default credentials display' }
      ]
    },
    {
      category: 'Technical Infrastructure',
      icon: Database,
      color: primaryColor,
      status: 'complete',
      items: [
        { name: 'Supabase Backend', status: 'complete', description: 'PostgreSQL database with Edge Functions' },
        { name: 'Authentication System', status: 'complete', description: 'Admin auth with role-based access' },
        { name: 'File Storage', status: 'complete', description: 'Secure blob storage for images/files' },
        { name: 'API Architecture', status: 'complete', description: 'RESTful API with Hono web server' },
        { name: 'Responsive Design', status: 'complete', description: 'Mobile, tablet, desktop optimized' },
        { name: 'Accessibility (WCAG 2.0 AA)', status: 'complete', description: 'Screen reader support, keyboard navigation' }
      ]
    },
    {
      category: 'Internationalization',
      icon: Globe,
      color: tertiaryColor,
      status: 'complete',
      items: [
        { name: 'Multi-language Support', status: 'complete', description: '21 languages including regional variants (en-GB, es-MX, fr-CA, pt-BR, pt-PT, zh-TW)' },
        { name: 'Language Selector', status: 'complete', description: 'Per-user language preference with persistence' },
        { name: 'RTL Support', status: 'complete', description: 'Full right-to-left support for Arabic and Hebrew' },
        { name: 'Intelligent Fallbacks', status: 'complete', description: 'Regional variants fall back to base language automatically' }
      ]
    }
  ];

  const demoScenarios = [
    {
      step: 1,
      title: 'Landing Page',
      path: '/demos/step1',
      icon: Home,
      color: primaryColor,
      description: 'First impression with branding',
      variations: ['Standard', 'Skip to Auth', 'Multi-Site Selection'],
      useCase: 'Company wants employees to see branded welcome before selection'
    },
    {
      step: 2,
      title: 'Access Validation',
      path: '/demos/step2',
      icon: Shield,
      color: secondaryColor,
      description: 'Secure access without employee portal',
      variations: ['Email', 'Employee ID', 'Serial Card', 'Magic Link', 'SSO'],
      useCase: 'Validate recipients without providing employee database access'
    },
    {
      step: 3,
      title: 'Welcome Message',
      path: '/demos/step3',
      icon: PartyPopper,
      color: tertiaryColor,
      description: 'Personal touch from leadership',
      variations: ['Letter with CEO Photo', 'Video Message', 'With Celebration', 'Skip Welcome'],
      useCase: 'CEO wants to personally thank each recipient'
    },
    {
      step: 4,
      title: 'Gift Selection',
      path: '/demos/step4',
      icon: Gift,
      color: primaryColor,
      description: 'Browse and choose gifts',
      variations: ['Grid View', 'Category Filter', 'With Pricing', 'Without Pricing'],
      useCase: 'Recipients browse curated catalog and select preferred gift'
    },
    {
      step: 5,
      title: 'Shipping & Review',
      path: '/demos/step5',
      icon: Truck,
      color: secondaryColor,
      description: 'Delivery information & confirmation',
      variations: ['Company Ship', 'Self Ship', 'Store Pickup', 'Digital Only'],
      useCase: 'Flexible delivery options based on company policy'
    },
    {
      step: 6,
      title: 'Confirmation',
      path: '/demos/step6',
      icon: CheckCircle,
      color: tertiaryColor,
      description: 'Order complete with tracking',
      variations: ['Standard', 'With Tracking', 'Digital Download', 'Multi-Gift'],
      useCase: 'Recipients receive confirmation and can track their order'
    }
  ];

  const useCases: UseCase[] = [
    {
      title: 'Event Gifting - Serial Card Access',
      description: 'Corporate event gifting with unique serial card validation codes',
      icon: Gift,
      color: primaryColor,
      demoSlug: 'demo-event-serial-card',
      scenario: 'Company hosts a conference or corporate event and distributes physical gift cards with unique serial codes. Attendees use the serial code to access their gift selection portal.',
      configuration: {
        landing: 'Event-themed branding with conference logo and messaging',
        validation: 'Serial card code validation (unique code per attendee)',
        welcome: 'Event welcome message from host/sponsor',
        catalog: 'Event-specific gift catalog curated for attendees',
        shipping: 'Ship to home address (attendee provides shipping info)',
        celebration: 'Optional - not typically used for events'
      },
      features: [
        'Unique serial code per attendee (printed on gift card)',
        'One-time use code validation',
        'Event-branded gift selection experience',
        'Attendee self-service shipping address entry',
        'Order tracking and confirmation',
        'Bulk serial code generation for events',
        'Code redemption tracking and analytics'
      ],
      benefits: [
        'No personal data required upfront - attendees provide at redemption',
        'Physical gift cards create tangible event memento',
        'Flexible redemption timing (attendees redeem when convenient)',
        'Trackable redemption rates and gift preferences',
        'Scalable for events of any size'
      ],
      authInstructions: 'Demo uses serial card validation. For demo purposes, enter any code (e.g., CONF2025-ABC123 or EVENT-XYZ789) to access the gift selection portal.'
    },
    {
      title: 'Event Gifting - Ship to Store/Office',
      description: 'Corporate event gifting with centralized delivery to office locations',
      icon: Store,
      color: secondaryColor,
      demoSlug: 'demo-event-ship-to-store',
      scenario: 'Company runs an event or promotion and wants to deliver gifts to specific office/store locations for employee pickup rather than individual home addresses.',
      configuration: {
        landing: 'Event or promotion branding',
        validation: 'Email or Employee ID validation',
        welcome: 'Event announcement with pickup instructions',
        catalog: 'Event-specific gift selection',
        shipping: 'Pre-configured store/office locations for pickup',
        celebration: 'Optional - not typically used for events'
      },
      features: [
        'Employee selects preferred pickup location from dropdown',
        'Pre-configured list of store/office addresses',
        'Bulk shipping to centralized locations',
        'Pickup notification when order arrives at location',
        'Location-based order tracking',
        'Reduced shipping costs vs individual home delivery',
        'Location pickup metrics and reporting'
      ],
      benefits: [
        'Cost savings - bulk shipping to fewer locations',
        'Faster delivery to centralized distribution points',
        'Supports in-office employee populations',
        'Encourages office visits (good for hybrid/remote teams)',
        'Reduces address errors and failed deliveries',
        'Simplified logistics for event coordinators'
      ],
      authInstructions: 'Demo uses email validation. For demo purposes, enter any email address to access the site and see ship-to-store pickup options.'
    },
    {
      title: 'Service Award Recognition',
      description: 'Recognition gifts for employee milestones and anniversaries',
      icon: Award,
      color: tertiaryColor,
      demoSlug: 'service-award',
      scenario: 'Company recognizes employees reaching 5, 10, 15+ year service milestones',
      configuration: {
        landing: 'Professional branding with award theme',
        validation: 'Magic link sent to employee email',
        welcome: 'Personalized letter from leadership with milestone details',
        catalog: 'Tiered catalog based on years of service',
        shipping: 'Choice of home delivery or store pickup',
        celebration: 'Optional - can be added'
      },
      features: [
        'Automated milestone detection from HRIS',
        'Personalized welcome messages',
        'Tiered gift catalogs by service level',
        'Flexible delivery options',
        'Order history and tracking',
        'Certificate or letter download'
      ],
      benefits: [
        'Automated year-round program',
        'Scalable recognition',
        'Employee choice increases satisfaction',
        'Professional presentation'
      ],
      authInstructions: 'Demo uses magic link validation. For demo purposes, validation is bypassed - click "Continue" to access the site.'
    },
    {
      title: 'Service Award with Celebrations',
      description: 'Service awards enhanced with team recognition and eCards',
      icon: PartyPopper,
      color: primaryColor,
      demoSlug: 'service-award-celebration',
      scenario: 'Company wants to combine milestone gifts with peer-to-peer recognition and celebration',
      configuration: {
        landing: 'Celebration-themed branding',
        validation: 'Magic link for recipient, open access for team',
        welcome: 'Celebration page with team messages and eCards',
        catalog: 'Premium gift selection for milestone',
        shipping: 'Flexible delivery options',
        celebration: '✓ Full celebration module enabled'
      },
      features: [
        'Team members create and send eCards',
        'Collaborative message wall',
        'Photo uploads from team celebrations',
        'Email notifications for new messages',
        'Milestone timeline and history',
        'Social recognition features'
      ],
      benefits: [
        'Combines gift + peer recognition',
        'Builds team culture and connection',
        'Lasting digital keepsake',
        'Increases employee engagement'
      ],
      authInstructions: 'Demo uses magic link validation. For demo purposes, validation is bypassed - click "Continue" to access the site.'
    },
    {
      title: 'Employee Onboarding',
      description: 'Manager portal for ordering new hire onboarding kits',
      icon: Users,
      color: tertiaryColor,
      demoSlug: 'employee-onboarding',
      scenario: 'Company needs managers to order standardized onboarding kits for new hires with flexible shipping options to stores or remote locations',
      configuration: {
        landing: 'Branded onboarding portal for managers',
        validation: 'Employee ID or SSO (manager authentication)',
        welcome: 'Onboarding program overview and instructions',
        catalog: 'Pre-configured onboarding kits (tech, apparel, supplies)',
        shipping: 'Ship to store location OR ship to remote employee home',
        celebration: 'Optional welcome messages from team'
      },
      features: [
        'Manager-facing portal (not employee self-service)',
        'Order onboarding kits on behalf of new hires',
        'Ship to specific store/office locations',
        'Ship directly to remote employee home address',
        'Pre-configured kit options (IT, desk setup, swag)',
        'Bulk ordering capability for multiple new hires',
        'Order tracking and delivery confirmation'
      ],
      benefits: [
        'Streamlined onboarding experience for remote and in-office staff',
        'Consistent new hire experience across all locations',
        'Managers control timing and delivery method',
        'Support for distributed and hybrid teams',
        'Reduces HR administrative burden'
      ],
      authInstructions: 'Demo uses employee ID validation. Enter any employee ID (e.g., MGR001 or ADMIN) to access the manager portal.'
    }
  ];

  const currentGaps = [
    {
      category: 'Order Fulfillment',
      priority: 'high',
      items: [
        { name: 'Shipping Provider Integration', impact: 'No real-time shipping rates or label generation' },
        { name: 'Inventory Management', impact: 'No stock tracking or low-inventory alerts' },
        { name: 'Supplier/Vendor Integration', impact: 'Manual order fulfillment process' },
        { name: 'Tracking Number Updates', impact: 'No automated tracking synchronization' }
      ]
    },
    {
      category: 'Payment & E-commerce (Deprioritized)',
      priority: 'low',
      items: [
        { name: 'Payment Gateway Integration', impact: 'Not needed - clients invoiced via ERP, gifting is free for users' },
        { name: 'Shopping Cart (Multi-item)', impact: 'Currently single-item selection (adequate for award programs)' },
        { name: 'Point Balance System', impact: 'Future consideration for employee choice programs' }
      ]
    },
    {
      category: 'Data Integration',
      priority: 'medium',
      items: [
        { name: 'SSO Provider Setup', impact: 'Requires manual configuration per client' },
        { name: 'API for External Systems', impact: 'No programmatic access for client systems' },
        { name: 'Webhook Notifications', impact: 'No real-time event notifications to external systems' }
      ]
    },
    {
      category: 'Advanced Features',
      priority: 'medium',
      items: [
        { name: 'Gift Registry/Wishlist', impact: 'Recipients cannot save favorites' },
        { name: 'Gift Recommendations', impact: 'No personalized suggestions' },
        { name: 'Budget Management', impact: 'No per-department or per-user budget tracking' },
        { name: 'Approval Workflows', impact: 'No manager approval for high-value gifts' },
        { name: 'Bulk Order Processing', impact: 'Each order processed individually' }
      ]
    },
    {
      category: 'Reporting & Analytics',
      priority: 'low',
      items: [
        { name: 'Advanced Analytics', impact: 'Basic metrics only, no deep insights' },
        { name: 'Export/Reporting API', impact: 'Limited export capabilities' },
        { name: 'Custom Report Builder', impact: 'Pre-defined reports only' },
        { name: 'Real-time Dashboard', impact: 'Manual refresh required' }
      ]
    },
    {
      category: 'Communication',
      priority: 'low',
      items: [
        { name: 'SMS Notifications', impact: 'Email notifications only' },
        { name: 'In-app Notifications', impact: 'No notification center' },
        { name: 'Email Scheduling', impact: 'Immediate send only' }
      ]
    }
  ];

  const developmentStatus = {
    phase1: {
      name: 'Phase 1: Core Platform',
      status: 'complete',
      completion: 100,
      items: ['6-step user flow', 'Basic admin portal', 'Client/site structure', 'Database architecture']
    },
    phase2: {
      name: 'Phase 2: Validation & Celebrations',
      status: 'complete',
      completion: 100,
      items: ['5 validation methods', 'Celebration module', 'eCard system', 'Email notifications']
    },
    phase3: {
      name: 'Phase 3: Multi-Catalog Architecture & UX Refinements (Feb 12, 2026)',
      status: 'complete',
      completion: 100,
      items: [
        'Multi-catalog architecture supporting products from multiple ERP sources',
        'Unified Site Configuration with Header/Footer, Branding, and Gift Selection tabs', 
        'Shopping cart with line items and multi-gift selection',
        'Smart UI controls (auto-hide search/filter on catalogs ≤10 gifts)',
        'Landing page route renamed from /landing to /home',
        'Removed default admin credentials from login page',
        'Backend refactoring with CRUD factory pattern (11 resource types)',
        'Fixed critical API route conflicts across public site endpoints'
      ]
    },
    phase4: {
      name: 'Phase 4: E-commerce Foundation',
      status: 'planned',
      completion: 0,
      items: ['Payment integration', 'Shipping API', 'Inventory system', 'Multi-item cart']
    },
    phase5: {
      name: 'Phase 5: Enterprise Integration',
      status: 'planned',
      completion: 0,
      items: ['HRIS connectors', 'Public API', 'Webhooks', 'Advanced SSO']
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">wecelebrate Platform Review</h1>
              <p className="text-gray-600 mt-1">Comprehensive Feature Overview & Stakeholder Demo</p>
            </div>
            <Link
              to="/"
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
            >
              Back to App
            </Link>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? 'bg-[#D91C81] text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Executive Summary */}
            <div className="bg-gradient-to-r from-[#D91C81] via-[#1B2A5E] to-[#00B4CC] rounded-3xl p-8 md:p-12 text-white">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Executive Summary</h2>
              <div className="grid md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                  <div className="text-4xl font-bold mb-2">95%</div>
                  <div className="text-white/90">Core Features Complete</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                  <div className="text-4xl font-bold mb-2">6-Step</div>
                  <div className="text-white/90">User Experience Flow</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                  <div className="text-4xl font-bold mb-2">21</div>
                  <div className="text-white/90">Language Support</div>
                </div>
              </div>
              <p className="text-lg text-white/90 leading-relaxed">
                wecelebrate is a comprehensive corporate gifting and employee recognition platform designed for companies 
                that need to deliver award programs and anniversary celebrations without sharing employee data or 
                requiring external authentication. The platform supports full-service award recognition including 
                service awards, milestone celebrations, and corporate event gifting with a complete 6-step user flow, 
                robust admin portal with multi-catalog architecture, integrated celebration module with shopping cart, 
                and flexible validation methods. The landing page has been streamlined with the route renamed from 
                <code className="px-1.5 py-0.5 bg-white/20 rounded text-sm font-mono mx-1">/landing</code> to 
                <code className="px-1.5 py-0.5 bg-white/20 rounded text-sm font-mono mx-1">/home</code> for better UX. 
                Gifting is free for end users with clients invoiced through our ERP system. Currently deployed and ready for stakeholder review.
              </p>
            </div>

            {/* Key Highlights */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border-2 border-green-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">What's Working</h3>
                </div>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Complete 6-step user flow (landing → confirmation)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Award recognition system with milestone tracking</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Anniversary celebrations with team collaboration</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Celebration module with eCards & messages</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>5 validation methods (no employee data sharing)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Multi-tenant architecture with site-specific branding</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>21 languages with RTL support (WCAG 2.0 AA)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Employee data import via CSV, SFTP, and HRIS</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Backend refactored with CRUD factory pattern</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Multi-catalog architecture for products from different ERP sources</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Smart UI controls with auto-hiding search/filter on small catalogs</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-xl border-2 border-orange-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">What's Missing</h3>
                </div>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                    <span>Shipping provider API (UPS/FedEx/USPS)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                    <span>Real-time inventory management system</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                    <span>Live HRIS/HR system integrations (in progress)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                    <span>Public REST API for external systems</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                    <span>Advanced analytics dashboards</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                    <span>Automated tracking number sync</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span><strong>Note:</strong> Payment gateway deprioritized - gifting is free for users, clients invoiced via ERP</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Quick Navigation */}
            <div className="grid md:grid-cols-4 gap-4">
              <button
                onClick={() => setActiveTab('features')}
                className="p-6 bg-white rounded-xl border-2 border-gray-200 hover:border-[#D91C81] transition-all text-left group"
              >
                <CheckCircle className="w-8 h-8 text-[#D91C81] mb-3" />
                <h3 className="font-bold text-gray-900 mb-1">Features</h3>
                <p className="text-sm text-gray-600">See all capabilities</p>
              </button>
              <button
                onClick={() => setActiveTab('demos')}
                className="p-6 bg-white rounded-xl border-2 border-gray-200 hover:border-[#1B2A5E] transition-all text-left group"
              >
                <Play className="w-8 h-8 text-[#1B2A5E] mb-3" />
                <h3 className="font-bold text-gray-900 mb-1">Demos</h3>
                <p className="text-sm text-gray-600">Try interactive previews</p>
              </button>
              <button
                onClick={() => setActiveTab('use-cases')}
                className="p-6 bg-white rounded-xl border-2 border-gray-200 hover:border-[#00B4CC] transition-all text-left group"
              >
                <Briefcase className="w-8 h-8 text-[#00B4CC] mb-3" />
                <h3 className="font-bold text-gray-900 mb-1">Use Cases</h3>
                <p className="text-sm text-gray-600">Explore real-world scenarios</p>
              </button>
              <button
                onClick={() => setActiveTab('gaps')}
                className="p-6 bg-white rounded-xl border-2 border-gray-200 hover:border-orange-500 transition-all text-left group"
              >
                <AlertCircle className="w-8 h-8 text-orange-500 mb-3" />
                <h3 className="font-bold text-gray-900 mb-1">Gaps</h3>
                <p className="text-sm text-gray-600">Review missing features</p>
              </button>
              <button
                onClick={() => setActiveTab('roadmap')}
                className="p-6 bg-white rounded-xl border-2 border-gray-200 hover:border-[#00B4CC] transition-all text-left group"
              >
                <Clock className="w-8 h-8 text-[#00B4CC] mb-3" />
                <h3 className="font-bold text-gray-900 mb-1">Roadmap</h3>
                <p className="text-sm text-gray-600">Development timeline</p>
              </button>
            </div>
          </div>
        )}

        {/* Features Tab */}
        {activeTab === 'features' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Platform Capabilities</h2>
              <p className="text-gray-600">Comprehensive list of all implemented features and functionality</p>
            </div>

            {coreFeatures.map((feature, index) => {
              const IconComponent = feature.icon;
              const completedItems = feature.items.filter(item => item.status === 'complete').length;
              const totalItems = feature.items.length;
              const completionRate = Math.round((completedItems / totalItems) * 100);

              return (
                <div key={index} className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
                  <div 
                    className="p-6 border-b border-gray-200"
                    style={{ backgroundColor: `${feature.color}10` }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-white"
                          style={{ backgroundColor: feature.color }}
                        >
                          <IconComponent className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{feature.category}</h3>
                          <p className="text-sm text-gray-600">{completedItems} of {totalItems} complete</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold" style={{ color: feature.color }}>
                          {completionRate}%
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="space-y-3">
                      {feature.items.map((item, idx) => (
                        <div 
                          key={idx} 
                          className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                        >
                          {item.status === 'complete' ? (
                            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          ) : (
                            <Clock className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                          )}
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900">{item.name}</div>
                            <div className="text-sm text-gray-600 mt-0.5">{item.description}</div>
                          </div>
                          <span 
                            className={`text-xs font-medium px-2 py-1 rounded-full ${
                              item.status === 'complete' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-orange-100 text-orange-700'
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Demos Tab */}
        {activeTab === 'demos' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-[#D91C81] to-[#1B2A5E] rounded-xl p-8 text-white">
              <h2 className="text-3xl font-bold mb-3">Interactive User Flow Demos</h2>
              <p className="text-white/90 text-lg">
                Experience the complete 6-step user journey. Each demo shows multiple variations 
                to demonstrate the platform's flexibility for different use cases.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {demoScenarios.map((demo) => {
                const IconComponent = demo.icon;
                return (
                  <Link
                    key={demo.step}
                    to={demo.path}
                    className="group bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-[#D91C81] hover:shadow-xl transition-all"
                  >
                    {/* Step Number */}
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                        style={{ backgroundColor: demo.color }}
                      >
                        {demo.step}
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-[#D91C81] group-hover:translate-x-1 transition-all" />
                    </div>

                    {/* Icon & Title */}
                    <div className="mb-4">
                      <div className="flex items-center gap-3 mb-2">
                        <IconComponent className="w-6 h-6" style={{ color: demo.color }} />
                        <h3 className="font-bold text-gray-900 text-lg">{demo.title}</h3>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">{demo.description}</p>
                    </div>

                    {/* Use Case */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                      <p className="text-xs font-semibold text-blue-900 mb-1">USE CASE:</p>
                      <p className="text-sm text-blue-800">{demo.useCase}</p>
                    </div>

                    {/* Variations */}
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        {demo.variations.length} Variations
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {demo.variations.map((variation, idx) => (
                          <span
                            key={idx}
                            className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full"
                          >
                            {variation}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Additional Demo Info */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">About These Demos</h3>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• All demos are fully interactive with real UI components</li>
                    <li>• Each step shows multiple configuration variations</li>
                    <li>• Responsive design works on desktop, tablet, and mobile</li>
                    <li>• Use cases demonstrate real-world business scenarios</li>
                    <li>• Demos use mock data - no actual orders are created</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Live Demo Sites Call-to-Action */}
            <div className="bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-200 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-2">Try Live Demo Sites</h3>
                  <p className="text-gray-700 mb-4">
                    Want to see the <strong>complete end-to-end experience</strong>? Check out the <strong>Use Cases</strong> tab 
                    for fully functional demo sites with real data, actual validation flows, and working gift selection. 
                    Each demo site is seeded in the development database and can be modified through the admin portal.
                  </p>
                  <button
                    onClick={() => setActiveTab('use-cases')}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#D91C81] to-[#1B2A5E] text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                  >
                    <Briefcase className="w-5 h-5" />
                    View Live Demo Sites
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Use Cases Tab */}
        {activeTab === 'use-cases' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-[#D91C81] to-[#1B2A5E] rounded-xl p-8 text-white">
              <h2 className="text-3xl font-bold mb-3">Client Use Cases</h2>
              <p className="text-white/90 text-lg">
                Real-world business scenarios showing how wecelebrate can be configured for different gifting programs. 
                Each use case demonstrates platform flexibility and configuration options.
              </p>
            </div>

            {useCases.map((useCase, index) => {
              const IconComponent = useCase.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden hover:shadow-xl transition-all"
                >
                  {/* Header */}
                  <div 
                    className="p-6 border-b border-gray-200"
                    style={{ backgroundColor: `${useCase.color}10` }}
                  >
                    <div className="flex items-start gap-4">
                      <div 
                        className="w-14 h-14 rounded-xl flex items-center justify-center text-white flex-shrink-0"
                        style={{ backgroundColor: useCase.color }}
                      >
                        <IconComponent className="w-7 h-7" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">{useCase.title}</h3>
                        <p className="text-gray-700 text-base mb-3">{useCase.description}</p>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <p className="text-xs font-semibold text-blue-900 uppercase tracking-wide mb-1">Business Scenario</p>
                          <p className="text-sm text-blue-800">{useCase.scenario}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Content Grid */}
                  <div className="p-6">
                    <div className="grid lg:grid-cols-2 gap-6">
                      {/* Platform Configuration */}
                      <div>
                        <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <Settings className="w-5 h-5 text-gray-600" />
                          Platform Configuration
                        </h4>
                        <div className="space-y-3">
                          {Object.entries(useCase.configuration).map(([key, value], idx) => (
                            <div key={idx} className="flex items-start gap-2 text-sm">
                              <div className="w-2 h-2 rounded-full bg-[#D91C81] mt-1.5 flex-shrink-0"></div>
                              <div>
                                <span className="font-semibold text-gray-900 capitalize">{key.replace(/([A-Z])/g, ' $1')}: </span>
                                <span className="text-gray-700">{value}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Key Features */}
                      <div>
                        <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          Key Features Used
                        </h4>
                        <div className="space-y-2">
                          {useCase.features.map((feature, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-sm">
                              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-700">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Benefits Section */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-yellow-600" />
                        Business Benefits
                      </h4>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {useCase.benefits.map((benefit, idx) => (
                          <div 
                            key={idx} 
                            className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg"
                          >
                            <ArrowRight className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-700">{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Authentication Instructions & Preview Button */}
                    {useCase.demoSlug && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        {useCase.authInstructions && (
                            <div className="mb-4">
                                <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                                  <Shield className="w-5 h-5 text-blue-600" />
                                  How to Access Demo
                                </h4>
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                  <p className="text-sm text-blue-900">{useCase.authInstructions}</p>
                                </div>
                            </div>
                        )}
                        
                        {/* Demo Site Information Panel */}
                        <div className="mb-4">
                          <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <Database className="w-5 h-5 text-purple-600" />
                            Demo Site Details
                          </h4>
                          <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-4">
                            <div className="grid sm:grid-cols-3 gap-4">
                              {/* Client Info */}
                              <div>
                                <div className="text-xs font-bold text-purple-900 uppercase tracking-wide mb-1.5">
                                  <Building2 className="w-3 h-3 inline mr-1" />
                                  Client
                                </div>
                                <div className="font-semibold text-gray-900">JALA Demo</div>
                                <div className="text-sm text-gray-600">Stakeholder Sites</div>
                              </div>
                              
                              {/* Site Info */}
                              <div>
                                <div className="text-xs font-bold text-purple-900 uppercase tracking-wide mb-1.5">
                                  <Globe className="w-3 h-3 inline mr-1" />
                                  Site
                                </div>
                                <div className="font-semibold text-gray-900">{useCase.title}</div>
                                <div className="text-xs text-gray-600 font-mono bg-white/60 px-2 py-0.5 rounded mt-1 inline-block">
                                  {useCase.demoSlug}
                                </div>
                              </div>
                              
                              {/* Validation Method & Test Credentials */}
                              <div>
                                <div className="text-xs font-bold text-purple-900 uppercase tracking-wide mb-1.5">
                                  <Lock className="w-3 h-3 inline mr-1" />
                                  Test Credentials
                                </div>
                                {useCase.demoSlug === 'demo-event-serial-card' && (
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">Serial Card</div>
                                    <code className="text-xs bg-white border border-purple-300 px-2 py-1 rounded mt-1 inline-block font-mono font-semibold text-purple-900">
                                      CONF2025-ABC123
                                    </code>
                                  </div>
                                )}
                                {useCase.demoSlug === 'demo-event-ship-to-store' && (
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">Email</div>
                                    <code className="text-xs bg-white border border-purple-300 px-2 py-1 rounded mt-1 inline-block font-mono font-semibold text-purple-900 break-all">
                                      employee@company.com
                                    </code>
                                  </div>
                                )}
                                {useCase.demoSlug === 'service-award' && (
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">Email</div>
                                    <code className="text-xs bg-white border border-purple-300 px-2 py-1 rounded mt-1 inline-block font-mono font-semibold text-purple-900 break-all">
                                      jennifer.martinez@company.com
                                    </code>
                                  </div>
                                )}
                                {useCase.demoSlug === 'service-award-celebration' && (
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">Email</div>
                                    <code className="text-xs bg-white border border-purple-300 px-2 py-1 rounded mt-1 inline-block font-mono font-semibold text-purple-900 break-all">
                                      jennifer.martinez@company.com
                                    </code>
                                  </div>
                                )}
                                {useCase.demoSlug === 'employee-onboarding' && (
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">Employee ID</div>
                                    <code className="text-xs bg-white border border-purple-300 px-2 py-1 rounded mt-1 inline-block font-mono font-semibold text-purple-900">
                                      MGR001
                                    </code>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <a
                          href={`/site/${useCase.demoSlug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white transition-all hover:scale-105 hover:shadow-lg"
                          style={{ backgroundColor: useCase.color }}
                        >
                          <Play className="w-5 h-5" />
                          Preview Demo Site
                          <ArrowRight className="w-4 h-4" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Use Case Summary */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">About These Use Cases</h3>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Each use case represents a real-world business scenario</li>
                    <li>• Platform can be configured differently for each client need</li>
                    <li>• Multiple use cases can run simultaneously for different sites</li>
                    <li>• All configurations are managed through the admin portal</li>
                    <li>• Custom branding and messaging per use case</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Demo Sites Note */}
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <Database className="w-6 h-6 text-purple-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Live Demo Sites in Development Database</h3>
                  <p className="text-gray-700 mb-3">
                    All demo sites listed above are <strong>real, fully functional sites</strong> seeded in the development database. 
                    They are not mock-ups or prototypes—they use actual data and can be accessed, tested, and modified through the admin portal.
                  </p>
                  <div className="bg-white border border-purple-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Settings className="w-4 h-4 text-purple-600" />
                      Admin Portal Access
                    </h4>
                    <ul className="text-sm text-gray-700 space-y-1.5">
                      <li>• <strong>Login:</strong> <a href="/admin/login" className="text-[#D91C81] hover:underline">/admin/login</a></li>
                      <li>• <strong>Client:</strong> JALA Demo - Stakeholder Sites</li>
                      <li>• <strong>Modify Sites:</strong> Update branding, messages, validation methods, catalog assignments</li>
                      <li>• <strong>View Orders:</strong> See test orders placed through demo sites</li>
                      <li>• <strong>Manage Employees:</strong> Add/edit test employees for validation testing</li>
                      <li>• <strong>Edit Catalogs:</strong> Modify gift offerings and assignments per site</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Gaps Tab */}
        {activeTab === 'gaps' && (
          <div className="space-y-6">
            <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Current Platform Gaps</h2>
                  <p className="text-gray-700">
                    These features are not currently implemented but may be needed for production deployment 
                    depending on business requirements and use cases.
                  </p>
                </div>
              </div>
            </div>

            {currentGaps.map((gap, index) => (
              <div key={index} className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
                <div 
                  className={`p-4 border-b border-gray-200 ${
                    gap.priority === 'high' ? 'bg-red-50' : gap.priority === 'medium' ? 'bg-orange-50' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-900">{gap.category}</h3>
                    <span 
                      className={`text-xs font-bold px-3 py-1 rounded-full uppercase ${
                        gap.priority === 'high' 
                          ? 'bg-red-100 text-red-700' 
                          : gap.priority === 'medium'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {gap.priority} Priority
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    {gap.items.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">{item.name}</div>
                          <div className="text-sm text-gray-600 mt-0.5">Impact: {item.impact}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            {/* Impact Analysis */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4">Gap Impact Analysis</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="text-2xl font-bold text-red-700 mb-1">
                    {currentGaps.filter(g => g.priority === 'high').reduce((sum, g) => sum + g.items.length, 0)}
                  </div>
                  <div className="text-sm text-red-800 font-medium">High Priority Gaps</div>
                  <p className="text-xs text-red-700 mt-1">Critical for production use</p>
                </div>
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="text-2xl font-bold text-orange-700 mb-1">
                    {currentGaps.filter(g => g.priority === 'medium').reduce((sum, g) => sum + g.items.length, 0)}
                  </div>
                  <div className="text-sm text-orange-800 font-medium">Medium Priority Gaps</div>
                  <p className="text-xs text-orange-700 mt-1">Important for scale</p>
                </div>
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="text-2xl font-bold text-gray-700 mb-1">
                    {currentGaps.filter(g => g.priority === 'low').reduce((sum, g) => sum + g.items.length, 0)}
                  </div>
                  <div className="text-sm text-gray-800 font-medium">Low Priority Gaps</div>
                  <p className="text-xs text-gray-700 mt-1">Nice-to-have features</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Roadmap Tab */}
        {activeTab === 'roadmap' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Development Timeline</h2>
              <p className="text-gray-600">Current progress and upcoming development phases</p>
            </div>

            {/* Timeline */}
            <div className="space-y-4">
              {Object.entries(developmentStatus).map(([key, phase], index) => (
                <div key={key} className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                            phase.status === 'complete' ? 'bg-green-500' : 'bg-gray-400'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">{phase.name}</h3>
                            <p className="text-sm text-gray-600 capitalize">{phase.status}</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${
                          phase.completion === 100 ? 'text-green-600' : 'text-gray-400'
                        }`}>
                          {phase.completion}%
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-4">
                      <div 
                        className={`h-full transition-all ${
                          phase.completion === 100 ? 'bg-green-500' : 'bg-gray-400'
                        }`}
                        style={{ width: `${phase.completion}%` }}
                      />
                    </div>

                    {/* Items */}
                    <div className="grid sm:grid-cols-2 gap-2">
                      {phase.items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                          {phase.status === 'complete' ? (
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          ) : (
                            <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          )}
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Current Status Summary (Updated Feb 12, 2026)</h3>
                  <p className="text-gray-700 mb-3">
                    <strong>Phases 1-3 are complete</strong> including the multi-catalog architecture and UX refinements completed February 12, 2026. 
                    The platform is deployed to production at{' '}
                    <a 
                      href="https://jala2-dev.netlify.app" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[#D91C81] hover:underline font-medium"
                    >
                      jala2-dev.netlify.app
                    </a>
                    . All demo use case sites are fully seeded in the development database and accessible through the admin portal for 
                    configuration, testing, and live demonstrations.
                  </p>
                  <p className="text-gray-700">
                    <strong>Phases 4-5</strong> represent enterprise features (payment processing, shipping integration, 
                    HRIS connectors) that can be prioritized based on business requirements and client needs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default StakeholderReview;