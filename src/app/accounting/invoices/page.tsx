'use client';

import { useState, useEffect, useMemo } from 'react';
import PageLayout from '@/components/PageLayout';
import {
  FileText,
  Plus,
  Search,
  Trash2,
  Eye,
  Calendar,
  ArrowUpDown,
  AlertTriangle,
} from 'lucide-react';
import Link from 'next/link';
import { loadInvoices, deleteInvoice } from '@/lib/accountingStorage';
import {
  formatCurrency,
  formatDate,
  invoiceStatusLabels,
  invoiceStatusColors,
} from '@/lib/data';
import { Invoice, InvoiceStatus } from '@/lib/types';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setInvoices(loadInvoices());
    setIsLoading(false);
  }, []);

  const filteredInvoices = useMemo(() => {
    let result = [...invoices];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (i) =>
          i.invoiceNumber.toLowerCase().includes(query) ||
          i.clientName.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter((i) => i.status === statusFilter);
    }

    result.sort((a, b) => {
      if (sortBy === 'date') {
        return sortOrder === 'desc'
          ? new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime()
          : new Date(a.issueDate).getTime() - new Date(b.issueDate).getTime();
      } else {
        return sortOrder === 'desc' ? b.totalAmount - a.totalAmount : a.totalAmount - b.totalAmount;
      }
    });

    return result;
  }, [invoices, searchQuery, statusFilter, sortBy, sortOrder]);

  const stats = useMemo(() => {
    const total = invoices.reduce((sum, i) => sum + i.totalAmount, 0);
    const paid = invoices.reduce((sum, i) => sum + i.paidAmount, 0);
    const pending = total - paid;
    return { total, paid, pending };
  }, [invoices]);

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this invoice?')) {
      deleteInvoice(id);
      setInvoices(loadInvoices());
    }
  };

  const getStatusBadgeClasses = (status: InvoiceStatus) => {
    const color = invoiceStatusColors[status];
    const colorClasses: Record<string, string> = {
      slate: 'bg-slate-100 text-slate-700',
      blue: 'bg-blue-100 text-blue-700',
      emerald: 'bg-emerald-100 text-emerald-700',
      amber: 'bg-amber-100 text-amber-700',
      red: 'bg-red-100 text-red-700',
      zinc: 'bg-zinc-100 text-zinc-700',
    };
    return colorClasses[color] || 'bg-zinc-100 text-zinc-700';
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
              <div className="flex h-10 w-10 items-center justify-center bg-blue-100 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <h1 className="text-2xl font-bold text-zinc-900">Invoices</h1>
            </div>
            <p className="text-zinc-600">Create and manage invoices for your events</p>
          </div>
          <Link
            href="/accounting/invoices/create"
            className="inline-flex items-center gap-2 bg-zinc-900 text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-zinc-800 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Create Invoice
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-zinc-200 p-4">
            <p className="text-sm text-zinc-500 mb-1">Total Invoiced</p>
            <p className="text-xl font-bold text-zinc-900">{formatCurrency(stats.total)}</p>
          </div>
          <div className="bg-emerald-50 rounded-xl border border-emerald-100 p-4">
            <p className="text-sm text-emerald-600 mb-1">Collected</p>
            <p className="text-xl font-bold text-emerald-700">{formatCurrency(stats.paid)}</p>
          </div>
          <div className="bg-amber-50 rounded-xl border border-amber-100 p-4">
            <p className="text-sm text-amber-600 mb-1">Pending</p>
            <p className="text-xl font-bold text-amber-700">{formatCurrency(stats.pending)}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-zinc-200 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
              <input
                type="text"
                placeholder="Search invoices..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-zinc-900"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as InvoiceStatus | 'all')}
              className="px-4 py-2.5 bg-zinc-50 border-none rounded-lg text-sm font-medium focus:ring-2 focus:ring-zinc-900"
            >
              <option value="all">All Status</option>
              {Object.entries(invoiceStatusLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>

            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'amount')}
                className="px-4 py-2.5 bg-zinc-50 border-none rounded-lg text-sm font-medium focus:ring-2 focus:ring-zinc-900"
              >
                <option value="date">Sort by Date</option>
                <option value="amount">Sort by Amount</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-2.5 bg-zinc-50 rounded-lg hover:bg-zinc-100"
              >
                <ArrowUpDown className="h-5 w-5 text-zinc-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Invoices List */}
        <div className="space-y-3">
          {filteredInvoices.length > 0 ? (
            filteredInvoices.map((invoice) => (
              <div
                key={invoice.id}
                className="bg-white rounded-xl border border-zinc-200 p-4 hover:border-zinc-300 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-lg font-bold text-zinc-900">{invoice.invoiceNumber}</span>
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${getStatusBadgeClasses(invoice.status)}`}>
                        {invoiceStatusLabels[invoice.status]}
                      </span>
                      {invoice.status === 'overdue' && (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    <p className="font-medium text-zinc-700">{invoice.clientName}</p>
                    <div className="flex items-center gap-4 text-sm text-zinc-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(invoice.issueDate)}
                      </span>
                      <span>Due: {formatDate(invoice.dueDate)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-xl font-bold text-zinc-900">{formatCurrency(invoice.totalAmount)}</p>
                      {invoice.balanceAmount > 0 && (
                        <p className="text-sm text-amber-600">
                          Balance: {formatCurrency(invoice.balanceAmount)}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/accounting/invoices/${invoice.id}`}
                        className="p-2 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <Eye className="h-5 w-5" />
                      </Link>
                      <button
                        onClick={() => handleDelete(invoice.id)}
                        className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-xl border border-zinc-200 p-12 text-center">
              <FileText className="h-12 w-12 text-zinc-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-zinc-900 mb-2">No invoices found</h3>
              <p className="text-zinc-500 mb-4">
                {searchQuery || statusFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Create your first invoice to get started'}
              </p>
              <Link
                href="/accounting/invoices/create"
                className="inline-flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-zinc-800"
              >
                <Plus className="h-4 w-4" />
                Create Invoice
              </Link>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
