'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  CalendarDays,
  Plus,
  Filter,
  Search,
  Eye,
  Edit,
  ShoppingCart,
  Upload,
  Download,
  Users,
  MapPin,
  IndianRupee,
  Calendar,
  Clock,
} from 'lucide-react'
import PageLayout from '@/components/PageLayout'
import BulkUploadModal from '@/components/BulkUploadModal'
import InvoiceDownloadButton from '@/components/InvoiceDownloadButton'
import { getEvents, getEventsForGroceryPurchase, bulkUploadEvents } from '@/lib/actions/events'
import { validateEventsData, transformEventsDataForUpload, downloadGroceryList } from '@/lib/excel'

export default function EventsPage() {
  const router = useRouter()
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'all' | 'local' | 'main'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showGroceryModal, setShowGroceryModal] = useState(false)
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false)
  const [groceryEvents, setGroceryEvents] = useState<any[]>([])
  const [groceryDate, setGroceryDate] = useState(() => {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
    return tomorrow.toISOString().split('T')[0]
  })
  const [groceryLoading, setGroceryLoading] = useState(false)
  const [manualMode, setManualMode] = useState(false)
  const [selectedEventIds, setSelectedEventIds] = useState<Set<string>>(new Set())

  // TODO: Replace with actual user ID from auth
  const userId = 'temp-user-id'

  useEffect(() => {
    loadEvents()
  }, [])

  async function loadEvents() {
    setLoading(true)
    try {
      const result = await getEvents()
      if (result.success && result.data) {
        setEvents(result.data)
      }
    } catch (error) {
      console.error('Failed to load events:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenGroceryList = async () => {
    setManualMode(false)
    setSelectedEventIds(new Set())
    setGroceryLoading(true)
    const targetDate = new Date(groceryDate + 'T00:00:00')
    const result = await getEventsForGroceryPurchase(targetDate)
    if (result.success && result.data) {
      setGroceryEvents(result.data)
    }
    setGroceryLoading(false)
    setShowGroceryModal(true)
  }

  const handleGroceryDateChange = async (date: string) => {
    setGroceryDate(date)
    setManualMode(false)
    setSelectedEventIds(new Set())
    setGroceryLoading(true)
    const targetDate = new Date(date + 'T00:00:00')
    const result = await getEventsForGroceryPurchase(targetDate)
    if (result.success && result.data) {
      setGroceryEvents(result.data)
    }
    setGroceryLoading(false)
  }

  const handleEnableManualMode = () => {
    setManualMode(true)
    // Pre-select all upcoming/in-progress events
    const ids = new Set(
      events
        .filter(e => e.status === 'UPCOMING' || e.status === 'IN_PROGRESS')
        .map(e => e.id)
    )
    setSelectedEventIds(ids)
  }

  const toggleEventSelection = (id: string) => {
    setSelectedEventIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const getGroceryEventsToDownload = () => {
    if (manualMode) {
      return events.filter(e => selectedEventIds.has(e.id))
    }
    return groceryEvents
  }

  const handleBulkUpload = async (data: any[]) => {
    const transformedData = transformEventsDataForUpload(data, userId)
    const result = await bulkUploadEvents(transformedData)

    if (result.success) {
      loadEvents()
    }

    return result
  }

  const filteredEvents = events.filter((event) => {
    // Tab filter
    if (activeTab === 'local' && event.eventType !== 'LOCAL_ORDER') return false
    if (activeTab === 'main' && event.eventType !== 'MAIN_EVENT') return false

    // Status filter
    if (statusFilter !== 'all' && event.status !== statusFilter) return false

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      return (
        event.name.toLowerCase().includes(search) ||
        event.clientName.toLowerCase().includes(search) ||
        event.location.toLowerCase().includes(search)
      )
    }

    return true
  })

  const stats = {
    all: events.length,
    local: events.filter((e) => e.eventType === 'LOCAL_ORDER').length,
    main: events.filter((e) => e.eventType === 'MAIN_EVENT').length,
    upcoming: events.filter((e) => e.status === 'UPCOMING').length,
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'UPCOMING':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'IN_PROGRESS':
        return 'bg-purple-50 text-purple-700 border-purple-200'
      case 'COMPLETED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'CANCELLED':
        return 'bg-red-50 text-red-700 border-red-200'
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200'
    }
  }

  return (
    <PageLayout currentPath="/events">
      <div className="min-h-screen bg-slate-50/50 pb-12">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 lg:py-12 space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">
                Event Management
              </p>
              <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
                Events
              </h1>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={handleOpenGroceryList}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-slate-900 text-slate-900 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-all"
              >
                <ShoppingCart className="w-4 h-4" />
                Grocery List
              </button>
              <button
                onClick={() => setShowBulkUploadModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 transition-all">
                <Upload className="w-4 h-4" />
                Upload Events
              </button>
              <button
                onClick={() => router.push('/events/create')}
                className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-slate-900/10"
              >
                <Plus className="w-5 h-5" />
                New Event
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'All Events', value: stats.all, color: 'indigo' },
              { label: 'Local Orders', value: stats.local, color: 'blue' },
              { label: 'Main Events', value: stats.main, color: 'purple' },
              { label: 'Upcoming', value: stats.upcoming, color: 'emerald' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200"
              >
                <p className="text-sm font-medium text-slate-500 mb-1">{stat.label}</p>
                <p className="text-3xl font-black text-slate-900">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Tabs and Filters */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
            {/* Tabs */}
            <div className="flex items-center gap-2 flex-wrap">
              {[
                { value: 'all', label: 'All Events' },
                { value: 'local', label: 'Local Orders' },
                { value: 'main', label: 'Main Events' },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value as any)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === tab.value
                      ? 'bg-slate-900 text-white shadow-md'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex-1 min-w-50">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search events, clients, locations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="UPCOMING">Upcoming</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          {/* Events List */}
          <div className="space-y-4">
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event) => (
                <div
                  key={event.id}
                  className="bg-white rounded-3xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 hover:shadow-md transition-all group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="p-3 bg-indigo-50 rounded-xl">
                        <CalendarDays className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-slate-900">{event.name}</h3>
                          <span
                            className={`px-3 py-1 rounded-lg text-xs font-semibold border ${getStatusColor(
                              event.status
                            )}`}
                          >
                            {event.status}
                          </span>
                          <span
                            className={`px-3 py-1 rounded-lg text-xs font-semibold ${event.eventType === 'LOCAL_ORDER'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-purple-100 text-purple-700'
                              }`}
                          >
                            {event.eventType === 'LOCAL_ORDER' ? 'Local Order' : 'Main Event'}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 font-medium mb-3">
                          Client: {event.clientName}
                        </p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            {new Date(event.eventDate).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Clock className="w-4 h-4 text-slate-400" />
                            {event.eventTime}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Users className="w-4 h-4 text-slate-400" />
                            {event.guestCount} guests
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <MapPin className="w-4 h-4 text-slate-400" />
                            {event.location}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => router.push(`/events/${event.id}`)}
                        className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => router.push(`/events/${event.id}/edit`)}
                        className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <InvoiceDownloadButton
                        eventId={event.id}
                        eventName={event.name}
                        className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      />
                    </div>
                  </div>

                  {/* Financial Info */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                    <div className="flex items-center gap-6">
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Total Amount</p>
                        <p className="text-lg font-bold text-slate-900 flex items-center gap-1">
                          <IndianRupee className="w-4 h-4" />
                          {Number(event.totalAmount).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Paid</p>
                        <p className="text-lg font-bold text-emerald-600 flex items-center gap-1">
                          <IndianRupee className="w-4 h-4" />
                          {Number(event.paidAmount).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Balance</p>
                        <p className="text-lg font-bold text-amber-600 flex items-center gap-1">
                          <IndianRupee className="w-4 h-4" />
                          {Number(event.balanceAmount).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {event.balanceAmount > 0 && (
                      <button className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-semibold hover:bg-emerald-100 transition-colors">
                        Collect Payment
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-slate-200">
                <CalendarDays className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-900 mb-2">No events found</h3>
                <p className="text-slate-500 max-w-md mx-auto">
                  {searchTerm || statusFilter !== 'all'
                    ? 'Try adjusting your filters to see more events.'
                    : 'Get started by creating your first event or importing existing ones.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grocery Purchase Modal */}
      {showGroceryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-8 py-6 border-b border-slate-200 flex items-start justify-between bg-slate-50 gap-4">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-slate-900">Grocery List</h2>
                <div className="flex items-center gap-3 mt-3 flex-wrap">
                  <label className="text-sm font-medium text-slate-600 whitespace-nowrap">
                    Select Date:
                  </label>
                  <input
                    type="date"
                    value={groceryDate}
                    onChange={e => handleGroceryDateChange(e.target.value)}
                    className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  />
                  {!manualMode && (
                    <button
                      onClick={handleEnableManualMode}
                      className="px-3 py-1.5 border border-slate-300 text-slate-600 rounded-lg text-sm hover:bg-slate-100 transition-colors whitespace-nowrap"
                    >
                      Select Events Manually
                    </button>
                  )}
                  {manualMode && (
                    <span className="text-sm text-indigo-600 font-medium">
                      Manual mode — {selectedEventIds.size} event(s) selected
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setShowGroceryModal(false)}
                className="p-2 hover:bg-slate-200 rounded-full transition-colors text-2xl leading-none flex-shrink-0"
              >
                ×
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8">
              {groceryLoading ? (
                <div className="text-center py-12 text-slate-400">Loading events...</div>
              ) : manualMode ? (
                /* Manual event selection */
                <div className="space-y-3">
                  <p className="text-sm text-slate-500 mb-4">
                    Select the events you want to include in the grocery list:
                  </p>
                  {events.filter(e => e.status === 'UPCOMING' || e.status === 'IN_PROGRESS').length > 0 ? (
                    events
                      .filter(e => e.status === 'UPCOMING' || e.status === 'IN_PROGRESS')
                      .map(event => (
                        <label
                          key={event.id}
                          className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer hover:border-slate-300 transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={selectedEventIds.has(event.id)}
                            onChange={() => toggleEventSelection(event.id)}
                            className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                          />
                          <div className="flex-1">
                            <p className="font-semibold text-slate-900">{event.name}</p>
                            <p className="text-sm text-slate-500">
                              {new Date(event.eventDate).toLocaleDateString('en-IN')} • {event.guestCount} guests • {event.location}
                            </p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-lg font-medium ${getStatusColor(event.status)}`}>
                            {event.status}
                          </span>
                        </label>
                      ))
                  ) : (
                    <div className="text-center py-8 text-slate-400">
                      <p>No upcoming events found.</p>
                    </div>
                  )}

                  {selectedEventIds.size > 0 && (
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                      <button
                        onClick={() => downloadGroceryList(getGroceryEventsToDownload())}
                        className="px-6 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors font-medium flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Download Grocery List ({selectedEventIds.size} events)
                      </button>
                    </div>
                  )}
                </div>
              ) : groceryEvents.length > 0 ? (
                <div className="space-y-6">
                  {groceryEvents.map((event) => (
                    <div
                      key={event.id}
                      className="p-5 bg-slate-50 rounded-2xl border border-slate-200"
                    >
                      <h3 className="font-bold text-slate-900 mb-1">{event.name}</h3>
                      <p className="text-sm text-slate-500 mb-3">
                        {new Date(event.eventDate).toLocaleDateString('en-IN')} • {event.guestCount} guests
                      </p>
                      <div className="space-y-2">
                        {event.dishes && event.dishes.map((dish: any) => (
                          <div key={dish.id} className="flex items-center justify-between py-1">
                            <div>
                              <p className="font-medium text-slate-900">{dish.dish.name}</p>
                              <p className="text-sm text-slate-500">
                                {dish.quantity} plates
                              </p>
                            </div>
                            <div className="text-right text-sm text-slate-600">
                              {dish.dish.ingredients && dish.dish.ingredients.length > 0
                                ? `${dish.dish.ingredients.length} ingredients`
                                : <span className="text-amber-500">No ingredients set</span>
                              }
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                    <button
                      onClick={() => downloadGroceryList(groceryEvents)}
                      className="px-6 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors font-medium flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download Excel ({groceryEvents.length} events)
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400">
                  <ShoppingCart className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-semibold text-slate-900 mb-2">
                    No events on {new Date(groceryDate + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                  <p className="text-sm mb-6">Try a different date or select events manually.</p>
                  <button
                    onClick={handleEnableManualMode}
                    className="px-6 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors font-medium"
                  >
                    Select Events Manually
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      <BulkUploadModal
        isOpen={showBulkUploadModal}
        onClose={() => setShowBulkUploadModal(false)}
        type="events"
        onUpload={handleBulkUpload}
        validateData={validateEventsData}
      />
    </PageLayout>
  )
}
