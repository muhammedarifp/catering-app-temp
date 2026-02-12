'use client';

import { useState, useEffect, useMemo } from 'react';
import PageLayout from '@/components/PageLayout';
import {
  UserCog,
  Plus,
  Search,
  Phone,
  Star,
  Calendar,
  Briefcase,
  MessageCircle,
  Users,
  TrendingUp,
  Clock,
  AlertCircle,
  ChevronRight,
  Filter,
} from 'lucide-react';
import Link from 'next/link';
import {
  loadStaff,
  loadAssignments,
  calculateStaffStats,
  getRoleLabel,
  getEmploymentTypeLabel,
  getRoleColor,
  getWhatsAppLink,
  generateWhatsAppMessage,
} from '@/lib/staffStorage';
import { formatCurrency } from '@/lib/data';
import { events } from '@/lib/data';
import { Staff, StaffRole, EmploymentType, EventStaffAssignment } from '@/lib/types';

export default function StaffDashboard() {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [assignments, setAssignments] = useState<EventStaffAssignment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<StaffRole | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<EmploymentType | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setStaffList(loadStaff());
    setAssignments(loadAssignments());
    setIsLoading(false);
  }, []);

  const stats = useMemo(() => calculateStaffStats(), [staffList, assignments]);

  const filteredStaff = useMemo(() => {
    let result = [...staffList];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.phone.includes(query) ||
          s.skills.some(skill => skill.toLowerCase().includes(query))
      );
    }

    if (roleFilter !== 'all') {
      result = result.filter((s) => s.role === roleFilter);
    }

    if (typeFilter !== 'all') {
      result = result.filter((s) => s.employmentType === typeFilter);
    }

    return result.sort((a, b) => b.rating - a.rating);
  }, [staffList, searchQuery, roleFilter, typeFilter]);

  const upcomingAssignments = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return assignments
      .filter(a => a.shiftStart.split('T')[0] >= today && (a.status === 'confirmed' || a.status === 'pending'))
      .sort((a, b) => new Date(a.shiftStart).getTime() - new Date(b.shiftStart).getTime())
      .slice(0, 5);
  }, [assignments]);

  const getStaffName = (staffId: string) => {
    const staff = staffList.find(s => s.id === staffId);
    return staff?.name || 'Unknown';
  };

  const getEventName = (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    return event?.name || 'Unknown Event';
  };

  const getRoleBadgeClasses = (role: StaffRole) => {
    const color = getRoleColor(role);
    const colorClasses: Record<string, string> = {
      amber: 'bg-amber-50 text-amber-700',
      orange: 'bg-orange-50 text-orange-700',
      blue: 'bg-blue-50 text-blue-700',
      purple: 'bg-purple-50 text-purple-700',
      pink: 'bg-pink-50 text-pink-700',
      emerald: 'bg-emerald-50 text-emerald-700',
      cyan: 'bg-cyan-50 text-cyan-700',
      slate: 'bg-slate-50 text-slate-700',
    };
    return colorClasses[color] || 'bg-zinc-50 text-zinc-700';
  };

  if (isLoading) {
    return (
      <PageLayout currentPath="/staff">
        <div className="flex h-96 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-zinc-900"></div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout currentPath="/staff">
      <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8 lg:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="flex h-10 w-10 items-center justify-center bg-indigo-100 rounded-lg">
                <UserCog className="h-5 w-5 text-indigo-600" />
              </div>
              <h1 className="text-2xl font-bold text-zinc-900">Staff Management</h1>
            </div>
            <p className="text-zinc-600">Manage your team and send WhatsApp alerts</p>
          </div>
          <Link
            href="/staff/create"
            className="inline-flex items-center gap-2 bg-zinc-900 text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-zinc-800 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Add Staff
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-zinc-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-5 w-5 text-indigo-600" />
              <span className="text-sm text-zinc-500">Total Staff</span>
            </div>
            <p className="text-2xl font-bold text-zinc-900">{stats.totalStaff}</p>
            <p className="text-xs text-zinc-500">{stats.activeStaff} active</p>
          </div>
          <div className="bg-white rounded-xl border border-zinc-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Briefcase className="h-5 w-5 text-emerald-600" />
              <span className="text-sm text-zinc-500">Full Time</span>
            </div>
            <p className="text-2xl font-bold text-zinc-900">{stats.fullTimeStaff}</p>
          </div>
          <div className="bg-white rounded-xl border border-zinc-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-amber-600" />
              <span className="text-sm text-zinc-500">Part Time</span>
            </div>
            <p className="text-2xl font-bold text-zinc-900">{stats.partTimeStaff}</p>
          </div>
          <div className="bg-white rounded-xl border border-zinc-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <span className="text-sm text-zinc-500">Avg Rating</span>
            </div>
            <p className="text-2xl font-bold text-zinc-900">{stats.averageRating.toFixed(1)}</p>
          </div>
          <div className="bg-amber-50 rounded-xl border border-amber-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <span className="text-sm text-amber-700">Pending Pay</span>
            </div>
            <p className="text-2xl font-bold text-amber-700">{formatCurrency(stats.pendingPaymentAmount)}</p>
            <p className="text-xs text-amber-600">{stats.pendingPayments} staff</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Staff List */}
          <div className="lg:col-span-2">
            {/* Filters */}
            <div className="bg-white rounded-xl border border-zinc-200 p-4 mb-4">
              <div className="flex flex-col lg:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Search by name, phone, or skill..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-zinc-900"
                  />
                </div>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as StaffRole | 'all')}
                  className="px-4 py-2.5 bg-zinc-50 border-none rounded-lg text-sm font-medium focus:ring-2 focus:ring-zinc-900"
                >
                  <option value="all">All Roles</option>
                  <option value="head_chef">Head Chef</option>
                  <option value="chef">Chef</option>
                  <option value="helper">Helper</option>
                  <option value="waiter">Waiter</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="driver">Driver</option>
                  <option value="cleaner">Cleaner</option>
                </select>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as EmploymentType | 'all')}
                  className="px-4 py-2.5 bg-zinc-50 border-none rounded-lg text-sm font-medium focus:ring-2 focus:ring-zinc-900"
                >
                  <option value="all">All Types</option>
                  <option value="full_time">Full Time</option>
                  <option value="part_time">Part Time</option>
                  <option value="freelance">Freelance</option>
                </select>
              </div>
            </div>

            {/* Staff Cards */}
            <div className="space-y-3">
              {filteredStaff.length > 0 ? (
                filteredStaff.map((staff) => (
                  <div
                    key={staff.id}
                    className="bg-white rounded-xl border border-zinc-200 p-4 hover:border-zinc-300 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <div className={`flex h-14 w-14 items-center justify-center rounded-xl text-lg font-bold ${
                          staff.status === 'active' ? 'bg-indigo-100 text-indigo-700' : 'bg-zinc-100 text-zinc-500'
                        }`}>
                          {staff.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-zinc-900">{staff.name}</h3>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${getRoleBadgeClasses(staff.role)}`}>
                              {getRoleLabel(staff.role)}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-xs ${
                              staff.employmentType === 'full_time' ? 'bg-emerald-50 text-emerald-700' :
                              staff.employmentType === 'part_time' ? 'bg-amber-50 text-amber-700' :
                              'bg-purple-50 text-purple-700'
                            }`}>
                              {getEmploymentTypeLabel(staff.employmentType)}
                            </span>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-zinc-500">
                            <span className="flex items-center gap-1">
                              <Phone className="h-4 w-4" />
                              {staff.phone}
                            </span>
                            <span className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-500" />
                              {staff.rating.toFixed(1)}
                            </span>
                            <span>{staff.totalEventsWorked} events</span>
                          </div>

                          {/* Skills */}
                          <div className="flex flex-wrap gap-1 mt-2">
                            {staff.skills.slice(0, 3).map((skill) => (
                              <span key={skill} className="px-2 py-0.5 bg-zinc-100 text-zinc-600 text-xs rounded">
                                {skill}
                              </span>
                            ))}
                            {staff.skills.length > 3 && (
                              <span className="px-2 py-0.5 text-zinc-400 text-xs">+{staff.skills.length - 3} more</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* WhatsApp Button */}
                        <a
                          href={`https://wa.me/${staff.whatsappNumber?.replace(/[^0-9]/g, '') || staff.phone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-3 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
                        >
                          <MessageCircle className="h-4 w-4" />
                          WhatsApp
                        </a>
                        <Link
                          href={`/staff/${staff.id}`}
                          className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-lg"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </Link>
                      </div>
                    </div>

                    {/* Pay Rate */}
                    <div className="mt-3 pt-3 border-t border-zinc-100 flex items-center justify-between text-sm">
                      <span className="text-zinc-500">
                        {formatCurrency(staff.hourlyRate)}/hr
                        {staff.dailyRate && ` • ${formatCurrency(staff.dailyRate)}/day`}
                      </span>
                      <span className={`font-medium ${staff.reliabilityScore >= 90 ? 'text-emerald-600' : staff.reliabilityScore >= 75 ? 'text-amber-600' : 'text-red-600'}`}>
                        {staff.reliabilityScore}% reliable
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-xl border border-zinc-200 p-12 text-center">
                  <UserCog className="h-12 w-12 text-zinc-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-zinc-900 mb-2">No staff found</h3>
                  <p className="text-zinc-500 mb-4">Add your team members to get started</p>
                  <Link
                    href="/staff/create"
                    className="inline-flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-zinc-800"
                  >
                    <Plus className="h-4 w-4" />
                    Add Staff
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Upcoming Assignments */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-zinc-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-zinc-900">Upcoming Assignments</h2>
                <Calendar className="h-5 w-5 text-zinc-400" />
              </div>

              {upcomingAssignments.length > 0 ? (
                <div className="space-y-3">
                  {upcomingAssignments.map((assignment) => {
                    const staff = staffList.find(s => s.id === assignment.staffId);
                    const event = events.find(e => e.id === assignment.eventId);
                    return (
                      <div key={assignment.id} className="p-3 bg-zinc-50 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-zinc-900">{staff?.name}</span>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            assignment.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' :
                            'bg-amber-100 text-amber-700'
                          }`}>
                            {assignment.status}
                          </span>
                        </div>
                        <p className="text-sm text-zinc-600 mb-1">{event?.name}</p>
                        <div className="flex items-center justify-between text-xs text-zinc-500">
                          <span>{new Date(assignment.shiftStart).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                          <span>{getRoleLabel(assignment.role)}</span>
                          <span>{formatCurrency(assignment.estimatedPay)}</span>
                        </div>
                        {!assignment.whatsappAlertSent && staff && event && (
                          <a
                            href={getWhatsAppLink(
                              staff.whatsappNumber || staff.phone,
                              generateWhatsAppMessage(staff, event, assignment)
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 flex items-center justify-center gap-1 w-full py-1.5 bg-green-500 text-white rounded text-xs font-medium hover:bg-green-600"
                          >
                            <MessageCircle className="h-3 w-3" />
                            Send Alert
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-zinc-500 text-center py-4">No upcoming assignments</p>
              )}

              {/* Quick Actions */}
              <div className="mt-6 pt-4 border-t border-zinc-200">
                <h3 className="text-sm font-semibold text-zinc-700 mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  <Link
                    href="/events"
                    className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                  >
                    <span className="text-sm font-medium text-indigo-700">Assign Staff to Event</span>
                    <ChevronRight className="h-4 w-4 text-indigo-400" />
                  </Link>
                  <button
                    onClick={() => {
                      const activeStaff = staffList.filter(s => s.status === 'active');
                      const message = encodeURIComponent('📢 Team Update from CaterPro\n\nHi Team! We have upcoming events. Please check your WhatsApp for assignment details.\n\nThank you!');
                      alert(`Broadcast message ready for ${activeStaff.length} staff members. Open WhatsApp to send.`);
                    }}
                    className="flex items-center justify-between w-full p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <span className="text-sm font-medium text-green-700">Broadcast to All Staff</span>
                    <MessageCircle className="h-4 w-4 text-green-400" />
                  </button>
                </div>
              </div>
            </div>

            {/* Role Distribution */}
            <div className="bg-white rounded-xl border border-zinc-200 p-5 mt-4">
              <h2 className="text-lg font-semibold text-zinc-900 mb-4">Team Composition</h2>
              <div className="space-y-3">
                {Object.entries(stats.staffByRole || {}).map(([role, count]) => (
                  <div key={role} className="flex items-center justify-between">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getRoleBadgeClasses(role as StaffRole)}`}>
                      {getRoleLabel(role as StaffRole)}
                    </span>
                    <span className="text-sm font-semibold text-zinc-900">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
