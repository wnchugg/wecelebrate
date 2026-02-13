import { FileText, Book, Users, ShoppingCart, Gift, Package, Mail, Settings, Eye, Shield, CheckCircle, ArrowRight, Info, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router';

export function ApplicationDocumentation() {
  const documentationSections = [
    {
      title: 'Getting Started',
      icon: Book,
      color: 'from-blue-500 to-blue-600',
      documents: [
        {
          name: 'Platform Overview',
          description: 'Introduction to the weCelebrate Event Gifting Platform',
          topics: ['Purpose', 'Key features', 'User roles', 'Workflow overview']
        },
        {
          name: 'Admin User Guide',
          description: 'How to use the admin interface',
          topics: ['Login process', 'Navigation', 'Dashboard overview', 'Site selection']
        },
        {
          name: 'First Time Setup',
          description: 'Initial configuration steps for new deployments',
          topics: ['Create first client', 'Setup first site', 'Configure branding', 'Add products']
        }
      ]
    },
    {
      title: 'Client Management',
      icon: Users,
      color: 'from-purple-500 to-purple-600',
      documents: [
        {
          name: 'Creating Clients',
          description: 'How to set up new corporate clients',
          topics: ['Client creation form', 'Required information', 'Client settings', 'Status management']
        },
        {
          name: 'Client Dashboard',
          description: 'View and manage client performance',
          topics: ['Client metrics', 'Site overview', 'Order summary', 'Reports']
        },
        {
          name: 'Multi-Client Management',
          description: 'Best practices for managing multiple clients',
          topics: ['Client organization', 'Filtering', 'Bulk operations', 'Reporting']
        }
      ]
    },
    {
      title: 'Site Management',
      icon: Settings,
      color: 'from-green-500 to-green-600',
      documents: [
        {
          name: 'Creating Sites',
          description: 'How to create and configure sites for clients',
          topics: ['Site creation', 'Domain setup', 'Branding configuration', 'Status control']
        },
        {
          name: 'Site Configuration',
          description: 'Customize site settings and appearance',
          topics: ['Brand colors', 'Logo upload', 'Custom messaging', 'Language settings']
        },
        {
          name: 'Site Selector',
          description: 'How to switch between different sites',
          topics: ['Environment selection', 'Client filtering', 'Site search', 'Quick switching']
        }
      ]
    },
    {
      title: 'Product & Gift Management',
      icon: Gift,
      color: 'from-pink-500 to-pink-600',
      documents: [
        {
          name: 'Gift Catalog',
          description: 'Managing the global gift catalog',
          topics: ['Add products', 'Product details', 'Pricing', 'Inventory management']
        },
        {
          name: 'Site Gift Assignment',
          description: 'Assign gifts to specific sites',
          topics: ['Product selection', 'Site-specific catalogs', 'Custom pricing', 'Availability']
        },
        {
          name: 'Product Categories',
          description: 'Organizing gifts into categories',
          topics: ['Category creation', 'Product organization', 'Filtering', 'Display order']
        }
      ]
    },
    {
      title: 'Order Management',
      icon: ShoppingCart,
      color: 'from-orange-500 to-orange-600',
      documents: [
        {
          name: 'Viewing Orders',
          description: 'How to view and manage employee orders',
          topics: ['Order list', 'Order details', 'Filtering options', 'Status tracking']
        },
        {
          name: 'Order Processing',
          description: 'Processing and fulfilling orders',
          topics: ['Order status updates', 'Shipping management', 'Order modifications', 'Cancellations']
        },
        {
          name: 'Order Reports',
          description: 'Generate reports on order activity',
          topics: ['Export orders', 'Analytics', 'Client reports', 'Shipping reports']
        }
      ]
    },
    {
      title: 'Employee Management',
      icon: Users,
      color: 'from-cyan-500 to-cyan-600',
      documents: [
        {
          name: 'Employee Data Loading',
          description: 'Three methods to load and manage employee data',
          topics: ['Manual CSV upload', 'SFTP automated sync', 'HRIS integration', 'Data validation']
        },
        {
          name: 'Site Mapping Rules',
          description: 'Automatically assign employees to sites based on attributes',
          topics: ['Country-based mapping', 'Department mapping', 'Region mapping', 'Priority rules']
        },
        {
          name: 'Manual Employee Upload',
          description: 'Upload employee data via CSV file',
          topics: ['CSV template', 'Field requirements', 'Import validation', 'Error handling']
        },
        {
          name: 'SFTP Integration',
          description: 'Configure automated employee data imports via SFTP',
          topics: ['Connection setup', 'Authentication', 'File patterns', 'Scheduling', 'Archive management']
        },
        {
          name: 'HRIS Integration',
          description: 'Connect to Workday, BambooHR, ADP and other HRIS systems',
          topics: ['Provider setup', 'OAuth/API authentication', 'Field mapping', 'Real-time sync']
        },
        {
          name: 'Validation Methods',
          description: 'Configure how employees validate their identity',
          topics: ['Email validation', 'Employee ID', 'Serial cards', 'Magic links', 'SSO']
        },
        {
          name: 'Employee Data Security',
          description: 'Handling employee information securely',
          topics: ['Data privacy', 'GDPR compliance', 'Data retention', 'Access controls']
        }
      ]
    },
    {
      title: 'Reports & Analytics',
      icon: Package,
      color: 'from-indigo-500 to-indigo-600',
      documents: [
        {
          name: 'Client Reports',
          description: 'Generate reports for client performance',
          topics: ['Order volume', 'Product popularity', 'Site performance', 'Export options']
        },
        {
          name: 'Analytics Dashboard',
          description: 'View platform-wide analytics',
          topics: ['Key metrics', 'Trends', 'Comparison views', 'Time periods']
        },
        {
          name: 'Custom Reports',
          description: 'Create custom report configurations',
          topics: ['Report builder', 'Filter options', 'Scheduled reports', 'Export formats']
        }
      ]
    },
    {
      title: 'Communication',
      icon: Mail,
      color: 'from-yellow-500 to-yellow-600',
      documents: [
        {
          name: 'Email Templates',
          description: 'Customize email communications',
          topics: ['Template editor', 'Personalization', 'Preview', 'Test emails']
        },
        {
          name: 'Notification Settings',
          description: 'Configure automated notifications',
          topics: ['Order confirmations', 'Shipping updates', 'Admin notifications', 'Triggers']
        },
        {
          name: 'Multi-Language Support',
          description: '21 languages with full RTL support for Arabic and Hebrew',
          topics: ['21 supported languages', 'RTL layout (Arabic, Hebrew)', 'Regional variants', 'Automatic fallback system', 'Translation management']
        }
      ]
    }
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Application Documentation</h1>
        <p className="text-gray-600 mt-2">
          User guides and stakeholder documentation for the weCelebrate Platform - supporting both corporate event gifting and employee anniversary recognition programs.
          For technical and development documentation, see <span className="font-semibold text-[#D91C81]">Developer Tools → Development Documentation</span>.
        </p>
        
        {/* Platform Purpose Summary */}
        <div className="mt-4 bg-gradient-to-r from-[#D91C81]/10 to-[#1B2A5E]/10 border border-[#D91C81]/20 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-2">Platform Purpose</h3>
          <p className="text-sm text-gray-700 mb-3">
            weCelebrate serves two primary and complementary use cases:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <h4 className="font-semibold text-[#D91C81] text-sm mb-1">1. Event Gifting</h4>
              <p className="text-xs text-gray-600">
                Corporate event-based gifting programs where recipients select and receive gifts. Often doesn't require direct employee data; uses magic links, serial cards, or email validation.
              </p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <h4 className="font-semibold text-[#1B2A5E] text-sm mb-1">2. Service Award Anniversary Recognition</h4>
              <p className="text-xs text-gray-600">
                Comprehensive employee anniversary celebration and gift selection. Uses employee database with bulk import capabilities for validation, tracking, and peer/manager celebration.
              </p>
            </div>
          </div>
        </div>
        
        {/* Quick Link to Stakeholder Review */}
        <div className="mt-4">
          <Link
            to="/stakeholder-review"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#D91C81] to-[#1B2A5E] text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
          >
            <Eye className="w-5 h-5" />
            📊 View Comprehensive Stakeholder Review
          </Link>
          <p className="text-sm text-gray-500 mt-2">
            Interactive platform overview with features, demos, and use cases for stakeholders
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {documentationSections.map((section, idx) => (
          <div key={idx} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Section Header */}
            <div className={`bg-gradient-to-r ${section.color} p-6`}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <section.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{section.title}</h2>
                </div>
              </div>
            </div>

            {/* Documents */}
            <div className="p-6 space-y-6">
              {section.documents.map((doc, docIdx) => (
                <div key={docIdx} className="border-l-4 border-gray-200 pl-6 hover:border-[#D91C81] transition-colors">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{doc.name}</h3>
                  <p className="text-gray-600 text-sm mb-3">{doc.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {doc.topics.map((topic, topicIdx) => (
                      <span
                        key={topicIdx}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Reference */}
      <div className="bg-gradient-to-r from-[#D91C81] to-[#B71569] rounded-xl p-6 text-white">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <FileText className="w-6 h-6" />
          Quick Reference
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <h3 className="font-semibold mb-2">Support Contact</h3>
            <p className="text-sm text-white/90">For technical support and questions</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <h3 className="font-semibold mb-2">Training Resources</h3>
            <p className="text-sm text-white/90">Access video tutorials and guides</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <h3 className="font-semibold mb-2">Best Practices</h3>
            <p className="text-sm text-white/90">Recommended workflows and tips</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <h3 className="font-semibold mb-2">Release Notes</h3>
            <p className="text-sm text-white/90">Latest updates and features</p>
          </div>
        </div>
      </div>

      {/* Getting Help */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-blue-900 mb-3">Getting Help</h2>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-1">•</span>
            <span>Contact your system administrator for account access and permissions</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-1">•</span>
            <span>Use the <strong>Site Selector</strong> in the top right to switch between different client sites</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-1">•</span>
            <span>Check <strong>Order Management</strong> to track all employee gift orders</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-1">•</span>
            <span>Review <strong>Analytics</strong> and <strong>Reports</strong> for platform insights</span>
          </li>
        </ul>
      </div>

      {/* RBAC System Overview Section */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">RBAC System Overview</h2>
          <p className="text-gray-600 mt-1">Understanding Roles, Access Groups, and Permissions</p>
        </div>

        {/* Key Concepts */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4">🔑 Key Concepts</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Access Groups */}
            <div className="bg-white rounded-lg p-4 border border-cyan-200">
              <div className="flex items-center gap-2 mb-3">
                <Eye className="w-6 h-6 text-cyan-600" />
                <h4 className="font-bold text-gray-900">Access Groups</h4>
              </div>
              <p className="text-sm text-gray-700 mb-2"><strong>WHAT you can SEE</strong></p>
              <p className="text-sm text-gray-600">
                Define which components and resources are visible to users. Controls component-level visibility.
              </p>
              <Link 
                to="/admin/access-groups"
                className="inline-flex items-center gap-1 text-cyan-600 hover:text-cyan-700 font-medium text-sm mt-3"
              >
                Manage Access Groups <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Roles */}
            <div className="bg-white rounded-lg p-4 border border-purple-200">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-6 h-6 text-purple-600" />
                <h4 className="font-bold text-gray-900">Roles</h4>
              </div>
              <p className="text-sm text-gray-700 mb-2"><strong>WHAT you can DO</strong></p>
              <p className="text-sm text-gray-600">
                Define what actions users can perform within components they have access to. Controls action-level permissions.
              </p>
              <Link 
                to="/admin/roles"
                className="inline-flex items-center gap-1 text-purple-600 hover:text-purple-700 font-medium text-sm mt-3"
              >
                Manage Roles <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Permissions */}
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <h4 className="font-bold text-gray-900">Permissions</h4>
              </div>
              <p className="text-sm text-gray-700 mb-2"><strong>Granular Actions</strong></p>
              <p className="text-sm text-gray-600">
                Individual actions that can be performed on specific resources. Assigned to both Roles and Access Groups.
              </p>
              <div className="text-sm text-gray-500 mt-3">
                Predefined system permissions
              </div>
            </div>
          </div>
        </div>

        {/* How They Work Together */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-6 h-6 text-[#D91C81]" />
            How They Work Together
          </h3>
          
          <div className="space-y-6">
            {/* Step 1 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-cyan-600 text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-900 mb-2">User is assigned to an Access Group</h4>
                <p className="text-gray-700">
                  An employee is assigned to one or more access groups (e.g., "Employee", "Manager", "HR Admin"). 
                  This determines which components and resources they can <strong>see</strong> in the application.
                </p>
                <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-3 mt-2">
                  <p className="text-sm text-cyan-900">
                    <strong>Example:</strong> A manager is assigned to the "Manager" access group, which gives them 
                    permission to see the "Gift Redemption Report" component and the "Nomination Approval" tile.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-900 mb-2">User is assigned a Role</h4>
                <p className="text-gray-700">
                  The same employee is also assigned one or more roles (e.g., "Employee", "Manager", "VP"). 
                  This determines what <strong>actions</strong> they are allowed to perform within the components they can see.
                </p>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mt-2">
                  <p className="text-sm text-purple-900">
                    <strong>Example:</strong> The manager has the "Manager" role, which includes the "view_team_orders" 
                    permission, allowing them to see orders only for employees reporting to them (not all orders).
                  </p>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-900 mb-2">Permissions define the specific actions</h4>
                <p className="text-gray-700">
                  The permissions associated with the user's roles and access groups work together to determine 
                  the exact scope of what they can see and do.
                </p>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-2">
                  <p className="text-sm text-green-900">
                    <strong>Combined Result:</strong> The manager can see the Gift Redemption Report (Access Group) 
                    and within that report, they can only see data for their team members (Role).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Real-World Examples */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Info className="w-6 h-6 text-blue-600" />
            Real-World Examples
          </h3>

          <div className="space-y-6">
            {/* Example 1: Award Nomination */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-bold text-gray-900 mb-3">Example 1: Standard Award Nomination</h4>
              <p className="text-sm text-gray-700 mb-3">
                An award is set up for a site that can be nominated by anyone but requires manager approval.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="font-semibold text-blue-900 mb-2">👤 Employee Setup:</p>
                  <ul className="space-y-1 text-sm text-blue-800">
                    <li>• <strong>Access Group:</strong> "Employee" (permission to see nomination tile)</li>
                    <li>• <strong>Role:</strong> "Employee" (permission to nominate)</li>
                    <li>• <strong>Result:</strong> Can see and nominate for the award</li>
                  </ul>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <p className="font-semibold text-purple-900 mb-2">👔 Manager Setup:</p>
                  <ul className="space-y-1 text-sm text-purple-800">
                    <li>• <strong>Access Group:</strong> "Manager" (permission to approve nominations)</li>
                    <li>• <strong>Role:</strong> "Manager" (permission to approve)</li>
                    <li>• <strong>Result:</strong> Can see the nomination approval interface</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Example 2: Special VP Award */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-bold text-gray-900 mb-3">Example 2: Executive-Only Award</h4>
              <p className="text-sm text-gray-700 mb-3">
                A special award is created where only VPs can nominate and it's approved by the Head of HR.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <p className="font-semibold text-gray-900 mb-2">👤 Regular Employee:</p>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>• <strong>Access Group:</strong> "Employee"</li>
                    <li>• <strong>Role:</strong> "Employee"</li>
                    <li>• <strong>Result:</strong> ❌ Cannot see this award at all</li>
                  </ul>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="font-semibold text-blue-900 mb-2">🎯 VP Setup:</p>
                  <ul className="space-y-1 text-sm text-blue-800">
                    <li>• <strong>Access Group:</strong> "Manager"</li>
                    <li>• <strong>Role:</strong> "VP" (configured for this award)</li>
                    <li>• <strong>Result:</strong> ✅ Can see and nominate for this award</li>
                    <li>• <strong>Note:</strong> Cannot approve (different permission)</li>
                  </ul>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <p className="font-semibold text-purple-900 mb-2">👔 Head of HR:</p>
                  <ul className="space-y-1 text-sm text-purple-800">
                    <li>• <strong>Access Group:</strong> "HR Admin", "Manager", "Employee"</li>
                    <li>• <strong>Role:</strong> "Head of HR"</li>
                    <li>• <strong>Result:</strong> ✅ Can see and approve this award</li>
                    <li>• <strong>Note:</strong> Cannot nominate (different permission)</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Example 3: Report Access */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-bold text-gray-900 mb-3">Example 3: Gift Redemption Report</h4>
              <p className="text-sm text-gray-700 mb-3">
                Different users see different scopes of data in the same report based on their role.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="font-semibold text-green-900 mb-2">👤 Employee:</p>
                  <ul className="space-y-1 text-sm text-green-800">
                    <li>• <strong>Access Group:</strong> "Employee"</li>
                    <li>• <strong>Role:</strong> "Employee"</li>
                    <li>• <strong>Permission:</strong> "view_own_orders"</li>
                    <li>• <strong>Result:</strong> ✅ Sees only their own orders</li>
                  </ul>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="font-semibold text-blue-900 mb-2">👔 Manager:</p>
                  <ul className="space-y-1 text-sm text-blue-800">
                    <li>• <strong>Access Group:</strong> "Manager"</li>
                    <li>• <strong>Role:</strong> "Manager"</li>
                    <li>• <strong>Permission:</strong> "view_team_orders"</li>
                    <li>• <strong>Result:</strong> ✅ Sees orders for their team</li>
                  </ul>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <p className="font-semibold text-purple-900 mb-2">🎯 HR Admin:</p>
                  <ul className="space-y-1 text-sm text-purple-800">
                    <li>• <strong>Access Group:</strong> "HR Admin"</li>
                    <li>• <strong>Role:</strong> "HR Admin"</li>
                    <li>• <strong>Permission:</strong> "view_all_orders"</li>
                    <li>• <strong>Result:</strong> ✅ Sees all orders across company</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Important Notes */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-900 mb-2">Important Notes</h3>
              <ul className="space-y-2 text-sm text-yellow-800">
                <li>• <strong>Multiple Assignments:</strong> Employees can have multiple roles AND multiple access groups assigned simultaneously</li>
                <li>• <strong>Predefined vs Custom:</strong> Predefined roles/groups are system-wide; custom roles/groups are client-specific</li>
                <li>• <strong>Site-Specific:</strong> Assignments can be scoped to specific sites or apply to all sites</li>
                <li>• <strong>Permission Inheritance:</strong> If a user has multiple roles, they get the union of all permissions from those roles</li>
                <li>• <strong>Award Configuration:</strong> Each award/celebration can specify which roles can nominate and which can approve</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/admin/roles"
            className="bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-xl p-6 hover:shadow-lg transition-all"
          >
            <Shield className="w-8 h-8 mb-3" />
            <h4 className="font-bold text-lg mb-1">Manage Roles</h4>
            <p className="text-sm opacity-90">Define what users can DO</p>
          </Link>

          <Link
            to="/admin/access-groups"
            className="bg-gradient-to-br from-cyan-500 to-blue-500 text-white rounded-xl p-6 hover:shadow-lg transition-all"
          >
            <Eye className="w-8 h-8 mb-3" />
            <h4 className="font-bold text-lg mb-1">Manage Access Groups</h4>
            <p className="text-sm opacity-90">Define what users can SEE</p>
          </Link>

          <Link
            to="/admin/employees"
            className="bg-gradient-to-br from-green-500 to-teal-500 text-white rounded-xl p-6 hover:shadow-lg transition-all"
          >
            <Users className="w-8 h-8 mb-3" />
            <h4 className="font-bold text-lg mb-1">Assign to Employees</h4>
            <p className="text-sm opacity-90">Configure employee access</p>
          </Link>
        </div>
      </div>
    </div>
  );
}