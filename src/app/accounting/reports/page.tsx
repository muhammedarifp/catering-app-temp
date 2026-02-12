'use client';

import { useState, useEffect, useMemo } from 'react';
import PageLayout from '@/components/PageLayout';
import {
  PieChart,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  IndianRupee,
} from 'lucide-react';
import { loadExpenses, loadIncome, loadInvoices } from '@/lib/accountingStorage';
import {
  formatCurrency,
  calculateExpensesByCategory,
  calculateIncomeByType,
  expenseCategoryLabels,
  expenseCategoryColors,
  incomeTypeLabels,
} from '@/lib/data';
import { Expense, Income, Invoice } from '@/lib/types';

type ReportPeriod = 'this_month' | 'last_month' | 'this_quarter' | 'this_year' | 'custom';

export default function ReportsPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [income, setIncome] = useState<Income[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [period, setPeriod] = useState<ReportPeriod>('this_month');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setExpenses(loadExpenses());
    setIncome(loadIncome());
    setInvoices(loadInvoices());
    setIsLoading(false);
  }, []);

  const dateRange = useMemo(() => {
    const now = new Date();
    let start: Date, end: Date;

    switch (period) {
      case 'this_month':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case 'last_month':
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case 'this_quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        start = new Date(now.getFullYear(), quarter * 3, 1);
        end = new Date(now.getFullYear(), (quarter + 1) * 3, 0);
        break;
      case 'this_year':
        start = new Date(now.getFullYear(), 0, 1);
        end = new Date(now.getFullYear(), 11, 31);
        break;
      case 'custom':
        start = customStart ? new Date(customStart) : new Date(now.getFullYear(), now.getMonth(), 1);
        end = customEnd ? new Date(customEnd) : now;
        break;
      default:
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = now;
    }

    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
      label: period === 'custom' ? 'Custom Period' :
             period === 'this_month' ? 'This Month' :
             period === 'last_month' ? 'Last Month' :
             period === 'this_quarter' ? 'This Quarter' : 'This Year',
    };
  }, [period, customStart, customEnd]);

  const filteredData = useMemo(() => {
    const filteredExpenses = expenses.filter(
      (e) => e.date >= dateRange.start && e.date <= dateRange.end
    );
    const filteredIncome = income.filter(
      (i) => i.date >= dateRange.start && i.date <= dateRange.end
    );
    const filteredInvoices = invoices.filter(
      (i) => i.issueDate >= dateRange.start && i.issueDate <= dateRange.end
    );
    return { expenses: filteredExpenses, income: filteredIncome, invoices: filteredInvoices };
  }, [expenses, income, invoices, dateRange]);

  const pnlData = useMemo(() => {
    const totalExpenses = filteredData.expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalOtherIncome = filteredData.income.reduce((sum, i) => sum + i.amount, 0);
    const totalInvoiceIncome = filteredData.invoices.reduce((sum, i) => sum + i.paidAmount, 0);
    const totalIncome = totalOtherIncome + totalInvoiceIncome;
    const grossProfit = totalIncome - filteredData.expenses
      .filter(e => e.category === 'food_costs')
      .reduce((sum, e) => sum + e.amount, 0);
    const netProfit = totalIncome - totalExpenses;
    const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;

    return {
      totalIncome,
      totalInvoiceIncome,
      totalOtherIncome,
      totalExpenses,
      grossProfit,
      netProfit,
      profitMargin,
      expensesByCategory: calculateExpensesByCategory(filteredData.expenses),
      incomeByType: calculateIncomeByType(filteredData.income),
    };
  }, [filteredData]);

  const cashFlowData = useMemo(() => {
    const inflows = pnlData.totalIncome;
    const outflows = pnlData.totalExpenses;
    const netCashFlow = inflows - outflows;
    const totalReceivables = filteredData.invoices.reduce((sum, i) => sum + i.balanceAmount, 0);

    return {
      inflows,
      outflows,
      netCashFlow,
      totalReceivables,
    };
  }, [pnlData, filteredData]);

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
                <PieChart className="h-5 w-5 text-purple-600" />
              </div>
              <h1 className="text-2xl font-bold text-zinc-900">Financial Reports</h1>
            </div>
            <p className="text-zinc-600">Analyze your business performance</p>
          </div>
        </div>

        {/* Period Selector */}
        <div className="bg-white rounded-xl border border-zinc-200 p-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-zinc-400" />
              <span className="text-sm font-medium text-zinc-700">Report Period:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'this_month', label: 'This Month' },
                { value: 'last_month', label: 'Last Month' },
                { value: 'this_quarter', label: 'This Quarter' },
                { value: 'this_year', label: 'This Year' },
                { value: 'custom', label: 'Custom' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setPeriod(option.value as ReportPeriod)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    period === option.value
                      ? 'bg-zinc-900 text-white'
                      : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            {period === 'custom' && (
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm"
                />
                <span className="text-zinc-400">to</span>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm"
                />
              </div>
            )}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-emerald-50 rounded-xl border border-emerald-100 p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-700">Total Income</span>
            </div>
            <p className="text-2xl font-bold text-emerald-700">{formatCurrency(pnlData.totalIncome)}</p>
          </div>
          <div className="bg-red-50 rounded-xl border border-red-100 p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="h-5 w-5 text-red-600" />
              <span className="text-sm font-medium text-red-700">Total Expenses</span>
            </div>
            <p className="text-2xl font-bold text-red-700">{formatCurrency(pnlData.totalExpenses)}</p>
          </div>
          <div className={`rounded-xl border p-4 ${pnlData.netProfit >= 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
            <div className="flex items-center gap-2 mb-2">
              <IndianRupee className={`h-5 w-5 ${pnlData.netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`} />
              <span className={`text-sm font-medium ${pnlData.netProfit >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>Net Profit</span>
            </div>
            <p className={`text-2xl font-bold ${pnlData.netProfit >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
              {formatCurrency(pnlData.netProfit)}
            </p>
            <p className={`text-sm ${pnlData.netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {pnlData.profitMargin.toFixed(1)}% margin
            </p>
          </div>
          <div className="bg-amber-50 rounded-xl border border-amber-100 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-5 w-5 text-amber-600" />
              <span className="text-sm font-medium text-amber-700">Receivables</span>
            </div>
            <p className="text-2xl font-bold text-amber-700">{formatCurrency(cashFlowData.totalReceivables)}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Profit & Loss Statement */}
          <div className="bg-white rounded-xl border border-zinc-200 p-6">
            <h2 className="text-lg font-semibold text-zinc-900 mb-6">Profit & Loss Statement</h2>
            <div className="space-y-4">
              {/* Income Section */}
              <div>
                <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-3">Revenue</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-600">Invoice Payments</span>
                    <span className="font-medium text-zinc-900">{formatCurrency(pnlData.totalInvoiceIncome)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-600">Other Income</span>
                    <span className="font-medium text-zinc-900">{formatCurrency(pnlData.totalOtherIncome)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold pt-2 border-t border-zinc-100">
                    <span className="text-emerald-700">Total Revenue</span>
                    <span className="text-emerald-700">{formatCurrency(pnlData.totalIncome)}</span>
                  </div>
                </div>
              </div>

              {/* Expenses Section */}
              <div className="pt-4 border-t border-zinc-200">
                <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-3">Expenses</h3>
                <div className="space-y-2">
                  {Object.entries(pnlData.expensesByCategory)
                    .filter(([, amount]) => amount > 0)
                    .sort(([, a], [, b]) => b - a)
                    .map(([category, amount]) => (
                      <div key={category} className="flex justify-between text-sm">
                        <span className="text-zinc-600">{expenseCategoryLabels[category as keyof typeof expenseCategoryLabels]}</span>
                        <span className="font-medium text-zinc-900">{formatCurrency(amount)}</span>
                      </div>
                    ))}
                  <div className="flex justify-between text-sm font-semibold pt-2 border-t border-zinc-100">
                    <span className="text-red-700">Total Expenses</span>
                    <span className="text-red-700">{formatCurrency(pnlData.totalExpenses)}</span>
                  </div>
                </div>
              </div>

              {/* Net Profit */}
              <div className={`pt-4 border-t-2 border-zinc-900`}>
                <div className="flex justify-between text-lg font-bold">
                  <span>Net Profit</span>
                  <span className={pnlData.netProfit >= 0 ? 'text-emerald-700' : 'text-red-700'}>
                    {formatCurrency(pnlData.netProfit)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Cash Flow Summary */}
          <div className="bg-white rounded-xl border border-zinc-200 p-6">
            <h2 className="text-lg font-semibold text-zinc-900 mb-6">Cash Flow Summary</h2>
            <div className="space-y-6">
              {/* Inflows */}
              <div>
                <h3 className="text-sm font-semibold text-emerald-600 mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Cash Inflows
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-600">Event Payments Received</span>
                    <span className="font-medium">{formatCurrency(pnlData.totalInvoiceIncome)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-600">Other Income</span>
                    <span className="font-medium">{formatCurrency(pnlData.totalOtherIncome)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold pt-2 border-t border-zinc-100">
                    <span className="text-emerald-700">Total Inflows</span>
                    <span className="text-emerald-700">{formatCurrency(cashFlowData.inflows)}</span>
                  </div>
                </div>
              </div>

              {/* Outflows */}
              <div>
                <h3 className="text-sm font-semibold text-red-600 mb-3 flex items-center gap-2">
                  <TrendingDown className="h-4 w-4" />
                  Cash Outflows
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-600">Operating Expenses</span>
                    <span className="font-medium">{formatCurrency(cashFlowData.outflows)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold pt-2 border-t border-zinc-100">
                    <span className="text-red-700">Total Outflows</span>
                    <span className="text-red-700">{formatCurrency(cashFlowData.outflows)}</span>
                  </div>
                </div>
              </div>

              {/* Net Cash Flow */}
              <div className="pt-4 border-t-2 border-zinc-900">
                <div className="flex justify-between text-lg font-bold">
                  <span>Net Cash Flow</span>
                  <span className={cashFlowData.netCashFlow >= 0 ? 'text-emerald-700' : 'text-red-700'}>
                    {formatCurrency(cashFlowData.netCashFlow)}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-amber-600 mt-2">
                  <span>Pending Receivables</span>
                  <span>{formatCurrency(cashFlowData.totalReceivables)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Expense Breakdown Chart */}
          <div className="bg-white rounded-xl border border-zinc-200 p-6">
            <h2 className="text-lg font-semibold text-zinc-900 mb-6">Expense Breakdown</h2>
            <div className="space-y-4">
              {Object.entries(pnlData.expensesByCategory)
                .filter(([, amount]) => amount > 0)
                .sort(([, a], [, b]) => b - a)
                .map(([category, amount]) => {
                  const percentage = pnlData.totalExpenses > 0 ? (amount / pnlData.totalExpenses) * 100 : 0;
                  const color = expenseCategoryColors[category as keyof typeof expenseCategoryColors];
                  return (
                    <div key={category}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-zinc-700">
                          {expenseCategoryLabels[category as keyof typeof expenseCategoryLabels]}
                        </span>
                        <div className="text-right">
                          <span className="text-sm font-semibold text-zinc-900">{formatCurrency(amount)}</span>
                          <span className="text-xs text-zinc-500 ml-2">({percentage.toFixed(1)}%)</span>
                        </div>
                      </div>
                      <div className="h-3 bg-zinc-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            color === 'emerald' ? 'bg-emerald-500' :
                            color === 'blue' ? 'bg-blue-500' :
                            color === 'amber' ? 'bg-amber-500' :
                            color === 'purple' ? 'bg-purple-500' :
                            color === 'pink' ? 'bg-pink-500' :
                            color === 'cyan' ? 'bg-cyan-500' :
                            color === 'orange' ? 'bg-orange-500' :
                            'bg-slate-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              {Object.values(pnlData.expensesByCategory).every(v => v === 0) && (
                <p className="text-sm text-zinc-500 text-center py-4">No expenses in this period</p>
              )}
            </div>
          </div>

          {/* Period Summary */}
          <div className="bg-white rounded-xl border border-zinc-200 p-6">
            <h2 className="text-lg font-semibold text-zinc-900 mb-6">Period Summary - {dateRange.label}</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-zinc-50 rounded-lg p-4">
                <p className="text-sm text-zinc-500 mb-1">Total Transactions</p>
                <p className="text-2xl font-bold text-zinc-900">
                  {filteredData.expenses.length + filteredData.income.length + filteredData.invoices.length}
                </p>
              </div>
              <div className="bg-zinc-50 rounded-lg p-4">
                <p className="text-sm text-zinc-500 mb-1">Invoices Created</p>
                <p className="text-2xl font-bold text-zinc-900">{filteredData.invoices.length}</p>
              </div>
              <div className="bg-zinc-50 rounded-lg p-4">
                <p className="text-sm text-zinc-500 mb-1">Expenses Recorded</p>
                <p className="text-2xl font-bold text-zinc-900">{filteredData.expenses.length}</p>
              </div>
              <div className="bg-zinc-50 rounded-lg p-4">
                <p className="text-sm text-zinc-500 mb-1">Income Entries</p>
                <p className="text-2xl font-bold text-zinc-900">{filteredData.income.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
