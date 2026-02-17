'use client'

import { useState, useEffect } from 'react'
import {
  Wallet,
  Plus,
  Trash2,
  Edit,
  Download,
  Search,
  Filter,
  Calendar,
  Truck,
  Users as UsersIcon,
  Package as PackageIcon,
  Wrench,
  Box,
  MoreHorizontal,
} from 'lucide-react'
import PageLayout from '@/components/PageLayout'
import { getAllExpenses, createExpense, deleteExpense } from '@/lib/actions/expenses'
import { getEvents } from '@/lib/actions/events'

export default function OtherExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<string>('')
  const [filterCategory, setFilterCategory] = useState<string>('all')

  // Form state
  const [formData, setFormData] = useState({
    eventId: '',
    category: 'DELIVERY' as any,
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
  })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [expensesRes, eventsRes] = await Promise.all([
        getAllExpenses(),
        getEvents(),
      ])

      if (expensesRes.success && expensesRes.data) setExpenses(expensesRes.data)
      if (eventsRes.success && eventsRes.data) setEvents(eventsRes.data)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault()

    const result = await createExpense({
      eventId: formData.eventId,
      category: formData.category,
      description: formData.description,
      amount: parseFloat(formData.amount),
      date: new Date(formData.date),
    })

    if (result.success) {
      setShowAddModal(false)
      setFormData({
        eventId: '',
        category: 'DELIVERY',
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
      })
      loadData()
    } else {
      alert(result.error || 'Failed to add expense')
    }
  }

  const handleDeleteExpense = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) return

    const result = await deleteExpense(id)
    if (result.success) {
      loadData()
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'DELIVERY':
        return <Truck className="w-4 h-4" />
      case 'MANPOWER':
        return <UsersIcon className="w-4 h-4" />
      case 'TRANSPORTATION':
        return <Truck className="w-4 h-4" />
      case 'EQUIPMENT_RENTAL':
        return <Wrench className="w-4 h-4" />
      case 'PACKAGING':
        return <Box className="w-4 h-4" />
      default:
        return <PackageIcon className="w-4 h-4" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'DELIVERY':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'MANPOWER':
        return 'bg-purple-50 text-purple-700 border-purple-200'
      case 'TRANSPORTATION':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200'
      case 'EQUIPMENT_RENTAL':
        return 'bg-orange-50 text-orange-700 border-orange-200'
      case 'PACKAGING':
        return 'bg-green-50 text-green-700 border-green-200'
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200'
    }
  }

  const filteredExpenses =
    filterCategory === 'all'
      ? expenses
      : expenses.filter((e) => e.category === filterCategory)

  const totalExpenses = filteredExpenses.reduce(
    (sum, e) => sum + Number(e.amount),
    0
  )

  // Group expenses by event
  const expensesByEvent = filteredExpenses.reduce((acc: any, expense: any) => {
    const eventId = expense.event?.id || 'unknown'
    if (!acc[eventId]) {
      acc[eventId] = {
        event: expense.event,
        expenses: [],
        total: 0,
      }
    }
    acc[eventId].expenses.push(expense)
    acc[eventId].total += Number(expense.amount)
    return acc
  }, {})

  return (
    <PageLayout currentPath="/other-expenses">
      <div className="min-h-screen bg-slate-50/50 pb-12">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 lg:py-12 space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">
                Finance Management
              </p>
              <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
                Other Expenses
              </h1>
              <div className="mt-3 bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-900">
                  <strong>Note:</strong> Other expenses will be added to local events and main
                  events. Track delivery, manpower, and other operational costs here.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-slate-900/10"
            >
              <Plus className="w-5 h-5" />
              Add Expense
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-3xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100">
              <p className="text-sm font-semibold text-slate-500 mb-2">Total Expenses</p>
              <p className="text-3xl font-black text-red-600">₹{totalExpenses.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-3xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100">
              <p className="text-sm font-semibold text-slate-500 mb-2">Total Items</p>
              <p className="text-3xl font-black text-slate-900">{filteredExpenses.length}</p>
            </div>
            <div className="bg-white rounded-3xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100">
              <p className="text-sm font-semibold text-slate-500 mb-2">Events</p>
              <p className="text-3xl font-black text-slate-900">
                {Object.keys(expensesByEvent).length}
              </p>
            </div>
            <div className="bg-white rounded-3xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100">
              <p className="text-sm font-semibold text-slate-500 mb-2">Avg per Event</p>
              <p className="text-3xl font-black text-slate-900">
                ₹
                {Object.keys(expensesByEvent).length > 0
                  ? Math.round(totalExpenses / Object.keys(expensesByEvent).length).toLocaleString()
                  : 0}
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-slate-400" />
                <span className="text-sm font-semibold text-slate-700">Filter by Category:</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {[
                  { value: 'all', label: 'All' },
                  { value: 'DELIVERY', label: 'Delivery' },
                  { value: 'MANPOWER', label: 'Manpower' },
                  { value: 'TRANSPORTATION', label: 'Transportation' },
                  { value: 'EQUIPMENT_RENTAL', label: 'Equipment' },
                  { value: 'PACKAGING', label: 'Packaging' },
                  { value: 'MISCELLANEOUS', label: 'Others' },
                ].map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setFilterCategory(cat.value)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      filterCategory === cat.value
                        ? 'bg-slate-900 text-white shadow-md'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Expenses by Event */}
          <div className="space-y-6">
            {Object.values(expensesByEvent).length > 0 ? (
              Object.values(expensesByEvent).map((group: any) => (
                <div
                  key={group.event?.id || 'unknown'}
                  className="bg-white rounded-3xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100"
                >
                  <div className="flex items-start justify-between mb-4 pb-4 border-b border-slate-200">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">
                        {group.event?.name || 'Unknown Event'}
                      </h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {group.event?.eventDate
                            ? new Date(group.event.eventDate).toLocaleDateString()
                            : 'N/A'}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                            group.event?.eventType === 'LOCAL_ORDER'
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-purple-50 text-purple-700'
                          }`}
                        >
                          {group.event?.eventType === 'LOCAL_ORDER' ? 'Local Order' : 'Main Event'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-500 mb-1">Total Expenses</p>
                      <p className="text-2xl font-black text-red-600">
                        ₹{group.total.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {group.expenses.map((expense: any) => (
                      <div
                        key={expense.id}
                        className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div
                            className={`p-2.5 rounded-lg border ${getCategoryColor(
                              expense.category
                            )}`}
                          >
                            {getCategoryIcon(expense.category)}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-slate-900">{expense.description}</h4>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-xs text-slate-500">
                                {expense.category.replace('_', ' ')}
                              </span>
                              <span className="text-xs text-slate-400">•</span>
                              <span className="text-xs text-slate-500">
                                {new Date(expense.date).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <p className="text-lg font-bold text-red-600">
                            ₹{Number(expense.amount).toLocaleString()}
                          </p>
                          <button
                            onClick={() => handleDeleteExpense(expense.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-3xl p-12 text-center shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100">
                <Wallet className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-900 mb-2">No expenses found</h3>
                <p className="text-slate-500 max-w-md mx-auto">
                  Click "Add Expense" to track operational costs for your events.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl">
            <div className="px-8 py-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h2 className="text-2xl font-bold text-slate-900">Add Expense</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-slate-200 rounded-full transition-colors"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Select Event *
                </label>
                <select
                  required
                  value={formData.eventId}
                  onChange={(e) => setFormData({ ...formData, eventId: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                >
                  <option value="">Choose an event</option>
                  {events.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.name} - {new Date(event.eventDate).toLocaleDateString()} (
                      {event.eventType === 'LOCAL_ORDER' ? 'Local' : 'Main Event'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Category *
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                >
                  <option value="DELIVERY">Delivery</option>
                  <option value="MANPOWER">Manpower</option>
                  <option value="TRANSPORTATION">Transportation</option>
                  <option value="EQUIPMENT_RENTAL">Equipment Rental</option>
                  <option value="PACKAGING">Packaging</option>
                  <option value="MISCELLANEOUS">Miscellaneous</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description *
                </label>
                <input
                  type="text"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  placeholder="E.g., Delivery charges for venue"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Amount (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-100 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors font-medium"
                >
                  Add Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageLayout>
  )
}
