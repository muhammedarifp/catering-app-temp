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
  Send,
  Download,
  CalendarDays,
  Plus,
  Share2,
  UtensilsCrossed
} from 'lucide-react'
import PageLayout from '@/components/PageLayout'
import {
  getEnquiryById,
  updateEnquiryStatus,
  addEnquiryUpdate,
  updateEnquiryDetails,
  removeEnquiryDish,
  removeEnquiryService,
  updateEnquiryDish,
  updateEnquiryService,
  addEnquiryDish,
  addEnquiryService
} from '@/lib/actions/enquiries'
import { getDishes } from '@/lib/actions/dishes'
import { useAuth } from '@/contexts/AuthContext'
import { downloadMenu } from '@/lib/invoice-pdf'

const DISH_CATEGORIES: { label: string; dbCategories: string[] }[] = [
  { label: 'Welcome Drink', dbCategories: ['Welcome Drink'] },
  { label: 'Starters',      dbCategories: ['Starters'] },
  { label: 'Tea',           dbCategories: ['Herbal Tea'] },
  { label: 'Breads',        dbCategories: ['Breads'] },
  { label: 'Rice',          dbCategories: ['Main Course'] },
  { label: 'Curry & Gravy', dbCategories: ['Curry'] },
  { label: 'Fry & Grilled', dbCategories: ['Fry'] },
  { label: 'Salads',        dbCategories: ['Salads'] },
  { label: 'Drinks',        dbCategories: ['Drinks'] },
  { label: 'Desserts',      dbCategories: ['Desserts'] },
  { label: 'Other',         dbCategories: [] },
]

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

  // List of all dishes for adding new ones
  const [allDishes, setAllDishes] = useState<any[]>([])

  // Editing state
  const [editingDishId, setEditingDishId] = useState<string | null>(null)
  const [editDishForm, setEditDishForm] = useState({ quantity: 0, pricePerPlate: 0 })
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null)
  const [editServiceForm, setEditServiceForm] = useState({ serviceName: '', price: 0 })

  // Expand sub-items state
  const [expandedDishId, setExpandedDishId] = useState<string | null>(null)

  // Adding new Item state
  const [isAddingDish, setIsAddingDish] = useState(false)
  const [addDishCategory, setAddDishCategory] = useState(DISH_CATEGORIES[0].label)
  const [newDishForm, setNewDishForm] = useState({ dishId: '', quantity: 1, pricePerPlate: 0 })
  const [isAddingService, setIsAddingService] = useState(false)
  const [newServiceForm, setNewServiceForm] = useState({ serviceName: '', price: 0 })

  // Finalize / Download Quote Modals
  const [isFinalizeModalOpen, setIsFinalizeModalOpen] = useState(false)
  const [finalizeDishPrices, setFinalizeDishPrices] = useState<Record<string, number>>({})
  const [finalizeServicePrices, setFinalizeServicePrices] = useState<Record<string, number>>({})

  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false)
  const [downloadIncludeSubItems, setDownloadIncludeSubItems] = useState(false)

  useEffect(() => {
    loadEnquiry()
  }, [id])

  async function loadEnquiry() {
    setLoading(true)
    const [result, dishesResult] = await Promise.all([
      getEnquiryById(id),
      getDishes(undefined, true) // fetch active dishes
    ])

    if (result.success && result.data) {
      setEnquiry(result.data)
      setOccasion(Array.isArray(result.data.occasion) ? (result.data.occasion[0] || '') : (result.data.occasion || ''))
      setServiceType(Array.isArray(result.data.serviceType) ? (result.data.serviceType[0] || '') : (result.data.serviceType || ''))
    }
    if (dishesResult.success && dishesResult.data) {
      setAllDishes(dishesResult.data)
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

  const handleAddNewDish = async () => {
    if (!newDishForm.dishId || newDishForm.quantity <= 0) return
    // Auto-fill price if 0 or empty? We'll assume admin typed it.
    await addEnquiryDish(id, {
      dishId: newDishForm.dishId,
      quantity: newDishForm.quantity,
      pricePerPlate: newDishForm.pricePerPlate
    })
    setIsAddingDish(false)
    setNewDishForm({ dishId: '', quantity: 1, pricePerPlate: 0 })
    loadEnquiry()
  }

  const handleAddNewService = async () => {
    if (!newServiceForm.serviceName.trim()) return
    await addEnquiryService(id, {
      serviceName: newServiceForm.serviceName,
      price: newServiceForm.price
    })
    setIsAddingService(false)
    setNewServiceForm({ serviceName: '', price: 0 })
    loadEnquiry()
  }

  const handleUpdateDish = async (dishId: string) => {
    await updateEnquiryDish(dishId, id, editDishForm)
    setEditingDishId(null)
    loadEnquiry()
  }

  const handleRemoveDish = async (dishId: string) => {
    if (confirm('Are you sure you want to remove this dish?')) {
      await removeEnquiryDish(dishId, id)
      loadEnquiry()
    }
  }

  const handleUpdateService = async (serviceId: string) => {
    await updateEnquiryService(serviceId, id, editServiceForm)
    setEditingServiceId(null)
    loadEnquiry()
  }

  const handleRemoveService = async (serviceId: string) => {
    if (confirm('Are you sure you want to remove this service?')) {
      await removeEnquiryService(serviceId, id)
      loadEnquiry()
    }
  }

  const handleDownloadMenu = (format: 'pdf' | 'excel') => {
    if (!enquiry) return

    const payload = {
      status: enquiry.status,
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
      includeSubItems: downloadIncludeSubItems
    }

    if (format === 'excel') {
      import('@/lib/invoice-excel').then(m => m.downloadMenuExcel(payload))
    } else {
      downloadMenu(payload)
    }

    setIsDownloadModalOpen(false)
  }

  const handleShareQuotation = () => {
    if (!enquiry) return
    const dishesTotal = enquiry.dishes.reduce((sum: number, d: any) => sum + d.quantity * Number(d.pricePerPlate), 0)
    const servicesTotal = enquiry.services.reduce((sum: number, s: any) => sum + Number(s.price), 0)
    const total = dishesTotal + servicesTotal

    const text = `*New Quotation from CaterPro*
Quotation No: ${enquiry.quotationNumber}
Event Date: ${new Date(enquiry.eventDate).toLocaleDateString()}
Guests: ${enquiry.peopleCount}
Total Amount: ₹${total.toLocaleString()}

Please let us know if you have any questions!
    `
    const url = `https://wa.me/${enquiry.clientContact}?text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
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
      case 'PRICE_QUOTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-semibold border border-indigo-200">
            <CheckCircle className="w-3.5 h-3.5" />
            Quoted
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

  const isTerminal = enquiry.status === 'SUCCESS' || enquiry.status === 'LOST'

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
                placeholder="Occasion (e.g. NIKKAH)"
                value={occasion}
                onChange={e => setOccasion(e.target.value)}
                onBlur={async () => {
                  await updateEnquiryDetails(id, { occasion: occasion ? [occasion] : undefined })
                }}
                className="px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-slate-900 focus:border-transparent w-44"
              />
              <input
                type="text"
                placeholder="Service Type"
                value={serviceType}
                onChange={e => setServiceType(e.target.value)}
                onBlur={async () => {
                  await updateEnquiryDetails(id, { serviceType: serviceType ? [serviceType] : undefined })
                }}
                className="px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-slate-900 focus:border-transparent w-36"
              />
              <button
                onClick={() => setIsDownloadModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 transition-all"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Menu</span>
              </button>
              <button
                onClick={handleShareQuotation}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 border border-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-all shadow-sm"
              >
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">Share</span>
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
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <UtensilsCrossed className="w-5 h-5 text-slate-500" />
                    <h2 className="text-lg font-semibold text-slate-900">Dishes (Visible to Admin Only)</h2>
                  </div>
                  {!isTerminal && (
                    <button
                      onClick={() => setIsAddingDish(!isAddingDish)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-100/50"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Dish
                    </button>
                  )}
                </div>

                {isAddingDish && (() => {
                  const allMapped = DISH_CATEGORIES.flatMap(c => c.dbCategories)
                  const activeCat = DISH_CATEGORIES.find(c => c.label === addDishCategory)!
                  const categoryDishes = activeCat.dbCategories.length === 0
                    ? allDishes.filter(d => !allMapped.includes(d.category))
                    : allDishes.filter(d => activeCat.dbCategories.includes(d.category))
                  const selectedDish = allDishes.find(d => d.id === newDishForm.dishId)
                  return (
                    <div className="mb-4 border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                      {/* Category dropdown */}
                      <div className="px-4 pt-4 pb-3 border-b border-slate-100 bg-slate-50/60">
                        <label className="text-xs font-semibold text-slate-500 mb-1.5 block uppercase tracking-wide">Category</label>
                        <select
                          value={addDishCategory}
                          onChange={e => { setAddDishCategory(e.target.value); setNewDishForm({ dishId: '', quantity: 1, pricePerPlate: 0 }) }}
                          className="w-full px-3 py-2 text-sm font-medium text-slate-800 border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white appearance-none cursor-pointer"
                        >
                          {DISH_CATEGORIES.map(cat => (
                            <option key={cat.label} value={cat.label}>{cat.label}</option>
                          ))}
                        </select>
                      </div>
                      {/* Dish list */}
                      <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-52 overflow-y-auto">
                        {categoryDishes.length === 0 ? (
                          <p className="col-span-2 text-xs text-slate-400 text-center py-4">No dishes in this category.</p>
                        ) : categoryDishes.map((dish: any) => (
                          <button
                            key={dish.id}
                            onClick={() => setNewDishForm({ dishId: dish.id, quantity: 1, pricePerPlate: Number(dish.sellingPricePerPlate) || 0 })}
                            className={`flex items-center justify-between p-2.5 rounded-lg text-left text-sm transition-colors border ${
                              newDishForm.dishId === dish.id
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50'
                            }`}
                          >
                            <span className="font-medium truncate">{dish.name}</span>
                            <span className="text-xs opacity-75 ml-2 shrink-0">₹{Number(dish.sellingPricePerPlate)} {dish.priceUnit || 'per plate'}</span>
                          </button>
                        ))}
                      </div>
                      {/* Qty / Price / Add — shown when a dish is selected */}
                      {newDishForm.dishId && (
                        <div className="px-3 pb-3 pt-2 border-t border-blue-100 flex flex-wrap gap-3 items-end bg-blue-50/40">
                          <div className="w-24">
                            <label className="text-xs font-semibold text-slate-500 mb-1 block">Quantity</label>
                            <input
                              type="number" min="1"
                              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-500 bg-white"
                              value={newDishForm.quantity}
                              onChange={e => setNewDishForm(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                            />
                          </div>
                          <div className="w-28">
                            <label className="text-xs font-semibold text-slate-500 mb-1 block">
                              Price / {(selectedDish?.priceUnit || 'per plate').replace('per ', '')}
                            </label>
                            <input
                              type="number"
                              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-500 bg-white"
                              value={newDishForm.pricePerPlate}
                              onChange={e => setNewDishForm(prev => ({ ...prev, pricePerPlate: Number(e.target.value) }))}
                            />
                          </div>
                          <button
                            onClick={handleAddNewDish}
                            disabled={newDishForm.quantity <= 0}
                            className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                          >
                            Add
                          </button>
                          <button
                            onClick={() => { setIsAddingDish(false); setNewDishForm({ dishId: '', quantity: 1, pricePerPlate: 0 }) }}
                            className="px-4 py-2 bg-slate-200 text-slate-700 text-sm font-bold rounded-lg hover:bg-slate-300 transition"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })()}
                {enquiry.dishes.length > 0 ? (
                  <div className="space-y-3">
                    {enquiry.dishes.map((d: any) => (
                      <div key={d.id} className="flex flex-col p-3 border border-slate-100 rounded-xl bg-slate-50/50">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                          <div className="mb-2 sm:mb-0 flex items-start gap-2">
                            {d.dish?.ingredients?.length > 0 && (
                              <button
                                onClick={() => setExpandedDishId(expandedDishId === d.id ? null : d.id)}
                                className="mt-1 p-0.5 text-slate-400 hover:text-slate-600 rounded bg-slate-100 hover:bg-slate-200"
                              >
                                {expandedDishId === d.id ? (
                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                  </svg>
                                ) : (
                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                )}
                              </button>
                            )}
                            <div>
                              <p className="font-semibold text-slate-900">{d.dish?.name || '—'}</p>
                              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                {d.dish?.category && (
                                  <span className="text-xs text-slate-500">{d.dish.category}</span>
                                )}
                                {d.dish?.priceUnit && (
                                  <span className="text-xs font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md">
                                    {d.dish.priceUnit}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {editingDishId === d.id ? (
                            <div className="flex items-center gap-2 bg-white p-2 border border-blue-200 rounded-lg shadow-sm">
                              <input
                                type="number"
                                className="w-20 px-2 py-1 text-sm border border-slate-200 rounded outline-none focus:border-blue-500"
                                value={editDishForm.quantity}
                                onChange={e => setEditDishForm(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                                placeholder="Qty"
                              />
                              <span className="text-slate-400 text-sm">× ₹</span>
                              <input
                                type="number"
                                className="w-24 px-2 py-1 text-sm border border-slate-200 rounded outline-none focus:border-blue-500"
                                value={editDishForm.pricePerPlate}
                                onChange={e => setEditDishForm(prev => ({ ...prev, pricePerPlate: Number(e.target.value) }))}
                                placeholder="Price"
                              />
                              <button onClick={() => handleUpdateDish(d.id)} className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded hover:bg-blue-700 transition">Save</button>
                              <button onClick={() => setEditingDishId(null)} className="px-3 py-1 bg-slate-200 text-slate-700 text-xs font-bold rounded hover:bg-slate-300 transition">Cancel</button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-4">
                              {enquiry.status !== 'PENDING' && (
                                <div className="text-right">
                                  <p className="text-sm font-semibold text-slate-900">
                                    {d.quantity} {(d.dish?.priceUnit || 'per plate').replace('per ', '')} × ₹{(Number(d.pricePerPlate) || Number(d.dish?.sellingPricePerPlate) || 0).toLocaleString()}
                                  </p>
                                  <p className="text-xs text-slate-500 font-medium">
                                    Subtotal: ₹{(d.quantity * (Number(d.pricePerPlate) || Number(d.dish?.sellingPricePerPlate) || 0)).toLocaleString()}
                                  </p>
                                </div>
                              )}
                              {!isTerminal && (
                                <div className="flex flex-col gap-1 border-l border-slate-200 pl-4">
                                  <button onClick={() => {
                                    setEditingDishId(d.id)
                                    setEditDishForm({ quantity: d.quantity, pricePerPlate: Number(d.pricePerPlate) || Number(d.dish?.sellingPricePerPlate) || 0 })
                                  }} className="text-[10px] uppercase font-bold text-blue-600 hover:underline">Edit</button>
                                  <button onClick={() => handleRemoveDish(d.id)} className="text-[10px] uppercase font-bold text-red-600 hover:underline">Remove</button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        {expandedDishId === d.id && d.dish?.ingredients?.length > 0 && (
                          <div className="mt-3 pl-8 py-2 border-t border-slate-100/50 flex flex-col gap-1">
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Sub-Items</p>
                            {d.dish.ingredients.map((ing: any) => (
                              <div key={ing.id} className="text-sm text-slate-600 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                                {ing.ingredientName}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-sm text-center py-4">No dishes added</p>
                )}
              </div>

              {/* Services */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-slate-900">Services (Visible to Admin Only)</h2>
                  {!isTerminal && (
                    <button
                      onClick={() => setIsAddingService(!isAddingService)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-100/50"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Service
                    </button>
                  )}
                </div>

                {isAddingService && (
                  <div className="mb-4 p-4 bg-blue-50/50 border border-blue-100 rounded-xl flex flex-wrap gap-3 items-end">
                    <div className="flex-1 min-w-[200px]">
                      <label className="text-xs font-semibold text-slate-500 mb-1 block">Service Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Waiters, DJ, Decoration"
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-500"
                        value={newServiceForm.serviceName}
                        onChange={e => setNewServiceForm(prev => ({ ...prev, serviceName: e.target.value }))}
                      />
                    </div>
                    <div className="w-32">
                      <label className="text-xs font-semibold text-slate-500 mb-1 block">Total Price</label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-500"
                        value={newServiceForm.price}
                        onChange={e => setNewServiceForm(prev => ({ ...prev, price: Number(e.target.value) }))}
                      />
                    </div>
                    <button onClick={handleAddNewService} disabled={!newServiceForm.serviceName} className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition disabled:opacity-50">Add</button>
                  </div>
                )}
                {enquiry.services.length > 0 ? (
                  <div className="space-y-3">
                    {enquiry.services.map((s: any) => (
                      <div key={s.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border border-slate-100 rounded-xl bg-slate-50/50">
                        {editingServiceId === s.id ? (
                          <div className="flex flex-wrap items-center gap-2 bg-white p-2 border border-blue-200 rounded-lg shadow-sm w-full">
                            <input
                              type="text"
                              className="flex-1 min-w-[150px] px-2 py-1 text-sm border border-slate-200 rounded outline-none focus:border-blue-500"
                              value={editServiceForm.serviceName}
                              onChange={e => setEditServiceForm(prev => ({ ...prev, serviceName: e.target.value }))}
                            />
                            <span className="text-slate-400 text-sm">₹</span>
                            <input
                              type="number"
                              className="w-24 px-2 py-1 text-sm border border-slate-200 rounded outline-none focus:border-blue-500"
                              value={editServiceForm.price}
                              onChange={e => setEditServiceForm(prev => ({ ...prev, price: Number(e.target.value) }))}
                            />
                            <button onClick={() => handleUpdateService(s.id)} className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded hover:bg-blue-700 transition">Save</button>
                            <button onClick={() => setEditingServiceId(null)} className="px-3 py-1 bg-slate-200 text-slate-700 text-xs font-bold rounded hover:bg-slate-300 transition">Cancel</button>
                          </div>
                        ) : (
                          <>
                            <div className="mb-2 sm:mb-0">
                              <p className="font-semibold text-slate-900">{s.serviceName}</p>
                              {s.description && (
                                <p className="text-xs text-slate-500">{s.description}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-4">
                              {enquiry.status !== 'PENDING' && (
                                <p className="text-sm font-semibold text-slate-900">
                                  ₹{Number(s.price).toLocaleString()}
                                </p>
                              )}
                              {!isTerminal && (
                                <div className="flex flex-col gap-1 border-l border-slate-200 pl-4">
                                  <button onClick={() => {
                                    setEditingServiceId(s.id)
                                    setEditServiceForm({ serviceName: s.serviceName, price: Number(s.price) })
                                  }} className="text-[10px] uppercase font-bold text-blue-600 hover:underline">Edit</button>
                                  <button onClick={() => handleRemoveService(s.id)} className="text-[10px] uppercase font-bold text-red-600 hover:underline">Remove</button>
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-sm text-center py-4">No services added</p>
                )}
              </div>

              {/* Total */}
              {enquiry.status !== 'PENDING' && (
                <div className="bg-slate-900 rounded-2xl p-6 text-white">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300 font-medium">Total Quotation Amount</span>
                    <span className="text-3xl font-bold">
                      ₹{(dishesTotal + servicesTotal).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

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
                    disabled={updating || enquiry.status === 'PENDING' || enquiry.status === 'SUCCESS'}
                    className={`w-full flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${enquiry.status === 'PENDING'
                      ? 'bg-amber-100 text-amber-700 border-2 border-amber-300'
                      : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <Clock className="w-4 h-4" />
                    Pending
                  </button>
                  {enquiry.status === 'PENDING' ? (
                    <button
                      onClick={() => {
                        const prices: Record<string, number> = {}
                        enquiry.dishes.forEach((d: any) => {
                          prices[d.id] = Number(d.pricePerPlate) || Number(d.dish?.sellingPricePerPlate) || 0
                        })
                        setFinalizeDishPrices(prices)
                        setIsFinalizeModalOpen(true)
                      }}
                      disabled={updating}
                      className="w-full flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Set Prices & Quote
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStatusUpdate('SUCCESS')}
                      disabled={updating || enquiry.status === 'SUCCESS' || enquiry.status === 'LOST'}
                      className={`w-full flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${enquiry.status === 'SUCCESS'
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
                  )}
                  <button
                    onClick={() => handleStatusUpdate('LOST')}
                    disabled={updating || enquiry.status === 'LOST' || enquiry.status === 'SUCCESS'}
                    className={`w-full flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${enquiry.status === 'LOST'
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

      {/* Download Modal */}
      {isDownloadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-xl border border-slate-200">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-lg font-semibold text-slate-900">Download Quotation</h3>
              <button
                onClick={() => setIsDownloadModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-5">
              <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                <input
                  type="checkbox"
                  checked={downloadIncludeSubItems}
                  onChange={e => setDownloadIncludeSubItems(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-600 focus:ring-2"
                />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-slate-900">Include Sub-items</span>
                  <span className="text-xs text-slate-500">List dish ingredients on the document</span>
                </div>
              </label>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleDownloadMenu('pdf')}
                  className="flex flex-col items-center justify-center gap-2 p-4 border-2 border-slate-200 hover:border-red-500 hover:bg-red-50 rounded-xl transition-all group"
                >
                  <FileText className="w-8 h-8 text-slate-400 group-hover:text-red-500 transition-colors" />
                  <span className="text-sm font-semibold text-slate-700 group-hover:text-red-600">PDF</span>
                </button>
                <button
                  onClick={() => handleDownloadMenu('excel')}
                  className="flex flex-col items-center justify-center gap-2 p-4 border-2 border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 rounded-xl transition-all group"
                >
                  <svg className="w-8 h-8 text-slate-400 group-hover:text-emerald-500 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM13 3.5L18.5 9H13V3.5zM10.15 15.68l-1.92-2.61-1.85 2.61H4.8l2.92-3.8-2.73-3.6h1.61l1.73 2.4 1.7-2.4h1.57l-2.67 3.65 2.85 3.75h-1.63z" />
                  </svg>
                  <span className="text-sm font-semibold text-slate-700 group-hover:text-emerald-600">Excel (XLSX)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Finalize Prices Modal */}
      {isFinalizeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-xl border border-slate-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Finalize Prices</h3>
                <p className="text-sm text-slate-500 mt-1">Review and set final prices before marking as Success.</p>
              </div>
              <button
                onClick={() => setIsFinalizeModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1 space-y-6">
              {enquiry.dishes.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold tracking-wider text-slate-500 uppercase mb-3">Dishes</h4>
                  <div className="space-y-3">
                    {enquiry.dishes.map((d: any) => (
                      <div key={d.id} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl">
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900">{d.dish?.name || '—'}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-xs text-slate-500">
                              {d.quantity} {(d.dish?.priceUnit || 'per plate').replace('per ', '')}
                            </span>
                            {d.dish?.priceUnit && (
                              <span className="text-xs font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md">
                                {d.dish.priceUnit}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <label className="text-xs font-semibold text-slate-500">
                            Price / {(d.dish?.priceUnit || 'per plate').replace('per ', '')}
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
                            <input
                              type="number"
                              className="w-28 pl-7 pr-3 py-2 text-sm font-semibold border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                              value={finalizeDishPrices[d.id] ?? (Number(d.pricePerPlate) || Number(d.dish?.sellingPricePerPlate) || 0)}
                              onChange={e => setFinalizeDishPrices(prev => ({ ...prev, [d.id]: Number(e.target.value) }))}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {enquiry.services.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold tracking-wider text-slate-500 uppercase mb-3">Services</h4>
                  <div className="space-y-3">
                    {enquiry.services.map((s: any) => (
                      <div key={s.id} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl">
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900">{s.serviceName}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <label className="text-xs font-semibold text-slate-500">Total Price</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
                            <input
                              type="number"
                              className="w-28 pl-7 pr-3 py-2 text-sm font-semibold border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                              value={finalizeServicePrices[s.id] ?? s.price}
                              onChange={e => setFinalizeServicePrices(prev => ({ ...prev, [s.id]: Number(e.target.value) }))}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm text-slate-500 font-medium">Estimated Total</span>
                <span className="text-xl font-bold text-slate-900">
                  ₹{
                    (enquiry.dishes.reduce((sum: number, d: any) => sum + (d.quantity * (finalizeDishPrices[d.id] ?? (Number(d.pricePerPlate) || Number(d.dish?.sellingPricePerPlate) || 0))), 0) +
                      enquiry.services.reduce((sum: number, s: any) => sum + (finalizeServicePrices[s.id] ?? Number(s.price)), 0)).toLocaleString()
                  }
                </span>
              </div>
              <button
                onClick={async () => {
                  if (!user) return
                  setUpdating(true)
                  try {
                    // Update all dish prices concurrently
                    await Promise.all(enquiry.dishes.map((d: any) => {
                      if (finalizeDishPrices[d.id] !== undefined && finalizeDishPrices[d.id] !== Number(d.pricePerPlate)) {
                        return updateEnquiryDish(d.id, id, { quantity: d.quantity, pricePerPlate: finalizeDishPrices[d.id] })
                      }
                    }))

                    // Update all service prices concurrently
                    await Promise.all(enquiry.services.map((s: any) => {
                      if (finalizeServicePrices[s.id] !== undefined && finalizeServicePrices[s.id] !== Number(s.price)) {
                        return updateEnquiryService(s.id, id, { serviceName: s.serviceName, price: finalizeServicePrices[s.id] })
                      }
                    }))

                    // Finally update status to PRICE_QUOTED
                    await updateEnquiryStatus(id, 'PRICE_QUOTED', user.id)
                    setIsFinalizeModalOpen(false)
                    loadEnquiry()
                  } catch (e) {
                    console.error('Failed to finalize pricing', e)
                  }
                  setUpdating(false)
                }}
                disabled={updating}
                className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50"
              >
                {updating ? 'Confirming...' : 'Save & Quote Pricing'}
              </button>
            </div>
          </div>
        </div>
      )}

    </PageLayout>
  )
}
