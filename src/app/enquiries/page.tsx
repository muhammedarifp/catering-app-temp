'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Plus, Search, Filter } from 'lucide-react'
import PageLayout from '@/components/PageLayout'
import AddEnquiryModal from '@/components/AddEnquiryModal'
import EnquiriesList from '@/components/EnquiriesList'
import { getEnquiries } from '@/lib/actions/enquiries'
import { getDishes } from '@/lib/actions/dishes'
import { useAuth } from '@/contexts/AuthContext'

export default function EnquiriesPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [enquiries, setEnquiries] = useState<any[]>([])
  const [dishes, setDishes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    const [enquiriesRes, dishesRes] = await Promise.all([
      getEnquiries(),
      getDishes(undefined, true),
    ])
    if (enquiriesRes.success && enquiriesRes.data) setEnquiries(enquiriesRes.data)
    if (dishesRes.success && dishesRes.data) setDishes(dishesRes.data)
    setLoading(false)
  }

  const filtered = enquiries.filter(e => {
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
    pending: enquiries.filter(e => e.status === 'PENDING').length,
    success: enquiries.filter(e => e.status === 'SUCCESS').length,
    lost: enquiries.filter(e => e.status === 'LOST').length,
  }

  return (
    <PageLayout currentPath="/enquiries">
      <div className="min-h-screen bg-slate-50/50 pb-12">
        <div className="max-w-5xl mx-auto px-4 lg:px-8 py-8 lg:py-12 space-y-8">

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">
                Enquiry Management
              </p>
              <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
                Enquiries
              </h1>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-slate-900/10"
            >
              <Plus className="w-5 h-5" />
              New Enquiry
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'All', value: stats.all, color: 'text-slate-900' },
              { label: 'Pending', value: stats.pending, color: 'text-amber-600' },
              { label: 'Success', value: stats.success, color: 'text-emerald-600' },
              { label: 'Lost', value: stats.lost, color: 'text-red-600' },
            ].map(stat => (
              <div key={stat.label} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
                <p className="text-sm font-medium text-slate-500 mb-1">{stat.label}</p>
                <p className={`text-3xl font-black ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              {[
                { value: 'all', label: 'All' },
                { value: 'PENDING', label: 'Pending' },
                { value: 'SUCCESS', label: 'Success' },
                { value: 'LOST', label: 'Lost' },
              ].map(tab => (
                <button
                  key={tab.value}
                  onClick={() => setStatusFilter(tab.value)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    statusFilter === tab.value
                      ? 'bg-slate-900 text-white shadow-md'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by client name, quotation number..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              />
            </div>
          </div>

          {/* List */}
          {loading ? (
            <div className="text-center py-12 text-slate-400">Loading...</div>
          ) : (
            <EnquiriesList
              enquiries={filtered}
              onViewDetails={id => router.push(`/enquiries/${id}`)}
            />
          )}
        </div>
      </div>

      <AddEnquiryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          loadData()
        }}
        dishes={dishes}
        userId={user?.id || ''}
      />
    </PageLayout>
  )
}
