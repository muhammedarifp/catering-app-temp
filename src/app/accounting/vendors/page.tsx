'use client';

import { useState, useEffect, useMemo } from 'react';
import PageLayout from '@/components/PageLayout';
import {
  Users,
  Plus,
  Search,
  Trash2,
  Edit,
  Phone,
  MapPin,
  Building2,
} from 'lucide-react';
import Link from 'next/link';
import { loadVendors, deleteVendor, loadExpenses } from '@/lib/accountingStorage';
import {
  formatCurrency,
  expenseCategoryLabels,
  expenseCategoryColors,
} from '@/lib/data';
import { Vendor, ExpenseCategory } from '@/lib/types';

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ExpenseCategory | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load and update vendor stats
    const vendorList = loadVendors();
    const expenses = loadExpenses();

    // Update transaction counts for each vendor
    const updatedVendors = vendorList.map(vendor => {
      const vendorExpenses = expenses.filter(e =>
        e.vendor.toLowerCase() === vendor.name.toLowerCase()
      );
      return {
        ...vendor,
        totalTransactions: vendorExpenses.length,
        totalAmount: vendorExpenses.reduce((sum, e) => sum + e.amount, 0),
      };
    });

    setVendors(updatedVendors);
    setIsLoading(false);
  }, []);

  const filteredVendors = useMemo(() => {
    let result = [...vendors];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (v) =>
          v.name.toLowerCase().includes(query) ||
          (v.contactPerson && v.contactPerson.toLowerCase().includes(query))
      );
    }

    if (categoryFilter !== 'all') {
      result = result.filter((v) => v.category === categoryFilter);
    }

    return result.sort((a, b) => b.totalAmount - a.totalAmount);
  }, [vendors, searchQuery, categoryFilter]);

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this vendor?')) {
      deleteVendor(id);
      setVendors(loadVendors());
    }
  };

  const getCategoryBadgeClasses = (category: ExpenseCategory) => {
    const color = expenseCategoryColors[category];
    const colorClasses: Record<string, string> = {
      emerald: 'bg-emerald-50 text-emerald-700',
      blue: 'bg-blue-50 text-blue-700',
      amber: 'bg-amber-50 text-amber-700',
      purple: 'bg-purple-50 text-purple-700',
      pink: 'bg-pink-50 text-pink-700',
      cyan: 'bg-cyan-50 text-cyan-700',
      orange: 'bg-orange-50 text-orange-700',
      slate: 'bg-slate-50 text-slate-700',
    };
    return colorClasses[color] || 'bg-zinc-50 text-zinc-700';
  };

  if (isLoading) {
    return (
      <PageLayout currentPath="/accounting">
        <div className="flex h-96 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-zinc-900"></div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout currentPath="/accounting">
      <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8 lg:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="flex h-10 w-10 items-center justify-center bg-amber-100 rounded-lg">
                <Users className="h-5 w-5 text-amber-600" />
              </div>
              <h1 className="text-2xl font-bold text-zinc-900">Vendors</h1>
            </div>
            <p className="text-zinc-600">Manage your suppliers and service providers</p>
          </div>
          <Link
            href="/accounting/vendors/create"
            className="inline-flex items-center gap-2 bg-zinc-900 text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-zinc-800 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Add Vendor
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-zinc-200 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
              <input
                type="text"
                placeholder="Search vendors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-zinc-900"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as ExpenseCategory | 'all')}
              className="px-4 py-2.5 bg-zinc-50 border-none rounded-lg text-sm font-medium focus:ring-2 focus:ring-zinc-900"
            >
              <option value="all">All Categories</option>
              {Object.entries(expenseCategoryLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Vendors Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredVendors.length > 0 ? (
            filteredVendors.map((vendor) => (
              <div
                key={vendor.id}
                className="bg-white rounded-xl border border-zinc-200 p-5 hover:border-zinc-300 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center bg-zinc-100 rounded-lg">
                      <Building2 className="h-6 w-6 text-zinc-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-zinc-900">{vendor.name}</h3>
                      {vendor.contactPerson && (
                        <p className="text-sm text-zinc-500">{vendor.contactPerson}</p>
                      )}
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${getCategoryBadgeClasses(vendor.category)}`}>
                    {expenseCategoryLabels[vendor.category]}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  {vendor.phone && (
                    <p className="flex items-center gap-2 text-sm text-zinc-600">
                      <Phone className="h-4 w-4" />
                      {vendor.phone}
                    </p>
                  )}
                  {vendor.address && (
                    <p className="flex items-center gap-2 text-sm text-zinc-600">
                      <MapPin className="h-4 w-4" />
                      <span className="truncate">{vendor.address}</span>
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-zinc-100">
                  <div>
                    <p className="text-xs text-zinc-500">{vendor.totalTransactions} transactions</p>
                    <p className="text-lg font-bold text-zinc-900">{formatCurrency(vendor.totalAmount)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/accounting/vendors/create?edit=${vendor.id}`}
                      className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-lg"
                    >
                      <Edit className="h-5 w-5" />
                    </Link>
                    <button
                      onClick={() => handleDelete(vendor.id)}
                      className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full bg-white rounded-xl border border-zinc-200 p-12 text-center">
              <Users className="h-12 w-12 text-zinc-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-zinc-900 mb-2">No vendors found</h3>
              <p className="text-zinc-500 mb-4">
                {searchQuery || categoryFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Add your first vendor to get started'}
              </p>
              <Link
                href="/accounting/vendors/create"
                className="inline-flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-zinc-800"
              >
                <Plus className="h-4 w-4" />
                Add Vendor
              </Link>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
