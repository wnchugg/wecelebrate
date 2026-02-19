import { useState } from 'react';
import { Edit, Key, UserCheck, Search, Loader2, User } from 'lucide-react';
import { Button } from '../ui/button';
import { AdvancedAuthUser } from '../../../types/advancedAuth';
import { useNameFormat } from '../../hooks/useNameFormat';

interface AdvancedUserListProps {
  users: AdvancedAuthUser[];
  loading: boolean;
  onEditUser: (user: AdvancedAuthUser) => void;
  onSetPassword: (user: AdvancedAuthUser) => void;
  onProxyLogin: (user: AdvancedAuthUser) => void;
  hasProxyPermission: boolean;
}

export function AdvancedUserList({
  users,
  loading,
  onEditUser,
  onSetPassword,
  onProxyLogin,
  hasProxyPermission
}: AdvancedUserListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { formatFullName } = useNameFormat();

  const filteredUsers = users.filter(user => {
    const query = searchQuery.toLowerCase();
    return (
      user.email.toLowerCase().includes(query) ||
      user.firstName.toLowerCase().includes(query) ||
      user.lastName.toLowerCase().includes(query) ||
      user.employeeId?.toLowerCase().includes(query)
    );
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 border-red-200';
      case 'manager': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'employee': return 'bg-green-100 text-green-800 border-green-200';
      case 'viewer': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'suspended': return 'bg-red-100 text-red-800 border-red-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search users by name, email, or employee ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
        />
      </div>

      {/* User List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-[#D91C81] animate-spin" />
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-12 border border-gray-200 rounded-lg">
          <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600">No users found</p>
          <p className="text-sm text-gray-500 mt-1">
            {searchQuery ? `No users matching "${searchQuery}"` : 'Users will appear here when added'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredUsers.map(user => (
            <div 
              key={user.id} 
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D91C81] to-purple-600 flex items-center justify-center text-white font-semibold">
                  {user.firstName[0]}{user.lastName[0]}
                </div>
                
                {/* User Info */}
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">
                    {formatFullName(user.firstName, user.lastName)}
                  </p>
                  <p className="text-sm text-gray-600">{user.email}</p>
                  
                  {/* Badges */}
                  <div className="flex gap-2 mt-1 flex-wrap">
                    <span className={`px-2 py-0.5 text-xs rounded-full border ${getRoleBadgeColor(user.role)}`}>
                      {user.role}
                    </span>
                    <span className={`px-2 py-0.5 text-xs rounded-full border ${getStatusBadgeColor(user.status)}`}>
                      {user.status}
                    </span>
                    {user.employeeId && (
                      <span className="px-2 py-0.5 text-xs rounded-full border bg-blue-50 text-blue-700 border-blue-200">
                        ID: {user.employeeId}
                      </span>
                    )}
                    {user.forcePasswordReset && (
                      <span className="px-2 py-0.5 text-xs rounded-full border bg-amber-100 text-amber-800 border-amber-200">
                        Password Reset Required
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onEditUser(user)}
                  className="flex items-center gap-1"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onSetPassword(user)}
                  className="flex items-center gap-1"
                >
                  <Key className="w-4 h-4" />
                  Set Password
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onProxyLogin(user)}
                  disabled={!hasProxyPermission}
                  className="flex items-center gap-1"
                  title={!hasProxyPermission ? 'You do not have permission to proxy login' : 'Login as this user'}
                >
                  <UserCheck className="w-4 h-4" />
                  Login As
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Results Count */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <p>
          {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
          {searchQuery && ` matching "${searchQuery}"`}
        </p>
      </div>
    </div>
  );
}
