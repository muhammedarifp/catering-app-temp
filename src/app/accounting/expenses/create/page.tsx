'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PageLayout from '@/components/PageLayout';
import {
  Receipt,
  Save,
  ArrowLeft,
  Calendar,
  Building2,
  CreditCard,
  FileText,
  Tag,
  RefreshCw,
  Link as LinkIcon,
} from 'lucide-react';
import Link from 'next/link';
import {
  loadExpenses,
  addExpense,
  updateExpense,
  loadVendors,
} from '@/lib/accountingStorage';
import {
  expenseCategoryLabels,
  paymentMethodLabels,
  recurrencePatternLabels,
} from '@/lib/data';
import { events } from '@/lib/data';
import { Expense, ExpenseCategory, PaymentMethod, RecurrencePattern } from '@/lib/types';

export default function ExpenseFormPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');
  const isEditing = !!editId;

  const [formData, setFormData] = useState({
    category: 'food_costs' as ExpenseCategory,
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'cash' as PaymentMethod,
    vendor: '',
    vendorContact: '',
    receiptNumber: '',
    notes: '',
    eventId: '',
    isRecurring: false,
    recurrencePattern: 'monthly' as RecurrencePattern,
    recurrenceEndDate: '',
    tags: '',
  });

  const [vendors, setVendors] = useState<{ id: string; name: string }[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const vendorList = loadVendors();
    setVendors(vendorList.map((v) => ({ id: v.id, name: v.name })));

    if (editId) {
      const expenses = loadExpenses();
      const expense = expenses.find((e) => e.id === editId);
      if (expense) {
        setFormData({
          category: expense.category,
          description: expense.description,
          amount: expense.amount.toString(),
          date: expense.date,
          paymentMethod: expense.paymentMethod,
          vendor: expense.vendor,
          vendorContact: expense.vendorContact || '',
          receiptNumber: expense.receiptNumber || '',
          notes: expense.notes || '',
          eventId: expense.eventId || '',
          isRecurring: expense.isRecurring,
          recurrencePattern: expense.recurrencePattern || 'monthly',
          recurrenceEndDate: expense.recurrenceEndDate || '',
          tags: expense.tags?.join(', ') || '',
        });
      }
    }
  }, [editId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const expenseData = {
        category: formData.category,
        description: formData.description,
        amount: parseFloat(formData.amount),
        date: formData.date,
        paymentMethod: formData.paymentMethod,
        vendor: formData.vendor,
        vendorContact: formData.vendorContact || undefined,
        receiptNumber: formData.receiptNumber || undefined,
        notes: formData.notes || undefined,
        eventId: formData.eventId || undefined,
        isRecurring: formData.isRecurring,
        recurrencePattern: formData.isRecurring ? formData.recurrencePattern : undefined,
        recurrenceEndDate: formData.isRecurring && formData.recurrenceEndDate ? formData.recurrenceEndDate : undefined,
        tags: formData.tags ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean) : undefined,
      };

      if (isEditing && editId) {
        updateExpense(editId, expenseData);
      } else {
        addExpense(expenseData);
      }

      router.push('/accounting/expenses');
    } catch (error) {
      console.error('Error saving expense:', error);
      alert('Failed to save expense');
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
            href="/accounting/expenses"
            className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Expenses
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center bg-red-100 rounded-lg">
              <Receipt className="h-5 w-5 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-zinc-900">
              {isEditing ? 'Edit Expense' : 'Add Expense'}
            </h1>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-xl border border-zinc-200 p-6">
            <h2 className="text-lg font-semibold text-zinc-900 mb-4">Expense Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as ExpenseCategory })}
                  className="w-full px-4 py-2.5 bg-zinc-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-zinc-900"
                  required
                >
                  {Object.entries(expenseCategoryLabels).map(([value, label]) => (
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
                  placeholder="What was this expense for?"
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

          {/* Vendor Info */}
          <div className="bg-white rounded-xl border border-zinc-200 p-6">
            <h2 className="text-lg font-semibold text-zinc-900 mb-4 flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Vendor Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Vendor Name */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                  Vendor Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.vendor}
                  onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                  placeholder="Vendor/Payee name"
                  list="vendors"
                  className="w-full px-4 py-2.5 bg-zinc-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-zinc-900"
                  required
                />
                <datalist id="vendors">
                  {vendors.map((v) => (
                    <option key={v.id} value={v.name} />
                  ))}
                </datalist>
              </div>

              {/* Vendor Contact */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                  Vendor Contact
                </label>
                <input
                  type="text"
                  value={formData.vendorContact}
                  onChange={(e) => setFormData({ ...formData, vendorContact: e.target.value })}
                  placeholder="Phone number"
                  className="w-full px-4 py-2.5 bg-zinc-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-zinc-900"
                />
              </div>

              {/* Receipt Number */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <FileText className="h-4 w-4" />
                    Receipt/Bill Number
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

          {/* Recurring */}
          <div className="bg-white rounded-xl border border-zinc-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Recurring Expense
              </h2>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isRecurring}
                  onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-zinc-900 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-zinc-900"></div>
              </label>
            </div>

            {formData.isRecurring && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                    Recurrence Pattern
                  </label>
                  <select
                    value={formData.recurrencePattern}
                    onChange={(e) => setFormData({ ...formData, recurrencePattern: e.target.value as RecurrencePattern })}
                    className="w-full px-4 py-2.5 bg-zinc-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-zinc-900"
                  >
                    {Object.entries(recurrencePatternLabels)
                      .filter(([key]) => key !== 'none')
                      .map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                    End Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={formData.recurrenceEndDate}
                    onChange={(e) => setFormData({ ...formData, recurrenceEndDate: e.target.value })}
                    className="w-full px-4 py-2.5 bg-zinc-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-zinc-900"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Notes & Tags */}
          <div className="bg-white rounded-xl border border-zinc-200 p-6">
            <h2 className="text-lg font-semibold text-zinc-900 mb-4">Additional Info</h2>

            <div className="space-y-4">
              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Tag className="h-4 w-4" />
                    Tags
                  </span>
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="Comma-separated tags (e.g., vegetables, wedding)"
                  className="w-full px-4 py-2.5 bg-zinc-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-zinc-900"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any additional notes..."
                  rows={3}
                  className="w-full px-4 py-2.5 bg-zinc-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-zinc-900 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <Link
              href="/accounting/expenses"
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
              {isSaving ? 'Saving...' : isEditing ? 'Update Expense' : 'Save Expense'}
            </button>
          </div>
        </form>
      </div>
    </PageLayout>
  );
}
