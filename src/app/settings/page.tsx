'use client'

import { useState, useEffect } from 'react'
import {
  Settings as SettingsIcon,
  Users,
  Bell,
  Plus,
  Edit,
  Trash2,
  Shield,
  CheckCircle2,
  XCircle,
  Mail,
} from 'lucide-react'
import PageLayout from '@/components/PageLayout'
import {
  getUsers,
  createUser,
  updateUserPermissions,
  deleteUser,
  getNotificationSettings,
  updateNotificationSettings,
} from '@/lib/actions/users'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'users' | 'notifications'>('users')
  const [users, setUsers] = useState<any[]>([])
  const [notificationSettings, setNotificationSettings] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showAddUserModal, setShowAddUserModal] = useState(false)

  // New user form
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'MANAGER' as any,
    pageAccess: ['/'] as string[],
    canCreateEvents: false,
    canManageEnquiries: false,
    canManageDishes: false,
    canManageExpenses: false,
    canViewReports: false,
  })

  const availablePages = [
    { value: '/', label: 'Home' },
    { value: '/enquiries', label: 'Enquiries' },
    { value: '/events', label: 'Events' },
    { value: '/dishes', label: 'Dishes' },
    { value: '/other-expenses', label: 'Other Expenses' },
    { value: '/settings', label: 'Settings' },
  ]

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [usersRes, notifRes] = await Promise.all([
        getUsers(),
        getNotificationSettings(),
      ])

      if (usersRes.success && usersRes.data) setUsers(usersRes.data)
      if (notifRes.success && notifRes.data) setNotificationSettings(notifRes.data)
    } catch (error) {
      console.error('Failed to load settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()

    const result = await createUser(newUserForm)

    if (result.success) {
      setShowAddUserModal(false)
      setNewUserForm({
        name: '',
        email: '',
        password: '',
        role: 'MANAGER',
        pageAccess: ['/'],
        canCreateEvents: false,
        canManageEnquiries: false,
        canManageDishes: false,
        canManageExpenses: false,
        canViewReports: false,
      })
      loadData()
    } else {
      alert(result.error || 'Failed to create user')
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return

    const result = await deleteUser(userId)
    if (result.success) {
      loadData()
    }
  }

  const handleUpdateNotifications = async (settings: any) => {
    const result = await updateNotificationSettings(settings)
    if (result.success) {
      loadData()
    }
  }

  const togglePageAccess = (page: string) => {
    const current = newUserForm.pageAccess
    const updated = current.includes(page)
      ? current.filter((p) => p !== page)
      : [...current, page]
    setNewUserForm({ ...newUserForm, pageAccess: updated })
  }

  return (
    <PageLayout currentPath="/settings">
      <div className="min-h-screen bg-slate-50/50 pb-12">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 lg:py-12 space-y-8">
          {/* Header */}
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">
              System Configuration
            </p>
            <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
              Settings
            </h1>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-2xl p-2 shadow-sm border border-slate-200 inline-flex gap-2">
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'users'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Users className="w-5 h-5" />
              User Management
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'notifications'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Bell className="w-5 h-5" />
              Notifications
            </button>
          </div>

          {/* User Management Tab */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex-1 mr-4">
                  <p className="text-sm text-blue-900">
                    <strong>Note:</strong> Super Admin has full access to all features. Managers can
                    be assigned specific page access and permissions.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddUserModal(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-slate-900/10 whitespace-nowrap"
                >
                  <Plus className="w-5 h-5" />
                  Add User
                </button>
              </div>

              {/* Users List */}
              <div className="grid grid-cols-1 gap-6">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="bg-white rounded-3xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-linear-to-br from-slate-700 to-slate-900 text-white flex items-center justify-center text-lg font-bold">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            {user.name}
                            {user.role === 'SUPER_ADMIN' && (
                              <span className="flex items-center gap-1 px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs font-semibold border border-purple-200">
                                <Shield className="w-3.5 h-3.5" />
                                Super Admin
                              </span>
                            )}
                            {user.role === 'MANAGER' && (
                              <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold border border-blue-200">
                                Manager
                              </span>
                            )}
                          </h3>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-sm text-slate-600 flex items-center gap-1">
                              <Mail className="w-3.5 h-3.5" />
                              {user.email}
                            </span>
                            <span
                              className={`flex items-center gap-1 text-xs font-medium ${
                                user.isActive ? 'text-emerald-600' : 'text-red-600'
                              }`}
                            >
                              {user.isActive ? (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  Active
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-3.5 h-3.5" />
                                  Inactive
                                </>
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                      {user.role === 'MANAGER' && (
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {user.role === 'MANAGER' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                        <div>
                          <p className="text-xs font-semibold text-slate-500 uppercase mb-2">
                            Page Access
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {user.pageAccess.length > 0 ? (
                              user.pageAccess.map((page: string) => (
                                <span
                                  key={page}
                                  className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md text-xs font-medium"
                                >
                                  {availablePages.find((p) => p.value === page)?.label || page}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-slate-400">No pages assigned</span>
                            )}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-500 uppercase mb-2">
                            Permissions
                          </p>
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              { key: 'canCreateEvents', label: 'Create Events' },
                              { key: 'canManageEnquiries', label: 'Manage Enquiries' },
                              { key: 'canManageDishes', label: 'Manage Dishes' },
                              { key: 'canManageExpenses', label: 'Manage Expenses' },
                              { key: 'canViewReports', label: 'View Reports' },
                            ].map((perm) => (
                              <div
                                key={perm.key}
                                className={`flex items-center gap-1 text-xs ${
                                  user[perm.key] ? 'text-emerald-600' : 'text-slate-400'
                                }`}
                              >
                                {user[perm.key] ? (
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                ) : (
                                  <XCircle className="w-3.5 h-3.5" />
                                )}
                                {perm.label}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && notificationSettings && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-900">
                  <strong>Note:</strong> These settings control global notification preferences.
                  Enable or disable specific notification types below.
                </p>
              </div>

              <div className="bg-white rounded-3xl p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100">
                <h3 className="text-lg font-bold text-slate-900 mb-6">Notification Preferences</h3>
                <div className="space-y-4">
                  {[
                    { key: 'invoiceGenerated', label: 'Invoice Generated', description: 'Notify when a new invoice is created' },
                    { key: 'eventCreated', label: 'Event Created', description: 'Notify when a new event is scheduled' },
                    { key: 'eventStatusChanged', label: 'Event Status Changed', description: 'Notify when event status is updated' },
                    { key: 'enquiryStatusChanged', label: 'Enquiry Status Changed', description: 'Notify when enquiry status is updated' },
                    { key: 'paymentReceived', label: 'Payment Received', description: 'Notify when payment is received' },
                    { key: 'lowStockAlert', label: 'Low Stock Alert', description: 'Notify when inventory is running low' },
                  ].map((setting) => (
                    <div
                      key={setting.key}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200"
                    >
                      <div>
                        <h4 className="font-semibold text-slate-900">{setting.label}</h4>
                        <p className="text-sm text-slate-500 mt-1">{setting.description}</p>
                      </div>
                      <button
                        onClick={() =>
                          handleUpdateNotifications({
                            [setting.key]: !notificationSettings[setting.key],
                          })
                        }
                        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                          notificationSettings[setting.key] ? 'bg-emerald-500' : 'bg-slate-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                            notificationSettings[setting.key] ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl my-8">
            <div className="px-8 py-6 border-b border-slate-200 flex items-center justify-between bg-slate-50 rounded-t-3xl">
              <h2 className="text-2xl font-bold text-slate-900">Add New User</h2>
              <button
                onClick={() => setShowAddUserModal(false)}
                className="p-2 hover:bg-slate-200 rounded-full transition-colors text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Name *</label>
                  <input
                    type="text"
                    required
                    value={newUserForm.name}
                    onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email *</label>
                  <input
                    type="email"
                    required
                    value={newUserForm.email}
                    onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Password *</label>
                  <input
                    type="password"
                    required
                    value={newUserForm.password}
                    onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Role *</label>
                  <select
                    value={newUserForm.role}
                    onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value as any })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  >
                    <option value="MANAGER">Manager</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                  </select>
                </div>
              </div>

              {newUserForm.role === 'MANAGER' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-3">
                      Page Access
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {availablePages.map((page) => (
                        <label
                          key={page.value}
                          className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 hover:bg-slate-100 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={newUserForm.pageAccess.includes(page.value)}
                            onChange={() => togglePageAccess(page.value)}
                            className="w-4 h-4 text-slate-900 rounded focus:ring-2 focus:ring-slate-900"
                          />
                          <span className="text-sm font-medium text-slate-900">{page.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-3">
                      Permissions
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { key: 'canCreateEvents', label: 'Create Events' },
                        { key: 'canManageEnquiries', label: 'Manage Enquiries' },
                        { key: 'canManageDishes', label: 'Manage Dishes' },
                        { key: 'canManageExpenses', label: 'Manage Expenses' },
                        { key: 'canViewReports', label: 'View Reports' },
                      ].map((perm) => (
                        <label
                          key={perm.key}
                          className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 hover:bg-slate-100 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={newUserForm[perm.key as keyof typeof newUserForm] as boolean}
                            onChange={(e) =>
                              setNewUserForm({ ...newUserForm, [perm.key]: e.target.checked })
                            }
                            className="w-4 h-4 text-slate-900 rounded focus:ring-2 focus:ring-slate-900"
                          />
                          <span className="text-sm font-medium text-slate-900">{perm.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-100 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors font-medium"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageLayout>
  )
}
