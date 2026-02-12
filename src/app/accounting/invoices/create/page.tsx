'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PageLayout from '@/components/PageLayout';
import {
  FileText,
  Save,
  ArrowLeft,
  Plus,
  Trash2,
  Calendar,
} from 'lucide-react';
import Link from 'next/link';
import { addInvoice, generateNextInvoiceNumber } from '@/lib/accountingStorage';
import { formatCurrency, TAX_RATES } from '@/lib/data';
import { events, getDishById } from '@/lib/data';
import { TaxType, InvoiceLineItem, InvoiceStatus } from '@/lib/types';

function CreateInvoiceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams.get('event');

  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [selectedEventId, setSelectedEventId] = useState(eventId || '');
  const [dueDate, setDueDate] = useState('');
  const [lineItems, setLineItems] = useState<Omit<InvoiceLineItem, 'id'>[]>([]);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [notes, setNotes] = useState('');
  const [terms, setTerms] = useState('Payment due within 15 days of invoice date.');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setInvoiceNumber(generateNextInvoiceNumber());
    // Set default due date to 15 days from now
    const due = new Date();
    due.setDate(due.getDate() + 15);
    setDueDate(due.toISOString().split('T')[0]);
  }, []);

  // Auto-populate from event
  useEffect(() => {
    if (selectedEventId) {
      const event = events.find(e => e.id === selectedEventId);
      if (event && event.eventMenu && event.eventMenu.length > 0) {
        const items: Omit<InvoiceLineItem, 'id'>[] = [];

        // Calculate food items total
        let foodTotal = 0;
        event.eventMenu.forEach(menuItem => {
          const dish = getDishById(menuItem.dishId);
          if (dish) {
            const price = menuItem.customPrice || dish.sellingPricePerPlate;
            foodTotal += price * menuItem.quantity;
          }
        });

        if (foodTotal > 0) {
          const taxAmount = (foodTotal * TAX_RATES.food) / 100;
          items.push({
            description: `Catering Service - ${event.guests} Guests (Food)`,
            quantity: 1,
            unitPrice: foodTotal,
            totalPrice: foodTotal,
            taxType: 'food',
            taxRate: TAX_RATES.food,
            taxAmount: taxAmount,
          });
        }

        setLineItems(items);
      }
    }
  }, [selectedEventId]);

  const selectedEvent = useMemo(() => {
    return events.find(e => e.id === selectedEventId);
  }, [selectedEventId]);

  const calculations = useMemo(() => {
    const subtotal = lineItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const totalTax = lineItems.reduce((sum, item) => sum + item.taxAmount, 0);
    const total = subtotal + totalTax - discountAmount;
    return { subtotal, totalTax, total };
  }, [lineItems, discountAmount]);

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      {
        description: '',
        quantity: 1,
        unitPrice: 0,
        totalPrice: 0,
        taxType: 'food' as TaxType,
        taxRate: TAX_RATES.food,
        taxAmount: 0,
      },
    ]);
  };

  const updateLineItem = (index: number, field: string, value: string | number) => {
    const updated = [...lineItems];
    const item = { ...updated[index] };

    if (field === 'taxType') {
      item.taxType = value as TaxType;
      item.taxRate = TAX_RATES[value as keyof typeof TAX_RATES];
    } else {
      (item as Record<string, unknown>)[field] = value;
    }

    // Recalculate totals
    item.totalPrice = item.quantity * item.unitPrice;
    item.taxAmount = (item.totalPrice * item.taxRate) / 100;

    updated[index] = item;
    setLineItems(updated);
  };

  const removeLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent || lineItems.length === 0) {
      alert('Please select an event and add at least one line item');
      return;
    }

    setIsSaving(true);

    try {
      const invoiceData = {
        invoiceNumber,
        eventId: selectedEventId,
        clientName: selectedEvent.client,
        clientPhone: selectedEvent.clientPhone,
        clientEmail: selectedEvent.clientEmail,
        clientAddress: selectedEvent.address,
        issueDate: new Date().toISOString().split('T')[0],
        dueDate,
        status: 'sent' as InvoiceStatus,
        lineItems: lineItems.map((item, index) => ({
          ...item,
          id: `li-${Date.now()}-${index}`,
        })),
        subtotal: calculations.subtotal,
        totalTaxAmount: calculations.totalTax,
        discountAmount,
        totalAmount: calculations.total,
        paidAmount: selectedEvent.paidAmount,
        balanceAmount: calculations.total - selectedEvent.paidAmount,
        payments: selectedEvent.paidAmount > 0 ? [{
          id: `pay-prev-${Date.now()}`,
          amount: selectedEvent.paidAmount,
          date: selectedEvent.createdAt,
          paymentMethod: 'bank_transfer' as const,
          notes: 'Previous payments',
        }] : [],
        notes: notes || undefined,
        termsAndConditions: terms || undefined,
      };

      addInvoice(invoiceData);
      router.push('/accounting/invoices');
    } catch (error) {
      console.error('Error creating invoice:', error);
      alert('Failed to create invoice');
    } finally {
      setIsSaving(false);
    }
  };

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
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center bg-blue-100 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-zinc-900">Create Invoice</h1>
              <p className="text-sm text-zinc-500">{invoiceNumber}</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Event Selection */}
          <div className="bg-white rounded-xl border border-zinc-200 p-6">
            <h2 className="text-lg font-semibold text-zinc-900 mb-4">Event & Client</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                  Select Event <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-zinc-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-zinc-900"
                  required
                >
                  <option value="">Select an event</option>
                  {events.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.name} - {event.client} ({event.guests} guests)
                    </option>
                  ))}
                </select>
              </div>

              {selectedEvent && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-zinc-500 mb-1">Client Name</label>
                    <p className="font-medium text-zinc-900">{selectedEvent.client}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-500 mb-1">Phone</label>
                    <p className="font-medium text-zinc-900">{selectedEvent.clientPhone}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-zinc-500 mb-1">Address</label>
                    <p className="font-medium text-zinc-900">{selectedEvent.address}</p>
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    Due Date <span className="text-red-500">*</span>
                  </span>
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-zinc-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-zinc-900"
                  required
                />
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="bg-white rounded-xl border border-zinc-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-zinc-900">Line Items</h2>
              <button
                type="button"
                onClick={addLineItem}
                className="inline-flex items-center gap-1 text-sm font-medium text-zinc-600 hover:text-zinc-900"
              >
                <Plus className="h-4 w-4" />
                Add Item
              </button>
            </div>

            <div className="space-y-4">
              {lineItems.map((item, index) => (
                <div key={index} className="p-4 bg-zinc-50 rounded-lg">
                  <div className="grid grid-cols-12 gap-3">
                    <div className="col-span-12 md:col-span-5">
                      <label className="block text-xs font-medium text-zinc-500 mb-1">Description</label>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                        placeholder="Item description"
                        className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm"
                        required
                      />
                    </div>
                    <div className="col-span-4 md:col-span-1">
                      <label className="block text-xs font-medium text-zinc-500 mb-1">Qty</label>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateLineItem(index, 'quantity', parseInt(e.target.value) || 0)}
                        min="1"
                        className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm"
                        required
                      />
                    </div>
                    <div className="col-span-4 md:col-span-2">
                      <label className="block text-xs font-medium text-zinc-500 mb-1">Unit Price</label>
                      <input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => updateLineItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                        min="0"
                        className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm"
                        required
                      />
                    </div>
                    <div className="col-span-4 md:col-span-2">
                      <label className="block text-xs font-medium text-zinc-500 mb-1">Tax Type</label>
                      <select
                        value={item.taxType}
                        onChange={(e) => updateLineItem(index, 'taxType', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm"
                      >
                        <option value="food">Food (5%)</option>
                        <option value="equipment">Equipment (18%)</option>
                        <option value="none">No Tax</option>
                      </select>
                    </div>
                    <div className="col-span-10 md:col-span-1 flex items-end">
                      <p className="text-sm font-semibold text-zinc-900 py-2">
                        {formatCurrency(item.totalPrice + item.taxAmount)}
                      </p>
                    </div>
                    <div className="col-span-2 md:col-span-1 flex items-end justify-end">
                      <button
                        type="button"
                        onClick={() => removeLineItem(index)}
                        className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {lineItems.length === 0 && (
                <div className="text-center py-8 text-zinc-500">
                  <p>No line items added. Click &quot;Add Item&quot; to start.</p>
                </div>
              )}
            </div>

            {/* Totals */}
            <div className="mt-6 pt-4 border-t border-zinc-200">
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Subtotal</span>
                    <span className="font-medium">{formatCurrency(calculations.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Tax</span>
                    <span className="font-medium">{formatCurrency(calculations.totalTax)}</span>
                  </div>
                  <div className="flex justify-between text-sm items-center">
                    <span className="text-zinc-500">Discount</span>
                    <input
                      type="number"
                      value={discountAmount}
                      onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
                      min="0"
                      className="w-24 px-2 py-1 bg-zinc-50 border border-zinc-200 rounded text-sm text-right"
                    />
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-zinc-200">
                    <span>Total</span>
                    <span>{formatCurrency(calculations.total)}</span>
                  </div>
                  {selectedEvent && selectedEvent.paidAmount > 0 && (
                    <>
                      <div className="flex justify-between text-sm text-emerald-600">
                        <span>Already Paid</span>
                        <span>-{formatCurrency(selectedEvent.paidAmount)}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold text-amber-600">
                        <span>Balance Due</span>
                        <span>{formatCurrency(calculations.total - selectedEvent.paidAmount)}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Notes & Terms */}
          <div className="bg-white rounded-xl border border-zinc-200 p-6">
            <h2 className="text-lg font-semibold text-zinc-900 mb-4">Notes & Terms</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any notes for the client..."
                  rows={2}
                  className="w-full px-4 py-2.5 bg-zinc-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-zinc-900 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">Terms & Conditions</label>
                <textarea
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2.5 bg-zinc-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-zinc-900 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <Link
              href="/accounting/invoices"
              className="px-6 py-2.5 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSaving || lineItems.length === 0}
              className="inline-flex items-center gap-2 bg-zinc-900 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-zinc-800 disabled:opacity-50"
            >
              <Save className="h-5 w-5" />
              {isSaving ? 'Creating...' : 'Create Invoice'}
            </button>
          </div>
        </form>
      </div>
    </PageLayout>
  );
}

export default function CreateInvoicePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CreateInvoiceContent />
    </Suspense>
  );
}
