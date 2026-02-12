'use client';

import { useState, useEffect, useMemo } from 'react';
import PageLayout from '@/components/PageLayout';
import {
  ArrowUpDown,
  Search,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Filter,
} from 'lucide-react';
import Link from 'next/link';
import { loadExpenses, loadIncome, loadInvoices } from '@/lib/accountingStorage';
import {
  formatCurrency,
  formatDate,
  generateTransactions,
  paymentMethodLabels,
} from '@/lib/data';
import { Transaction, TransactionType, PaymentMethod } from '@/lib/types';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<TransactionType | 'all'>('all');
  const [methodFilter, setMethodFilter] = useState<PaymentMethod | 'all'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const expenses = loadExpenses();
    const income = loadIncome();
    const invoices = loadInvoices();
    const txns = generateTransactions(expenses, income, invoices);
    setTransactions(txns);
    setIsLoading(false);
  }, []);

  const filteredTransactions = useMemo(() => {
    let result = [...transactions];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((t) => t.description.toLowerCase().includes(query));
    }

    if (typeFilter !== 'all') {
      result = result.filter((t) => t.type === typeFilter);
    }

    if (methodFilter !== 'all') {
      result = result.filter((t) => t.paymentMethod === methodFilter);
    }

    if (startDate) {
      result = result.filter((t) => t.date >= startDate);
    }

    if (endDate) {
      result = result.filter((t) => t.date <= endDate);
    }

    return result;
  }, [transactions, searchQuery, typeFilter, methodFilter, startDate, endDate]);

  const stats = useMemo(() => {
    const totalIncome = filteredTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = filteredTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    return { totalIncome, totalExpense, net: totalIncome - totalExpense };
  }, [filteredTransactions]);

  const exportToCSV = () => {
    const headers = ['Date', 'Type', 'Description', 'Amount', 'Payment Method', 'Reference'];
    const rows = filteredTransactions.map((t) => [
      t.date,
      t.type,
      t.description,
      t.type === 'income' ? t.amount : -t.amount,
      paymentMethodLabels[t.paymentMethod],
      t.paymentReference || '',
    ]);

    const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
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
              <div className="flex h-10 w-10 items-center justify-center bg-purple-100 rounded-lg">
                <ArrowUpDown className="h-5 w-5 text-purple-600" />
              </div>
              <h1 className="text-2xl font-bold text-zinc-900">Transactions</h1>
            </div>
            <p className="text-zinc-600">View all money in and out of your business</p>
          </div>
          <button
            onClick={exportToCSV}
            className="inline-flex items-center gap-2 border border-zinc-200 px-4 py-2.5 rounded-xl font-semibold hover:bg-zinc-50 transition-colors"
          >
            <Download className="h-5 w-5" />
            Export CSV
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-emerald-50 rounded-xl border border-emerald-100 p-4">
            <p className="text-sm text-emerald-600 mb-1">Total Income</p>
            <p className="text-xl font-bold text-emerald-700">{formatCurrency(stats.totalIncome)}</p>
          </div>
          <div className="bg-red-50 rounded-xl border border-red-100 p-4">
            <p className="text-sm text-red-600 mb-1">Total Expenses</p>
            <p className="text-xl font-bold text-red-700">{formatCurrency(stats.totalExpense)}</p>
          </div>
          <div className={`rounded-xl border p-4 ${stats.net >= 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
            <p className={`text-sm mb-1 ${stats.net >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>Net</p>
            <p className={`text-xl font-bold ${stats.net >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
              {formatCurrency(stats.net)}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-zinc-200 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-zinc-900"
              />
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as TransactionType | 'all')}
              className="px-4 py-2.5 bg-zinc-50 border-none rounded-lg text-sm font-medium focus:ring-2 focus:ring-zinc-900"
            >
              <option value="all">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>

            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value as PaymentMethod | 'all')}
              className="px-4 py-2.5 bg-zinc-50 border-none rounded-lg text-sm font-medium focus:ring-2 focus:ring-zinc-900"
            >
              <option value="all">All Methods</option>
              {Object.entries(paymentMethodLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>

            <div className="flex items-center gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="From"
                className="px-3 py-2.5 bg-zinc-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-zinc-900"
              />
              <span className="text-zinc-400">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="To"
                className="px-3 py-2.5 bg-zinc-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-zinc-900"
              />
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-50 border-b border-zinc-200">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-zinc-600">Date</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-zinc-600">Description</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-zinc-600">Type</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-zinc-600">Method</th>
                  <th className="text-right px-4 py-3 text-sm font-semibold text-zinc-600">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((txn) => (
                    <tr key={txn.id} className="hover:bg-zinc-50">
                      <td className="px-4 py-3 text-sm text-zinc-600 whitespace-nowrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(txn.date)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-900 max-w-xs truncate">
                        {txn.description}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${
                          txn.type === 'income'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-red-50 text-red-700'
                        }`}>
                          {txn.type === 'income' ? (
                            <ArrowDownRight className="h-3 w-3" />
                          ) : (
                            <ArrowUpRight className="h-3 w-3" />
                          )}
                          {txn.type === 'income' ? 'Income' : 'Expense'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-600">
                        {paymentMethodLabels[txn.paymentMethod]}
                      </td>
                      <td className={`px-4 py-3 text-sm font-semibold text-right ${
                        txn.type === 'income' ? 'text-emerald-600' : 'text-red-600'
                      }`}>
                        {txn.type === 'income' ? '+' : '-'}{formatCurrency(txn.amount)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-zinc-500">
                      No transactions found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-sm text-zinc-500 mt-4 text-center">
          Showing {filteredTransactions.length} of {transactions.length} transactions
        </p>
      </div>
    </PageLayout>
  );
}
