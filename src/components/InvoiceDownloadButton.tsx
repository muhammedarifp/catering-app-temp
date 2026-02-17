'use client'

import { Download, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { getEventForInvoice, createInvoice, getInvoiceByEvent } from '@/lib/actions/invoices'
import { downloadInvoice } from '@/lib/invoice-pdf'

interface InvoiceDownloadButtonProps {
  eventId: string
  eventName: string
  className?: string
}

export default function InvoiceDownloadButton({
  eventId,
  eventName,
  className = '',
}: InvoiceDownloadButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleDownload = async () => {
    setLoading(true)
    try {
      // First check if invoice exists
      const existingInvoiceResult = await getInvoiceByEvent(eventId)
      let invoiceData

      if (existingInvoiceResult.success && existingInvoiceResult.data) {
        // Use existing invoice
        invoiceData = existingInvoiceResult.data
      } else {
        // Create new invoice
        const createResult = await createInvoice(eventId)
        if (!createResult.success) {
          alert('Failed to create invoice: ' + createResult.error)
          return
        }

        // Fetch the newly created invoice with all details
        const fetchResult = await getInvoiceByEvent(eventId)
        if (!fetchResult.success || !fetchResult.data) {
          alert('Failed to fetch invoice data')
          return
        }
        invoiceData = fetchResult.data
      }

      // Generate and download PDF
      downloadInvoice(invoiceData)
    } catch (error) {
      console.error('Failed to download invoice:', error)
      alert('Failed to download invoice. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className={`flex items-center gap-2 ${className}`}
      title="Download Invoice"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      {loading ? 'Generating...' : 'Download Invoice'}
    </button>
  )
}
