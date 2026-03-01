'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react'
import PageLayout from '@/components/PageLayout'
import { createEnquiry } from '@/lib/actions/enquiries'
import { useGetDishesQuery } from '@/store/api'
import { useAuth } from '@/contexts/AuthContext'

interface DishItem {
    dishId: string
    dishName: string
    quantity: number
    pricePerPlate: number
}

interface ServiceItem {
    serviceName: string
    description: string
    price: number
}

// Maps UI category labels → actual DB category strings
const CATEGORY_DB_MAP: Record<string, string[]> = {
    'WELCOME DRINK':  ['Welcome Drink'],
    'STARTER & SOUPS': ['Starters'],
    'TEA':            ['Herbal Tea'],
    'BREADS':         ['Breads'],
    'RICE':           ['Main Course'],
    'CURRY & GRAVY':  ['Curry'],
    'FRY & GRILLED':  ['Fry'],
    'SALADS':         ['Salads'],
    'DRINK':          ['Drinks'],
    'DESSERT':        ['Desserts'],
}
const ALL_MAPPED_DB_CATEGORIES = Object.values(CATEGORY_DB_MAP).flat()

export default function NewEnquiryPage() {
    const router = useRouter()
    const { user } = useAuth()
    const [loading, setLoading] = useState(false)

    const { data: dishes = [] } = useGetDishesQuery({ activeOnly: true })

    const [formData, setFormData] = useState({
        clientName: '',
        clientContact: '',
        peopleCount: '',
        location: '',
        eventDate: '',
        eventTime: '',
        occasion: '', // Single selection
        serviceType: '', // Single selection
    })

    const [selectedDishes, setSelectedDishes] = useState<DishItem[]>([])
    const [services, setServices] = useState<ServiceItem[]>([])

    // Auto-fill quantity when peopleCount changes
    useEffect(() => {
        const peopleCountNum = parseInt(formData.peopleCount)
        if (!isNaN(peopleCountNum) && peopleCountNum > 0) {
            setSelectedDishes(prev => prev.map(d => ({ ...d, quantity: peopleCountNum })))
        }
    }, [formData.peopleCount])

    const handleAddDish = () => {
        if (dishes.length > 0) {
            setSelectedDishes([
                ...selectedDishes,
                {
                    dishId: dishes[0].id,
                    dishName: dishes[0].name,
                    quantity: parseInt(formData.peopleCount) || 1,
                    pricePerPlate: Number(dishes[0].sellingPricePerPlate || dishes[0].pricePerPlate),
                },
            ])
        }
    }

    const handleUpdateDish = (index: number, field: string, value: any) => {
        const updated = [...selectedDishes]
        if (field === 'dishId') {
            const dish = dishes.find((d: any) => d.id === value)
            if (dish) {
                updated[index] = {
                    ...updated[index],
                    dishId: value,
                    dishName: dish.name,
                    pricePerPlate: Number(dish.sellingPricePerPlate || dish.pricePerPlate),
                }
            }
        } else {
            updated[index] = { ...updated[index], [field]: value }
        }
        setSelectedDishes(updated)
    }

    const handleRemoveDish = (index: number) => {
        setSelectedDishes(selectedDishes.filter((_, i) => i !== index))
    }

    const handleAddService = () => {
        setServices([...services, { serviceName: '', description: '', price: 0 }])
    }

    const handleUpdateService = (index: number, field: string, value: any) => {
        const updated = [...services]
        updated[index] = { ...updated[index], [field]: value }
        setServices(updated)
    }

    const handleRemoveService = (index: number) => {
        setServices(services.filter((_, i) => i !== index))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.occasion) {
            alert('Please select an Event Type')
            return
        }
        setLoading(true)

        try {
            const result = await createEnquiry({
                clientName: formData.clientName,
                clientContact: formData.clientContact,
                // Ensure to parse it to avoid passing NaN
                peopleCount: parseInt(formData.peopleCount) || 1,
                location: formData.location,
                eventDate: new Date(formData.eventDate),
                eventTime: formData.eventTime,
                // Send as array to match db
                occasion: formData.occasion ? [formData.occasion] : undefined,
                serviceType: formData.serviceType ? [formData.serviceType] : undefined,
                dishes: selectedDishes.map(d => ({
                    dishId: d.dishId,
                    quantity: d.quantity,
                    pricePerPlate: d.pricePerPlate,
                })),
                services: services.map(s => ({
                    serviceName: s.serviceName,
                    description: s.description,
                    price: 0, // Force 0 as price is removed
                })),
                createdById: user?.id || '',
            })

            if (result.success) {
                router.back() // Go back or to `/enquiries`
            } else {
                alert(result.error || 'Failed to create enquiry')
            }
        } catch (error) {
            console.error('Failed to create enquiry:', error)
            alert('Failed to create enquiry')
        } finally {
            setLoading(false)
        }
    }

    return (
        <PageLayout currentPath="/enquiries">
            <div className="min-h-screen bg-slate-50/50 pb-12">
                <div className="max-w-4xl mx-auto px-4 lg:px-8 py-6 lg:py-8 space-y-6">

                    {/* Header */}
                    <div className="flex items-center gap-4 pb-5 border-b border-slate-200/80">
                        <button
                            onClick={() => router.back()}
                            className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-slate-600" />
                        </button>
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
                                New Quotation
                            </p>
                            <h1 className="text-xl lg:text-2xl font-bold text-slate-900 tracking-tight">
                                Create Enquiry
                            </h1>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200">
                        {/* Client Information */}
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-4">Client Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Client Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.clientName}
                                        onChange={e => setFormData({ ...formData, clientName: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                                        placeholder="Enter client name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Contact Number *
                                    </label>
                                    <input
                                        type="tel"
                                        required
                                        value={formData.clientContact}
                                        onChange={e => setFormData({ ...formData, clientContact: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                                        placeholder="Enter contact number"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Event Details */}
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-4">Event Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Event Date *
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.eventDate}
                                        onChange={e => setFormData({ ...formData, eventDate: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Event Time *
                                    </label>
                                    <input
                                        type="time"
                                        required
                                        value={formData.eventTime}
                                        onChange={e => setFormData({ ...formData, eventTime: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Venue *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.location}
                                        onChange={e => setFormData({ ...formData, location: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                                        placeholder="Enter event venue"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Number of Guests *
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        value={formData.peopleCount}
                                        onChange={e => setFormData({ ...formData, peopleCount: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                                        placeholder="Enter number of guests"
                                    />
                                </div>
                            </div>

                            <div className="space-y-6">
                                {/* Event Type / Occasion */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-3">
                                        EVENT TYPE <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {[
                                            'WEDDING RECEPTION', 'NIKKAH', 'SALKARAM', 'FAMILY MEET',
                                            'MEETING', 'ENGAGEMENT', 'CORPORATE EVENT', 'GET-TOGETHER',
                                            'BIRTHDAY PARTY', 'CONFERENCE', 'OTHER'
                                        ].map(type => (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, occasion: type })}
                                                className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${formData.occasion === type
                                                    ? 'bg-slate-900 text-white border-slate-900'
                                                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                                    }`}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Service Type */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-3">
                                        SERVICE TYPE
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {[
                                            'BUFFET', 'BOX COUNTER', 'TABLE SERVICE'
                                        ].map(type => (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, serviceType: type })}
                                                className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${formData.serviceType === type
                                                    ? 'bg-slate-900 text-white border-slate-900'
                                                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                                    }`}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Dishes by Category */}
                        <div className="space-y-6 pt-4 border-t border-slate-200">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-lg font-semibold text-slate-900">Dishes</h3>
                            </div>
                            <p className="text-sm text-slate-500 mb-4">Quantity is automatically filled with the number of guests.</p>

                            {[
                                'WELCOME DRINK', 'STARTER & SOUPS', 'TEA', 'BREADS', 'RICE',
                                'CURRY & GRAVY', 'FRY & GRILLED', 'SALADS', 'DRINK', 'DESSERT', 'OTHER'
                            ].map(category => {
                                const categoryDishes = dishes.filter((d: any) => {
                                    if (category === 'OTHER') {
                                        return !ALL_MAPPED_DB_CATEGORIES.includes(d.category)
                                    }
                                    return CATEGORY_DB_MAP[category]?.includes(d.category) ?? false
                                })

                                const selectedInCategory = selectedDishes.map((sd, i) => ({ ...sd, originalIndex: i })).filter(sd => {
                                    const originalDish = dishes.find((d: any) => d.id === sd.dishId)
                                    if (!originalDish) return false
                                    if (category === 'OTHER') {
                                        return !ALL_MAPPED_DB_CATEGORIES.includes(originalDish.category)
                                    }
                                    return CATEGORY_DB_MAP[category]?.includes(originalDish.category) ?? false
                                })

                                return (
                                    <div key={category} className="bg-slate-50/50 rounded-2xl border border-slate-200 p-4">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                                            <h4 className="font-semibold text-slate-800">{category}</h4>
                                            <button
                                                type="button"
                                                disabled={categoryDishes.length === 0}
                                                onClick={() => {
                                                    if (categoryDishes.length > 0) {
                                                        setSelectedDishes([
                                                            ...selectedDishes,
                                                            {
                                                                dishId: categoryDishes[0].id,
                                                                dishName: categoryDishes[0].name,
                                                                quantity: parseInt(formData.peopleCount) || 1,
                                                                pricePerPlate: Number(categoryDishes[0].sellingPricePerPlate || categoryDishes[0].pricePerPlate),
                                                            },
                                                        ])
                                                    }
                                                }}
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium w-fit disabled:opacity-40 disabled:cursor-not-allowed"
                                            >
                                                <Plus className="w-3.5 h-3.5" />
                                                Add item
                                            </button>
                                        </div>

                                        {selectedInCategory.length > 0 ? (
                                            <div className="space-y-3">
                                                {selectedInCategory.map((dish) => (
                                                    <div key={dish.originalIndex} className="flex flex-wrap sm:flex-nowrap items-center gap-3 p-3 bg-white rounded-xl border border-slate-200">
                                                        <select
                                                            value={dish.dishId}
                                                            onChange={e => handleUpdateDish(dish.originalIndex, 'dishId', e.target.value)}
                                                            className="flex-1 min-w-[200px] px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 hover:bg-slate-50 transition-colors"
                                                        >
                                                            {categoryDishes.map((d: any) => (
                                                                <option key={d.id} value={d.id}>
                                                                    {d.name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            value={dish.quantity}
                                                            readOnly
                                                            className="w-24 px-3 py-2 border border-slate-200 rounded-lg bg-slate-100 cursor-not-allowed select-none text-slate-500"
                                                            placeholder="Qty"
                                                            title="Quantity syncs with number of guests automatically"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveDish(dish.originalIndex)}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-4 text-sm text-slate-400 bg-white/50 rounded-xl border border-slate-100 border-dashed">
                                                No {category.toLowerCase()} added yet.
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>

                        {/* Services */}
                        <div className="pt-4 border-t border-slate-200">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-slate-900">Services</h3>
                                <button
                                    type="button"
                                    onClick={handleAddService}
                                    className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors text-sm font-medium"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Service
                                </button>
                            </div>
                            <div className="space-y-3">
                                {services.map((service, index) => (
                                    <div key={index} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="text"
                                                value={service.serviceName}
                                                onChange={e => handleUpdateService(index, 'serviceName', e.target.value)}
                                                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900"
                                                placeholder="Service name (e.g. Photography, Decor)"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveService(index)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <input
                                            type="text"
                                            value={service.description}
                                            onChange={e => handleUpdateService(index, 'description', e.target.value)}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900"
                                            placeholder="Description (optional)"
                                        />
                                    </div>
                                ))}
                                {services.length === 0 && (
                                    <div className="text-center py-8 text-slate-400">
                                        No services added yet. Click "Add Service" to start.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Submit Action */}
                        <div className="pt-6 border-t border-slate-200 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="px-6 py-2.5 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-100 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading || selectedDishes.length === 0}
                                className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Save className="w-4 h-4" />
                                {loading ? 'Creating...' : 'Create Enquiry'}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </PageLayout>
    )
}
