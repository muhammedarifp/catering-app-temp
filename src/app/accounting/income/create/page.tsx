'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PageLayout from '@/components/PageLayout';
import {
  TrendingUp,
  Save,
  ArrowLeft,
  Calendar,
  User,
  CreditCard,
  FileText,
  Link as LinkIcon,
} from 'lucide-react';
import Link from 'next/link';
import { loadIncome, addIncome, updateIncome } from '@/lib/accountingStorage';
import { incomeTypeLabels, paymentMethodLabels } from '@/lib/data';
import { events } from '@/lib/data';
import { Income, IncomeType, PaymentMethod } from '@/lib/types';

export default function IncomeFormPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');
  const isEditing = !!editId;

  const [formData, setFormData] = useState({
    type: 'miscellaneous' as IncomeType,
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'cash' as PaymentMethod,
    payer: '',
    payerContact: '',
    eventId: '',
    receiptNumber: '',
    notes: '',
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (editId) {
      const incomeList = loadIncome();
      const income = incomeList.find((i) => i.id === editId);
      if (income) {
        setFormData({
          type: income.type,
          description: income.description,
          amount: income.amount.toString(),
          date: income.date,
          paymentMethod: income.paymentMethod,
          payer: income.payer,
          payerContact: income.payerContact || '',
          eventId: income.eventId || '',
          receiptNumber: income.receiptNumber || '',
          notes: income.notes || '',
        });
      }
    }
  }, [editId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const incomeData = {
        type: formData.type,
        description: formData.description,
        amount: parseFloat(formData.amount),
        date: formData.date,
        paymentMethod: formData.paymentMethod,
        payer: formData.payer,
        payerContact: formData.payerContact || undefined,
        eventId: formData.eventId || undefined,
        receiptNumber: formData.receiptNumber || undefined,
        notes: formData.notes || undefined,
      };

      if (isEditing && editId) {
        updateIncome(editId, incomeData);
      } else {
        addIncome(incomeData);
      }

      router.push('/accounting/income');
    } catch (error) {
      console.error('Error saving income:', error);
      alert('Failed to save income');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PageLayout currentPath="/accounting">
      <div className="mx-auto max-w-3xl px-4 py-6 lg:px-8 lg:py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/accounting/income"
            className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Income
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center bg-emerald-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
            </div>
            <h1 className="text-2xl font-bold text-zinc-900">
              {isEditing ? 'Edit Income' : 'Add Income'}
            </h1>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-xl border border-zinc-200 p-6">
            <h2 className="text-lg font-semibold text-zinc-900 mb-4">Income Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                  Income Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as IncomeType })}
                  className="w-full px-4 py-2.5 bg-zinc-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-zinc-900"
                  required
                >
                  {Object.entries(incomeTypeLabels)
                    .filter(([key]) => key !== 'event_revenue')
                    .map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                </select>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                  Amount (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2.5 bg-zinc-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-zinc-900"
                  required
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                  Description <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="What is this income for?"
                  className="w-full px-4 py-2.5 bg-zinc-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-zinc-900"
                  required
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    Date <span className="text-red-500">*</span>
                  </span>
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-2.5 bg-zinc-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-zinc-900"
                  required
                />
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <CreditCard className="h-4 w-4" />
                    Payment Method <span className="text-red-500">*</span>
                  </span>
                </label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as PaymentMethod })}
                  className="w-full px-4 py-2.5 bg-zinc-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-zinc-900"
                  required
                >
                  {Object.entries(paymentMethodLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Payer Info */}
          <div className="bg-white rounded-xl border border-zinc-200 p-6">
            <h2 className="text-lg font-semibold text-zinc-900 mb-4 flex items-center gap-2">
              <User className="h-5 w-5" />
              Payer Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Payer Name */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                  Payer Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.payer}
                  onChange={(e) => setFormData({ ...formData, payer: e.target.value })}
                  placeholder="Who paid?"
                  className="w-full px-4 py-2.5 bg-zinc-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-zinc-900"
                  required
                />
              </div>

              {/* Payer Contact */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                  Payer Contact
                </label>
                <input
                  type="text"
                  value={formData.payerContact}
                  onChange={(e) => setFormData({ ...formData, payerContact: e.target.value })}
                  placeholder="Phone number"
                  className="w-full px-4 py-2.5 bg-zinc-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-zinc-900"
                />
              </div>

              {/* Receipt Number */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <FileText className="h-4 w-4" />
                    Receipt Number
                  </span>
                </label>
                <input
                  type="text"
                  value={formData.receiptNumber}
                  onChange={(e) => setFormData({ ...formData, receiptNumber: e.target.value })}
                  placeholder="REC-001"
                  className="w-full px-4 py-2.5 bg-zinc-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-zinc-900"
                />
              </div>

              {/* Link to Event */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <LinkIcon className="h-4 w-4" />
                    Link to Event
                  </span>
                </label>
                <select
                  value={formData.eventId}
                  onChange={(e) => setFormData({ ...formData, eventId: e.target.value })}
                  className="w-full px-4 py-2.5 bg-zinc-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-zinc-900"
                >
                  <option value="">No Event</option>
                  {events.map((event) => (
                    <option key={event.id} value={event.id}>{event.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-xl border border-zinc-200 p-6">
            <h2 className="text-lg font-semibold text-zinc-900 mb-4">Additional Notes</h2>

            <div>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any additional notes..."
                rows={3}
                className="w-full px-4 py-2.5 bg-zinc-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-zinc-900 resize-none"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <Link
              href="/accounting/income"
              className="px-6 py-2.5 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 bg-zinc-900 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-zinc-800 disabled:opacity-50"
            >
              <Save className="h-5 w-5" />
              {isSaving ? 'Saving...' : isEditing ? 'Update Income' : 'Save Income'}
            </button>
          </div>
        </form>
      </div>
    </PageLayout>
  );
}
