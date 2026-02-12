'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import PageLayout from '@/components/PageLayout';
import {
  FileText,
  ArrowLeft,
  Printer,
  Plus,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Check,
} from 'lucide-react';
import Link from 'next/link';
import { loadInvoices, addInvoicePayment, updateInvoice } from '@/lib/accountingStorage';
import {
  formatCurrency,
  formatDate,
  invoiceStatusLabels,
  invoiceStatusColors,
  paymentMethodLabels,
} from '@/lib/data';
import { Invoice, PaymentMethod, InvoiceStatus } from '@/lib/types';

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = params.id as string;

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bank_transfer');
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');

  useEffect(() => {
    const invoices = loadInvoices();
    const found = invoices.find(i => i.id === invoiceId);
    setInvoice(found || null);
    setIsLoading(false);
  }, [invoiceId]);

  const handleRecordPayment = () => {
    if (!invoice || !paymentAmount) return;

    const amount = parseFloat(paymentAmount);
    if (amount <= 0) return;

    const payment = {
      amount,
      date: new Date().toISOString().split('T')[0],
      paymentMethod,
      paymentReference: paymentReference || undefined,
      notes: paymentNotes || undefined,
    };

    const updated = addInvoicePayment(invoiceId, payment);
    if (updated) {
      setInvoice(updated);
      setShowPaymentModal(false);
      setPaymentAmount('');
      setPaymentReference('');
      setPaymentNotes('');
    }
  };

  const markAsPaid = () => {
    if (!invoice) return;
    if (invoice.balanceAmount > 0) {
      const payment = {
        amount: invoice.balanceAmount,
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'bank_transfer' as PaymentMethod,
        notes: 'Final payment',
      };
      const updated = addInvoicePayment(invoiceId, payment);
      if (updated) setInvoice(updated);
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

  if (!invoice) {
    return (
      <PageLayout currentPath="/accounting">
        <div className="mx-auto max-w-4xl px-4 py-6 lg:px-8 lg:py-8">
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-zinc-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-zinc-900 mb-2">Invoice not found</h2>
            <Link href="/accounting/invoices" className="text-blue-600 hover:underline">
              Back to Invoices
            </Link>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout currentPath="/accounting">
      <div className="mx-auto max-w-4xl px-4 py-6 lg:px-8 lg:py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/accounting/invoices"
            className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Invoices
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center bg-blue-100 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-zinc-900">{invoice.invoiceNumber}</h1>
                <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-medium ${getStatusBadgeClasses(invoice.status)}`}>
                  {invoiceStatusLabels[invoice.status]}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {invoice.status !== 'paid' && (
                <>
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700"
                  >
                    <Plus className="h-4 w-4" />
                    Record Payment
                  </button>
                  <button
                    onClick={markAsPaid}
                    className="inline-flex items-center gap-2 border border-emerald-600 text-emerald-600 px-4 py-2 rounded-lg font-medium hover:bg-emerald-50"
                  >
                    <Check className="h-4 w-4" />
                    Mark as Paid
                  </button>
                </>
              )}
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 border border-zinc-200 px-4 py-2 rounded-lg font-medium hover:bg-zinc-50"
              >
                <Printer className="h-4 w-4" />
                Print
              </button>
            </div>
          </div>
        </div>

        {/* Invoice Content */}
        <div className="bg-white rounded-xl border border-zinc-200 p-6 lg:p-8 print:border-0 print:shadow-none">
          {/* Header Info */}
          <div className="flex flex-col md:flex-row md:justify-between gap-6 mb-8 pb-8 border-b border-zinc-200">
            <div>
              <h2 className="text-2xl font-bold text-zinc-900 mb-4">CaterPro</h2>
              <p className="text-sm text-zinc-600">Catering Management Services</p>
              <p className="text-sm text-zinc-600">Hyderabad, Telangana</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-zinc-500 mb-1">Invoice Number</p>
              <p className="text-xl font-bold text-zinc-900 mb-4">{invoice.invoiceNumber}</p>
              <div className="flex items-center justify-end gap-4 text-sm text-zinc-600">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Issued: {formatDate(invoice.issueDate)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>Due: {formatDate(invoice.dueDate)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Client Info */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-3">Bill To</h3>
            <p className="text-lg font-semibold text-zinc-900">{invoice.clientName}</p>
            <div className="flex flex-wrap gap-4 mt-2 text-sm text-zinc-600">
              {invoice.clientPhone && (
                <span className="flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  {invoice.clientPhone}
                </span>
              )}
              {invoice.clientEmail && (
                <span className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  {invoice.clientEmail}
                </span>
              )}
            </div>
            {invoice.clientAddress && (
              <p className="flex items-center gap-1 mt-2 text-sm text-zinc-600">
                <MapPin className="h-4 w-4" />
                {invoice.clientAddress}
              </p>
            )}
          </div>

          {/* Line Items Table */}
          <div className="mb-8">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-200">
                  <th className="text-left py-3 text-sm font-semibold text-zinc-500">Description</th>
                  <th className="text-right py-3 text-sm font-semibold text-zinc-500 w-20">Qty</th>
                  <th className="text-right py-3 text-sm font-semibold text-zinc-500 w-28">Rate</th>
                  <th className="text-right py-3 text-sm font-semibold text-zinc-500 w-24">Tax</th>
                  <th className="text-right py-3 text-sm font-semibold text-zinc-500 w-28">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.lineItems.map((item) => (
                  <tr key={item.id} className="border-b border-zinc-100">
                    <td className="py-3 text-sm text-zinc-900">{item.description}</td>
                    <td className="py-3 text-sm text-zinc-900 text-right">{item.quantity}</td>
                    <td className="py-3 text-sm text-zinc-900 text-right">{formatCurrency(item.unitPrice)}</td>
                    <td className="py-3 text-sm text-zinc-500 text-right">{item.taxRate}%</td>
                    <td className="py-3 text-sm font-medium text-zinc-900 text-right">
                      {formatCurrency(item.totalPrice + item.taxAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-72 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Subtotal</span>
                <span className="font-medium">{formatCurrency(invoice.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">CGST (State Tax)</span>
                <span className="font-medium">{formatCurrency(invoice.totalTaxAmount / 2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">SGST (Central Tax)</span>
                <span className="font-medium">{formatCurrency(invoice.totalTaxAmount / 2)}</span>
              </div>
              {invoice.discountAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Discount</span>
                  <span className="font-medium text-red-600">-{formatCurrency(invoice.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-zinc-200">
                <span>Total</span>
                <span>{formatCurrency(invoice.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-sm text-emerald-600">
                <span>Paid</span>
                <span>{formatCurrency(invoice.paidAmount)}</span>
              </div>
              <div className={`flex justify-between text-lg font-bold ${invoice.balanceAmount > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                <span>Balance Due</span>
                <span>{formatCurrency(invoice.balanceAmount)}</span>
              </div>
            </div>
          </div>

          {/* Payment History */}
          {invoice.payments.length > 0 && (
            <div className="mb-8 p-4 bg-zinc-50 rounded-lg">
              <h3 className="text-sm font-semibold text-zinc-700 mb-3">Payment History</h3>
              <div className="space-y-2">
                {invoice.payments.map((payment) => (
                  <div key={payment.id} className="flex justify-between items-center text-sm">
                    <div>
                      <span className="text-zinc-900">{formatDate(payment.date)}</span>
                      <span className="text-zinc-500 mx-2">&middot;</span>
                      <span className="text-zinc-500">{paymentMethodLabels[payment.paymentMethod]}</span>
                      {payment.notes && (
                        <span className="text-zinc-400 ml-2">({payment.notes})</span>
                      )}
                    </div>
                    <span className="font-medium text-emerald-600">+{formatCurrency(payment.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes & Terms */}
          {(invoice.notes || invoice.termsAndConditions) && (
            <div className="pt-6 border-t border-zinc-200 space-y-4 text-sm">
              {invoice.notes && (
                <div>
                  <h4 className="font-semibold text-zinc-700 mb-1">Notes</h4>
                  <p className="text-zinc-600">{invoice.notes}</p>
                </div>
              )}
              {invoice.termsAndConditions && (
                <div>
                  <h4 className="font-semibold text-zinc-700 mb-1">Terms & Conditions</h4>
                  <p className="text-zinc-600">{invoice.termsAndConditions}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Payment Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-zinc-900 mb-4">Record Payment</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                    Amount <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder={`Max: ${invoice.balanceAmount}`}
                    max={invoice.balanceAmount}
                    min="0"
                    className="w-full px-4 py-2.5 bg-zinc-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-zinc-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1.5">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-4 py-2.5 bg-zinc-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-zinc-900"
                  >
                    {Object.entries(paymentMethodLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1.5">Reference (Optional)</label>
                  <input
                    type="text"
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                    placeholder="Transaction ID, Cheque No., etc."
                    className="w-full px-4 py-2.5 bg-zinc-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-zinc-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1.5">Notes (Optional)</label>
                  <input
                    type="text"
                    value={paymentNotes}
                    onChange={(e) => setPaymentNotes(e.target.value)}
                    placeholder="Any notes..."
                    className="w-full px-4 py-2.5 bg-zinc-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-zinc-900"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 border border-zinc-200 rounded-lg text-sm font-medium hover:bg-zinc-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRecordPayment}
                  disabled={!paymentAmount || parseFloat(paymentAmount) <= 0}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50"
                >
                  Record Payment
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
