'use client'

import { useState } from 'react'
import { FileText, Eye, CheckCircle, XCircle, Clock } from 'lucide-react'

interface Enquiry {
  id: string
  quotationNumber: string
  clientName: string
  clientContact: string
  eventDate: Date
  status: 'PENDING' | 'LOST' | 'SUCCESS'
  totalAmount: number
  createdAt: Date
}

interface EnquiriesListProps {
  enquiries: Enquiry[]
  onViewDetails: (id: string) => void
}

export default function EnquiriesList({ enquiries, onViewDetails }: EnquiriesListProps) {
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

  if (enquiries.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-500">No enquiries found</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {enquiries.map((enquiry) => (
        <div
          key={enquiry.id}
          className="p-5 bg-white border border-slate-200 rounded-2xl hover:shadow-md transition-all cursor-pointer group"
          onClick={() => onViewDetails(enquiry.id)}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-slate-100 rounded-xl group-hover:bg-slate-900 group-hover:text-white transition-colors">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 text-lg">{enquiry.quotationNumber}</h3>
                <p className="text-sm text-slate-500">{enquiry.clientName}</p>
              </div>
            </div>
            {getStatusBadge(enquiry.status)}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t border-slate-100">
            <div>
              <p className="text-xs text-slate-500 mb-1">Event Date</p>
              <p className="text-sm font-medium text-slate-900">
                {new Date(enquiry.eventDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Contact</p>
              <p className="text-sm font-medium text-slate-900">{enquiry.clientContact}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Amount</p>
              <p className="text-sm font-semibold text-slate-900">
                ₹{Number(enquiry.totalAmount).toLocaleString()}
              </p>
            </div>
            <div className="flex items-end justify-end">
              <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                <Eye className="w-4 h-4" />
                View Details
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
