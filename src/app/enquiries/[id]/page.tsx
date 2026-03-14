'use client'

import { useState, useEffect, use, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, CheckCircle, XCircle, Clock, MapPin, Calendar, Users, Phone,
  FileText, Send, Download, CalendarDays, Plus, Share2, UtensilsCrossed,
  Trash2, Calculator, DollarSign, History, RotateCcw, Lock, Loader2, X,
  ChevronRight, AlertTriangle, Table2, Maximize2, Minimize2, RefreshCw
} from 'lucide-react'
import PageLayout from '@/components/PageLayout'
import {
  getEnquiryById, updateEnquiryStatus, addEnquiryUpdate, updateEnquiryDetails,
  removeEnquiryDish, removeEnquiryService, updateEnquiryDish, updateEnquiryService,
  addEnquiryDish, addEnquiryService, updateEnquiryPricing, reviseEnquiry
} from '@/lib/actions/enquiries'
import { addCostItem, updateCostItem, deleteCostItem, syncGroceryFromMenu } from '@/lib/actions/costing'
import { getDishes } from '@/lib/actions/dishes'
import { useAuth } from '@/contexts/AuthContext'
import { downloadMenu } from '@/lib/invoice-pdf'

// ─── Constants ────────────────────────────────────────────────────────────────

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

const COST_SECTIONS = ['Grocery', 'Meat', 'Vegetables', 'Rentals', 'Labour', 'Others']

// ─── Toast system ─────────────────────────────────────────────────────────────

type ToastItem = { id: string; type: 'success' | 'error' | 'info'; message: string }

function ToastStack({ toasts, onDismiss }: { toasts: ToastItem[]; onDismiss: (id: string) => void }) {
  if (toasts.length === 0) return null
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id}
          className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg border bg-white min-w-[240px] max-w-[320px]
            border-l-4 transition-all
            ${t.type === 'success' ? 'border-l-emerald-500' : t.type === 'error' ? 'border-l-red-500' : 'border-l-indigo-500'}`}>
          <div className="mt-0.5 shrink-0">
            {t.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-500" />}
            {t.type === 'error'   && <XCircle className="w-4 h-4 text-red-500" />}
            {t.type === 'info'    && <Clock className="w-4 h-4 text-indigo-500" />}
          </div>
          <p className="text-sm text-slate-700 flex-1">{t.message}</p>
          <button onClick={() => onDismiss(t.id)} className="text-slate-400 hover:text-slate-600 shrink-0 mt-0.5">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  )
}

// ─── Confirm Modal ────────────────────────────────────────────────────────────

type ConfirmModalConfig = {
  title: string
  body: string
  confirmLabel: string
  variant?: 'red' | 'emerald' | 'violet' | 'indigo'
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

function ConfirmModal({ title, body, confirmLabel, variant = 'indigo', loading, onConfirm, onCancel }: ConfirmModalConfig) {
  const variantCls = {
    red:     'bg-red-600 hover:bg-red-700',
    emerald: 'bg-emerald-600 hover:bg-emerald-700',
    violet:  'bg-violet-600 hover:bg-violet-700',
    indigo:  'bg-indigo-600 hover:bg-indigo-700',
  }[variant]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px]">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl border border-slate-200 overflow-hidden">
        <div className="p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className={`p-2 rounded-xl shrink-0 ${variant === 'red' ? 'bg-red-50' : variant === 'emerald' ? 'bg-emerald-50' : variant === 'violet' ? 'bg-violet-50' : 'bg-indigo-50'}`}>
              <AlertTriangle className={`w-5 h-5 ${variant === 'red' ? 'text-red-500' : variant === 'emerald' ? 'text-emerald-500' : variant === 'violet' ? 'text-violet-500' : 'text-indigo-500'}`} />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">{title}</h3>
              <p className="text-sm text-slate-500 mt-1">{body}</p>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={onCancel} disabled={loading}
              className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors disabled:opacity-50">
              Cancel
            </button>
            <button onClick={onConfirm} disabled={loading}
              className={`px-4 py-2 text-sm font-semibold text-white rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2 ${variantCls}`}>
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Status Stepper ───────────────────────────────────────────────────────────

function StatusStepper({ status, revisionNumber }: { status: string; revisionNumber: number }) {
  const isLost = status === 'LOST'
  const steps = [
    { key: 'PENDING',      label: 'Planning',  short: 'Draft' },
    { key: 'PRICE_QUOTED', label: 'Quoted',    short: 'Quoted' },
    { key: isLost ? 'LOST' : 'SUCCESS', label: isLost ? 'Lost' : 'Confirmed', short: isLost ? 'Lost' : 'Done' },
  ]
  const statusOrder: Record<string, number> = { PENDING: 0, PRICE_QUOTED: 1, SUCCESS: 2, LOST: 2 }
  const current = statusOrder[status] ?? 0

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm px-6 py-4">
      <div className="flex items-center">
        {steps.map((step, idx) => {
          const done    = current > idx
          const active  = current === idx
          const isLostStep = step.key === 'LOST'
          return (
            <div key={step.key} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all relative
                  ${done
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : active
                      ? isLostStep
                        ? 'bg-red-500 text-white ring-4 ring-red-100'
                        : 'bg-indigo-600 text-white ring-4 ring-indigo-100'
                      : 'bg-slate-100 text-slate-400'
                  }`}>
                  {done
                    ? <CheckCircle className="w-4.5 h-4.5 w-[18px] h-[18px]" />
                    : active && isLostStep
                      ? <XCircle className="w-[18px] h-[18px]" />
                      : <span>{idx + 1}</span>
                  }
                  {active && revisionNumber > 1 && idx === 0 && (
                    <span className="absolute -top-2 -right-2 text-[9px] font-black bg-violet-600 text-white px-1 rounded-full leading-4">
                      R{revisionNumber}
                    </span>
                  )}
                </div>
                <span className={`text-[11px] font-semibold mt-1.5 whitespace-nowrap
                  ${active ? (isLostStep ? 'text-red-600' : 'text-indigo-700') : done ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {step.label}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 mb-4 rounded-full transition-all ${done ? 'bg-emerald-300' : 'bg-slate-200'}`} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function convertToBaseUnit(qty: number, fromUnit: string, toUnit: string): number {
  const f = fromUnit.toLowerCase().trim()
  const t = toUnit.toLowerCase().trim()
  if (f === t) return qty
  if (f === 'g'  && t === 'kg') return qty / 1000
  if (f === 'kg' && t === 'g')  return qty * 1000
  if (f === 'mg' && t === 'kg') return qty / 1_000_000
  if (f === 'mg' && t === 'g')  return qty / 1000
  if (f === 'ml' && (t === 'l' || t === 'litre' || t === 'liter')) return qty / 1000
  if ((f === 'l' || f === 'litre' || f === 'liter') && t === 'ml') return qty * 1000
  return qty
}

function computeDishCost(dish: any): number {
  if (!dish) return 0
  const linked = (dish.ingredients || []).filter(
    (i: any) => i.ingredient && Number(i.ingredient.pricePerUnit) > 0
  )
  if (linked.length > 0) {
    return linked.reduce((sum: number, i: any) => {
      const q = convertToBaseUnit(Number(i.quantity), i.unit || '', i.ingredient.unit || '')
      return sum + q * Number(i.ingredient.pricePerUnit)
    }, 0)
  }
  return Number(dish.estimatedCostPerPlate) || 0
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function EnquiryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { user } = useAuth()

  // Data
  const [enquiry, setEnquiry]       = useState<any>(null)
  const [allDishes, setAllDishes]   = useState<any[]>([])
  const [costItems, setCostItems]   = useState<any[]>([])

  // Loading states
  const [initialLoading, setInitialLoading] = useState(true)
  const [refreshing, setRefreshing]         = useState(false)

  // Tab
  const [activeTab, setActiveTab] = useState<'menu' | 'costing' | 'validation' | 'pricing' | 'history'>('menu')

  // Header fields
  const [occasion, setOccasion]       = useState('')
  const [serviceType, setServiceType] = useState('')

  // Toasts
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const showToast = useCallback((type: ToastItem['type'], message: string) => {
    const id = Math.random().toString(36).slice(2)
    setToasts(p => [...p, { id, type, message }])
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000)
  }, [])
  const dismissToast = useCallback((id: string) => setToasts(p => p.filter(t => t.id !== id)), [])

  // Confirm modal
  const [modal, setModal] = useState<(ConfirmModalConfig & { loading?: boolean }) | null>(null)

  // Dish state
  const [editingDishId, setEditingDishId]   = useState<string | null>(null)
  const [editDishForm, setEditDishForm]     = useState({ quantity: 0, pricePerPlate: 0 })
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null)
  const [editServiceForm, setEditServiceForm]   = useState({ serviceName: '', price: 0 })
  const [expandedDishId, setExpandedDishId] = useState<string | null>(null)
  const [isAddingDish, setIsAddingDish]     = useState(false)
  const [addDishCategory, setAddDishCategory] = useState(DISH_CATEGORIES[0].label)
  const [newDishForm, setNewDishForm]       = useState({ dishId: '', quantity: 1, pricePerPlate: 0 })
  const [isAddingService, setIsAddingService] = useState(false)
  const [newServiceForm, setNewServiceForm] = useState({ serviceName: '', price: 0 })
  const [savingDishId, setSavingDishId]     = useState<string | null>(null)
  const [savingServiceId, setSavingServiceId] = useState<string | null>(null)
  const [addingDish, setAddingDish]         = useState(false)
  const [addingService, setAddingService]   = useState(false)

  // Costing state
  const [isAddingCostItem, setIsAddingCostItem] = useState(false)
  const [newCostItem, setNewCostItem] = useState({ section: 'Grocery', itemName: '', qty: 1, unit: 'kg', rate: 0 })
  const [editingCostId, setEditingCostId]   = useState<string | null>(null)
  const [editCostForm, setEditCostForm]     = useState({ section: '', itemName: '', qty: 0, unit: '', rate: 0 })
  const [savingCost, setSavingCost]         = useState(false)

  // Validation tab cell editing
  const [editingCell, setEditingCell]         = useState<{ type: 'dish' | 'cost'; id: string; field: string } | null>(null)
  const [cellValue, setCellValue]             = useState('')
  const [isValidationMaximized, setIsValidationMaximized] = useState(false)

  // Pricing state
  const [finalPrice, setFinalPrice]       = useState(0)
  const [advanceAmount, setAdvanceAmount] = useState(0)
  const [paymentTerms, setPaymentTerms]   = useState('')
  const [savingPricing, setSavingPricing] = useState(false)

  // Revision
  const [revising, setRevising] = useState(false)

  // Note
  const [noteInput, setNoteInput]   = useState('')
  const [addingNote, setAddingNote] = useState(false)

  // Download modal
  const [isDownloadModalOpen, setIsDownloadModalOpen]         = useState(false)
  const [downloadIncludeSubItems, setDownloadIncludeSubItems] = useState(false)

  // Action guards
  const [updating, setUpdating] = useState(false)

  // ─── Load enquiry ──────────────────────────────────────────────────────────

  async function loadEnquiry(opts: { silent?: boolean } = {}) {
    if (!opts.silent) setInitialLoading(true)
    else setRefreshing(true)

    const [result, dishesResult] = await Promise.all([
      getEnquiryById(id),
      getDishes(undefined, true),
    ])

    if (result.success && result.data) {
      const data = result.data
      setEnquiry(data)
      setOccasion(Array.isArray(data.occasion) ? (data.occasion[0] || '') : (data.occasion || ''))
      setServiceType(Array.isArray(data.serviceType) ? (data.serviceType[0] || '') : (data.serviceType || ''))
      setCostItems(data.costItems || [])
      const savedFinalPrice = data.finalPrice || 0
      if (savedFinalPrice > 0) {
        setFinalPrice(savedFinalPrice)
      } else {
        const dishesSum = (data.dishes || []).reduce((s: number, d: any) => {
          return s + d.quantity * (Number(d.pricePerPlate) || computeDishCost(d.dish))
        }, 0)
        const servicesSum = (data.services || []).reduce((s: number, sv: any) => s + Number(sv.price), 0)
        setFinalPrice(dishesSum + servicesSum)
      }
      setAdvanceAmount(data.advanceAmount || 0)
      setPaymentTerms(data.paymentTerms || '')
    }
    if (dishesResult.success && dishesResult.data) setAllDishes(dishesResult.data)

    setInitialLoading(false)
    setRefreshing(false)
  }

  useEffect(() => { loadEnquiry() }, [id])

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const handleStatusUpdate = async (status: 'LOST' | 'SUCCESS') => {
    if (!user || updating) return
    setUpdating(true)
    setModal(prev => prev ? { ...prev, loading: true } : null)
    try {
      const result = await updateEnquiryStatus(id, status as any, user.id)
      if (!result.success) {
        showToast('error', result.error || 'Failed to update status')
        setUpdating(false)
        setModal(null)
        return
      }
      if (status === 'SUCCESS' && result.event) {
        showToast('success', 'Enquiry confirmed! Redirecting to event...')
        router.push(`/events/${result.event.id}`)
        return
      }
      showToast('success', status === 'LOST' ? 'Enquiry marked as lost.' : 'Status updated.')
    } catch {
      showToast('error', 'An unexpected error occurred.')
    }
    setModal(null)
    setUpdating(false)
    await loadEnquiry({ silent: true })
  }

  const handleRevise = async () => {
    setRevising(true)
    setModal(prev => prev ? { ...prev, loading: true } : null)
    try {
      const result = await reviseEnquiry(id)
      if (!result.success) {
        showToast('error', result.error || 'Failed to revise quotation')
        setRevising(false)
        setModal(null)
        return
      }
      showToast('success', `Revision started — quotation is back in Planning.`)
    } catch {
      showToast('error', 'Unexpected error during revision.')
    }
    setModal(null)
    setRevising(false)
    await loadEnquiry({ silent: true })
  }

  const handleAddNote = async () => {
    if (!noteInput.trim()) return
    setAddingNote(true)
    const result = await addEnquiryUpdate(id, noteInput)
    if (result?.success) {
      showToast('success', 'Note added.')
      setNoteInput('')
      await loadEnquiry({ silent: true })
    } else {
      showToast('error', 'Failed to add note.')
    }
    setAddingNote(false)
  }

  const handleAddNewDish = async () => {
    if (!newDishForm.dishId || newDishForm.quantity <= 0) return
    setAddingDish(true)
    const result = await addEnquiryDish(id, {
      dishId: newDishForm.dishId,
      quantity: newDishForm.quantity,
      pricePerPlate: newDishForm.pricePerPlate,
    })
    if (result?.success) {
      showToast('success', 'Dish added.')
      setIsAddingDish(false)
      setNewDishForm({ dishId: '', quantity: 1, pricePerPlate: 0 })
      await loadEnquiry({ silent: true })
    } else {
      showToast('error', 'Failed to add dish.')
    }
    setAddingDish(false)
  }

  const handleAddNewService = async () => {
    if (!newServiceForm.serviceName.trim()) return
    setAddingService(true)
    const result = await addEnquiryService(id, { serviceName: newServiceForm.serviceName, price: newServiceForm.price })
    if (result?.success) {
      showToast('success', 'Service added.')
      setIsAddingService(false)
      setNewServiceForm({ serviceName: '', price: 0 })
      await loadEnquiry({ silent: true })
    } else {
      showToast('error', 'Failed to add service.')
    }
    setAddingService(false)
  }

  const handleUpdateDish = async (dishId: string) => {
    setSavingDishId(dishId)
    const result = await updateEnquiryDish(dishId, id, editDishForm)
    if (result?.success) {
      showToast('success', 'Dish updated.')
      setEditingDishId(null)
      await loadEnquiry({ silent: true })
    } else {
      showToast('error', 'Failed to update dish.')
    }
    setSavingDishId(null)
  }

  const handleRemoveDish = (dishId: string, dishName: string) => {
    setModal({
      title: 'Remove Dish',
      body: `Remove "${dishName}" from the menu?`,
      confirmLabel: 'Remove',
      variant: 'red',
      onConfirm: async () => {
        setModal(prev => prev ? { ...prev, loading: true } : null)
        const result = await removeEnquiryDish(dishId, id)
        if (result?.success) {
          showToast('success', 'Dish removed.')
          await loadEnquiry({ silent: true })
        } else {
          showToast('error', 'Failed to remove dish.')
        }
        setModal(null)
      },
      onCancel: () => setModal(null),
    })
  }

  const handleUpdateService = async (serviceId: string) => {
    setSavingServiceId(serviceId)
    const result = await updateEnquiryService(serviceId, id, editServiceForm)
    if (result?.success) {
      showToast('success', 'Service updated.')
      setEditingServiceId(null)
      await loadEnquiry({ silent: true })
    } else {
      showToast('error', 'Failed to update service.')
    }
    setSavingServiceId(null)
  }

  const handleRemoveService = (serviceId: string, name: string) => {
    setModal({
      title: 'Remove Service',
      body: `Remove "${name}" from the quotation?`,
      confirmLabel: 'Remove',
      variant: 'red',
      onConfirm: async () => {
        setModal(prev => prev ? { ...prev, loading: true } : null)
        const result = await removeEnquiryService(serviceId, id)
        if (result?.success) {
          showToast('success', 'Service removed.')
          await loadEnquiry({ silent: true })
        } else {
          showToast('error', 'Failed to remove service.')
        }
        setModal(null)
      },
      onCancel: () => setModal(null),
    })
  }

  const handleAddCostItem = async () => {
    if (!newCostItem.itemName.trim() || !isEditable) return
    setSavingCost(true)
    const result = await addCostItem({ enquiryId: id, ...newCostItem })
    if (result?.success) {
      showToast('success', 'Cost item added.')
      setNewCostItem({ section: 'Grocery', itemName: '', qty: 1, unit: 'kg', rate: 0 })
      setIsAddingCostItem(false)
      await loadEnquiry({ silent: true })
    } else {
      showToast('error', 'Failed to add cost item.')
    }
    setSavingCost(false)
  }

  const handleUpdateCostItem = async (costId: string) => {
    setSavingCost(true)
    const result = await updateCostItem(costId, editCostForm)
    if (result?.success) {
      showToast('success', 'Cost item updated.')
      setEditingCostId(null)
      await loadEnquiry({ silent: true })
    } else {
      showToast('error', 'Failed to update cost item.')
    }
    setSavingCost(false)
  }

  const handleDeleteCostItem = (costId: string, itemName: string) => {
    setModal({
      title: 'Delete Cost Item',
      body: `Delete "${itemName}" from the costing sheet?`,
      confirmLabel: 'Delete',
      variant: 'red',
      onConfirm: async () => {
        setModal(prev => prev ? { ...prev, loading: true } : null)
        const result = await deleteCostItem(costId)
        if (result?.success) {
          showToast('success', 'Cost item deleted.')
          await loadEnquiry({ silent: true })
        } else {
          showToast('error', 'Failed to delete cost item.')
        }
        setModal(null)
      },
      onCancel: () => setModal(null),
    })
  }

  // ─── Validation tab cell handlers ────────────────────────────────────────────

  const startCellEdit = (type: 'dish' | 'cost', id: string, field: string, currentValue: string | number) => {
    if (!isEditable) return
    setEditingCell({ type, id, field })
    setCellValue(String(currentValue))
  }

  const cancelCellEdit = () => {
    setEditingCell(null)
    setCellValue('')
  }

  const handleDishCellSave = async (dishId: string, field: 'quantity' | 'pricePerPlate') => {
    setEditingCell(null)
    const num = Number(cellValue)
    if (isNaN(num) || num <= 0) return
    const dish = enquiry.dishes.find((d: any) => d.id === dishId)
    if (!dish) return
    const data = {
      quantity: field === 'quantity' ? num : dish.quantity,
      pricePerPlate: field === 'pricePerPlate' ? num : (Number(dish.pricePerPlate) || computeDishCost(dish.dish)),
    }
    const result = await updateEnquiryDish(dishId, id, data)
    if (result?.success) {
      await loadEnquiry({ silent: true })
    } else {
      showToast('error', 'Failed to update dish.')
    }
  }

  const handleCostCellSave = async (costId: string, field: string) => {
    setEditingCell(null)
    const isNumeric = field === 'qty' || field === 'rate'
    const updateData: any = { [field]: isNumeric ? Number(cellValue) : cellValue }
    if (isNumeric && isNaN(updateData[field])) return
    const result = await updateCostItem(costId, updateData)
    if (result?.success) {
      await loadEnquiry({ silent: true })
    } else {
      showToast('error', 'Failed to update cost item.')
    }
  }

  const handleCellKeyDown = (
    e: React.KeyboardEvent,
    type: 'dish' | 'cost',
    id: string,
    field: string
  ) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (type === 'dish') handleDishCellSave(id, field as 'quantity' | 'pricePerPlate')
      else handleCostCellSave(id, field)
    }
    if (e.key === 'Escape') cancelCellEdit()
  }

  const handleSavePricing = async () => {
    if (!user || finalPrice <= 0) return
    setSavingPricing(true)
    const pricingResult = await updateEnquiryPricing(id, { finalPrice, advanceAmount, paymentTerms })
    if (!pricingResult?.success) {
      showToast('error', pricingResult?.error || 'Failed to save pricing.')
      setSavingPricing(false)
      return
    }
    if (enquiry.status === 'PENDING') {
      const statusResult = await updateEnquiryStatus(id, 'PRICE_QUOTED' as any, user.id)
      if (!statusResult?.success) {
        showToast('error', statusResult?.error || 'Pricing saved but failed to lock quotation.')
        setSavingPricing(false)
        await loadEnquiry({ silent: true })
        return
      }
      showToast('success', 'Quotation finalised and sent!')
    } else {
      showToast('success', 'Pricing saved.')
    }
    setSavingPricing(false)
    await loadEnquiry({ silent: true })
  }

  const handleDownloadMenu = (format: 'pdf' | 'excel' | 'word') => {
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
      includeSubItems: downloadIncludeSubItems,
    }
    if (format === 'excel') {
      import('@/lib/invoice-excel').then(m => m.downloadMenuExcel(payload))
    } else if (format === 'word') {
      import('@/lib/invoice-excel').then(m => m.downloadMenuWord(payload))
    } else {
      downloadMenu(payload)
    }
    setIsDownloadModalOpen(false)
  }

  const handleShareQuotation = () => {
    if (!enquiry) return
    const total = finalPrice > 0
      ? finalPrice
      : enquiry.dishes.reduce((s: number, d: any) => s + d.quantity * Number(d.pricePerPlate), 0) +
        enquiry.services.reduce((s: number, sv: any) => s + Number(sv.price), 0)
    const text = `*Quotation from CaterPro*\nQuotation No: ${enquiry.quotationNumber}\nEvent Date: ${new Date(enquiry.eventDate).toLocaleDateString()}\nGuests: ${enquiry.peopleCount}\nTotal: ₹${total.toLocaleString()}\n\nPlease let us know if you have any questions!`
    window.open(`https://wa.me/${enquiry.clientContact}?text=${encodeURIComponent(text)}`, '_blank')
  }

  const openReviseModal = (currentRevNum: number) => {
    setModal({
      title: `Start Revision ${currentRevNum + 1}?`,
      body: `The quotation will revert to Planning state, the quoted price will be cleared, and you'll be free to update the menu and pricing.`,
      confirmLabel: `Confirm → Rev. ${currentRevNum + 1}`,
      variant: 'violet',
      onConfirm: handleRevise,
      onCancel: () => setModal(null),
    })
  }

  const openConvertModal = () => {
    setModal({
      title: 'Convert to Event?',
      body: `This will confirm the enquiry and create a new event with all dishes, services, and pricing. This cannot be undone.`,
      confirmLabel: 'Confirm & Convert',
      variant: 'emerald',
      onConfirm: () => handleStatusUpdate('SUCCESS'),
      onCancel: () => setModal(null),
    })
  }

  const openLostModal = () => {
    setModal({
      title: 'Mark as Lost?',
      body: `This will close the enquiry as a lost deal. This action cannot be reversed.`,
      confirmLabel: 'Mark as Lost',
      variant: 'red',
      onConfirm: () => handleStatusUpdate('LOST'),
      onCancel: () => setModal(null),
    })
  }

  // ─── Status badge helpers ──────────────────────────────────────────────────

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':      return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-lg text-xs font-semibold border border-amber-200"><Clock className="w-3.5 h-3.5" />Planning</span>
      case 'SUCCESS':      return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-semibold border border-emerald-200"><CheckCircle className="w-3.5 h-3.5" />Confirmed</span>
      case 'PRICE_QUOTED': return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-semibold border border-indigo-200"><Lock className="w-3.5 h-3.5" />Price Quoted</span>
      case 'LOST':         return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 rounded-lg text-xs font-semibold border border-red-200"><XCircle className="w-3.5 h-3.5" />Lost</span>
      default: return null
    }
  }

  const getUpdateIcon = (updateType: string) => {
    switch (updateType) {
      case 'STATUS_CHANGE': return <CheckCircle className="w-4 h-4 text-indigo-500" />
      case 'NOTE_ADDED':    return <FileText className="w-4 h-4 text-slate-400" />
      case 'REVISION':      return <RotateCcw className="w-4 h-4 text-violet-500" />
      default:              return <Clock className="w-4 h-4 text-slate-400" />
    }
  }

  // ─── Loading state ─────────────────────────────────────────────────────────

  if (initialLoading) return (
    <PageLayout currentPath="/enquiries">
      <div className="min-h-screen bg-slate-50/50 flex items-center justify-center">
        <div className="flex items-center gap-2 text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading enquiry...
        </div>
      </div>
    </PageLayout>
  )

  if (!enquiry) return (
    <PageLayout currentPath="/enquiries">
      <div className="min-h-screen bg-slate-50/50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500 mb-4">Enquiry not found</p>
          <button onClick={() => router.push('/')} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-medium">Back to Home</button>
        </div>
      </div>
    </PageLayout>
  )

  const isTerminal = enquiry.status === 'SUCCESS' || enquiry.status === 'LOST'
  const isLocked   = enquiry.status === 'PRICE_QUOTED'
  const isEditable = enquiry.status === 'PENDING'
  const revisionNumber  = enquiry.revisionNumber || 1
  const dishesTotal     = enquiry.dishes.reduce((s: number, d: any) => s + d.quantity * (Number(d.pricePerPlate) || computeDishCost(d.dish)), 0)
  const servicesTotal   = enquiry.services.reduce((s: number, sv: any) => s + Number(sv.price), 0)
  const internalCostTotal = costItems.reduce((s: number, c: any) => s + Number(c.qty) * Number(c.rate), 0)
  const margin = finalPrice > 0 ? ((finalPrice - internalCostTotal) / finalPrice * 100) : 0
  const costBySec = COST_SECTIONS.reduce((acc, sec) => { acc[sec] = costItems.filter(c => c.section === sec); return acc }, {} as Record<string, any[]>)

  return (
    <PageLayout currentPath="/enquiries">
      {/* Refreshing bar */}
      {refreshing && (
        <div className="fixed top-0 left-0 right-0 z-[200] h-0.5 bg-indigo-500 animate-pulse" />
      )}

      <div className="min-h-screen bg-slate-50/50 pb-12">
        <div className="max-w-5xl mx-auto px-4 lg:px-8 py-8 lg:py-10 space-y-5">

          {/* ── Header ──────────────────────────────────────────────────────── */}
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-start gap-4">
              <button onClick={() => router.back()}
                className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors mt-1">
                <ArrowLeft className="w-5 h-5 text-slate-600" />
              </button>
              <div>
                <div className="flex items-center gap-3 mb-1 flex-wrap">
                  <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">{enquiry.quotationNumber}</h1>
                  {revisionNumber > 1 && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-violet-100 text-violet-700 text-xs font-bold rounded-lg border border-violet-200">
                      <RotateCcw className="w-3 h-3" />Rev. {revisionNumber}
                    </span>
                  )}
                  {getStatusBadge(enquiry.status)}
                </div>
                <p className="text-slate-500 text-sm">
                  Created {new Date(enquiry.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  {enquiry.createdBy && ` by ${enquiry.createdBy.name}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Occasion */}
              {isEditable
                ? <input type="text" placeholder="Occasion (e.g. NIKKAH)" value={occasion}
                    onChange={e => setOccasion(e.target.value)}
                    onBlur={async () => { await updateEnquiryDetails(id, { occasion: occasion ? [occasion] : undefined }) }}
                    className="px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-slate-900 focus:border-transparent w-44" />
                : occasion
                  ? <span className="px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-700 font-medium">{occasion}</span>
                  : null
              }
              {/* Service Type */}
              {isEditable
                ? <input type="text" placeholder="Service Type" value={serviceType}
                    onChange={e => setServiceType(e.target.value)}
                    onBlur={async () => { await updateEnquiryDetails(id, { serviceType: serviceType ? [serviceType] : undefined }) }}
                    className="px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-slate-900 focus:border-transparent w-36" />
                : serviceType
                  ? <span className="px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-700 font-medium">{serviceType}</span>
                  : null
              }
              <button onClick={() => setIsDownloadModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 transition-all">
                <Download className="w-4 h-4" /><span className="hidden sm:inline">Download</span>
              </button>
              <button onClick={handleShareQuotation}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 border border-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-all shadow-sm">
                <Share2 className="w-4 h-4" /><span className="hidden sm:inline">Share</span>
              </button>
            </div>
          </div>

          {/* ── Client Info ──────────────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-slate-100 rounded-lg mt-0.5"><Phone className="w-4 h-4 text-slate-500" /></div>
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Client</p>
                  <p className="font-semibold text-slate-900 text-sm">{enquiry.clientName}</p>
                  <p className="text-xs text-slate-600">{enquiry.clientContact}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-slate-100 rounded-lg mt-0.5"><MapPin className="w-4 h-4 text-slate-500" /></div>
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Venue</p>
                  <p className="font-semibold text-slate-900 text-sm">{enquiry.location}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-slate-100 rounded-lg mt-0.5"><Calendar className="w-4 h-4 text-slate-500" /></div>
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Date &amp; Time</p>
                  <p className="font-semibold text-slate-900 text-sm">{new Date(enquiry.eventDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                  <p className="text-xs text-slate-600">{enquiry.eventTime}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-slate-100 rounded-lg mt-0.5"><Users className="w-4 h-4 text-slate-500" /></div>
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Guests</p>
                  <p className="font-semibold text-slate-900 text-sm">{enquiry.peopleCount} people</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Status Stepper ──────────────────────────────────────────────── */}
          <StatusStepper status={enquiry.status} revisionNumber={revisionNumber} />

          {/* ── Main Workspace ──────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* LEFT: Tabbed workspace */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

                {/* Tab bar */}
                <div className="flex border-b border-slate-100 bg-slate-50/60">
                  {[
                    { key: 'menu',       label: 'Menu',       Icon: UtensilsCrossed },
                    { key: 'costing',    label: 'Costing',    Icon: Calculator },
                    { key: 'validation', label: 'Validation', Icon: Table2 },
                    { key: 'pricing',    label: 'Pricing',    Icon: DollarSign },
                    { key: 'history',    label: 'History',    Icon: History },
                  ].map(({ key, label, Icon }) => (
                    <button key={key} onClick={() => { setActiveTab(key as any); setEditingCell(null) }}
                      className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-3.5 text-xs sm:text-sm font-semibold transition-colors border-b-2 ${
                        activeTab === key
                          ? 'border-blue-600 text-blue-700 bg-white'
                          : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100/60'
                      }`}>
                      <Icon className="w-4 h-4" />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>

                <div className="p-5">

                  {/* ════════ MENU TAB ════════ */}
                  {activeTab === 'menu' && (
                    <div className="space-y-6">

                      {/* Dishes */}
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <UtensilsCrossed className="w-4 h-4 text-slate-500" />
                            <h2 className="text-base font-semibold text-slate-900">Dishes</h2>
                            <span className="text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md">{enquiry.dishes.length}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => setIsDownloadModalOpen(true)}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 bg-white hover:bg-slate-100 rounded-lg transition-colors border border-slate-200">
                              <Download className="w-3.5 h-3.5" />Download
                            </button>
                            {isLocked && (
                              <span className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg">
                                <Lock className="w-3 h-3" />Locked
                              </span>
                            )}
                            {isEditable && (
                              <button onClick={() => setIsAddingDish(!isAddingDish)}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-100">
                                <Plus className="w-3.5 h-3.5" />Add Dish
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Add dish form */}
                        {isAddingDish && (() => {
                          const allMapped = DISH_CATEGORIES.flatMap(c => c.dbCategories)
                          const activeCat = DISH_CATEGORIES.find(c => c.label === addDishCategory)!
                          const categoryDishes = activeCat.dbCategories.length === 0
                            ? allDishes.filter(d => !allMapped.includes(d.category))
                            : allDishes.filter(d => activeCat.dbCategories.includes(d.category))
                          const selectedDish = allDishes.find(d => d.id === newDishForm.dishId)
                          return (
                            <div className="mb-4 border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                              <div className="px-4 pt-3 pb-3 border-b border-slate-100 bg-slate-50/60">
                                <label className="text-xs font-semibold text-slate-500 mb-1.5 block uppercase tracking-wide">Category</label>
                                <select value={addDishCategory}
                                  onChange={e => { setAddDishCategory(e.target.value); setNewDishForm({ dishId: '', quantity: 1, pricePerPlate: 0 }) }}
                                  className="w-full px-3 py-2 text-sm font-medium text-slate-800 border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white appearance-none cursor-pointer">
                                  {DISH_CATEGORIES.map(cat => <option key={cat.label} value={cat.label}>{cat.label}</option>)}
                                </select>
                              </div>
                              <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-52 overflow-y-auto">
                                {categoryDishes.length === 0 ? (
                                  <p className="col-span-2 text-xs text-slate-400 text-center py-4">No dishes in this category.</p>
                                ) : categoryDishes.map((dish: any) => (
                                  <button key={dish.id}
                                    onClick={() => setNewDishForm({ dishId: dish.id, quantity: 1, pricePerPlate: computeDishCost(dish) })}
                                    className={`flex items-center justify-between p-2.5 rounded-lg text-left text-sm transition-colors border ${
                                      newDishForm.dishId === dish.id
                                        ? 'bg-blue-600 text-white border-blue-600'
                                        : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50'
                                    }`}>
                                    <span className="font-medium truncate">{dish.name}</span>
                                    <span className="text-xs opacity-75 ml-2 shrink-0">₹{computeDishCost(dish)} {dish.priceUnit || 'per plate'}</span>
                                  </button>
                                ))}
                              </div>
                              {newDishForm.dishId && (
                                <div className="px-3 pb-3 pt-2 border-t border-blue-100 flex flex-wrap gap-3 items-end bg-blue-50/40">
                                  <div className="w-24">
                                    <label className="text-xs font-semibold text-slate-500 mb-1 block">Quantity</label>
                                    <input type="number" min="1" value={newDishForm.quantity}
                                      onChange={e => setNewDishForm(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-500 bg-white" />
                                  </div>
                                  <div className="w-28">
                                    <label className="text-xs font-semibold text-slate-500 mb-1 block">Price / {(selectedDish?.priceUnit || 'per plate').replace('per ', '')}</label>
                                    <input type="number" value={newDishForm.pricePerPlate}
                                      onChange={e => setNewDishForm(prev => ({ ...prev, pricePerPlate: Number(e.target.value) }))}
                                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-500 bg-white" />
                                  </div>
                                  <button onClick={handleAddNewDish} disabled={newDishForm.quantity <= 0 || addingDish}
                                    className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-1.5">
                                    {addingDish && <Loader2 className="w-3.5 h-3.5 animate-spin" />}Add
                                  </button>
                                  <button onClick={() => { setIsAddingDish(false); setNewDishForm({ dishId: '', quantity: 1, pricePerPlate: 0 }) }}
                                    className="px-4 py-2 bg-slate-200 text-slate-700 text-sm font-bold rounded-lg hover:bg-slate-300 transition">Cancel</button>
                                </div>
                              )}
                            </div>
                          )
                        })()}

                        {enquiry.dishes.length > 0 ? (
                          <div className="space-y-2">
                            {enquiry.dishes.map((d: any) => {
                              const unitPrice = Number(d.pricePerPlate) || computeDishCost(d.dish)
                              const subtotal  = d.quantity * unitPrice
                              return (
                                <div key={d.id} className="flex flex-col p-3 border border-slate-100 rounded-xl bg-slate-50/50">
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                                    <div className="mb-2 sm:mb-0 flex items-start gap-2">
                                      {d.dish?.ingredients?.length > 0 && (
                                        <button onClick={() => setExpandedDishId(expandedDishId === d.id ? null : d.id)}
                                          className="mt-1 p-0.5 text-slate-400 hover:text-slate-600 rounded bg-slate-100 hover:bg-slate-200">
                                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={expandedDishId === d.id ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                                          </svg>
                                        </button>
                                      )}
                                      <div>
                                        <p className="font-semibold text-slate-900">{d.dish?.name || '—'}</p>
                                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                          {d.dish?.category && <span className="text-xs text-slate-500">{d.dish.category}</span>}
                                          {d.dish?.priceUnit && <span className="text-xs font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md">{d.dish.priceUnit}</span>}
                                          {isEditable && <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200">DRAFT</span>}
                                        </div>
                                      </div>
                                    </div>
                                    {editingDishId === d.id ? (
                                      <div className="flex items-center gap-2 bg-white p-2 border border-blue-200 rounded-lg shadow-sm">
                                        <input type="number" className="w-20 px-2 py-1 text-sm border border-slate-200 rounded outline-none focus:border-blue-500"
                                          value={editDishForm.quantity} onChange={e => setEditDishForm(prev => ({ ...prev, quantity: Number(e.target.value) }))} placeholder="Qty" />
                                        <span className="text-slate-400 text-sm">× ₹</span>
                                        <input type="number" className="w-24 px-2 py-1 text-sm border border-slate-200 rounded outline-none focus:border-blue-500"
                                          value={editDishForm.pricePerPlate} onChange={e => setEditDishForm(prev => ({ ...prev, pricePerPlate: Number(e.target.value) }))} placeholder="Price" />
                                        <button onClick={() => handleUpdateDish(d.id)} disabled={savingDishId === d.id}
                                          className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded hover:bg-blue-700 flex items-center gap-1 disabled:opacity-50">
                                          {savingDishId === d.id && <Loader2 className="w-3 h-3 animate-spin" />}Save
                                        </button>
                                        <button onClick={() => setEditingDishId(null)} className="px-3 py-1 bg-slate-200 text-slate-700 text-xs font-bold rounded hover:bg-slate-300">Cancel</button>
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-4">
                                        <div className="text-right">
                                          <p className="text-sm font-semibold text-slate-900">
                                            {d.quantity} {(d.dish?.priceUnit || 'per plate').replace('per ', '')} × ₹{unitPrice.toLocaleString()}
                                          </p>
                                          <p className="text-xs text-slate-500 font-medium">
                                            Subtotal: ₹{subtotal.toLocaleString()}
                                          </p>
                                        </div>
                                        {isEditable && (
                                          <div className="flex flex-col gap-1 border-l border-slate-200 pl-4">
                                            <button onClick={() => { setEditingDishId(d.id); setEditDishForm({ quantity: d.quantity, pricePerPlate: unitPrice }) }}
                                              className="text-[10px] uppercase font-bold text-blue-600 hover:underline">Edit</button>
                                            <button onClick={() => handleRemoveDish(d.id, d.dish?.name || 'this dish')}
                                              className="text-[10px] uppercase font-bold text-red-600 hover:underline">Remove</button>
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
                              )
                            })}
                          </div>
                        ) : (
                          <p className="text-slate-400 text-sm text-center py-6">No dishes added</p>
                        )}
                      </div>

                      {/* Services */}
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h2 className="text-base font-semibold text-slate-900">Services</h2>
                          {isEditable && (
                            <button onClick={() => setIsAddingService(!isAddingService)}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-100">
                              <Plus className="w-3.5 h-3.5" />Add Service
                            </button>
                          )}
                        </div>
                        {isAddingService && (
                          <div className="mb-4 p-4 bg-blue-50/50 border border-blue-100 rounded-xl flex flex-wrap gap-3 items-end">
                            <div className="flex-1 min-w-[200px]">
                              <label className="text-xs font-semibold text-slate-500 mb-1 block">Service Name</label>
                              <input type="text" placeholder="e.g. Waiters, DJ, Decoration"
                                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-500"
                                value={newServiceForm.serviceName} onChange={e => setNewServiceForm(prev => ({ ...prev, serviceName: e.target.value }))} />
                            </div>
                            <div className="w-32">
                              <label className="text-xs font-semibold text-slate-500 mb-1 block">Total Price</label>
                              <input type="number" className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-500"
                                value={newServiceForm.price} onChange={e => setNewServiceForm(prev => ({ ...prev, price: Number(e.target.value) }))} />
                            </div>
                            <button onClick={handleAddNewService} disabled={!newServiceForm.serviceName || addingService}
                              className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-1.5">
                              {addingService && <Loader2 className="w-3.5 h-3.5 animate-spin" />}Add
                            </button>
                          </div>
                        )}
                        {enquiry.services.length > 0 ? (
                          <div className="space-y-2">
                            {enquiry.services.map((s: any) => (
                              <div key={s.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border border-slate-100 rounded-xl bg-slate-50/50">
                                {editingServiceId === s.id ? (
                                  <div className="flex flex-wrap items-center gap-2 bg-white p-2 border border-blue-200 rounded-lg shadow-sm w-full">
                                    <input type="text" className="flex-1 min-w-[150px] px-2 py-1 text-sm border border-slate-200 rounded outline-none focus:border-blue-500"
                                      value={editServiceForm.serviceName} onChange={e => setEditServiceForm(prev => ({ ...prev, serviceName: e.target.value }))} />
                                    <span className="text-slate-400 text-sm">₹</span>
                                    <input type="number" className="w-24 px-2 py-1 text-sm border border-slate-200 rounded outline-none focus:border-blue-500"
                                      value={editServiceForm.price} onChange={e => setEditServiceForm(prev => ({ ...prev, price: Number(e.target.value) }))} />
                                    <button onClick={() => handleUpdateService(s.id)} disabled={savingServiceId === s.id}
                                      className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded hover:bg-blue-700 flex items-center gap-1 disabled:opacity-50">
                                      {savingServiceId === s.id && <Loader2 className="w-3 h-3 animate-spin" />}Save
                                    </button>
                                    <button onClick={() => setEditingServiceId(null)} className="px-3 py-1 bg-slate-200 text-slate-700 text-xs font-bold rounded hover:bg-slate-300">Cancel</button>
                                  </div>
                                ) : (
                                  <>
                                    <div className="mb-2 sm:mb-0">
                                      <p className="font-semibold text-slate-900">{s.serviceName}</p>
                                      {s.description && <p className="text-xs text-slate-500">{s.description}</p>}
                                    </div>
                                    <div className="flex items-center gap-4">
                                      <p className="text-sm font-semibold text-slate-900">₹{Number(s.price).toLocaleString()}</p>
                                      {isEditable && (
                                        <div className="flex flex-col gap-1 border-l border-slate-200 pl-4">
                                          <button onClick={() => { setEditingServiceId(s.id); setEditServiceForm({ serviceName: s.serviceName, price: Number(s.price) }) }}
                                            className="text-[10px] uppercase font-bold text-blue-600 hover:underline">Edit</button>
                                          <button onClick={() => handleRemoveService(s.id, s.serviceName)}
                                            className="text-[10px] uppercase font-bold text-red-600 hover:underline">Remove</button>
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

                      {/* Menu total */}
                      <div className="bg-slate-900 rounded-xl p-4 text-white flex justify-between items-center">
                        <span className="text-slate-300 font-medium">Menu Total</span>
                        <span className="text-2xl font-bold">₹{(dishesTotal + servicesTotal).toLocaleString()}</span>
                      </div>

                      {/* CTA to pricing if editable */}
                      {isEditable && enquiry.dishes.length > 0 && (
                        <button onClick={() => setActiveTab('pricing')}
                          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-xl text-sm font-semibold hover:bg-indigo-100 transition-all">
                          <DollarSign className="w-4 h-4" />Ready to price? Go to Pricing
                          <ChevronRight className="w-4 h-4 ml-auto" />
                        </button>
                      )}

                      {/* Converted Event link */}
                      {enquiry.status === 'SUCCESS' && enquiry.convertedEvent && (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <CalendarDays className="w-5 h-5 text-emerald-600" />
                            <div>
                              <p className="font-semibold text-emerald-900">Converted to Event</p>
                              <p className="text-sm text-emerald-700">{enquiry.convertedEvent.name}</p>
                            </div>
                          </div>
                          <button onClick={() => router.push(`/events/${enquiry.convertedEvent.id}`)}
                            className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700">View Event</button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ════════ COSTING TAB ════════ */}
                  {activeTab === 'costing' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-base font-semibold text-slate-900">Internal Costing Sheet</h2>
                          <p className="text-xs text-slate-500 mt-0.5">Manual cost breakdown — admin only</p>
                        </div>
                        {isEditable && (
                          <button onClick={() => setIsAddingCostItem(true)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-100">
                            <Plus className="w-3.5 h-3.5" />Add Item
                          </button>
                        )}
                        {isLocked && (
                          <span className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg">
                            <Lock className="w-3 h-3" />Locked
                          </span>
                        )}
                      </div>

                      {/* Add form */}
                      {isAddingCostItem && isEditable && (
                        <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl space-y-3">
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            <div>
                              <label className="text-xs font-semibold text-slate-500 mb-1 block">Section</label>
                              <select value={newCostItem.section} onChange={e => setNewCostItem(p => ({ ...p, section: e.target.value }))}
                                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-500 bg-white">
                                {COST_SECTIONS.map(s => <option key={s}>{s}</option>)}
                              </select>
                            </div>
                            <div className="sm:col-span-2">
                              <label className="text-xs font-semibold text-slate-500 mb-1 block">Item Name</label>
                              <input type="text" placeholder="e.g. Chicken, Rice, Plates..." value={newCostItem.itemName}
                                onChange={e => setNewCostItem(p => ({ ...p, itemName: e.target.value }))}
                                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-500 bg-white" />
                            </div>
                            <div>
                              <label className="text-xs font-semibold text-slate-500 mb-1 block">Qty</label>
                              <input type="number" min="0" value={newCostItem.qty} onChange={e => setNewCostItem(p => ({ ...p, qty: Number(e.target.value) }))}
                                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-500 bg-white" />
                            </div>
                            <div>
                              <label className="text-xs font-semibold text-slate-500 mb-1 block">Unit</label>
                              <input type="text" placeholder="kg, L, pcs..." value={newCostItem.unit}
                                onChange={e => setNewCostItem(p => ({ ...p, unit: e.target.value }))}
                                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-500 bg-white" />
                            </div>
                            <div>
                              <label className="text-xs font-semibold text-slate-500 mb-1 block">Rate (₹)</label>
                              <input type="number" min="0" value={newCostItem.rate} onChange={e => setNewCostItem(p => ({ ...p, rate: Number(e.target.value) }))}
                                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-500 bg-white" />
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-slate-700">Total: ₹{(newCostItem.qty * newCostItem.rate).toLocaleString()}</span>
                            <div className="flex gap-2">
                              <button onClick={() => { setIsAddingCostItem(false); setNewCostItem({ section: 'Grocery', itemName: '', qty: 1, unit: 'kg', rate: 0 }) }}
                                className="px-3 py-1.5 text-sm bg-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-300">Cancel</button>
                              <button onClick={handleAddCostItem} disabled={savingCost || !newCostItem.itemName}
                                className="px-4 py-1.5 text-sm bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1.5">
                                {savingCost && <Loader2 className="w-3.5 h-3.5 animate-spin" />}Save Item
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Cost items */}
                      {costItems.length === 0 && !isAddingCostItem ? (
                        <div className="text-center py-12 text-slate-400">
                          <Calculator className="w-10 h-10 mx-auto mb-3 opacity-30" />
                          <p className="text-sm">No cost items yet.{isEditable ? ' Click "Add Item" to start.' : ''}</p>
                        </div>
                      ) : (
                        <div className={`space-y-3 ${!isEditable && costItems.length > 0 ? 'opacity-75' : ''}`}>
                          {COST_SECTIONS.map(section => {
                            const items = costBySec[section]
                            if (!items || items.length === 0) return null
                            return (
                              <div key={section} className="border border-slate-200 rounded-xl overflow-hidden">
                                <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">{section}</span>
                                  <span className="text-xs text-slate-400">₹{items.reduce((s: number, i: any) => s + Number(i.qty) * Number(i.rate), 0).toLocaleString()}</span>
                                </div>
                                <div className="divide-y divide-slate-100">
                                  <div className="grid grid-cols-12 px-4 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wide bg-white">
                                    <div className="col-span-4">Item</div>
                                    <div className="col-span-2 text-right">Qty</div>
                                    <div className="col-span-1 text-center">Unit</div>
                                    <div className="col-span-2 text-right">Rate</div>
                                    <div className="col-span-2 text-right">Total</div>
                                    <div className="col-span-1"></div>
                                  </div>
                                  {items.map((item: any) => (
                                    <div key={item.id}>
                                      {editingCostId === item.id ? (
                                        <div className="p-3 bg-blue-50/40 space-y-2">
                                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                            <div className="col-span-2">
                                              <input type="text" value={editCostForm.itemName}
                                                onChange={e => setEditCostForm(p => ({ ...p, itemName: e.target.value }))}
                                                className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-500" placeholder="Item name" />
                                            </div>
                                            <div>
                                              <input type="number" value={editCostForm.qty}
                                                onChange={e => setEditCostForm(p => ({ ...p, qty: Number(e.target.value) }))}
                                                className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-500" placeholder="Qty" />
                                            </div>
                                            <div>
                                              <input type="text" value={editCostForm.unit}
                                                onChange={e => setEditCostForm(p => ({ ...p, unit: e.target.value }))}
                                                className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-500" placeholder="Unit" />
                                            </div>
                                            <div>
                                              <input type="number" value={editCostForm.rate}
                                                onChange={e => setEditCostForm(p => ({ ...p, rate: Number(e.target.value) }))}
                                                className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-500" placeholder="Rate ₹" />
                                            </div>
                                            <div>
                                              <select value={editCostForm.section} onChange={e => setEditCostForm(p => ({ ...p, section: e.target.value }))}
                                                className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-500 bg-white">
                                                {COST_SECTIONS.map(s => <option key={s}>{s}</option>)}
                                              </select>
                                            </div>
                                          </div>
                                          <div className="flex items-center justify-between">
                                            <span className="text-sm font-semibold text-slate-700">Total: ₹{(editCostForm.qty * editCostForm.rate).toLocaleString()}</span>
                                            <div className="flex gap-2">
                                              <button onClick={() => setEditingCostId(null)} className="px-3 py-1 text-xs bg-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-300">Cancel</button>
                                              <button onClick={() => handleUpdateCostItem(item.id)} disabled={savingCost}
                                                className="px-3 py-1 text-xs bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1">
                                                {savingCost && <Loader2 className="w-3 h-3 animate-spin" />}Save
                                              </button>
                                            </div>
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="grid grid-cols-12 px-4 py-2.5 items-center hover:bg-slate-50 transition-colors">
                                          <div className="col-span-4 font-medium text-slate-800 text-sm truncate">{item.itemName}</div>
                                          <div className="col-span-2 text-right text-sm text-slate-600">{Number(item.qty)}</div>
                                          <div className="col-span-1 text-center text-xs text-slate-500">{item.unit}</div>
                                          <div className="col-span-2 text-right text-sm text-slate-600">₹{Number(item.rate).toLocaleString()}</div>
                                          <div className="col-span-2 text-right text-sm font-semibold text-slate-800">₹{(Number(item.qty) * Number(item.rate)).toLocaleString()}</div>
                                          {isEditable ? (
                                            <div className="col-span-1 flex justify-end gap-1.5">
                                              <button onClick={() => { setEditingCostId(item.id); setEditCostForm({ section: item.section, itemName: item.itemName, qty: Number(item.qty), unit: item.unit, rate: Number(item.rate) }) }}
                                                className="text-xs text-blue-600 hover:underline font-bold">Edit</button>
                                              <button onClick={() => handleDeleteCostItem(item.id, item.itemName)} className="text-red-400 hover:text-red-600">
                                                <Trash2 className="w-3.5 h-3.5" />
                                              </button>
                                            </div>
                                          ) : <div className="col-span-1" />}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}

                      {costItems.length > 0 && (
                        <div className="flex justify-between items-center p-4 bg-slate-900 text-white rounded-xl">
                          <span className="font-semibold text-slate-300">Total Internal Cost</span>
                          <span className="text-2xl font-bold">₹{internalCostTotal.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ════════ VALIDATION TAB ════════ */}
                  {activeTab === 'validation' && (() => {
                    // Grocery CostItems (section='Grocery') — editable store
                    const groceryItems = costItems.filter((c: any) => c.section === 'Grocery')
                    const groceryTotal = groceryItems.reduce((s: number, i: any) => s + Number(i.qty) * Number(i.rate), 0)

                    // Derived from Menu dishes — used for auto-sync
                    const menuDerived = (() => {
                      const map = new Map<string, { itemName: string; qty: number; unit: string; rate: number }>()
                      for (const ed of enquiry.dishes) {
                        const plateCount = Number(ed.quantity) || 1
                        for (const ing of (ed.dish?.ingredients ?? [])) {
                          const scaledQty = Number(ing.quantity) * plateCount
                          const existing = map.get(ing.ingredientName)
                          if (existing) {
                            existing.qty += scaledQty
                          } else {
                            map.set(ing.ingredientName, {
                              itemName: ing.ingredientName,
                              qty: scaledQty,
                              unit: ing.unit ?? '',
                              rate: Number(ing.ingredient?.pricePerUnit ?? 0),
                            })
                          }
                        }
                      }
                      return Array.from(map.values())
                    })()

                    const handleSyncFromMenu = async () => {
                      if (menuDerived.length === 0) return
                      setRefreshing(true)
                      await syncGroceryFromMenu(id, menuDerived)
                      await loadEnquiry({ silent: true })
                    }

                    // Editable cell (reuses shared editingCell / cellValue state)
                    const Cell = ({ value, display, costId, field, numeric, cls }: {
                      value: string | number; display?: string
                      costId: string; field: string; numeric?: boolean; cls?: string
                    }) => {
                      const active = editingCell?.id === costId && editingCell?.field === field
                      return active ? (
                        <input autoFocus type={numeric ? 'number' : 'text'} value={cellValue}
                          onChange={e => setCellValue(e.target.value)}
                          onBlur={() => handleCostCellSave(costId, field)}
                          onKeyDown={e => handleCellKeyDown(e, 'cost', costId, field)}
                          className={`w-full h-full min-h-[38px] px-2 py-1.5 text-sm outline-none bg-emerald-50 border-2 border-emerald-500 rounded focus:ring-0 ${cls ?? ''}`}
                        />
                      ) : (
                        <div
                          onClick={() => isEditable ? startCellEdit('cost', costId, field, value) : undefined}
                          title={isEditable ? 'Click to edit' : undefined}
                          className={`min-h-[38px] flex items-center px-2 py-1.5 text-sm
                            ${isEditable ? 'cursor-pointer hover:bg-emerald-50 hover:text-emerald-700 transition-colors' : 'cursor-default'}
                            ${cls ?? ''}`}>
                          {display ?? value}
                        </div>
                      )
                    }

                    const fmtQty = (qty: number) =>
                      qty % 1 === 0 ? qty.toString() : qty < 0.01 ? qty.toFixed(4) : qty.toFixed(3).replace(/\.?0+$/, '')

                    const BillSheet = () => (
                      <div className="space-y-4">
                        {/* ── Document header ── */}
                        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                          <div className="bg-slate-900 text-white text-center py-3 px-4">
                            <p className="text-base sm:text-lg font-bold tracking-wide uppercase">Ingredient Validation Sheet</p>
                            <p className="text-xs text-slate-400 mt-0.5">{enquiry.quotationNumber}</p>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y divide-slate-100 border-t border-slate-200">
                            <div className="px-4 py-3">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Client</p>
                              <p className="text-sm font-semibold text-slate-800 truncate">{enquiry.clientName}</p>
                            </div>
                            <div className="px-4 py-3">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Event Date</p>
                              <p className="text-sm font-semibold text-slate-800">
                                {new Date(enquiry.eventDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </p>
                            </div>
                            <div className="px-4 py-3">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">NO OF Guests</p>
                              <p className="text-sm font-bold text-slate-800">{enquiry.peopleCount}</p>
                            </div>
                            <div className="px-4 py-3">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Items</p>
                              <p className="text-sm font-bold text-slate-800">{groceryItems.length}</p>
                            </div>
                          </div>
                        </div>

                        {/* ── Table or empty state ── */}
                        {groceryItems.length === 0 ? (
                          <div className="border-2 border-dashed border-slate-200 rounded-xl py-16 text-center space-y-3">
                            <UtensilsCrossed className="w-10 h-10 text-slate-300 mx-auto" />
                            <p className="text-sm font-semibold text-slate-500">No grocery items yet</p>
                            {menuDerived.length > 0 ? (
                              <button onClick={handleSyncFromMenu}
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors">
                                <RefreshCw className="w-4 h-4" />Sync {menuDerived.length} ingredients from Menu
                              </button>
                            ) : (
                              <p className="text-xs text-slate-400">Add dishes with ingredients in the <strong>Menu</strong> tab first</p>
                            )}
                          </div>
                        ) : (
                          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                            <div className="overflow-x-auto">
                              <div className="min-w-[560px]">
                                {/* Column headers */}
                                <div className="flex bg-slate-800 text-white text-xs font-bold uppercase tracking-wide sticky top-0 z-10">
                                  <div className="w-11 shrink-0 px-3 py-3 border-r border-slate-700 text-center">Sl</div>
                                  <div className="flex-1 min-w-[150px] px-3 py-3 border-r border-slate-700">Particular Names</div>
                                  <div className="w-24 shrink-0 px-2 py-3 border-r border-slate-700 text-center">Qty</div>
                                  <div className="w-20 shrink-0 px-2 py-3 border-r border-slate-700 text-center hidden sm:block">Unit</div>
                                  <div className="w-28 shrink-0 px-2 py-3 border-r border-slate-700 text-right">Rate (₹)</div>
                                  <div className="w-28 shrink-0 px-3 py-3 text-right">Amount (₹)</div>
                                </div>

                                {/* Section banner */}
                                <div className="flex items-center justify-between bg-emerald-700 text-white px-4 py-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-black">A</span>
                                    <span className="w-px h-3 bg-emerald-500" />
                                    <span className="text-xs font-bold uppercase tracking-widest">Grocery</span>
                                    <span className="text-[10px] text-emerald-300">{groceryItems.length} items</span>
                                  </div>
                                  <span className="text-xs font-bold">{groceryTotal > 0 ? `₹${Math.round(groceryTotal).toLocaleString()}` : '—'}</span>
                                </div>

                                {/* Editable data rows */}
                                {groceryItems.map((item: any, i: number) => {
                                  const amount = Number(item.qty) * Number(item.rate)
                                  const isEven = i % 2 === 0
                                  return (
                                    <div key={item.id}
                                      className={`flex border-t border-slate-100 ${isEven ? 'bg-white' : 'bg-slate-50/50'}`}>
                                      <div className="w-11 shrink-0 px-2 flex items-center justify-center border-r border-slate-100 text-xs text-slate-400 font-mono">{i + 1}</div>
                                      <div className="flex-1 min-w-[150px] border-r border-slate-100">
                                        <Cell value={item.itemName} costId={item.id} field="itemName" cls="font-medium text-slate-800 w-full" />
                                      </div>
                                      <div className="w-24 shrink-0 border-r border-slate-100">
                                        <Cell value={Number(item.qty)} display={fmtQty(Number(item.qty))} costId={item.id} field="qty" numeric cls="text-center font-mono text-slate-700 w-full" />
                                      </div>
                                      <div className="w-20 shrink-0 border-r border-slate-100 hidden sm:block">
                                        <Cell value={item.unit} costId={item.id} field="unit" cls="text-center text-slate-500 w-full" />
                                      </div>
                                      <div className="w-28 shrink-0 border-r border-slate-100">
                                        <Cell value={Number(item.rate)} display={`₹${Number(item.rate).toLocaleString()}`} costId={item.id} field="rate" numeric cls="text-right font-mono text-slate-700 w-full" />
                                      </div>
                                      <div className="w-28 shrink-0 px-3 flex items-center justify-end">
                                        <span className={`text-sm font-semibold whitespace-nowrap ${amount > 0 ? 'text-slate-800' : 'text-slate-300'}`}>
                                          {amount > 0 ? `₹${Math.round(amount).toLocaleString()}` : '—'}
                                        </span>
                                      </div>
                                    </div>
                                  )
                                })}

                                {/* Total row */}
                                <div className="flex border-t-2 border-emerald-200 bg-emerald-50">
                                  <div className="w-11 shrink-0 px-2 py-3 border-r border-emerald-200 flex items-center justify-center">
                                    <span className="text-xs font-black text-emerald-700">A</span>
                                  </div>
                                  <div className="flex-1 min-w-[150px] border-r border-emerald-200 px-3 py-3 flex items-center">
                                    <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide">Total Grocery</span>
                                  </div>
                                  <div className="w-24 shrink-0 border-r border-emerald-200" />
                                  <div className="w-20 shrink-0 border-r border-emerald-200 hidden sm:block" />
                                  <div className="w-28 shrink-0 border-r border-emerald-200" />
                                  <div className="w-28 shrink-0 px-3 py-3 flex items-center justify-end">
                                    <span className="text-sm font-bold text-emerald-800">{groceryTotal > 0 ? `₹${Math.round(groceryTotal).toLocaleString()}` : '—'}</span>
                                  </div>
                                </div>

                                {/* Bill Value row */}
                                <div className="flex bg-slate-900 text-white border-t border-slate-700">
                                  <div className="w-11 shrink-0 px-2 py-3 border-r border-slate-700 flex items-center justify-center">
                                    <span className="text-xs font-black">I</span>
                                  </div>
                                  <div className="flex-1 px-3 py-3 flex items-center">
                                    <span className="text-sm font-bold uppercase tracking-wide">Bill Value</span>
                                  </div>
                                  <div className="w-28 shrink-0 px-3 py-3 flex items-center justify-end">
                                    <span className="text-sm font-bold">{groceryTotal > 0 ? `₹${Math.round(groceryTotal).toLocaleString()}` : '—'}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {isEditable && groceryItems.length > 0 && (
                          <p className="text-xs text-slate-400 text-center">
                            Click <span className="font-semibold text-emerald-600">Name</span>, <span className="font-semibold text-emerald-600">Qty</span>, <span className="font-semibold text-emerald-600">Unit</span> or <span className="font-semibold text-emerald-600">Rate</span> to edit · <kbd className="px-1 py-0.5 bg-slate-100 rounded text-[10px] font-mono">Enter</kbd> save · <kbd className="px-1 py-0.5 bg-slate-100 rounded text-[10px] font-mono">Esc</kbd> cancel
                          </p>
                        )}
                        {isLocked && (
                          <p className="text-xs text-indigo-500 text-center flex items-center justify-center gap-1">
                            <Lock className="w-3 h-3" />Quotation is locked — use Revise Quotation to edit
                          </p>
                        )}
                      </div>
                    )

                    return (
                      <>
                        <div>
                          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Table2 className="w-4 h-4 text-emerald-600" />
                              <h2 className="text-base font-semibold text-slate-900">Ingredient Validation</h2>
                              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">Grocery Sheet</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {menuDerived.length > 0 && (
                                <button onClick={handleSyncFromMenu}
                                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors">
                                  <RefreshCw className="w-3.5 h-3.5" />
                                  <span className="hidden sm:inline">Re-sync from Menu</span>
                                  <span className="sm:hidden">Sync</span>
                                </button>
                              )}
                              <button onClick={() => setIsValidationMaximized(true)}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-colors">
                                <Maximize2 className="w-3.5 h-3.5" />Expand
                              </button>
                            </div>
                          </div>
                          <BillSheet />
                        </div>

                        {/* ── Fullscreen modal ── */}
                        {isValidationMaximized && (
                          <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-[2px] flex flex-col">
                            <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-white border-b border-slate-200 shrink-0 shadow-sm">
                              <div className="flex items-center gap-3 min-w-0">
                                <Table2 className="w-5 h-5 text-emerald-600 shrink-0" />
                                <div className="min-w-0">
                                  <h2 className="text-base font-bold text-slate-900 truncate">Ingredient Validation Sheet</h2>
                                  <p className="text-xs text-slate-500 truncate">{enquiry.quotationNumber} · {enquiry.clientName} · {enquiry.peopleCount} guests</p>
                                </div>
                                {isEditable && groceryItems.length > 0 && (
                                  <span className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-lg whitespace-nowrap hidden md:inline">
                                    Click any cell to edit
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 shrink-0 ml-3">
                                {menuDerived.length > 0 && (
                                  <button onClick={handleSyncFromMenu}
                                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors">
                                    <RefreshCw className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">Re-sync</span>
                                  </button>
                                )}
                                <button onClick={() => setIsValidationMaximized(false)}
                                  className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-200 transition-colors">
                                  <Minimize2 className="w-4 h-4" />
                                  <span className="hidden sm:inline">Close</span>
                                </button>
                              </div>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-50">
                              <div className="max-w-4xl mx-auto">
                                <BillSheet />
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )
                  })()}

                  {/* ════════ PRICING TAB ════════ */}
                  {activeTab === 'pricing' && (
                    <div className="space-y-5">
                      <div>
                        <h2 className="text-base font-semibold text-slate-900">Pricing</h2>
                        <p className="text-xs text-slate-500 mt-0.5">Set the final selling price to quote the client</p>
                      </div>

                      {/* Internal cost */}
                      <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
                        <div>
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Internal Cost</p>
                          <p className="text-xs text-slate-400 mt-0.5">From Costing sheet</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-slate-800">₹{internalCostTotal.toLocaleString()}</p>
                          {internalCostTotal === 0 && <p className="text-xs text-amber-500 mt-0.5">No items in Costing tab yet</p>}
                        </div>
                      </div>

                      {/* Menu total reference */}
                      {(dishesTotal + servicesTotal) > 0 && (
                        <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-100 rounded-xl">
                          <div>
                            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Calculated from Menu</p>
                            <p className="text-xs text-blue-400 mt-0.5">Dishes + Services total</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <p className="text-xl font-bold text-blue-800">₹{(dishesTotal + servicesTotal).toLocaleString()}</p>
                            {finalPrice !== dishesTotal + servicesTotal && isEditable && (
                              <button type="button" onClick={() => setFinalPrice(dishesTotal + servicesTotal)}
                                className="text-xs font-semibold text-blue-600 bg-white border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors whitespace-nowrap">
                                Use ↑
                              </button>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Price inputs */}
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Final Selling Price (₹)</label>
                          {isEditable
                            ? <input type="number" min="0" value={finalPrice} onChange={e => setFinalPrice(Number(e.target.value))}
                                className="w-full px-4 py-3 text-lg font-semibold border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="0" />
                            : <div className="px-4 py-3 text-lg font-semibold border border-slate-200 rounded-xl bg-slate-50 text-slate-700">₹{finalPrice.toLocaleString()}</div>
                          }
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Advance Amount (₹)</label>
                          {isEditable
                            ? <input type="number" min="0" value={advanceAmount} onChange={e => setAdvanceAmount(Number(e.target.value))}
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="0" />
                            : <div className="px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-700">₹{advanceAmount.toLocaleString()}</div>
                          }
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Payment Terms</label>
                          {isEditable
                            ? <input type="text" value={paymentTerms} onChange={e => setPaymentTerms(e.target.value)}
                                placeholder="e.g. 50% advance, balance on event day"
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm" />
                            : <div className="px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-700 text-sm">{paymentTerms || '—'}</div>
                          }
                        </div>
                      </div>

                      {/* Margin summary */}
                      {finalPrice > 0 && (
                        <div className="grid grid-cols-3 gap-3">
                          <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-center">
                            <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wide">Selling</p>
                            <p className="text-base font-bold text-emerald-800 mt-1">₹{finalPrice.toLocaleString()}</p>
                          </div>
                          <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-center">
                            <p className="text-xs text-red-600 font-semibold uppercase tracking-wide">Cost</p>
                            <p className="text-base font-bold text-red-800 mt-1">₹{internalCostTotal.toLocaleString()}</p>
                          </div>
                          <div className={`p-3 border rounded-xl text-center ${margin >= 20 ? 'bg-blue-50 border-blue-100' : 'bg-amber-50 border-amber-100'}`}>
                            <p className={`text-xs font-semibold uppercase tracking-wide ${margin >= 20 ? 'text-blue-600' : 'text-amber-600'}`}>Margin</p>
                            <p className={`text-base font-bold mt-1 ${margin >= 20 ? 'text-blue-800' : 'text-amber-800'}`}>{margin.toFixed(1)}%</p>
                          </div>
                        </div>
                      )}

                      {isEditable && (
                        <button onClick={handleSavePricing} disabled={savingPricing || finalPrice <= 0}
                          className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed">
                          {savingPricing
                            ? <><Loader2 className="w-5 h-5 animate-spin" />Saving...</>
                            : <><CheckCircle className="w-5 h-5" />Finalise &amp; Send Quotation{revisionNumber > 1 ? ` (Rev. ${revisionNumber})` : ''}</>
                          }
                        </button>
                      )}

                      {isLocked && (
                        <div className="flex items-center gap-2 p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-sm text-indigo-700">
                          <Lock className="w-4 h-4 shrink-0" />
                          Pricing is locked. Use <strong>Revise Quotation</strong> in the sidebar to make changes.
                        </div>
                      )}
                    </div>
                  )}

                  {/* ════════ HISTORY TAB ════════ */}
                  {activeTab === 'history' && (() => {
                    const sortedUpdates = [...(enquiry.updates || [])].sort(
                      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                    )
                    type RevGroup = { revNum: number; title: string; updates: any[]; isCurrent: boolean }
                    const groups: RevGroup[] = []
                    let cur: RevGroup = { revNum: 1, title: 'Quotation — Rev. 1', updates: [], isCurrent: false }
                    for (const upd of sortedUpdates) {
                      if (upd.updateType === 'REVISION') {
                        groups.push(cur)
                        const match = upd.description.match(/Revision (\d+)/)
                        const newNum = match ? parseInt(match[1]) : cur.revNum + 1
                        cur = { revNum: newNum, title: `Revision — Rev. ${newNum}`, updates: [upd], isCurrent: false }
                      } else {
                        cur.updates.push(upd)
                      }
                    }
                    cur.isCurrent = !isTerminal
                    groups.push(cur)

                    return (
                      <div className="space-y-5">
                        {groups.length === 0 || (groups.length === 1 && groups[0].updates.length === 0) ? (
                          <p className="text-slate-400 text-sm text-center py-4">No activity yet</p>
                        ) : (
                          [...groups].reverse().map((group) => (
                            <div key={group.revNum} className="space-y-1">
                              <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider ${
                                group.revNum === 1
                                  ? 'bg-slate-100 text-slate-500'
                                  : group.isCurrent
                                    ? 'bg-violet-100 text-violet-700 border border-violet-200'
                                    : 'bg-violet-50 text-violet-500 border border-violet-100'
                              }`}>
                                {group.revNum > 1 ? <RotateCcw className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
                                {group.title}
                                {group.isCurrent && (
                                  <span className="ml-auto text-[10px] bg-violet-600 text-white px-1.5 py-0.5 rounded-md">Current</span>
                                )}
                              </div>
                              {group.updates.length === 0 ? (
                                <p className="text-xs text-slate-400 pl-4 py-2">No activity in this revision</p>
                              ) : (
                                <div className="pl-3 border-l-2 border-slate-100 ml-3 space-y-3 pt-2 pb-1">
                                  {[...group.updates].reverse().map((update: any) => (
                                    <div key={update.id} className="flex items-start gap-3">
                                      <div className={`mt-0.5 p-1.5 rounded-lg shrink-0 ${update.updateType === 'REVISION' ? 'bg-violet-100' : 'bg-slate-100'}`}>
                                        {getUpdateIcon(update.updateType)}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className={`text-sm ${update.updateType === 'REVISION' ? 'font-semibold text-violet-800' : 'text-slate-700'}`}>
                                          {update.description}
                                        </p>
                                        {(update.oldValue || update.newValue) && (
                                          <p className="text-xs text-slate-400 mt-0.5">
                                            {update.oldValue && <span className="line-through mr-1">{update.oldValue}</span>}
                                            {update.newValue && <span className="text-indigo-600 font-medium">{update.newValue}</span>}
                                          </p>
                                        )}
                                        <p className="text-xs text-slate-400 mt-0.5">
                                          {new Date(update.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    )
                  })()}

                </div>
              </div>
            </div>

            {/* RIGHT: Sidebar */}
            <div className="space-y-4">

              {/* Actions card */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Actions</h2>

                {/* PENDING */}
                {enquiry.status === 'PENDING' && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl mb-3">
                      <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-amber-700">Planning{revisionNumber > 1 ? ` · Rev. ${revisionNumber}` : ''}</p>
                        <p className="text-xs text-amber-600 mt-0.5">Edit menu, costing &amp; pricing freely</p>
                      </div>
                    </div>
                    <button onClick={() => setActiveTab('pricing')}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all shadow-sm">
                      <DollarSign className="w-4 h-4" />Go to Pricing &amp; Quote
                    </button>
                    <button onClick={openLostModal} disabled={updating}
                      className="w-full flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 disabled:opacity-50 transition-all">
                      <XCircle className="w-4 h-4" />Mark as Lost
                    </button>
                  </div>
                )}

                {/* PRICE_QUOTED */}
                {enquiry.status === 'PRICE_QUOTED' && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 p-3 bg-indigo-50 border border-indigo-200 rounded-xl mb-3">
                      <Lock className="w-4 h-4 text-indigo-600 shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-indigo-700">Quotation Sent</p>
                        <p className="text-xs text-indigo-500 mt-0.5">Awaiting client decision</p>
                      </div>
                    </div>
                    <button onClick={openConvertModal} disabled={updating}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-all shadow-sm disabled:opacity-50">
                      {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                      Confirm &amp; Convert to Event
                    </button>
                    <button onClick={() => openReviseModal(revisionNumber)} disabled={revising}
                      className="w-full flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold bg-violet-50 text-violet-700 hover:bg-violet-100 border border-violet-200 disabled:opacity-50 transition-all">
                      {revising ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                      Revise Quotation
                      <span className="ml-auto text-xs opacity-60">→ Rev. {revisionNumber + 1}</span>
                    </button>
                    <button onClick={openLostModal} disabled={updating}
                      className="w-full flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 disabled:opacity-50 transition-all">
                      <XCircle className="w-4 h-4" />Mark as Lost
                    </button>
                  </div>
                )}

                {/* SUCCESS */}
                {enquiry.status === 'SUCCESS' && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                    <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-emerald-700">Confirmed</p>
                    {enquiry.convertedEvent && (
                      <button onClick={() => router.push(`/events/${enquiry.convertedEvent.id}`)}
                        className="mt-2 inline-flex items-center gap-1 text-xs text-emerald-600 underline hover:text-emerald-800">
                        View Event →
                      </button>
                    )}
                  </div>
                )}

                {/* LOST */}
                {enquiry.status === 'LOST' && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-center">
                    <XCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-red-600">Lost</p>
                    <p className="text-xs text-red-400 mt-1">This enquiry is closed</p>
                  </div>
                )}
              </div>

              {/* Summary card */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Summary</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Menu Total</span>
                    <span className="font-semibold">₹{(dishesTotal + servicesTotal).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Internal Cost</span>
                    <span className="font-semibold">₹{internalCostTotal.toLocaleString()}</span>
                  </div>
                  {finalPrice > 0 && (
                    <>
                      <div className="flex justify-between border-t border-slate-100 pt-2 mt-2">
                        <span className="text-slate-700 font-semibold">Quoted Price</span>
                        <span className="font-bold text-indigo-700">₹{finalPrice.toLocaleString()}</span>
                      </div>
                      {advanceAmount > 0 && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">Advance</span>
                          <span className="font-semibold text-emerald-600">₹{advanceAmount.toLocaleString()}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Add Note card */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Add Note</h2>
                <textarea value={noteInput} onChange={e => setNoteInput(e.target.value)}
                  placeholder="Add a note or update..." rows={3}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-slate-900 focus:border-transparent resize-none" />
                <button onClick={handleAddNote} disabled={addingNote || !noteInput.trim()}
                  className="mt-2 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-50">
                  {addingNote ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {addingNote ? 'Adding...' : 'Add Note'}
                </button>
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
              <button onClick={() => setIsDownloadModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-5">
              <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50">
                <input type="checkbox" checked={downloadIncludeSubItems} onChange={e => setDownloadIncludeSubItems(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300" />
                <div>
                  <span className="text-sm font-semibold text-slate-900">Include Sub-items</span>
                  <p className="text-xs text-slate-500">List dish ingredients on the document</p>
                </div>
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button onClick={() => handleDownloadMenu('pdf')}
                  className="flex flex-col items-center justify-center gap-2 p-4 border-2 border-slate-200 hover:border-red-500 hover:bg-red-50 rounded-xl transition-all group">
                  <FileText className="w-7 h-7 text-slate-400 group-hover:text-red-500" />
                  <span className="text-xs font-semibold text-slate-700 group-hover:text-red-600">PDF</span>
                </button>
                <button onClick={() => handleDownloadMenu('word')}
                  className="flex flex-col items-center justify-center gap-2 p-4 border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50 rounded-xl transition-all group">
                  <svg className="w-7 h-7 text-slate-400 group-hover:text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM13 3.5L18.5 9H13V3.5zM7 13h2.5l1 3.5 1-3.5H14l-2 5H9.5L7 13z"/>
                  </svg>
                  <span className="text-xs font-semibold text-slate-700 group-hover:text-blue-600">Word (.doc)</span>
                </button>
                <button onClick={() => handleDownloadMenu('excel')}
                  className="flex flex-col items-center justify-center gap-2 p-4 border-2 border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 rounded-xl transition-all group">
                  <svg className="w-7 h-7 text-slate-400 group-hover:text-emerald-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM13 3.5L18.5 9H13V3.5zM10.15 15.68l-1.92-2.61-1.85 2.61H4.8l2.92-3.8-2.73-3.6h1.61l1.73 2.4 1.7-2.4h1.57l-2.67 3.65 2.85 3.75h-1.63z" />
                  </svg>
                  <span className="text-xs font-semibold text-slate-700 group-hover:text-emerald-600">Excel (XLSX)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {modal && <ConfirmModal {...modal} />}

      {/* Toast Stack */}
      <ToastStack toasts={toasts} onDismiss={dismissToast} />

    </PageLayout>
  )
}
