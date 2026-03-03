'use client';

import { useState, useEffect } from 'react';
import {
  ArrowLeft, CalendarDays, Clock, MapPin, Users, Phone,
  Edit, CheckCircle, Utensils, Receipt, Calculator,
  ShoppingCart, CreditCard, ClipboardList, Trash2, Plus,
  Printer, CheckSquare, Square,
} from 'lucide-react';
import PageLayout from '@/components/PageLayout';
import { getEventById, updateEventStatus, updateEventChecklist, updateEventAdvance, updateEventPayment } from '@/lib/actions/events';
import { addCostItem, updateCostItem, deleteCostItem } from '@/lib/actions/costing';
import InvoiceDownloadButton from '@/components/InvoiceDownloadButton';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

const COST_SECTIONS = ['Grocery', 'Meat', 'Vegetables', 'Rentals', 'Labour', 'Others'] as const;

const statusStyles: Record<string, string> = {
  UPCOMING: 'bg-blue-50 text-blue-700 border-blue-200',
  IN_PROGRESS: 'bg-purple-50 text-purple-700 border-purple-200',
  COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  CANCELLED: 'bg-red-50 text-red-700 border-red-200',
};

const statusLabels: Record<string, string> = {
  UPCOMING: 'Upcoming',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

const eventTypeStyles: Record<string, string> = {
  MAIN_EVENT: 'bg-purple-100 text-purple-700',
  LOCAL_ORDER: 'bg-blue-100 text-blue-700',
};

const EVENT_STATUSES = ['UPCOMING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] as const;

const blankCostItem = { section: 'Grocery', itemName: '', qty: '', unit: '', rate: '' };

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'dishes' | 'costing' | 'grocery' | 'payments' | 'status'>('overview');

  // Costing state
  const [costItems, setCostItems] = useState<any[]>([]);
  const [isAddingCostItem, setIsAddingCostItem] = useState(false);
  const [newCostItem, setNewCostItem] = useState({ ...blankCostItem });
  const [editingCostId, setEditingCostId] = useState<string | null>(null);
  const [editCostForm, setEditCostForm] = useState<any>({ ...blankCostItem });
  const [savingCost, setSavingCost] = useState(false);

  // Payments state
  const [editingAdvance, setEditingAdvance] = useState(false);
  const [advanceInput, setAdvanceInput] = useState('');
  const [paymentInput, setPaymentInput] = useState('');
  const [showPartialPayment, setShowPartialPayment] = useState(false);
  const [savingPayment, setSavingPayment] = useState(false);

  // Status / checklist state
  const [savingStatus, setSavingStatus] = useState(false);
  const [savingChecklist, setSavingChecklist] = useState<string | null>(null);

  async function reload() {
    const result = await getEventById(id);
    if (result.success && result.data) {
      setEvent(result.data);
      setCostItems(result.data.costItems || []);
    }
  }

  useEffect(() => {
    async function load() {
      const result = await getEventById(id);
      if (result.success && result.data) {
        setEvent(result.data);
        setCostItems(result.data.costItems || []);
      }
      setLoading(false);
    }
    load();
  }, [id]);

  // --- Costing handlers ---
  async function handleAddCostItem() {
    const qty = parseFloat(newCostItem.qty as string);
    const rate = parseFloat(newCostItem.rate as string);
    if (!newCostItem.itemName.trim() || isNaN(qty) || isNaN(rate)) return;
    setSavingCost(true);
    const result = await addCostItem({
      eventId: id,
      section: newCostItem.section,
      itemName: newCostItem.itemName.trim(),
      qty,
      unit: newCostItem.unit.trim(),
      rate,
    });
    if (result.success && result.data) {
      setCostItems(prev => [...prev, result.data]);
      setNewCostItem({ ...blankCostItem });
      setIsAddingCostItem(false);
    }
    setSavingCost(false);
  }

  async function handleUpdateCostItem(itemId: string) {
    const qty = parseFloat(editCostForm.qty as string);
    const rate = parseFloat(editCostForm.rate as string);
    if (!editCostForm.itemName.trim() || isNaN(qty) || isNaN(rate)) return;
    setSavingCost(true);
    const result = await updateCostItem(itemId, {
      section: editCostForm.section,
      itemName: editCostForm.itemName.trim(),
      qty,
      unit: editCostForm.unit.trim(),
      rate,
    });
    if (result.success && result.data) {
      setCostItems(prev => prev.map(c => c.id === itemId ? result.data : c));
      setEditingCostId(null);
    }
    setSavingCost(false);
  }

  async function handleDeleteCostItem(itemId: string) {
    const result = await deleteCostItem(itemId);
    if (result.success) {
      setCostItems(prev => prev.filter(c => c.id !== itemId));
    }
  }

  // --- Payments handlers ---
  async function handleSaveAdvance() {
    const amt = parseFloat(advanceInput);
    if (isNaN(amt) || amt < 0) return;
    setSavingPayment(true);
    const result = await updateEventAdvance(id, amt);
    if (result.success && result.data) {
      setEvent(result.data);
    }
    setEditingAdvance(false);
    setAdvanceInput('');
    setSavingPayment(false);
  }

  async function handleRecordPayment() {
    const amt = parseFloat(paymentInput);
    if (isNaN(amt) || amt <= 0) return;
    setSavingPayment(true);
    const result = await updateEventPayment(id, amt);
    if (result.success && result.data) {
      setEvent(result.data);
    }
    setShowPartialPayment(false);
    setPaymentInput('');
    setSavingPayment(false);
  }

  async function handleMarkPaid() {
    if (!event) return;
    setSavingPayment(true);
    const remaining = event.totalAmount - event.paidAmount;
    if (remaining > 0) {
      const result = await updateEventPayment(id, remaining);
      if (result.success && result.data) {
        setEvent(result.data);
      }
    }
    setSavingPayment(false);
  }

  // --- Status handlers ---
  async function handleStatusChange(status: string) {
    setSavingStatus(true);
    const result = await updateEventStatus(id, status as any);
    if (result.success && result.data) {
      setEvent((prev: any) => ({ ...prev, status }));
    }
    setSavingStatus(false);
  }

  async function handleChecklistToggle(field: string, current: boolean) {
    setSavingChecklist(field);
    const result = await updateEventChecklist(id, { [field]: !current });
    if (result.success && result.data) {
      setEvent((prev: any) => ({ ...prev, [field]: !current }));
    }
    setSavingChecklist(null);
  }

  if (loading) {
    return (
      <PageLayout currentPath="/events">
        <div className="flex min-h-[50vh] items-center justify-center">
          <p className="text-zinc-500">Loading event...</p>
        </div>
      </PageLayout>
    );
  }

  if (!event) {
    return (
      <PageLayout currentPath="/events">
        <div className="flex min-h-[50vh] items-center justify-center p-4">
          <div className="text-center">
            <h1 className="text-xl font-semibold text-zinc-900">Event Not Found</h1>
            <Link href="/events" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-zinc-900 hover:underline">
              <ArrowLeft className="h-4 w-4" /> Back to Events
            </Link>
          </div>
        </div>
      </PageLayout>
    );
  }

  const balance = Number(event.totalAmount) - Number(event.paidAmount);
  const totalInternalCost = costItems.reduce((sum: number, c: any) => sum + (Number(c.qty) * Number(c.rate)), 0);
  const groceryItems = costItems.filter((c: any) => ['Grocery', 'Meat', 'Vegetables'].includes(c.section));

  // Group costing items by section
  const costBySection: Record<string, any[]> = {};
  for (const item of costItems) {
    if (!costBySection[item.section]) costBySection[item.section] = [];
    costBySection[item.section].push(item);
  }

  const tabs = [
    { key: 'overview', label: 'Overview', Icon: CalendarDays },
    { key: 'dishes', label: 'Menu', Icon: Utensils },
    { key: 'costing', label: 'Costing', Icon: Calculator },
    { key: 'grocery', label: 'Grocery', Icon: ShoppingCart },
    { key: 'payments', label: 'Payments', Icon: CreditCard },
    { key: 'status', label: 'Status', Icon: ClipboardList },
  ] as const;

  return (
    <PageLayout currentPath="/events">
      <div className="p-4 lg:p-8">

        {/* Back */}
        <Link href="/events" className="mb-4 inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900">
          <ArrowLeft className="h-4 w-4" /> Back to Events
        </Link>

        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-2 py-0.5 text-xs font-medium rounded ${eventTypeStyles[event.eventType] || 'bg-zinc-100 text-zinc-700'}`}>
                {event.eventType === 'LOCAL_ORDER' ? 'Local Order' : 'Main Event'}
              </span>
              <span className={`border px-2 py-0.5 text-xs font-medium rounded ${statusStyles[event.status] || ''}`}>
                {statusLabels[event.status] || event.status}
              </span>
            </div>
            <h1 className="mt-2 text-xl font-semibold text-zinc-900 lg:text-2xl">{event.name}</h1>
            <p className="mt-1 text-sm text-zinc-500">
              Created on {new Date(event.createdAt).toLocaleDateString()}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => router.push(`/events/${event.id}/edit`)}
              className="flex items-center gap-2 border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100 rounded-lg"
            >
              <Edit className="h-4 w-4" /> Edit
            </button>
            <InvoiceDownloadButton
              eventId={event.id}
              eventName={event.name}
              className="flex items-center gap-2 border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 rounded-lg"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-zinc-200">
          <nav className="-mb-px flex space-x-6 overflow-x-auto">
            {tabs.map(({ key, label, Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-1.5 whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === key
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-zinc-500 hover:text-zinc-700 hover:border-zinc-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </nav>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">

          {/* Left Column */}
          <div className="space-y-6 lg:col-span-2">

            {/* OVERVIEW */}
            {activeTab === 'overview' && (
              <>
                <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-zinc-200 bg-zinc-50/50">
                    <h2 className="font-semibold text-zinc-900">Event Details</h2>
                  </div>
                  <div className="p-6 grid gap-6 sm:grid-cols-2">
                    <div className="flex items-start gap-3">
                      <CalendarDays className="mt-1 h-5 w-5 text-indigo-500" />
                      <div>
                        <p className="text-sm font-medium text-zinc-500">Date</p>
                        <p className="text-base text-zinc-900">
                          {new Date(event.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Clock className="mt-1 h-5 w-5 text-indigo-500" />
                      <div>
                        <p className="text-sm font-medium text-zinc-500">Time</p>
                        <p className="text-base text-zinc-900">{event.eventTime}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Users className="mt-1 h-5 w-5 text-indigo-500" />
                      <div>
                        <p className="text-sm font-medium text-zinc-500">Guests</p>
                        <p className="text-base text-zinc-900">{event.guestCount} people</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="mt-1 h-5 w-5 text-indigo-500" />
                      <div>
                        <p className="text-sm font-medium text-zinc-500">Venue</p>
                        <p className="text-base text-zinc-900">{event.location}</p>
                      </div>
                    </div>
                    {event.notes && (
                      <div className="sm:col-span-2">
                        <p className="text-sm font-medium text-zinc-500 mb-1">Notes</p>
                        <p className="text-sm text-zinc-700 bg-zinc-50 rounded-lg p-3">{event.notes}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-zinc-200 bg-zinc-50/50">
                    <h2 className="font-semibold text-zinc-900">Client Information</h2>
                  </div>
                  <div className="p-6">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                        {event.clientName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-base font-semibold text-zinc-900">{event.clientName}</p>
                        <div className="flex items-center gap-2 mt-1 text-sm text-zinc-600">
                          <Phone className="h-3.5 w-3.5" />
                          <a href={`tel:${event.clientContact}`} className="hover:underline">{event.clientContact}</a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {event.enquiry && (
                  <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-sm text-indigo-700">
                    Converted from enquiry{' '}
                    <Link href={`/enquiries/${event.enquiryId}`} className="font-medium underline">
                      {event.enquiry.quotationNumber}
                    </Link>
                  </div>
                )}
              </>
            )}

            {/* MENU */}
            {activeTab === 'dishes' && (
              <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-zinc-200 bg-zinc-50/50 flex justify-between items-center">
                  <h2 className="font-semibold text-zinc-900 flex items-center gap-2">
                    <Utensils className="h-4 w-4 text-zinc-500" /> Dishes
                  </h2>
                  <span className="text-xs font-medium bg-zinc-100 text-zinc-600 px-2 py-1 rounded-full">
                    {event.dishes?.length || 0} items
                  </span>
                </div>
                {event.dishes && event.dishes.length > 0 ? (
                  <table className="w-full text-sm text-left">
                    <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500">
                      <tr>
                        <th className="px-6 py-3">Dish</th>
                        <th className="px-6 py-3 text-right">Qty</th>
                        <th className="px-6 py-3 text-right">Price/Plate</th>
                        <th className="px-6 py-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {event.dishes.map((d: any) => (
                        <tr key={d.id} className="hover:bg-zinc-50">
                          <td className="px-6 py-3 font-medium text-zinc-900">{d.dish?.name || '—'}</td>
                          <td className="px-6 py-3 text-right text-zinc-600">{d.quantity}</td>
                          <td className="px-6 py-3 text-right text-zinc-600">₹{Number(d.pricePerPlate).toLocaleString()}</td>
                          <td className="px-6 py-3 text-right font-medium text-zinc-900">₹{(d.quantity * Number(d.pricePerPlate)).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-8 text-center text-zinc-400 text-sm">No dishes added to this event.</div>
                )}

                {event.services && event.services.length > 0 && (
                  <>
                    <div className="px-6 py-3 border-t border-b border-zinc-200 bg-zinc-50/50">
                      <h3 className="font-semibold text-zinc-900 text-sm">Services</h3>
                    </div>
                    <table className="w-full text-sm text-left">
                      <tbody className="divide-y divide-zinc-100">
                        {event.services.map((s: any) => (
                          <tr key={s.id} className="hover:bg-zinc-50">
                            <td className="px-6 py-3 font-medium text-zinc-900">{s.serviceName}</td>
                            <td className="px-6 py-3 text-zinc-500">{s.description || '—'}</td>
                            <td className="px-6 py-3 text-right font-medium text-zinc-900">₹{Number(s.price).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                )}
              </div>
            )}

            {/* COSTING */}
            {activeTab === 'costing' && (
              <div className="space-y-4">
                {/* Section groups */}
                {COST_SECTIONS.map(section => {
                  const items = costBySection[section] || [];
                  const sectionTotal = items.reduce((s: number, c: any) => s + Number(c.qty) * Number(c.rate), 0);
                  return (
                    <div key={section} className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
                      <div className="px-6 py-3 border-b border-zinc-200 bg-zinc-50/50 flex justify-between items-center">
                        <h3 className="font-semibold text-zinc-800 text-sm">{section}</h3>
                        {sectionTotal > 0 && (
                          <span className="text-xs text-zinc-500">₹{sectionTotal.toLocaleString()}</span>
                        )}
                      </div>
                      {items.length > 0 && (
                        <table className="w-full text-sm text-left">
                          <thead className="bg-zinc-50/50 text-zinc-400 text-xs border-b border-zinc-100">
                            <tr>
                              <th className="px-4 py-2">Item</th>
                              <th className="px-3 py-2 text-right">Qty</th>
                              <th className="px-3 py-2">Unit</th>
                              <th className="px-3 py-2 text-right">Rate (₹)</th>
                              <th className="px-3 py-2 text-right">Total</th>
                              <th className="px-3 py-2" />
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-50">
                            {items.map((item: any) => (
                              <tr key={item.id} className="hover:bg-zinc-50">
                                {editingCostId === item.id ? (
                                  <>
                                    <td className="px-4 py-2">
                                      <input
                                        value={editCostForm.itemName}
                                        onChange={e => setEditCostForm((p: any) => ({ ...p, itemName: e.target.value }))}
                                        className="w-full border border-zinc-200 rounded px-2 py-1 text-sm focus:outline-none focus:border-indigo-400"
                                      />
                                    </td>
                                    <td className="px-3 py-2">
                                      <input
                                        type="number"
                                        value={editCostForm.qty}
                                        onChange={e => setEditCostForm((p: any) => ({ ...p, qty: e.target.value }))}
                                        className="w-16 border border-zinc-200 rounded px-2 py-1 text-sm text-right focus:outline-none focus:border-indigo-400"
                                      />
                                    </td>
                                    <td className="px-3 py-2">
                                      <input
                                        value={editCostForm.unit}
                                        onChange={e => setEditCostForm((p: any) => ({ ...p, unit: e.target.value }))}
                                        className="w-14 border border-zinc-200 rounded px-2 py-1 text-sm focus:outline-none focus:border-indigo-400"
                                      />
                                    </td>
                                    <td className="px-3 py-2">
                                      <input
                                        type="number"
                                        value={editCostForm.rate}
                                        onChange={e => setEditCostForm((p: any) => ({ ...p, rate: e.target.value }))}
                                        className="w-20 border border-zinc-200 rounded px-2 py-1 text-sm text-right focus:outline-none focus:border-indigo-400"
                                      />
                                    </td>
                                    <td className="px-3 py-2 text-right text-zinc-400 text-xs">
                                      ₹{(parseFloat(editCostForm.qty || '0') * parseFloat(editCostForm.rate || '0')).toLocaleString()}
                                    </td>
                                    <td className="px-3 py-2">
                                      <div className="flex gap-1">
                                        <button
                                          onClick={() => handleUpdateCostItem(item.id)}
                                          disabled={savingCost}
                                          className="text-xs bg-indigo-600 text-white px-2 py-1 rounded hover:bg-indigo-700 disabled:opacity-50"
                                        >
                                          Save
                                        </button>
                                        <button
                                          onClick={() => setEditingCostId(null)}
                                          className="text-xs text-zinc-500 px-2 py-1 rounded hover:text-zinc-700"
                                        >
                                          Cancel
                                        </button>
                                      </div>
                                    </td>
                                  </>
                                ) : (
                                  <>
                                    <td className="px-4 py-2 font-medium text-zinc-900">{item.itemName}</td>
                                    <td className="px-3 py-2 text-right text-zinc-600">{Number(item.qty)}</td>
                                    <td className="px-3 py-2 text-zinc-500">{item.unit}</td>
                                    <td className="px-3 py-2 text-right text-zinc-600">₹{Number(item.rate).toLocaleString()}</td>
                                    <td className="px-3 py-2 text-right font-medium text-zinc-900">
                                      ₹{(Number(item.qty) * Number(item.rate)).toLocaleString()}
                                    </td>
                                    <td className="px-3 py-2">
                                      <div className="flex gap-1">
                                        <button
                                          onClick={() => {
                                            setEditingCostId(item.id);
                                            setEditCostForm({ section: item.section, itemName: item.itemName, qty: String(item.qty), unit: item.unit, rate: String(item.rate) });
                                          }}
                                          className="text-xs text-indigo-600 hover:text-indigo-800 px-2 py-1 rounded hover:bg-indigo-50"
                                        >
                                          Edit
                                        </button>
                                        <button
                                          onClick={() => handleDeleteCostItem(item.id)}
                                          className="text-xs text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
                                        >
                                          <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                      </div>
                                    </td>
                                  </>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                      {items.length === 0 && (
                        <div className="px-4 py-3 text-xs text-zinc-400 italic">No items in this section</div>
                      )}
                    </div>
                  );
                })}

                {/* Add Row */}
                {isAddingCostItem ? (
                  <div className="bg-white rounded-xl border border-indigo-200 p-4">
                    <p className="text-sm font-medium text-zinc-700 mb-3">Add Cost Item</p>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                      <div>
                        <label className="block text-xs text-zinc-500 mb-1">Section</label>
                        <select
                          value={newCostItem.section}
                          onChange={e => setNewCostItem(p => ({ ...p, section: e.target.value }))}
                          className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
                        >
                          {COST_SECTIONS.map(s => <option key={s}>{s}</option>)}
                        </select>
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs text-zinc-500 mb-1">Item Name</label>
                        <input
                          placeholder="e.g. Chicken"
                          value={newCostItem.itemName}
                          onChange={e => setNewCostItem(p => ({ ...p, itemName: e.target.value }))}
                          className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-zinc-500 mb-1">Qty</label>
                        <input
                          type="number"
                          placeholder="0"
                          value={newCostItem.qty}
                          onChange={e => setNewCostItem(p => ({ ...p, qty: e.target.value }))}
                          className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-zinc-500 mb-1">Unit</label>
                        <input
                          placeholder="kg"
                          value={newCostItem.unit}
                          onChange={e => setNewCostItem(p => ({ ...p, unit: e.target.value }))}
                          className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-zinc-500 mb-1">Rate (₹)</label>
                        <input
                          type="number"
                          placeholder="0"
                          value={newCostItem.rate}
                          onChange={e => setNewCostItem(p => ({ ...p, rate: e.target.value }))}
                          className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
                        />
                      </div>
                    </div>
                    {newCostItem.qty && newCostItem.rate && (
                      <p className="mt-2 text-xs text-zinc-500">
                        Total: ₹{(parseFloat(newCostItem.qty as string || '0') * parseFloat(newCostItem.rate as string || '0')).toLocaleString()}
                      </p>
                    )}
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={handleAddCostItem}
                        disabled={savingCost}
                        className="bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                      >
                        {savingCost ? 'Adding...' : 'Add Item'}
                      </button>
                      <button
                        onClick={() => { setIsAddingCostItem(false); setNewCostItem({ ...blankCostItem }); }}
                        className="text-sm text-zinc-600 px-4 py-2 rounded-lg hover:bg-zinc-50 border border-zinc-200"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsAddingCostItem(true)}
                    className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-zinc-200 text-zinc-500 hover:border-indigo-300 hover:text-indigo-600 py-3 rounded-xl text-sm transition-colors"
                  >
                    <Plus className="h-4 w-4" /> Add Cost Item
                  </button>
                )}

                {/* Total footer */}
                <div className="bg-zinc-900 text-white rounded-xl px-6 py-4 flex justify-between items-center">
                  <span className="font-medium">Total Internal Cost</span>
                  <span className="text-xl font-bold">₹{totalInternalCost.toLocaleString()}</span>
                </div>
              </div>
            )}

            {/* GROCERY */}
            {activeTab === 'grocery' && (
              <div className="space-y-4">
                <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden" id="grocery-print-area">
                  <div className="px-6 py-4 border-b border-zinc-200 bg-zinc-50/50 flex justify-between items-center">
                    <div>
                      <h2 className="font-semibold text-zinc-900">Grocery Sheet</h2>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        {event.name} — {new Date(event.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                    <button
                      onClick={() => window.print()}
                      className="flex items-center gap-2 border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 rounded-lg print:hidden"
                    >
                      <Printer className="h-4 w-4" /> Print
                    </button>
                  </div>

                  {groceryItems.length > 0 ? (
                    <>
                      {/* Group by section */}
                      {(['Grocery', 'Meat', 'Vegetables'] as const).map(sec => {
                        const secItems = groceryItems.filter((c: any) => c.section === sec);
                        if (!secItems.length) return null;
                        return (
                          <div key={sec}>
                            <div className="px-6 py-2 bg-zinc-50 border-b border-zinc-100">
                              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">{sec}</p>
                            </div>
                            <table className="w-full text-sm text-left">
                              <thead className="text-xs text-zinc-400 border-b border-zinc-100">
                                <tr>
                                  <th className="px-6 py-2">Item</th>
                                  <th className="px-6 py-2 text-right">Qty</th>
                                  <th className="px-6 py-2">Unit</th>
                                  <th className="px-6 py-2 text-right print:hidden">Est. Rate</th>
                                  <th className="px-6 py-2 text-right print:hidden">Est. Total</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-zinc-50">
                                {secItems.map((item: any) => (
                                  <tr key={item.id}>
                                    <td className="px-6 py-3 font-medium text-zinc-900">{item.itemName}</td>
                                    <td className="px-6 py-3 text-right text-zinc-700">{Number(item.qty)}</td>
                                    <td className="px-6 py-3 text-zinc-500">{item.unit}</td>
                                    <td className="px-6 py-3 text-right text-zinc-400 print:hidden">₹{Number(item.rate).toLocaleString()}</td>
                                    <td className="px-6 py-3 text-right text-zinc-500 print:hidden">
                                      ₹{(Number(item.qty) * Number(item.rate)).toLocaleString()}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        );
                      })}
                      <div className="px-6 py-3 border-t border-zinc-200 bg-zinc-50 flex justify-end">
                        <span className="text-sm font-semibold text-zinc-700">
                          Grocery Total: ₹{groceryItems.reduce((s: number, c: any) => s + Number(c.qty) * Number(c.rate), 0).toLocaleString()}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="p-10 text-center text-zinc-400">
                      <ShoppingCart className="h-8 w-8 mx-auto mb-2 opacity-20" />
                      <p className="text-sm">No grocery items yet.</p>
                      <p className="text-xs mt-1">Add Grocery, Meat, or Vegetable items in the Costing tab.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* PAYMENTS */}
            {activeTab === 'payments' && (
              <div className="space-y-4">
                {/* Summary cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white p-5 rounded-xl border border-zinc-200">
                    <p className="text-xs font-medium text-zinc-500 mb-1">Total Agreed Price</p>
                    <p className="text-2xl font-bold text-zinc-900">₹{Number(event.totalAmount).toLocaleString()}</p>
                  </div>
                  <div className="bg-white p-5 rounded-xl border border-zinc-200">
                    <p className="text-xs font-medium text-zinc-500 mb-1">Paid So Far</p>
                    <p className="text-2xl font-bold text-emerald-600">₹{Number(event.paidAmount).toLocaleString()}</p>
                  </div>
                  <div className={`p-5 rounded-xl border ${balance > 0 ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200'}`}>
                    <p className="text-xs font-medium text-zinc-500 mb-1">Balance Due</p>
                    <p className={`text-2xl font-bold ${balance > 0 ? 'text-amber-700' : 'text-emerald-600'}`}>
                      ₹{balance.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Advance */}
                <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-zinc-200 bg-zinc-50/50 flex justify-between items-center">
                    <h3 className="font-semibold text-zinc-900">Advance Received</h3>
                    {!editingAdvance && (
                      <button
                        onClick={() => { setEditingAdvance(true); setAdvanceInput(String(Number(event.advanceAmount) || '')); }}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                  <div className="p-6">
                    {editingAdvance ? (
                      <div className="flex items-center gap-3">
                        <span className="text-zinc-500">₹</span>
                        <input
                          type="number"
                          value={advanceInput}
                          onChange={e => setAdvanceInput(e.target.value)}
                          className="border border-zinc-200 rounded-lg px-3 py-2 text-sm w-40 focus:outline-none focus:border-indigo-400"
                          placeholder="0"
                        />
                        <button
                          onClick={handleSaveAdvance}
                          disabled={savingPayment}
                          className="bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                        >
                          {savingPayment ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          onClick={() => setEditingAdvance(false)}
                          className="text-sm text-zinc-500 hover:text-zinc-700"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <p className="text-3xl font-bold text-zinc-900">
                        ₹{Number(event.advanceAmount || 0).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="bg-white rounded-xl border border-zinc-200 p-6 space-y-3">
                  <h3 className="font-semibold text-zinc-900 mb-4">Record Payment</h3>

                  {balance > 0 && (
                    <>
                      {showPartialPayment ? (
                        <div className="flex items-center gap-3">
                          <span className="text-zinc-500 text-sm">₹</span>
                          <input
                            type="number"
                            value={paymentInput}
                            onChange={e => setPaymentInput(e.target.value)}
                            placeholder="Amount received"
                            className="border border-zinc-200 rounded-lg px-3 py-2 text-sm w-44 focus:outline-none focus:border-indigo-400"
                          />
                          <button
                            onClick={handleRecordPayment}
                            disabled={savingPayment}
                            className="bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                          >
                            {savingPayment ? 'Saving...' : 'Save Payment'}
                          </button>
                          <button
                            onClick={() => { setShowPartialPayment(false); setPaymentInput(''); }}
                            className="text-sm text-zinc-500 hover:text-zinc-700"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowPartialPayment(true)}
                          className="w-full border border-zinc-200 text-zinc-700 text-sm font-medium py-2.5 rounded-lg hover:bg-zinc-50"
                        >
                          Record Partial Payment
                        </button>
                      )}

                      <button
                        onClick={handleMarkPaid}
                        disabled={savingPayment}
                        className="w-full bg-emerald-600 text-white text-sm font-medium py-2.5 rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="h-4 w-4" /> Mark Balance as Paid (₹{balance.toLocaleString()})
                      </button>
                    </>
                  )}

                  {balance <= 0 && (
                    <div className="bg-emerald-50 text-emerald-700 py-3 rounded-lg text-center text-sm font-medium border border-emerald-100 flex items-center justify-center gap-2">
                      <CheckCircle className="h-4 w-4" /> Paid in Full
                    </div>
                  )}
                </div>

                {/* Expense list */}
                {event.expenses && event.expenses.length > 0 && (
                  <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-zinc-200 bg-zinc-50/50">
                      <h3 className="font-semibold text-zinc-900">Other Expenses</h3>
                    </div>
                    <table className="w-full text-sm text-left">
                      <thead className="bg-zinc-50 text-zinc-500 border-b border-zinc-200">
                        <tr>
                          <th className="px-6 py-3">Description</th>
                          <th className="px-6 py-3">Category</th>
                          <th className="px-6 py-3 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100">
                        {event.expenses.map((exp: any) => (
                          <tr key={exp.id} className="hover:bg-zinc-50">
                            <td className="px-6 py-3 font-medium text-zinc-900">{exp.description}</td>
                            <td className="px-6 py-3">
                              <span className="px-2 py-0.5 rounded text-xs bg-zinc-100 text-zinc-600 capitalize">
                                {exp.category.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="px-6 py-3 text-right font-medium text-red-600">-₹{Number(exp.amount).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* STATUS */}
            {activeTab === 'status' && (
              <div className="space-y-6">
                {/* Pre-event checklist */}
                <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-zinc-200 bg-zinc-50/50">
                    <h3 className="font-semibold text-zinc-900">Pre-Event Checklist</h3>
                    <p className="text-xs text-zinc-500 mt-0.5">Mark items as done once arranged</p>
                  </div>
                  <div className="p-6 space-y-3">
                    {([
                      { field: 'checklistGrocery', label: 'Grocery Purchased', icon: ShoppingCart },
                      { field: 'checklistRentals', label: 'Rentals Arranged', icon: ClipboardList },
                      { field: 'checklistStaff', label: 'Staff Assigned', icon: Users },
                      { field: 'checklistTransport', label: 'Transport Scheduled', icon: MapPin },
                    ] as const).map(({ field, label, icon: Icon }) => {
                      const checked = !!event[field];
                      const saving = savingChecklist === field;
                      return (
                        <button
                          key={field}
                          onClick={() => handleChecklistToggle(field, checked)}
                          disabled={saving}
                          className={`w-full flex items-center gap-3 p-4 rounded-xl border text-left transition-colors disabled:opacity-60 ${
                            checked
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                              : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50'
                          }`}
                        >
                          {checked ? (
                            <CheckSquare className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                          ) : (
                            <Square className="h-5 w-5 text-zinc-400 flex-shrink-0" />
                          )}
                          <Icon className={`h-4 w-4 flex-shrink-0 ${checked ? 'text-emerald-600' : 'text-zinc-400'}`} />
                          <span className={`font-medium text-sm ${checked ? 'line-through text-emerald-600' : ''}`}>{label}</span>
                          {saving && <span className="ml-auto text-xs text-zinc-400">Saving...</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Event status */}
                <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-zinc-200 bg-zinc-50/50">
                    <h3 className="font-semibold text-zinc-900">Event Status</h3>
                    <p className="text-xs text-zinc-500 mt-0.5">Current: <strong>{statusLabels[event.status] || event.status}</strong></p>
                  </div>
                  <div className="p-6 grid grid-cols-2 gap-3">
                    {EVENT_STATUSES.map(s => (
                      <button
                        key={s}
                        onClick={() => handleStatusChange(s)}
                        disabled={savingStatus || event.status === s}
                        className={`py-2.5 rounded-lg text-sm font-medium border transition-colors disabled:cursor-not-allowed ${
                          event.status === s
                            ? statusStyles[s] + ' cursor-default'
                            : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50 disabled:opacity-50'
                        }`}
                      >
                        {savingStatus && event.status !== s ? '...' : statusLabels[s]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Right Column — always visible summary */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-zinc-200 bg-zinc-50/50">
                <h3 className="font-semibold text-zinc-900">Payment Status</h3>
              </div>
              <div className="p-6 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-zinc-500">Total</span>
                  <span className="text-lg font-bold text-zinc-900">₹{Number(event.totalAmount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-zinc-500">Advance</span>
                  <span className="text-sm font-medium text-zinc-700">₹{Number(event.advanceAmount || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-zinc-500">Paid</span>
                  <span className="text-lg font-bold text-emerald-600">₹{Number(event.paidAmount).toLocaleString()}</span>
                </div>
                <div className="h-px bg-zinc-100" />
                <div className="flex justify-between items-center">
                  <span className="font-medium text-zinc-900">Balance</span>
                  <span className={`text-xl font-bold ${balance > 0 ? 'text-amber-600' : 'text-zinc-400'}`}>
                    ₹{balance.toLocaleString()}
                  </span>
                </div>
                {balance <= 0 && (
                  <div className="mt-2 bg-emerald-50 text-emerald-700 py-2 rounded-lg text-center text-sm font-medium border border-emerald-100 flex items-center justify-center gap-2">
                    <CheckCircle className="h-4 w-4" /> Paid in Full
                  </div>
                )}
              </div>
            </div>

            {/* Internal cost card — shows if costing items exist */}
            {costItems.length > 0 && (
              <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-zinc-200 bg-zinc-50/50">
                  <h3 className="font-semibold text-zinc-900">Cost Summary</h3>
                </div>
                <div className="p-6 flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-zinc-500">Internal Cost</span>
                    <span className="text-lg font-bold text-zinc-900">₹{totalInternalCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-zinc-500">Revenue</span>
                    <span className="text-sm font-medium text-zinc-700">₹{Number(event.totalAmount).toLocaleString()}</span>
                  </div>
                  {totalInternalCost > 0 && Number(event.totalAmount) > 0 && (
                    <>
                      <div className="h-px bg-zinc-100" />
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-zinc-900">Margin</span>
                        <span className={`text-lg font-bold ${
                          ((Number(event.totalAmount) - totalInternalCost) / Number(event.totalAmount)) * 100 >= 20
                            ? 'text-emerald-600'
                            : 'text-amber-600'
                        }`}>
                          {(((Number(event.totalAmount) - totalInternalCost) / Number(event.totalAmount)) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Checklist summary */}
            <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-zinc-200 bg-zinc-50/50">
                <h3 className="font-semibold text-zinc-900">Checklist</h3>
              </div>
              <div className="p-4 space-y-2">
                {([
                  { field: 'checklistGrocery', label: 'Grocery' },
                  { field: 'checklistRentals', label: 'Rentals' },
                  { field: 'checklistStaff', label: 'Staff' },
                  { field: 'checklistTransport', label: 'Transport' },
                ] as const).map(({ field, label }) => (
                  <div key={field} className="flex items-center gap-2 text-sm">
                    {event[field] ? (
                      <CheckSquare className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <Square className="h-4 w-4 text-zinc-300" />
                    )}
                    <span className={event[field] ? 'text-zinc-500 line-through' : 'text-zinc-700'}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </PageLayout>
  );
}
