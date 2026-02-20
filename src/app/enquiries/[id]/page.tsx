'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Calendar,
  Users,
  Phone,
  FileText,
  UtensilsCrossed,
  Send,
  Download,
  CalendarDays,
} from 'lucide-react'
import PageLayout from '@/components/PageLayout'
import { getEnquiryById, updateEnquiryStatus, addEnquiryUpdate } from '@/lib/actions/enquiries'
import { useAuth } from '@/contexts/AuthContext'
import { downloadMenu } from '@/lib/invoice-pdf'

export default function EnquiryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { user } = useAuth()
  const [enquiry, setEnquiry] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [noteInput, setNoteInput] = useState('')
  const [addingNote, setAddingNote] = useState(false)
  const [occasion, setOccasion] = useState('')
  const [serviceType, setServiceType] = useState('')

  useEffect(() => {
    loadEnquiry()
  }, [id])

  async function loadEnquiry() {
    setLoading(true)
    const result = await getEnquiryById(id)
    if (result.success && result.data) {
      setEnquiry(result.data)
    }
    setLoading(false)
  }

  const handleStatusUpdate = async (status: 'PENDING' | 'LOST' | 'SUCCESS') => {
    if (!user) return
    setUpdating(true)
    const result = await updateEnquiryStatus(id, status as any, user.id)
    if (result.success) {
      loadEnquiry()
    }
    setUpdating(false)
  }

  const handleAddNote = async () => {
    if (!noteInput.trim()) return
    setAddingNote(true)
    const result = await addEnquiryUpdate(id, noteInput)
    if (result.success) {
      setNoteInput('')
      loadEnquiry()
    }
    setAddingNote(false)
  }

  const handleDownloadMenu = () => {
    if (!enquiry) return
    downloadMenu({
      quotationNumber: enquiry.quotationNumber,
      clientName: enquiry.clientName,
      clientContact: enquiry.clientContact,
      location: enquiry.location,
      eventDate: enquiry.eventDate,
      eventTime: enquiry.eventTime,
      peopleCount: enquiry.peopleCount,
      occasion: occasion || undefined,
      serviceType: serviceType || undefined,
      dishes: enquiry.dishes,
      services: enquiry.services,
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-lg text-xs font-semibold border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            Pending
          </span>
        )
      case 'SUCCESS':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-semibold border border-emerald-200">
            <CheckCircle className="w-3.5 h-3.5" />
            Success
          </span>
        )
      case 'LOST':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 rounded-lg text-xs font-semibold border border-red-200">
            <XCircle className="w-3.5 h-3.5" />
            Lost
          </span>
        )
      default:
        return null
    }
  }

  const getUpdateIcon = (updateType: string) => {
    switch (updateType) {
      case 'STATUS_CHANGE':
        return <CheckCircle className="w-4 h-4 text-indigo-500" />
      case 'NOTE_ADDED':
        return <FileText className="w-4 h-4 text-slate-400" />
      default:
        return <Clock className="w-4 h-4 text-slate-400" />
    }
  }

  if (loading) {
    return (
      <PageLayout currentPath="/enquiries">
        <div className="min-h-screen bg-slate-50/50 flex items-center justify-center">
          <div className="text-slate-400">Loading enquiry...</div>
        </div>
      </PageLayout>
    )
  }

  if (!enquiry) {
    return (
      <PageLayout currentPath="/enquiries">
        <div className="min-h-screen bg-slate-50/50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-slate-500 mb-4">Enquiry not found</p>
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-medium"
            >
              Back to Home
            </button>
          </div>
        </div>
      </PageLayout>
    )
  }

  const dishesTotal = enquiry.dishes.reduce(
    (sum: number, d: any) => sum + d.quantity * Number(d.pricePerPlate),
    0
  )
  const servicesTotal = enquiry.services.reduce(
    (sum: number, s: any) => sum + Number(s.price),
    0
  )

  return (
    <PageLayout currentPath="/enquiries">
      <div className="min-h-screen bg-slate-50/50 pb-12">
        <div className="max-w-5xl mx-auto px-4 lg:px-8 py-8 lg:py-12 space-y-6">

          {/* Back button + Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors mt-1"
              >
                <ArrowLeft className="w-5 h-5 text-slate-600" />
              </button>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">
                    {enquiry.quotationNumber}
                  </h1>
                  {getStatusBadge(enquiry.status)}
                </div>
                <p className="text-slate-500">
                  Created {new Date(enquiry.createdAt).toLocaleDateString('en-IN', {
                    day: '2-digit', month: 'short', year: 'numeric'
                  })}
                  {enquiry.createdBy && ` by ${enquiry.createdBy.name}`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <input
                type="text"
                placeholder="Event (e.g. NIKKAH)"
                value={occasion}
                onChange={e => setOccasion(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-slate-900 focus:border-transparent w-40"
              />
              <input
                type="text"
                placeholder="Service Type"
                value={serviceType}
                onChange={e => setServiceType(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-slate-900 focus:border-transparent w-36"
              />
              <button
                onClick={handleDownloadMenu}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 transition-all"
              >
                <Download className="w-4 h-4" />
                Download Menu
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">

              {/* Client & Event Info */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Details</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-slate-100 rounded-lg mt-0.5">
                      <Phone className="w-4 h-4 text-slate-500" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-0.5">Client</p>
                      <p className="font-semibold text-slate-900">{enquiry.clientName}</p>
                      <p className="text-sm text-slate-600">{enquiry.clientContact}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-slate-100 rounded-lg mt-0.5">
                      <MapPin className="w-4 h-4 text-slate-500" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-0.5">Location</p>
                      <p className="font-semibold text-slate-900">{enquiry.location}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-slate-100 rounded-lg mt-0.5">
                      <Calendar className="w-4 h-4 text-slate-500" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-0.5">Event Date & Time</p>
                      <p className="font-semibold text-slate-900">
                        {new Date(enquiry.eventDate).toLocaleDateString('en-IN', {
                          day: '2-digit', month: 'short', year: 'numeric'
                        })}
                      </p>
                      <p className="text-sm text-slate-600">{enquiry.eventTime}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-slate-100 rounded-lg mt-0.5">
                      <Users className="w-4 h-4 text-slate-500" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-0.5">Guests</p>
                      <p className="font-semibold text-slate-900">{enquiry.peopleCount} people</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dishes */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <UtensilsCrossed className="w-5 h-5 text-slate-500" />
                  <h2 className="text-lg font-semibold text-slate-900">Dishes</h2>
                </div>
                {enquiry.dishes.length > 0 ? (
                  <div className="space-y-2">
                    {enquiry.dishes.map((d: any) => (
                      <div key={d.id} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                        <div>
                          <p className="font-medium text-slate-900">{d.dish?.name || '—'}</p>
                          {d.dish?.category && (
                            <p className="text-xs text-slate-500">{d.dish.category}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-slate-900">
                            {d.quantity} plates × ₹{Number(d.pricePerPlate).toLocaleString()}
                          </p>
                          <p className="text-xs text-slate-500">
                            ₹{(d.quantity * Number(d.pricePerPlate)).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-sm text-center py-4">No dishes added</p>
                )}
              </div>

              {/* Services */}
              {enquiry.services.length > 0 && (
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">Services</h2>
                  <div className="space-y-2">
                    {enquiry.services.map((s: any) => (
                      <div key={s.id} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                        <div>
                          <p className="font-medium text-slate-900">{s.serviceName}</p>
                          {s.description && (
                            <p className="text-xs text-slate-500">{s.description}</p>
                          )}
                        </div>
                        <p className="text-sm font-semibold text-slate-900">
                          ₹{Number(s.price).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Total */}
              <div className="bg-slate-900 rounded-2xl p-6 text-white">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300 font-medium">Total Quotation Amount</span>
                  <span className="text-3xl font-bold">
                    ₹{(dishesTotal + servicesTotal).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Converted Event Link */}
              {enquiry.status === 'SUCCESS' && enquiry.convertedEvent && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CalendarDays className="w-5 h-5 text-emerald-600" />
                    <div>
                      <p className="font-semibold text-emerald-900">Converted to Event</p>
                      <p className="text-sm text-emerald-700">{enquiry.convertedEvent.name}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => router.push(`/events/${enquiry.convertedEvent.id}`)}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors"
                  >
                    View Event
                  </button>
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-6">

              {/* Status Actions */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
                  Update Status
                </h2>
                <div className="space-y-2">
                  <button
                    onClick={() => handleStatusUpdate('PENDING')}
                    disabled={updating || enquiry.status === 'PENDING'}
                    className={`w-full flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      enquiry.status === 'PENDING'
                        ? 'bg-amber-100 text-amber-700 border-2 border-amber-300'
                        : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <Clock className="w-4 h-4" />
                    Pending
                  </button>
                  <button
                    onClick={() => handleStatusUpdate('SUCCESS')}
                    disabled={updating || enquiry.status === 'SUCCESS'}
                    className={`w-full flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      enquiry.status === 'SUCCESS'
                        ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-300'
                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <CheckCircle className="w-4 h-4" />
                    Mark as Success
                    {enquiry.status !== 'SUCCESS' && (
                      <span className="ml-auto text-xs opacity-70">→ Creates Event</span>
                    )}
                  </button>
                  <button
                    onClick={() => handleStatusUpdate('LOST')}
                    disabled={updating || enquiry.status === 'LOST'}
                    className={`w-full flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      enquiry.status === 'LOST'
                        ? 'bg-red-100 text-red-700 border-2 border-red-300'
                        : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <XCircle className="w-4 h-4" />
                    Mark as Lost
                  </button>
                </div>
              </div>

              {/* Add Note */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
                  Add Note
                </h2>
                <textarea
                  value={noteInput}
                  onChange={e => setNoteInput(e.target.value)}
                  placeholder="Add a note or update..."
                  rows={3}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-slate-900 focus:border-transparent resize-none"
                />
                <button
                  onClick={handleAddNote}
                  disabled={addingNote || !noteInput.trim()}
                  className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                  {addingNote ? 'Adding...' : 'Add Note'}
                </button>
              </div>

              {/* Timeline */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
                  Activity Timeline
                </h2>
                {enquiry.updates && enquiry.updates.length > 0 ? (
                  <div className="space-y-4">
                    {enquiry.updates.map((update: any) => (
                      <div key={update.id} className="flex items-start gap-3">
                        <div className="mt-0.5 p-1.5 bg-slate-100 rounded-lg">
                          {getUpdateIcon(update.updateType)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-slate-700">{update.description}</p>
                          <p className="text-xs text-slate-400 mt-1">
                            {new Date(update.createdAt).toLocaleDateString('en-IN', {
                              day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-sm text-center py-4">No activity yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
