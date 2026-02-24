'use client'

import { FileText, Eye, Clock, CheckCircle2, XCircle, ArrowRight, CircleDashed } from 'lucide-react'

// Extended interface assuming backend can return more activity-like data
interface Enquiry {
  id: string
  quotationNumber: string
  clientName: string
  clientContact: string
  eventDate: Date
  status: 'PENDING' | 'PRICE_QUOTED' | 'LOST' | 'SUCCESS'
  totalAmount: number
  createdAt: Date
  updatedAt?: Date
}

interface EnquiriesListProps {
  enquiries: Enquiry[]
  onViewDetails: (id: string) => void
}

function timeAgo(dateIn: Date | string) {
  const date = new Date(dateIn);
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " mins ago";
  return "just now";
}

const PipelineStep = ({
  active,
  completed,
  error,
  label
}: {
  active: boolean,
  completed: boolean,
  error?: boolean,
  label: string
}) => {
  return (
    <div className="flex flex-col items-center gap-1.5 relative w-16 sm:w-20">
      <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 bg-white z-10 transition-colors ${error ? 'border-red-500 text-red-500' :
        completed ? 'border-emerald-500 text-emerald-500 bg-emerald-50' :
          active ? 'border-blue-500 text-blue-500' :
            'border-slate-200 text-slate-300'
        }`}>
        {error ? <XCircle className="w-4 h-4" /> :
          completed ? <CheckCircle2 className="w-4 h-4" /> :
            <CircleDashed className={`w-4 h-4 ${active ? 'animate-[spin_4s_linear_infinite]' : ''}`} />}
      </div>
      <span className={`text-[9px] sm:text-[10px] uppercase font-bold tracking-wider text-center leading-tight ${error ? 'text-red-600' :
        completed || active ? 'text-slate-700' :
          'text-slate-400'
        }`}>
        {label}
      </span>
    </div>
  )
}

export default function EnquiriesList({ enquiries, onViewDetails }: EnquiriesListProps) {

  if (enquiries.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-slate-300" />
        </div>
        <p className="text-slate-500 font-medium">No recent enquiries</p>
        <p className="text-sm text-slate-400 mt-1">Quotations will appear here.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {enquiries.map((enquiry) => {
        const isPending = enquiry.status === 'PENDING';
        const isQuoted = enquiry.status === 'PRICE_QUOTED';
        const isSuccess = enquiry.status === 'SUCCESS';
        const isLost = enquiry.status === 'LOST';
        const dateToUse = enquiry.updatedAt || enquiry.createdAt;

        // Message logic
        let actionMessage = 'Drafting Quotation';
        if (isQuoted) actionMessage = 'Quotation Sent';
        if (isSuccess) actionMessage = 'Quotation accepted';
        else if (isLost) actionMessage = 'Quotation declined';

        return (
          <div
            key={enquiry.id}
            className="p-4 sm:p-5 bg-white border border-slate-200 rounded-2xl hover:shadow-md hover:border-slate-300 transition-all cursor-pointer group flex flex-col gap-4"
            onClick={() => onViewDetails(enquiry.id)}
          >
            {/* Top Row: Client Info & Status Message */}
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors border border-blue-100/50">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base flex items-center gap-2.5">
                    {enquiry.clientName}
                    <span className="text-[10px] font-bold bg-slate-100 border border-slate-200 text-slate-500 px-2 py-0.5 rounded-full tracking-wider">
                      {enquiry.quotationNumber}
                    </span>
                  </h3>
                  <p className="text-xs font-medium text-slate-500 flex items-center gap-1.5 mt-1">
                    <Clock className="w-3.5 h-3.5 opacity-70" />
                    Last Action: {actionMessage} <span className="opacity-60">({timeAgo(dateToUse)})</span>
                  </p>
                </div>
              </div>

              {/* Pipeline Visual */}
              <div className="flex items-center relative py-1 self-end sm:self-auto hidden sm:flex">
                {/* Connecting Lines */}
                <div className="absolute top-[15px] left-8 right-8 h-0.5 bg-slate-100 z-0 -mt-px">
                  <div className={`h-full transition-all duration-500 ${isSuccess ? 'bg-emerald-400 w-full' :
                    isLost ? 'bg-slate-300 w-full' :
                      isQuoted ? 'bg-blue-400 w-[66%]' :
                        'bg-blue-400 w-1/3'
                    }`} />
                </div>

                <PipelineStep label="Created" completed={true} active={false} />
                <PipelineStep label="Quoted" completed={!isPending} active={isPending} />
                <PipelineStep label={isLost ? 'Lost' : isSuccess ? 'Won' : 'Decision'} completed={isSuccess} active={isQuoted} error={isLost} />
              </div>
            </div>

            {/* Bottom Row: Details & Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-100 items-end">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 mb-1 tracking-widest leading-none">Event Date</p>
                <p className="text-sm font-semibold text-slate-800">
                  {new Date(enquiry.eventDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 mb-1 tracking-widest leading-none">Contact</p>
                <p className="text-sm font-semibold text-slate-800">{enquiry.clientContact}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 mb-1 tracking-widest leading-none">Est. Value</p>
                <p className="text-sm font-bold text-emerald-600">
                  ₹{Number(enquiry.totalAmount).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center justify-end">
                <button className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-700 bg-slate-50 hover:text-white hover:bg-slate-900 rounded-lg transition-colors border border-slate-200">
                  Open Quote
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
