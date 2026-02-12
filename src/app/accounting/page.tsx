'use client';

import { useState, useEffect, useMemo } from 'react';
import PageLayout from '@/components/PageLayout';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
  FileText,
  Users,
  Plus,
  ArrowRight,
  IndianRupee,
  PieChart,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import Link from 'next/link';
import {
  loadExpenses,
  loadIncome,
  loadInvoices,
} from '@/lib/accountingStorage';
import {
  formatCurrency,
  calculateTotalExpenses,
  calculateTotalIncome,
  calculateExpensesByCategory,
  expenseCategoryLabels,
  expenseCategoryColors,
  generateTransactions,
  paymentMethodLabels,
} from '@/lib/data';
import { Expense, Income, Invoice, Transaction } from '@/lib/types';

export default function AccountingDashboard() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [income, setIncome] = useState<Income[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'month' | 'quarter' | 'year'>('month');

  useEffect(() => {
    setExpenses(loadExpenses());
    setIncome(loadIncome());
    setInvoices(loadInvoices());
    setIsLoading(false);
  }, []);

  const stats = useMemo(() => {
    const totalExpenses = calculateTotalExpenses(expenses);
    const totalOtherIncome = calculateTotalIncome(income);
    const totalInvoiceIncome = invoices.reduce((sum, i) => sum + i.paidAmount, 0);
    const totalIncome = totalOtherIncome + totalInvoiceIncome;
    const netProfit = totalIncome - totalExpenses;
    const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;
    const totalReceivables = invoices.reduce((sum, i) => sum + i.balanceAmount, 0);
    const pendingInvoices = invoices.filter(i => i.status === 'sent' || i.status === 'partial').length;
    const overdueInvoices = invoices.filter(i => i.status === 'overdue').length;

    return {
      totalIncome,
      totalExpenses,
      netProfit,
      profitMargin,
      totalReceivables,
      pendingInvoices,
      overdueInvoices,
    };
  }, [expenses, income, invoices]);

  const expensesByCategory = useMemo(() => {
    return calculateExpensesByCategory(expenses);
  }, [expenses]);

  const recentTransactions = useMemo(() => {
    return generateTransactions(expenses, income, invoices).slice(0, 5);
  }, [expenses, income, invoices]);

  const quickActions = [
    { label: 'Add Expense', href: '/accounting/expenses/create', icon: Receipt, color: 'red' },
    { label: 'Add Income', href: '/accounting/income/create', icon: TrendingUp, color: 'emerald' },
    { label: 'Create Invoice', href: '/accounting/invoices/create', icon: FileText, color: 'blue' },
    { label: 'Add Vendor', href: '/accounting/vendors/create', icon: Users, color: 'purple' },
  ];

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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 shadow-lg shadow-zinc-900/10">
                <Wallet className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-zinc-900 lg:text-3xl">Accounting</h1>
            </div>
            <p className="text-zinc-500">Manage your finances, track expenses, and monitor cash flow</p>
          </div>

          {/* Date Options */}
          <div className="bg-white border border-zinc-200 p-1 rounded-xl flex items-center shadow-sm">
            <button
              onClick={() => setDateRange('month')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${dateRange === 'month' ? 'bg-zinc-900 text-white shadow-md' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'}`}
            >
              This Month
            </button>
            <button
              onClick={() => setDateRange('quarter')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${dateRange === 'quarter' ? 'bg-zinc-900 text-white shadow-md' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'}`}
            >
              Quarter
            </button>
            <button
              onClick={() => setDateRange('year')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${dateRange === 'year' ? 'bg-zinc-900 text-white shadow-md' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'}`}
            >
              Year
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Total Income */}
          <div className="bg-white rounded-xl border border-zinc-200 p-4 lg:p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
              </div>
              <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                <ArrowUpRight className="h-3 w-3" />
                Income
              </span>
            </div>
            <p className="text-2xl font-bold text-zinc-900">{formatCurrency(stats.totalIncome)}</p>
            <p className="text-sm text-zinc-500 mt-1">Total Income</p>
          </div>

          {/* Total Expenses */}
          <div className="bg-white rounded-xl border border-zinc-200 p-4 lg:p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50">
                <TrendingDown className="h-5 w-5 text-red-600" />
              </div>
              <span className="flex items-center gap-1 text-xs font-medium text-red-600">
                <ArrowDownRight className="h-3 w-3" />
                Expenses
              </span>
            </div>
            <p className="text-2xl font-bold text-zinc-900">{formatCurrency(stats.totalExpenses)}</p>
            <p className="text-sm text-zinc-500 mt-1">Total Expenses</p>
          </div>

          {/* Net Profit */}
          <div className={`bg-white rounded-xl border p-4 lg:p-6 ${stats.netProfit >= 0 ? 'border-emerald-200 bg-emerald-50/30' : 'border-red-200 bg-red-50/30'}`}>
            <div className="flex items-center justify-between mb-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stats.netProfit >= 0 ? 'bg-emerald-100' : 'bg-red-100'}`}>
                <IndianRupee className={`h-5 w-5 ${stats.netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`} />
              </div>
              <span className={`text-xs font-medium ${stats.netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {stats.profitMargin.toFixed(1)}% margin
              </span>
            </div>
            <p className={`text-2xl font-bold ${stats.netProfit >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
              {formatCurrency(stats.netProfit)}
            </p>
            <p className="text-sm text-zinc-500 mt-1">Net Profit</p>
          </div>

          {/* Receivables */}
          <div className="bg-white rounded-xl border border-zinc-200 p-4 lg:p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              {stats.overdueInvoices > 0 && (
                <span className="flex items-center gap-1 text-xs font-medium text-red-600">
                  <AlertTriangle className="h-3 w-3" />
                  {stats.overdueInvoices} overdue
                </span>
              )}
            </div>
            <p className="text-2xl font-bold text-zinc-900">{formatCurrency(stats.totalReceivables)}</p>
            <p className="text-sm text-zinc-500 mt-1">Pending Collections</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="flex items-center gap-3 bg-white rounded-xl border border-zinc-200 p-4 hover:border-zinc-300 hover:shadow-sm transition-all"
            >
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${action.color === 'red' ? 'bg-red-50' :
                  action.color === 'emerald' ? 'bg-emerald-50' :
                    action.color === 'blue' ? 'bg-blue-50' :
                      'bg-purple-50'
                }`}>
                <action.icon className={`h-4 w-4 ${action.color === 'red' ? 'text-red-600' :
                    action.color === 'emerald' ? 'text-emerald-600' :
                      action.color === 'blue' ? 'text-blue-600' :
                        'text-purple-600'
                  }`} />
              </div>
              <span className="text-sm font-medium text-zinc-700">{action.label}</span>
            </Link>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Expense Breakdown */}
          <div className="lg:col-span-1 bg-white rounded-xl border border-zinc-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-zinc-900">Expense Breakdown</h2>
              <Link href="/accounting/expenses" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 flex items-center gap-1">
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="space-y-4">
              {Object.entries(expensesByCategory)
                .filter(([, amount]) => amount > 0)
                .sort(([, a], [, b]) => b - a)
                .map(([category, amount]) => {
                  const percentage = stats.totalExpenses > 0 ? (amount / stats.totalExpenses) * 100 : 0;
                  const color = expenseCategoryColors[category as keyof typeof expenseCategoryColors];
                  return (
                    <div key={category}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-zinc-700">
                          {expenseCategoryLabels[category as keyof typeof expenseCategoryLabels]}
                        </span>
                        <span className="text-sm font-semibold text-zinc-900">{formatCurrency(amount)}</span>
                      </div>
                      <div className="h-3 bg-zinc-50 rounded-full overflow-hidden border border-zinc-100">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${color === 'emerald' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' :
                              color === 'blue' ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]' :
                                color === 'amber' ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]' :
                                  color === 'purple' ? 'bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.3)]' :
                                    color === 'pink' ? 'bg-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.3)]' :
                                      color === 'cyan' ? 'bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.3)]' :
                                        color === 'orange' ? 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.3)]' :
                                          'bg-slate-500'
                            }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <p className="text-xs font-medium text-zinc-400 mt-1.5">{percentage.toFixed(1)}%</p>
                    </div>
                  );
                })}
              {Object.values(expensesByCategory).every(v => v === 0) && (
                <p className="text-sm text-zinc-500 text-center py-4">No expenses recorded yet</p>
              )}
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-zinc-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-zinc-900">Recent Transactions</h2>
              <Link href="/accounting/transactions" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 flex items-center gap-1">
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="space-y-3">
              {recentTransactions.length > 0 ? (
                recentTransactions.map((txn) => (
                  <div key={txn.id} className="flex items-center justify-between py-3 border-b border-zinc-100 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${txn.type === 'income' ? 'bg-emerald-50' : 'bg-red-50'
                        }`}>
                        {txn.type === 'income' ? (
                          <ArrowDownRight className="h-5 w-5 text-emerald-600" />
                        ) : (
                          <ArrowUpRight className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-zinc-900 line-clamp-1">{txn.description}</p>
                        <p className="text-xs text-zinc-500">
                          {new Date(txn.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          {' '}&middot;{' '}
                          {paymentMethodLabels[txn.paymentMethod]}
                        </p>
                      </div>
                    </div>
                    <span className={`text-sm font-semibold ${txn.type === 'income' ? 'text-emerald-600' : 'text-red-600'
                      }`}>
                      {txn.type === 'income' ? '+' : '-'}{formatCurrency(txn.amount)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-zinc-500 text-center py-8">No transactions yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mt-8">
          <Link href="/accounting/expenses" className="bg-white rounded-xl border border-zinc-200 p-4 hover:border-zinc-300 hover:shadow-sm transition-all">
            <Receipt className="h-6 w-6 text-red-600 mb-2" />
            <h3 className="font-semibold text-zinc-900">Expenses</h3>
            <p className="text-xs text-zinc-500 mt-1">{expenses.length} records</p>
          </Link>
          <Link href="/accounting/income" className="bg-white rounded-xl border border-zinc-200 p-4 hover:border-zinc-300 hover:shadow-sm transition-all">
            <TrendingUp className="h-6 w-6 text-emerald-600 mb-2" />
            <h3 className="font-semibold text-zinc-900">Income</h3>
            <p className="text-xs text-zinc-500 mt-1">{income.length} records</p>
          </Link>
          <Link href="/accounting/invoices" className="bg-white rounded-xl border border-zinc-200 p-4 hover:border-zinc-300 hover:shadow-sm transition-all">
            <FileText className="h-6 w-6 text-blue-600 mb-2" />
            <h3 className="font-semibold text-zinc-900">Invoices</h3>
            <p className="text-xs text-zinc-500 mt-1">{invoices.length} invoices</p>
          </Link>
          <Link href="/accounting/reports" className="bg-white rounded-xl border border-zinc-200 p-4 hover:border-zinc-300 hover:shadow-sm transition-all">
            <PieChart className="h-6 w-6 text-purple-600 mb-2" />
            <h3 className="font-semibold text-zinc-900">Reports</h3>
            <p className="text-xs text-zinc-500 mt-1">P&L, Cash Flow</p>
          </Link>
          <Link href="/accounting/vendors" className="bg-white rounded-xl border border-zinc-200 p-4 hover:border-zinc-300 hover:shadow-sm transition-all">
            <Users className="h-6 w-6 text-amber-600 mb-2" />
            <h3 className="font-semibold text-zinc-900">Vendors</h3>
            <p className="text-xs text-zinc-500 mt-1">Manage suppliers</p>
          </Link>
        </div>
      </div>
    </PageLayout>
  );
}
