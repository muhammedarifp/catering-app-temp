'use client';

import { useState, useEffect, useMemo } from 'react';
import PageLayout from '@/components/PageLayout';
import {
  Receipt,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit,
  Calendar,
  ArrowUpDown,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';
import { loadExpenses, deleteExpense, loadVendors } from '@/lib/accountingStorage';
import {
  formatCurrency,
  formatDate,
  expenseCategoryLabels,
  expenseCategoryColors,
  paymentMethodLabels,
} from '@/lib/data';
import { events } from '@/lib/data';
import { Expense, ExpenseCategory, PaymentMethod } from '@/lib/types';

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ExpenseCategory | 'all'>('all');
  const [paymentFilter, setPaymentFilter] = useState<PaymentMethod | 'all'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setExpenses(loadExpenses());
    setIsLoading(false);
  }, []);

  const filteredExpenses = useMemo(() => {
    let result = [...expenses];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (e) =>
          e.description.toLowerCase().includes(query) ||
          e.vendor.toLowerCase().includes(query) ||
          (e.receiptNumber && e.receiptNumber.toLowerCase().includes(query))
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      result = result.filter((e) => e.category === categoryFilter);
    }

    // Payment method filter
    if (paymentFilter !== 'all') {
      result = result.filter((e) => e.paymentMethod === paymentFilter);
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'date') {
        return sortOrder === 'desc'
          ? new Date(b.date).getTime() - new Date(a.date).getTime()
          : new Date(a.date).getTime() - new Date(b.date).getTime();
      } else {
        return sortOrder === 'desc' ? b.amount - a.amount : a.amount - b.amount;
      }
    });

    return result;
  }, [expenses, searchQuery, categoryFilter, paymentFilter, sortBy, sortOrder]);

  const totalFiltered = useMemo(() => {
    return filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [filteredExpenses]);

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this expense?')) {
      deleteExpense(id);
      setExpenses(loadExpenses());
    }
  };

  const getEventName = (eventId?: string) => {
    if (!eventId) return null;
    const event = events.find((e) => e.id === eventId);
    return event?.name;
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
              <div className="flex h-10 w-10 items-center justify-center bg-red-100 rounded-lg">
                <Receipt className="h-5 w-5 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-zinc-900">Expenses</h1>
            </div>
            <p className="text-zinc-600">Track and manage all your business expenses</p>
          </div>
          <Link
            href="/accounting/expenses/create"
            className="inline-flex items-center gap-2 bg-zinc-900 text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-zinc-800 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Add Expense
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-zinc-200 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
              <input
                type="text"
                placeholder="Search expenses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-zinc-900"
              />
            </div>

            {/* Category Filter */}
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

            {/* Payment Filter */}
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value as PaymentMethod | 'all')}
              className="px-4 py-2.5 bg-zinc-50 border-none rounded-lg text-sm font-medium focus:ring-2 focus:ring-zinc-900"
            >
              <option value="all">All Payment Methods</option>
              {Object.entries(paymentMethodLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>

            {/* Sort */}
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

        {/* Summary Bar */}
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-red-700 font-medium">
              Showing {filteredExpenses.length} of {expenses.length} expenses
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-red-600">Total</p>
            <p className="text-xl font-bold text-red-700">{formatCurrency(totalFiltered)}</p>
          </div>
        </div>

        {/* Expenses List */}
        <div className="space-y-3">
          {filteredExpenses.length > 0 ? (
            filteredExpenses.map((expense) => (
              <div
                key={expense.id}
                className="bg-white rounded-xl border border-zinc-200 p-4 hover:border-zinc-300 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${getCategoryBadgeClasses(expense.category)}`}>
                            {expenseCategoryLabels[expense.category]}
                          </span>
                          {expense.isRecurring && (
                            <span className="px-2 py-1 rounded-lg text-xs font-medium bg-purple-50 text-purple-700 flex items-center gap-1">
                              <RefreshCw className="h-3 w-3" />
                              Recurring
                            </span>
                          )}
                        </div>
                        <h3 className="font-semibold text-zinc-900">{expense.description}</h3>
                        <div className="flex items-center gap-4 text-sm text-zinc-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(expense.date)}
                          </span>
                          <span>{expense.vendor}</span>
                          <span className="px-2 py-0.5 bg-zinc-100 rounded text-xs">
                            {paymentMethodLabels[expense.paymentMethod]}
                          </span>
                        </div>
                        {expense.eventId && (
                          <p className="text-xs text-zinc-500">
                            Event: <span className="font-medium text-zinc-700">{getEventName(expense.eventId)}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-xl font-bold text-red-600">{formatCurrency(expense.amount)}</p>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/accounting/expenses/create?edit=${expense.id}`}
                        className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-lg"
                      >
                        <Edit className="h-5 w-5" />
                      </Link>
                      <button
                        onClick={() => handleDelete(expense.id)}
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
              <Receipt className="h-12 w-12 text-zinc-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-zinc-900 mb-2">No expenses found</h3>
              <p className="text-zinc-500 mb-4">
                {searchQuery || categoryFilter !== 'all' || paymentFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Start tracking your expenses by adding one'}
              </p>
              <Link
                href="/accounting/expenses/create"
                className="inline-flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-zinc-800"
              >
                <Plus className="h-4 w-4" />
                Add Expense
              </Link>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
