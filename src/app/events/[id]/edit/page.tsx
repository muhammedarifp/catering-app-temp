'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import PageLayout from '@/components/PageLayout';
import { getEventById, updateEvent } from '@/lib/actions/events';
import { useParams, useRouter } from 'next/navigation';

const EVENT_TYPES = ['MAIN_EVENT', 'LOCAL_ORDER'] as const;
const EVENT_STATUSES = ['UPCOMING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] as const;

export default function EditEventPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    eventType: 'MAIN_EVENT' as typeof EVENT_TYPES[number],
    status: 'UPCOMING' as typeof EVENT_STATUSES[number],
    clientName: '',
    clientContact: '',
    location: '',
    eventDate: '',
    eventTime: '',
    guestCount: 0,
    totalAmount: 0,
    paidAmount: 0,
    notes: '',
  });

  useEffect(() => {
    async function load() {
      const result = await getEventById(id);
      if (result.success && result.data) {
        const e = result.data;
        setForm({
          name: e.name,
          eventType: e.eventType,
          status: e.status,
          clientName: e.clientName,
          clientContact: e.clientContact,
          location: e.location,
          eventDate: new Date(e.eventDate).toISOString().split('T')[0],
          eventTime: e.eventTime,
          guestCount: e.guestCount,
          totalAmount: e.totalAmount,
          paidAmount: e.paidAmount,
          notes: e.notes || '',
        });
      }
      setLoading(false);
    }
    load();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const balanceAmount = form.totalAmount - form.paidAmount;
      const result = await updateEvent(id, {
        name: form.name,
        eventType: form.eventType,
        status: form.status,
        clientName: form.clientName,
        clientContact: form.clientContact,
        location: form.location,
        eventDate: new Date(form.eventDate),
        eventTime: form.eventTime,
        guestCount: Number(form.guestCount),
        totalAmount: Number(form.totalAmount),
        paidAmount: Number(form.paidAmount),
        balanceAmount,
        notes: form.notes || undefined,
      });

      if (result.success) {
        router.push(`/events/${id}`);
      } else {
        setError(result.error || 'Failed to update event');
      }
    } catch {
      setError('An error occurred while saving');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PageLayout currentPath="/events">
        <div className="flex min-h-[50vh] items-center justify-center">
          <p className="text-zinc-500">Loading...</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout currentPath="/events">
      <div className="max-w-2xl mx-auto p-4 lg:p-8">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => router.back()} className="p-2 hover:bg-zinc-100 rounded-full text-zinc-500">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-zinc-900">Edit Event</h1>
            <p className="text-sm text-zinc-500">Update event details</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Basic Info */}
          <div className="bg-white rounded-xl border border-zinc-200 p-6 space-y-4">
            <h2 className="font-semibold text-zinc-900">Basic Information</h2>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Event Name *</label>
              <input
                required
                type="text"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Event Type</label>
                <select
                  value={form.eventType}
                  onChange={e => setForm({ ...form, eventType: e.target.value as any })}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:ring-2 focus:ring-zinc-900"
                >
                  <option value="MAIN_EVENT">Main Event</option>
                  <option value="LOCAL_ORDER">Local Order</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value as any })}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:ring-2 focus:ring-zinc-900"
                >
                  {EVENT_STATUSES.map(s => (
                    <option key={s} value={s}>{s.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Client Info */}
          <div className="bg-white rounded-xl border border-zinc-200 p-6 space-y-4">
            <h2 className="font-semibold text-zinc-900">Client Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Client Name *</label>
                <input
                  required
                  type="text"
                  value={form.clientName}
                  onChange={e => setForm({ ...form, clientName: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:ring-2 focus:ring-zinc-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Contact *</label>
                <input
                  required
                  type="text"
                  value={form.clientContact}
                  onChange={e => setForm({ ...form, clientContact: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:ring-2 focus:ring-zinc-900"
                />
              </div>
            </div>
          </div>

          {/* Event Details */}
          <div className="bg-white rounded-xl border border-zinc-200 p-6 space-y-4">
            <h2 className="font-semibold text-zinc-900">Event Details</h2>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Location *</label>
              <input
                required
                type="text"
                value={form.location}
                onChange={e => setForm({ ...form, location: e.target.value })}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:ring-2 focus:ring-zinc-900"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Date *</label>
                <input
                  required
                  type="date"
                  value={form.eventDate}
                  onChange={e => setForm({ ...form, eventDate: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:ring-2 focus:ring-zinc-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Time</label>
                <input
                  type="text"
                  value={form.eventTime}
                  onChange={e => setForm({ ...form, eventTime: e.target.value })}
                  placeholder="e.g. 07:00 PM"
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:ring-2 focus:ring-zinc-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Guests</label>
                <input
                  type="number"
                  min="0"
                  value={form.guestCount}
                  onChange={e => setForm({ ...form, guestCount: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:ring-2 focus:ring-zinc-900"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Notes</label>
              <textarea
                rows={3}
                value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:ring-2 focus:ring-zinc-900 resize-none"
              />
            </div>
          </div>

          {/* Financials */}
          <div className="bg-white rounded-xl border border-zinc-200 p-6 space-y-4">
            <h2 className="font-semibold text-zinc-900">Financials</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Total Amount (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={form.totalAmount}
                  onChange={e => setForm({ ...form, totalAmount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:ring-2 focus:ring-zinc-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Paid Amount (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={form.paidAmount}
                  onChange={e => setForm({ ...form, paidAmount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:ring-2 focus:ring-zinc-900"
                />
              </div>
            </div>
            <div className="p-3 bg-zinc-50 rounded-lg text-sm text-zinc-600">
              Balance: <span className="font-semibold text-zinc-900">₹{(form.totalAmount - form.paidAmount).toLocaleString()}</span>
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => router.back()} className="px-4 py-2 border border-zinc-300 rounded-lg text-sm font-medium text-zinc-700 hover:bg-zinc-50">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-zinc-800 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

        </form>
      </div>
    </PageLayout>
  );
}
