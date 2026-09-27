import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  KeyRound, 
  ShieldCheck, 
  ShieldAlert, 
  Trash2, 
  Edit2, 
  Check, 
  X, 
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Power
} from 'lucide-react';
import { User, UserRole } from '../../types';
import { 
  getAdminUsersApi, 
  createAdminUserApi, 
  updateAdminUserApi, 
  deleteAdminUserApi, 
  toggleUserStatusApi, 
  resetUserPasswordApi 
} from '../../api';
import { useAuth } from '../../context/AuthContext';

export const UserManagement: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [batchFilter, setBatchFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [resettingUser, setResettingUser] = useState<User | null>(null);
  const [tempPasswordResult, setTempPasswordResult] = useState<{ name: string; pass: string } | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'student' as UserRole,
    plainPassword: '',
    rollNumber: '',
    batch: 'SE-A1',
    division: 'A',
    department: 'Computer Engineering'
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await getAdminUsersApi({
        role: roleFilter,
        batch: batchFilter,
        status: statusFilter,
        search: searchQuery
      });
      setUsers(res.users);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, batchFilter, statusFilter, searchQuery]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setActionLoading(true);
    try {
      await createAdminUserApi(formData);
      setShowCreateModal(false);
      setFormData({
        name: '',
        email: '',
        role: 'student',
        plainPassword: '',
        rollNumber: '',
        batch: 'SE-A1',
        division: 'A',
        department: 'Computer Engineering'
      });
      fetchUsers();
    } catch (err: any) {
      setFormError(err.message || 'Failed to create user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setFormError(null);
    setActionLoading(true);
    try {
      await updateAdminUserApi(editingUser.id, {
        name: editingUser.name,
        email: editingUser.email,
        role: editingUser.role,
        rollNumber: editingUser.rollNumber,
        batch: editingUser.batch,
        division: editingUser.division,
        department: editingUser.department
      });
      setEditingUser(null);
      fetchUsers();
    } catch (err: any) {
      setFormError(err.message || 'Failed to update user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (user: User) => {
    if (user.id === currentUser?.id) {
      alert('Cannot deactivate your own active session.');
      return;
    }
    try {
      await toggleUserStatusApi(user.id);
      fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Failed to change user status');
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (user.id === currentUser?.id) {
      alert('Security policy: You cannot delete your own administrator account.');
      return;
    }
    if (!confirm(`Are you sure you want to permanently delete user "${user.name}" (${user.email})?`)) {
      return;
    }
    try {
      await deleteAdminUserApi(user.id);
      fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Failed to delete user');
    }
  };

  const handleResetPassword = async (customPass?: string) => {
    if (!resettingUser) return;
    setActionLoading(true);
    try {
      const res = await resetUserPasswordApi(resettingUser.id, customPass);
      if (res.tempPassword) {
        setTempPasswordResult({ name: resettingUser.name, pass: res.tempPassword });
      } else {
        alert(res.message || 'Password reset successfully');
      }
      setResettingUser(null);
      fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Failed to reset password');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">User Account Directory</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage students, faculty, and administrators with granular role authorization.
          </p>
        </div>

        <button
          onClick={() => {
            setFormError(null);
            setShowCreateModal(true);
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors self-start sm:self-auto"
          id="add-new-user-btn"
        >
          <UserPlus className="h-4 w-4" />
          <span>Provision New User</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Search box */}
          <div className="relative md:col-span-1">
            <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, roll..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:outline-none"
            />
          </div>

          {/* Role filter */}
          <div>
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:outline-none bg-white text-slate-700"
            >
              <option value="all">All Roles (Student, Faculty, Admin)</option>
              <option value="student">Students Only</option>
              <option value="faculty">Faculty Only</option>
              <option value="admin">Administrators Only</option>
            </select>
          </div>

          {/* Batch filter */}
          <div>
            <select
              value={batchFilter}
              onChange={e => setBatchFilter(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:outline-none bg-white text-slate-700"
            >
              <option value="all">All Batches</option>
              <option value="SE-A1">Batch SE-A1</option>
              <option value="SE-A2">Batch SE-A2</option>
              <option value="SE-A3">Batch SE-A3</option>
            </select>
          </div>

          {/* Status filter */}
          <div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:outline-none bg-white text-slate-700"
            >
              <option value="all">All Statuses (Active & Suspended)</option>
              <option value="active">Active Accounts</option>
              <option value="inactive">Deactivated / Locked</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th scope="col" className="px-5 py-3 text-left">User</th>
                <th scope="col" className="px-4 py-3 text-left">Role</th>
                <th scope="col" className="px-4 py-3 text-left">Academic Details</th>
                <th scope="col" className="px-4 py-3 text-left">Status</th>
                <th scope="col" className="px-4 py-3 text-left">Last Login</th>
                <th scope="col" className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin text-purple-600" />
                      <span>Loading user records...</span>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    No users matching the specified filter criteria.
                  </td>
                </tr>
              ) : (
                users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* User */}
                    <td className="px-5 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                          u.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                          u.role === 'faculty' ? 'bg-blue-100 text-blue-700' :
                          'bg-emerald-100 text-emerald-700'
                        }`}>
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{u.name}</div>
                          <div className="text-[11px] text-slate-500 font-mono">{u.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        u.role === 'admin' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                        u.role === 'faculty' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                        'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {u.role}
                      </span>
                    </td>

                    {/* Academic Details */}
                    <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                      {u.role === 'student' ? (
                        <div className="text-[11px]">
                          <span className="font-semibold text-slate-800">Roll {u.rollNumber || '-'}</span>
                          <span className="text-slate-400"> • </span>
                          <span>{u.batch || 'SE-A1'} (Div {u.division || 'A'})</span>
                        </div>
                      ) : (
                        <div className="text-[11px] text-slate-600">
                          {u.department || 'Computer Engineering'}
                        </div>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      {u.isActive ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-red-600 font-medium">
                          <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                          Deactivated
                        </span>
                      )}
                    </td>

                    {/* Last Login */}
                    <td className="px-4 py-3 whitespace-nowrap text-slate-500 text-[11px]">
                      {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Never'}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* Toggle Active/Inactive */}
                        <button
                          onClick={() => handleToggleStatus(u)}
                          title={u.isActive ? 'Deactivate user' : 'Activate user'}
                          className={`p-1.5 rounded-md transition-colors ${
                            u.isActive ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50' : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                          }`}
                        >
                          <Power className="h-3.5 w-3.5" />
                        </button>

                        {/* Reset Password */}
                        <button
                          onClick={() => setResettingUser(u)}
                          title="Reset password"
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        >
                          <KeyRound className="h-3.5 w-3.5" />
                        </button>

                        {/* Edit User */}
                        <button
                          onClick={() => setEditingUser(u)}
                          title="Edit user details"
                          className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => handleDeleteUser(u)}
                          title="Delete user"
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE USER MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-purple-700" />
                <h3 className="font-bold text-base text-slate-900">Provision New Institutional User</h3>
              </div>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-4 text-xs">
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sneha Kulkarni"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">TCET Institutional Email</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. sneha.kulkarni@tcet.edu.in"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:outline-none font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Role</label>
                  <select
                    value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value as UserRole })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:outline-none bg-white font-semibold"
                  >
                    <option value="student">Student</option>
                    <option value="faculty">Faculty</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Initial Password</label>
                  <input
                    type="text"
                    placeholder="Leave empty for default"
                    value={formData.plainPassword}
                    onChange={e => setFormData({ ...formData, plainPassword: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  />
                </div>

                {formData.role === 'student' && (
                  <>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Roll Number</label>
                      <input
                        type="text"
                        placeholder="e.g. 47"
                        value={formData.rollNumber}
                        onChange={e => setFormData({ ...formData, rollNumber: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Lab Batch</label>
                      <select
                        value={formData.batch}
                        onChange={e => setFormData({ ...formData, batch: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:outline-none bg-white"
                      >
                        <option value="SE-A1">SE-A1</option>
                        <option value="SE-A2">SE-A2</option>
                        <option value="SE-A3">SE-A3</option>
                      </select>
                    </div>
                  </>
                )}

                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={e => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2 px-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-2 px-3 bg-purple-700 hover:bg-purple-800 text-white rounded-lg font-semibold shadow-xs transition-colors disabled:opacity-50"
                >
                  {actionLoading ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit2 className="h-5 w-5 text-purple-700" />
                <h3 className="font-bold text-base text-slate-900">Edit User: {editingUser.name}</h3>
              </div>
              <button 
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="p-6 space-y-4 text-xs">
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editingUser.name}
                    onChange={e => setEditingUser({ ...editingUser, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={editingUser.email}
                    onChange={e => setEditingUser({ ...editingUser, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Role</label>
                  <select
                    value={editingUser.role}
                    onChange={e => setEditingUser({ ...editingUser, role: e.target.value as UserRole })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:outline-none bg-white font-semibold"
                  >
                    <option value="student">Student</option>
                    <option value="faculty">Faculty</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                {editingUser.role === 'student' && (
                  <>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Roll Number</label>
                      <input
                        type="text"
                        value={editingUser.rollNumber || ''}
                        onChange={e => setEditingUser({ ...editingUser, rollNumber: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Batch</label>
                      <select
                        value={editingUser.batch || 'SE-A1'}
                        onChange={e => setEditingUser({ ...editingUser, batch: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:outline-none bg-white"
                      >
                        <option value="SE-A1">SE-A1</option>
                        <option value="SE-A2">SE-A2</option>
                        <option value="SE-A3">SE-A3</option>
                      </select>
                    </div>
                  </>
                )}

                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={editingUser.department || 'Computer Engineering'}
                    onChange={e => setEditingUser({ ...editingUser, department: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="flex-1 py-2 px-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-2 px-3 bg-purple-700 hover:bg-purple-800 text-white rounded-lg font-semibold shadow-xs transition-colors disabled:opacity-50"
                >
                  {actionLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESET PASSWORD MODAL */}
      {resettingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-sm w-full overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-purple-700" />
                <h3 className="font-bold text-base text-slate-900">Reset Password</h3>
              </div>
              <button 
                onClick={() => setResettingUser(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <p className="text-slate-600">
                You are initiating a password reset for <span className="font-bold text-slate-900">{resettingUser.name}</span> (<code className="font-mono text-blue-700">{resettingUser.email}</code>).
              </p>

              <div className="space-y-2">
                <button
                  onClick={() => handleResetPassword()}
                  disabled={actionLoading}
                  className="w-full py-2.5 px-3 bg-purple-700 hover:bg-purple-800 text-white rounded-lg font-semibold shadow-xs transition-colors"
                >
                  Generate New Temporary Password
                </button>

                <button
                  onClick={() => {
                    const pass = prompt('Enter new password for this user (min 6 characters):', 'tcet1234');
                    if (pass && pass.trim().length >= 6) {
                      handleResetPassword(pass.trim());
                    }
                  }}
                  disabled={actionLoading}
                  className="w-full py-2.5 px-3 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg font-semibold transition-colors"
                >
                  Set Specific Custom Password
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TEMPORARY PASSWORD RESULT MODAL */}
      {tempPasswordResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-sm w-full overflow-hidden text-center p-6 space-y-4">
            <div className="h-12 w-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 className="h-6 w-6" />
            </div>

            <div>
              <h3 className="font-bold text-base text-slate-900">Password Reset Complete</h3>
              <p className="text-xs text-slate-500 mt-1">
                New credentials generated for {tempPasswordResult.name}.
              </p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg font-mono text-sm text-purple-700 font-bold select-all">
              {tempPasswordResult.pass}
            </div>

            <p className="text-[11px] text-slate-500">
              Provide this temporary password to the user. They can update it from their Profile menu once signed in.
            </p>

            <button
              onClick={() => setTempPasswordResult(null)}
              className="w-full py-2 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg"
            >
              Close & Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
