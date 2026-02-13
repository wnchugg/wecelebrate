import { Shield, Eye, CheckCircle, Users, ArrowRight, Info, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router';

export function RBACOverview() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">RBAC System Overview</h1>
        <p className="text-gray-600 mt-1">Understanding Roles, Access Groups, and Permissions</p>
      </div>

      {/* Key Concepts */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">🔑 Key Concepts</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Access Groups */}
          <div className="bg-white rounded-lg p-4 border border-cyan-200">
            <div className="flex items-center gap-2 mb-3">
              <Eye className="w-6 h-6 text-cyan-600" />
              <h3 className="font-bold text-gray-900">Access Groups</h3>
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
              <h3 className="font-bold text-gray-900">Roles</h3>
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
              <h3 className="font-bold text-gray-900">Permissions</h3>
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
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Users className="w-6 h-6 text-[#D91C81]" />
          How They Work Together
        </h2>
        
        <div className="space-y-6">
          {/* Step 1 */}
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-cyan-600 text-white rounded-full flex items-center justify-center font-bold">
              1
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 mb-2">User is assigned to an Access Group</h3>
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
              <h3 className="font-bold text-gray-900 mb-2">User is assigned a Role</h3>
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
              <h3 className="font-bold text-gray-900 mb-2">Permissions define the specific actions</h3>
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
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Info className="w-6 h-6 text-blue-600" />
          Real-World Examples
        </h2>

        <div className="space-y-6">
          {/* Example 1: Award Nomination */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-bold text-gray-900 mb-3">Example 1: Standard Award Nomination</h3>
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
            <h3 className="font-bold text-gray-900 mb-3">Example 2: Executive-Only Award</h3>
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
            <h3 className="font-bold text-gray-900 mb-3">Example 3: Gift Redemption Report</h3>
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
          <h3 className="font-bold text-lg mb-1">Manage Roles</h3>
          <p className="text-sm opacity-90">Define what users can DO</p>
        </Link>

        <Link
          to="/admin/access-groups"
          className="bg-gradient-to-br from-cyan-500 to-blue-500 text-white rounded-xl p-6 hover:shadow-lg transition-all"
        >
          <Eye className="w-8 h-8 mb-3" />
          <h3 className="font-bold text-lg mb-1">Manage Access Groups</h3>
          <p className="text-sm opacity-90">Define what users can SEE</p>
        </Link>

        <Link
          to="/admin/employees"
          className="bg-gradient-to-br from-green-500 to-teal-500 text-white rounded-xl p-6 hover:shadow-lg transition-all"
        >
          <Users className="w-8 h-8 mb-3" />
          <h3 className="font-bold text-lg mb-1">Assign to Employees</h3>
          <p className="text-sm opacity-90">Configure employee access</p>
        </Link>
      </div>
    </div>
  );
}
