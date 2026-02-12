'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PageLayout from '@/components/PageLayout';
import {
  Users,
  Save,
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  FileText,
  Building2,
} from 'lucide-react';
import Link from 'next/link';
import { loadVendors, addVendor, updateVendor } from '@/lib/accountingStorage';
import { expenseCategoryLabels } from '@/lib/data';
import { ExpenseCategory } from '@/lib/types';

export default function VendorFormPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');
  const isEditing = !!editId;

  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    category: 'food_costs' as ExpenseCategory,
    gstNumber: '',
    bankAccountName: '',
    bankAccountNumber: '',
    bankName: '',
    bankIfsc: '',
    notes: '',
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (editId) {
      const vendors = loadVendors();
      const vendor = vendors.find((v) => v.id === editId);
      if (vendor) {
        setFormData({
          name: vendor.name,
          contactPerson: vendor.contactPerson || '',
          phone: vendor.phone || '',
          email: vendor.email || '',
          address: vendor.address || '',
          category: vendor.category,
          gstNumber: vendor.gstNumber || '',
          bankAccountName: vendor.bankDetails?.accountName || '',
          bankAccountNumber: vendor.bankDetails?.accountNumber || '',
          bankName: vendor.bankDetails?.bankName || '',
          bankIfsc: vendor.bankDetails?.ifscCode || '',
          notes: vendor.notes || '',
        });
      }
    }
  }, [editId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const vendorData = {
        name: formData.name,
        contactPerson: formData.contactPerson || undefined,
        phone: formData.phone || undefined,
        email: formData.email || undefined,
        address: formData.address || undefined,
        category: formData.category,
        gstNumber: formData.gstNumber || undefined,
        bankDetails: formData.bankAccountNumber ? {
          accountName: formData.bankAccountName,
          accountNumber: formData.bankAccountNumber,
          bankName: formData.bankName,
          ifscCode: formData.bankIfsc,
        } : undefined,
        notes: formData.notes || undefined,
      };

      if (isEditing && editId) {
        updateVendor(editId, vendorData);
      } else {
        addVendor(vendorData);
      }

      router.push('/accounting/vendors');
    } catch (error) {
      console.error('Error saving vendor:', error);
      alert('Failed to save vendor');
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
            href="/accounting/vendors"
            className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Vendors
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center bg-amber-100 rounded-lg">
              <Users className="h-5 w-5 text-amber-600" />
            </div>
            <h1 className="text-2xl font-bold text-zinc-900">
              {isEditing ? 'Edit Vendor' : 'Add Vendor'}
            </h1>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-xl border border-zinc-200 p-6">
            <h2 className="text-lg font-semibold text-zinc-900 mb-4 flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Vendor Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Vendor Name */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                  Vendor Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Company or vendor name"
                  className="w-full px-4 py-2.5 bg-zinc-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-zinc-900"
                  required
                />
              </div>

              {/* Contact Person */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                  Contact Person
                </label>
                <input
                  type="text"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  placeholder="Name of contact"
                  className="w-full px-4 py-2.5 bg-zinc-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-zinc-900"
                />
              </div>

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

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Phone className="h-4 w-4" />
                    Phone Number
                  </span>
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full px-4 py-2.5 bg-zinc-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-zinc-900"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Mail className="h-4 w-4" />
                    Email
                  </span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="vendor@email.com"
                  className="w-full px-4 py-2.5 bg-zinc-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-zinc-900"
                />
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    Address
                  </span>
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Full address"
                  className="w-full px-4 py-2.5 bg-zinc-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-zinc-900"
                />
              </div>

              {/* GST Number */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <FileText className="h-4 w-4" />
                    GST Number
                  </span>
                </label>
                <input
                  type="text"
                  value={formData.gstNumber}
                  onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                  placeholder="GSTIN"
                  className="w-full px-4 py-2.5 bg-zinc-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-zinc-900"
                />
              </div>
            </div>
          </div>

          {/* Bank Details */}
          <div className="bg-white rounded-xl border border-zinc-200 p-6">
            <h2 className="text-lg font-semibold text-zinc-900 mb-4">Bank Details (Optional)</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                  Account Name
                </label>
                <input
                  type="text"
                  value={formData.bankAccountName}
                  onChange={(e) => setFormData({ ...formData, bankAccountName: e.target.value })}
                  placeholder="Account holder name"
                  className="w-full px-4 py-2.5 bg-zinc-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-zinc-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                  Account Number
                </label>
                <input
                  type="text"
                  value={formData.bankAccountNumber}
                  onChange={(e) => setFormData({ ...formData, bankAccountNumber: e.target.value })}
                  placeholder="Bank account number"
                  className="w-full px-4 py-2.5 bg-zinc-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-zinc-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                  Bank Name
                </label>
                <input
                  type="text"
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  placeholder="Bank name"
                  className="w-full px-4 py-2.5 bg-zinc-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-zinc-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                  IFSC Code
                </label>
                <input
                  type="text"
                  value={formData.bankIfsc}
                  onChange={(e) => setFormData({ ...formData, bankIfsc: e.target.value })}
                  placeholder="IFSC code"
                  className="w-full px-4 py-2.5 bg-zinc-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-zinc-900"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-xl border border-zinc-200 p-6">
            <h2 className="text-lg font-semibold text-zinc-900 mb-4">Notes</h2>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any additional notes about this vendor..."
              rows={3}
              className="w-full px-4 py-2.5 bg-zinc-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-zinc-900 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <Link
              href="/accounting/vendors"
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
              {isSaving ? 'Saving...' : isEditing ? 'Update Vendor' : 'Save Vendor'}
            </button>
          </div>
        </form>
      </div>
    </PageLayout>
  );
}
