'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Plus, Search, Filter } from 'lucide-react'
import PageLayout from '@/components/PageLayout'
import EnquiriesList from '@/components/EnquiriesList'
import { useGetEnquiriesQuery, useGetDishesQuery } from '@/store/api'
import { useAuth } from '@/contexts/AuthContext'

export default function EnquiriesPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const { data: enquiries = [], isLoading, refetch } = useGetEnquiriesQuery()
  const { data: dishes = [] } = useGetDishesQuery({ activeOnly: true })

  const filtered = enquiries.filter((e: any) => {
    if (statusFilter !== 'all' && e.status !== statusFilter) return false
    if (searchTerm) {
      const s = searchTerm.toLowerCase()
      return (
        e.clientName.toLowerCase().includes(s) ||
        e.quotationNumber.toLowerCase().includes(s) ||
        e.clientContact.includes(s)
      )
    }
    return true
  })

  const stats = {
    all: enquiries.length,
    pending: enquiries.filter((e: any) => e.status === 'PENDING').length,
    success: enquiries.filter((e: any) => e.status === 'SUCCESS').length,
    lost: enquiries.filter((e: any) => e.status === 'LOST').length,
  }

  return (
    <PageLayout currentPath="/enquiries">
      <div className="min-h-screen bg-slate-50/50 pb-12">
        <div className="max-w-6xl mx-auto px-4 lg:px-8 py-6 lg:py-8 space-y-6">

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 pb-5 border-b border-slate-200/80">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
                Quotations Management
              </p>
              <h1 className="text-xl lg:text-2xl font-bold text-slate-900 tracking-tight">
                Enquiries
              </h1>
            </div>
            <button
              onClick={() => router.push('/enquiries/new')}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
            >
              <Plus className="w-4 h-4" />
              <span>New Enquiry</span>
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
            {[
              { label: 'All', value: stats.all, color: 'text-slate-900' },
              { label: 'Pending', value: stats.pending, color: 'text-amber-600' },
              { label: 'Success', value: stats.success, color: 'text-emerald-600' },
              { label: 'Lost', value: stats.lost, color: 'text-slate-400' },
            ].map(stat => (
              <div key={stat.label} className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200/80 hover:border-slate-300 transition-colors">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">{stat.label}</p>
                <p className={`text-2xl font-bold tracking-tight ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
              {[
                { value: 'all', label: 'All' },
                { value: 'PENDING', label: 'Pending' },
                { value: 'SUCCESS', label: 'Success' },
                { value: 'LOST', label: 'Lost' },
              ].map(tab => (
                <button
                  key={tab.value}
                  onClick={() => setStatusFilter(tab.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all shrink-0 ${statusFilter === tab.value
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="relative w-full md:w-72 shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search quotations..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none bg-slate-50 focus:bg-white transition-colors"
              />
            </div>
          </div>

          {/* List */}
          {isLoading ? (
            <div className="text-center py-12 text-slate-400">Loading...</div>
          ) : (
            <EnquiriesList
              enquiries={filtered}
              onViewDetails={id => router.push(`/enquiries/${id}`)}
            />
          )}
        </div>
      </div>
    </PageLayout>
  )
}
