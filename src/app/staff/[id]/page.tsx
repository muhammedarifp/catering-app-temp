'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import PageLayout from '@/components/PageLayout';
import {
  UserCog,
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Star,
  Calendar,
  MessageCircle,
  Edit,
  Trash2,
  CreditCard,
  Briefcase,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Send,
  Plus,
} from 'lucide-react';
import Link from 'next/link';
import {
  loadStaff,
  deleteStaff,
  loadAssignments,
  addAssignment,
  updateAssignment,
  getWhatsAppLink,
  generateWhatsAppMessage,
  generateReminderMessage,
  getRoleLabel,
  getEmploymentTypeLabel,
  getRoleColor,
} from '@/lib/staffStorage';
import { formatCurrency, formatDate } from '@/lib/data';
import { events } from '@/lib/data';
import { Staff, EventStaffAssignment, StaffRole } from '@/lib/types';

export default function StaffDetailPage() {
  const params = useParams();
  const router = useRouter();
  const staffId = params.id as string;

  const [staff, setStaff] = useState<Staff | null>(null);
  const [assignments, setAssignments] = useState<EventStaffAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);

  // Assignment form state
  const [assignForm, setAssignForm] = useState({
    eventId: '',
    role: '' as StaffRole,
    shiftStart: '',
    shiftEnd: '',
    payType: 'daily' as 'hourly' | 'daily' | 'fixed',
    payRate: 0,
  });

  useEffect(() => {
    const staffList = loadStaff();
    const found = staffList.find((s) => s.id === staffId);
    setStaff(found || null);

    const allAssignments = loadAssignments();
    setAssignments(allAssignments.filter((a) => a.staffId === staffId));
    setIsLoading(false);
  }, [staffId]);

  useEffect(() => {
    if (staff) {
      setAssignForm((prev) => ({
        ...prev,
        role: staff.role,
        payRate: staff.dailyRate || staff.hourlyRate,
      }));
    }
  }, [staff]);

  const upcomingAssignments = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return assignments.filter((a) => a.shiftStart.split('T')[0] >= today);
  }, [assignments]);

  const pastAssignments = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return assignments.filter((a) => a.shiftStart.split('T')[0] < today);
  }, [assignments]);

  const pendingPayments = useMemo(() => {
    return assignments.filter((a) => a.status === 'completed' && a.paymentStatus === 'pending');
  }, [assignments]);

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this staff member? This cannot be undone.')) {
      deleteStaff(staffId);
      router.push('/staff');
    }
  };

  const handleAssign = () => {
    if (!staff || !assignForm.eventId) return;

    const event = events.find((e) => e.id === assignForm.eventId);
    if (!event) return;

    // Calculate estimated pay
    let estimatedPay = assignForm.payRate;
    if (assignForm.payType === 'hourly' && assignForm.shiftStart && assignForm.shiftEnd) {
      const start = new Date(`2000-01-01T${assignForm.shiftStart.split('T')[1]}`);
      const end = new Date(`2000-01-01T${assignForm.shiftEnd.split('T')[1]}`);
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      estimatedPay = assignForm.payRate * hours;
    }

    const newAssignment = addAssignment({
      eventId: assignForm.eventId,
      staffId: staff.id,
      role: assignForm.role,
      shiftStart: assignForm.shiftStart,
      shiftEnd: assignForm.shiftEnd,
      payRate: assignForm.payRate,
      payType: assignForm.payType,
      estimatedPay,
      status: 'pending',
      paymentStatus: 'pending',
      whatsappAlertSent: false,
      reminderSent: false,
    });

    setAssignments([...assignments, newAssignment]);
    setShowAssignModal(false);

    // Open WhatsApp to send alert
    const message = generateWhatsAppMessage(staff, event, newAssignment);
    window.open(getWhatsAppLink(staff.whatsappNumber || staff.phone, message), '_blank');

    // Mark as sent
    updateAssignment(newAssignment.id, {
      whatsappAlertSent: true,
      whatsappAlertSentAt: new Date().toISOString(),
    });
  };

  const markConfirmed = (assignmentId: string) => {
    updateAssignment(assignmentId, { status: 'confirmed', confirmedAt: new Date().toISOString() });
    setAssignments(loadAssignments().filter((a) => a.staffId === staffId));
  };

  const sendReminder = (assignment: EventStaffAssignment) => {
    if (!staff) return;
    const event = events.find((e) => e.id === assignment.eventId);
    if (!event) return;

    const message = generateReminderMessage(staff, event, assignment);
    window.open(getWhatsAppLink(staff.whatsappNumber || staff.phone, message), '_blank');

    updateAssignment(assignment.id, { reminderSent: true, reminderSentAt: new Date().toISOString() });
    setAssignments(loadAssignments().filter((a) => a.staffId === staffId));
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

  if (!staff) {
    return (
      <PageLayout currentPath="/staff">
        <div className="mx-auto max-w-4xl px-4 py-6 lg:px-8 lg:py-8">
          <div className="text-center py-12">
            <UserCog className="h-12 w-12 text-zinc-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-zinc-900 mb-2">Staff member not found</h2>
            <Link href="/staff" className="text-indigo-600 hover:underline">
              Back to Staff
            </Link>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout currentPath="/staff">
      <div className="mx-auto max-w-5xl px-4 py-6 lg:px-8 lg:py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/staff"
            className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Staff
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className={`flex h-16 w-16 items-center justify-center rounded-xl text-xl font-bold ${
                staff.status === 'active' ? 'bg-indigo-100 text-indigo-700' : 'bg-zinc-100 text-zinc-500'
              }`}>
                {staff.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-zinc-900">{staff.name}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${getRoleBadgeClasses(staff.role)}`}>
                    {getRoleLabel(staff.role)}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    staff.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                    staff.status === 'on_leave' ? 'bg-amber-100 text-amber-700' :
                    'bg-zinc-100 text-zinc-600'
                  }`}>
                    {staff.status === 'active' ? 'Active' : staff.status === 'on_leave' ? 'On Leave' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={`https://wa.me/${(staff.whatsappNumber || staff.phone).replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </a>
              <button
                onClick={() => setShowAssignModal(true)}
                className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700"
              >
                <Plus className="h-4 w-4" />
                Assign to Event
              </button>
              <Link
                href={`/staff/create?edit=${staff.id}`}
                className="p-2 border border-zinc-200 rounded-lg hover:bg-zinc-50"
              >
                <Edit className="h-5 w-5 text-zinc-600" />
              </Link>
              <button
                onClick={handleDelete}
                className="p-2 border border-red-200 rounded-lg hover:bg-red-50"
              >
                <Trash2 className="h-5 w-5 text-red-600" />
              </button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Details */}
          <div className="lg:col-span-1 space-y-6">
            {/* Contact Info */}
            <div className="bg-white rounded-xl border border-zinc-200 p-5">
              <h2 className="text-lg font-semibold text-zinc-900 mb-4">Contact</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-zinc-400" />
                  <span className="text-zinc-700">{staff.phone}</span>
                </div>
                {staff.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-zinc-400" />
                    <span className="text-zinc-700">{staff.email}</span>
                  </div>
                )}
                {staff.address && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-zinc-400" />
                    <span className="text-zinc-700">{staff.address}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="bg-white rounded-xl border border-zinc-200 p-5">
              <h2 className="text-lg font-semibold text-zinc-900 mb-4">Performance</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center justify-center gap-1 text-yellow-600 mb-1">
                    <Star className="h-5 w-5" />
                    <span className="text-2xl font-bold">{staff.rating.toFixed(1)}</span>
                  </div>
                  <p className="text-xs text-yellow-700">Rating</p>
                </div>
                <div className="text-center p-3 bg-indigo-50 rounded-lg">
                  <p className="text-2xl font-bold text-indigo-700">{staff.totalEventsWorked}</p>
                  <p className="text-xs text-indigo-600">Events Worked</p>
                </div>
                <div className="text-center p-3 bg-emerald-50 rounded-lg">
                  <p className="text-2xl font-bold text-emerald-700">{staff.reliabilityScore}%</p>
                  <p className="text-xs text-emerald-600">Reliability</p>
                </div>
                <div className="text-center p-3 bg-zinc-50 rounded-lg">
                  <p className="text-2xl font-bold text-zinc-700">{staff.experienceYears} yrs</p>
                  <p className="text-xs text-zinc-500">Experience</p>
                </div>
              </div>
            </div>

            {/* Pay Info */}
            <div className="bg-white rounded-xl border border-zinc-200 p-5">
              <h2 className="text-lg font-semibold text-zinc-900 mb-4 flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Pay Rates
              </h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Hourly</span>
                  <span className="font-semibold text-zinc-900">{formatCurrency(staff.hourlyRate)}/hr</span>
                </div>
                {staff.dailyRate && (
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Daily</span>
                    <span className="font-semibold text-zinc-900">{formatCurrency(staff.dailyRate)}/day</span>
                  </div>
                )}
              </div>
              {pendingPayments.length > 0 && (
                <div className="mt-4 pt-4 border-t border-zinc-100">
                  <div className="flex items-center justify-between text-amber-600">
                    <span className="text-sm font-medium">Pending Payments</span>
                    <span className="font-bold">
                      {formatCurrency(pendingPayments.reduce((sum, a) => sum + (a.actualPay || a.estimatedPay), 0))}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Skills */}
            <div className="bg-white rounded-xl border border-zinc-200 p-5">
              <h2 className="text-lg font-semibold text-zinc-900 mb-4">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {staff.skills.map((skill) => (
                  <span key={skill} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Assignments */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upcoming Assignments */}
            <div className="bg-white rounded-xl border border-zinc-200 p-5">
              <h2 className="text-lg font-semibold text-zinc-900 mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Assignments ({upcomingAssignments.length})
              </h2>

              {upcomingAssignments.length > 0 ? (
                <div className="space-y-3">
                  {upcomingAssignments.map((assignment) => {
                    const event = events.find((e) => e.id === assignment.eventId);
                    return (
                      <div key={assignment.id} className="p-4 bg-zinc-50 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-zinc-900">{event?.name || 'Unknown Event'}</h3>
                            <p className="text-sm text-zinc-500">
                              {formatDate(assignment.shiftStart.split('T')[0])} &middot;{' '}
                              {assignment.shiftStart.split('T')[1]?.slice(0, 5)} - {assignment.shiftEnd.split('T')[1]?.slice(0, 5)}
                            </p>
                            <p className="text-sm text-zinc-500">{event?.location}</p>
                          </div>
                          <div className="text-right">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              assignment.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' :
                              assignment.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                              'bg-zinc-100 text-zinc-600'
                            }`}>
                              {assignment.status}
                            </span>
                            <p className="text-lg font-bold text-zinc-900 mt-1">
                              {formatCurrency(assignment.estimatedPay)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-3">
                          {assignment.status === 'pending' && (
                            <button
                              onClick={() => markConfirmed(assignment.id)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white rounded text-sm font-medium hover:bg-emerald-700"
                            >
                              <CheckCircle className="h-4 w-4" />
                              Mark Confirmed
                            </button>
                          )}
                          {!assignment.reminderSent && event && (
                            <button
                              onClick={() => sendReminder(assignment)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white rounded text-sm font-medium hover:bg-green-600"
                            >
                              <Send className="h-4 w-4" />
                              Send Reminder
                            </button>
                          )}
                          {assignment.whatsappAlertSent && (
                            <span className="text-xs text-zinc-400 flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" /> Alert sent
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-zinc-500 text-center py-4">No upcoming assignments</p>
              )}
            </div>

            {/* Past Assignments */}
            <div className="bg-white rounded-xl border border-zinc-200 p-5">
              <h2 className="text-lg font-semibold text-zinc-900 mb-4">
                Past Events ({pastAssignments.length})
              </h2>

              {pastAssignments.length > 0 ? (
                <div className="space-y-2">
                  {pastAssignments.slice(0, 5).map((assignment) => {
                    const event = events.find((e) => e.id === assignment.eventId);
                    return (
                      <div key={assignment.id} className="flex items-center justify-between py-2 border-b border-zinc-100 last:border-0">
                        <div>
                          <p className="font-medium text-zinc-900">{event?.name}</p>
                          <p className="text-xs text-zinc-500">
                            {formatDate(assignment.shiftStart.split('T')[0])} &middot; {getRoleLabel(assignment.role)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-zinc-900">{formatCurrency(assignment.actualPay || assignment.estimatedPay)}</p>
                          <span className={`text-xs ${
                            assignment.paymentStatus === 'paid' ? 'text-emerald-600' : 'text-amber-600'
                          }`}>
                            {assignment.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-zinc-500 text-center py-4">No past events</p>
              )}
            </div>

            {/* Notes */}
            {staff.notes && (
              <div className="bg-white rounded-xl border border-zinc-200 p-5">
                <h2 className="text-lg font-semibold text-zinc-900 mb-3">Notes</h2>
                <p className="text-zinc-600">{staff.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Assign Modal */}
        {showAssignModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4">
              <h3 className="text-lg font-semibold text-zinc-900 mb-4">Assign {staff.name} to Event</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                    Select Event <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={assignForm.eventId}
                    onChange={(e) => setAssignForm({ ...assignForm, eventId: e.target.value })}
                    className="w-full px-4 py-2.5 bg-zinc-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-zinc-900"
                  >
                    <option value="">Select an event</option>
                    {events
                      .filter((e) => e.status !== 'completed' && e.status !== 'cancelled')
                      .map((event) => (
                        <option key={event.id} value={event.id}>
                          {event.name} - {formatDate(event.date)}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1.5">Role</label>
                    <select
                      value={assignForm.role}
                      onChange={(e) => setAssignForm({ ...assignForm, role: e.target.value as StaffRole })}
                      className="w-full px-4 py-2.5 bg-zinc-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-zinc-900"
                    >
                      <option value="head_chef">Head Chef</option>
                      <option value="chef">Chef</option>
                      <option value="helper">Helper</option>
                      <option value="waiter">Waiter</option>
                      <option value="supervisor">Supervisor</option>
                      <option value="driver">Driver</option>
                      <option value="cleaner">Cleaner</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1.5">Pay Type</label>
                    <select
                      value={assignForm.payType}
                      onChange={(e) => setAssignForm({ ...assignForm, payType: e.target.value as 'hourly' | 'daily' | 'fixed' })}
                      className="w-full px-4 py-2.5 bg-zinc-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-zinc-900"
                    >
                      <option value="daily">Daily</option>
                      <option value="hourly">Hourly</option>
                      <option value="fixed">Fixed</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1.5">Shift Start</label>
                    <input
                      type="datetime-local"
                      value={assignForm.shiftStart}
                      onChange={(e) => setAssignForm({ ...assignForm, shiftStart: e.target.value })}
                      className="w-full px-4 py-2.5 bg-zinc-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-zinc-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1.5">Shift End</label>
                    <input
                      type="datetime-local"
                      value={assignForm.shiftEnd}
                      onChange={(e) => setAssignForm({ ...assignForm, shiftEnd: e.target.value })}
                      className="w-full px-4 py-2.5 bg-zinc-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-zinc-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1.5">Pay Rate (₹)</label>
                  <input
                    type="number"
                    value={assignForm.payRate}
                    onChange={(e) => setAssignForm({ ...assignForm, payRate: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 bg-zinc-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-zinc-900"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 border border-zinc-200 rounded-lg text-sm font-medium hover:bg-zinc-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssign}
                  disabled={!assignForm.eventId}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
                >
                  <span className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    Assign & Send WhatsApp
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
