'use client'

import { FileText, Sparkles, Loader2, ChevronDown } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { getEventForInvoice, createInvoice, getInvoiceByEvent } from '@/lib/actions/invoices'
import { downloadInvoice } from '@/lib/invoice-pdf'

interface InvoiceDownloadButtonProps {
  eventId: string
  eventName: string
  className?: string
}

export default function InvoiceDownloadButton({
  eventId,
  className = '',
}: InvoiceDownloadButtonProps) {
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleDownload = async (type: 'standard' | 'pro') => {
    setOpen(false)
    setLoading(true)
    try {
      const existingResult = await getInvoiceByEvent(eventId)
      let invoiceData

      if (existingResult.success && existingResult.data) {
        invoiceData = existingResult.data
      } else {
        const createResult = await createInvoice(eventId)
        if (!createResult.success) {
          alert('Failed to create invoice: ' + createResult.error)
          return
        }
        const fetchResult = await getInvoiceByEvent(eventId)
        if (!fetchResult.success || !fetchResult.data) {
          alert('Failed to fetch invoice data')
          return
        }
        invoiceData = fetchResult.data
      }

      downloadInvoice(invoiceData, type)
    } catch (error) {
      console.error('Failed to download invoice:', error)
      alert('Failed to download invoice. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div ref={ref} className={`relative inline-flex ${className}`}>
      {/* Main button */}
      <button
        onClick={() => handleDownload('standard')}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-l-xl hover:bg-slate-800 transition-colors disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <FileText className="h-4 w-4" />
        )}
        {loading ? 'Generating...' : 'Invoice'}
      </button>

      {/* Dropdown toggle */}
      <button
        onClick={() => setOpen(v => !v)}
        disabled={loading}
        className="flex items-center px-2 py-2 bg-slate-800 text-white rounded-r-xl border-l border-slate-700 hover:bg-slate-700 transition-colors disabled:opacity-50"
        title="Choose invoice format"
      >
        <ChevronDown className="h-3.5 w-3.5" />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50">
          <button
            onClick={() => handleDownload('standard')}
            className="w-full flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left"
          >
            <FileText className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-slate-900">Standard</p>
              <p className="text-xs text-slate-500">Clean, minimal layout</p>
            </div>
          </button>
          <div className="h-px bg-slate-100" />
          <button
            onClick={() => handleDownload('pro')}
            className="w-full flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left"
          >
            <Sparkles className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-slate-900">Pro</p>
              <p className="text-xs text-slate-500">Branded, premium design</p>
            </div>
          </button>
        </div>
      )}
    </div>
  )
}
