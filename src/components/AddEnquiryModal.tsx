'use client'

import { useState } from 'react'
import { X, Plus, Trash2, Save } from 'lucide-react'
import { createEnquiry } from '@/lib/actions/enquiries'

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

interface AddEnquiryModalProps {
  isOpen: boolean
  onClose: () => void
  dishes: Array<{ id: string; name: string; pricePerPlate: number; category?: string }>
  userId: string
}

export default function AddEnquiryModal({ isOpen, onClose, dishes, userId }: AddEnquiryModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    clientName: '',
    clientContact: '',
    peopleCount: '',
    location: '',
    eventDate: '',
    eventTime: '',
    occasion: [] as string[],
    serviceType: [] as string[],
  })

  const [selectedDishes, setSelectedDishes] = useState<DishItem[]>([])
  const [services, setServices] = useState<ServiceItem[]>([])

  const handleAddDish = () => {
    if (dishes.length > 0) {
      setSelectedDishes([
        ...selectedDishes,
        {
          dishId: dishes[0].id,
          dishName: dishes[0].name,
          quantity: 1,
          pricePerPlate: Number(dishes[0].pricePerPlate),
        },
      ])
    }
  }

  const handleUpdateDish = (index: number, field: string, value: any) => {
    const updated = [...selectedDishes]
    if (field === 'dishId') {
      const dish = dishes.find(d => d.id === value)
      if (dish) {
        updated[index] = {
          ...updated[index],
          dishId: value,
          dishName: dish.name,
          pricePerPlate: Number(dish.pricePerPlate),
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

  const calculateTotal = () => {
    const dishesTotal = selectedDishes.reduce((sum, d) => sum + d.quantity * d.pricePerPlate, 0)
    const servicesTotal = services.reduce((sum, s) => sum + Number(s.price), 0)
    return dishesTotal + servicesTotal
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await createEnquiry({
        clientName: formData.clientName,
        clientContact: formData.clientContact,
        peopleCount: parseInt(formData.peopleCount),
        location: formData.location,
        eventDate: new Date(formData.eventDate),
        eventTime: formData.eventTime,
        occasion: formData.occasion.length > 0 ? formData.occasion : undefined,
        serviceType: formData.serviceType.length > 0 ? formData.serviceType : undefined,
        dishes: selectedDishes.map(d => ({
          dishId: d.dishId,
          quantity: d.quantity,
          pricePerPlate: d.pricePerPlate,
        })),
        services: services.map(s => ({
          serviceName: s.serviceName,
          description: s.description,
          price: s.price,
        })),
        createdById: userId,
      })

      if (result.success) {
        // Reset form
        setFormData({
          clientName: '',
          clientContact: '',
          peopleCount: '',
          location: '',
          eventDate: '',
          eventTime: '',
          occasion: [],
          serviceType: [],
        })
        setSelectedDishes([])
        setServices([])
        onClose()
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Add New Enquiry</h2>
            <p className="text-sm text-slate-500 mt-1">Create a quotation for potential client</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-slate-600" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="px-8 py-6 space-y-8">
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
                        onClick={() => {
                          const current = formData.occasion
                          const updated = current.includes(type)
                            ? current.filter(t => t !== type)
                            : [...current, type]
                          setFormData({ ...formData, occasion: updated })
                        }}
                        className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${formData.occasion.includes(type)
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
                        onClick={() => {
                          const current = formData.serviceType
                          const updated = current.includes(type)
                            ? current.filter(t => t !== type)
                            : [...current, type]
                          setFormData({ ...formData, serviceType: updated })
                        }}
                        className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${formData.serviceType.includes(type)
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
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-slate-900">Dishes & Quantity</h3>
              </div>

              {[
                'WELCOME DRINK', 'STARTER & SOUPS', 'TEA', 'BREADS', 'RICE',
                'CURRY & GRAVY', 'FRY & GRILLED', 'SALADS', 'DRINK', 'DESSERT', 'OTHER'
              ].map(category => {

                // Filter dishes available in this category for the dropdowns
                let categoryDishes = dishes.filter(d =>
                  d.category?.toUpperCase() === category.replace(' & ', '_AND_').replace(' ', '_') ||
                  d.category?.toUpperCase() === category ||
                  d.category?.toUpperCase().includes(category.split(' ')[0])
                )

                // Fallback if no specific categorization
                if (categoryDishes.length === 0 && dishes.length > 0) {
                  categoryDishes = dishes;
                }

                // Filter selected dishes matching this category
                // Based on the selected item's mapped original dish category
                const selectedInCategory = selectedDishes.map((sd, i) => ({ ...sd, originalIndex: i })).filter(sd => {
                  const originalDish = dishes.find(d => d.id === sd.dishId)
                  const dCat = originalDish?.category?.toUpperCase().replace('_', ' ') || 'OTHER'
                  if (category === 'OTHER') {
                    return !['WELCOME DRINK', 'STARTER & SOUPS', 'TEA', 'BREADS', 'RICE', 'CURRY & GRAVY', 'FRY & GRILLED', 'SALADS', 'DRINK', 'DESSERT'].some(c => dCat.includes(c.split(' ')[0]))
                  }
                  return dCat.includes(category.split(' ')[0])
                })

                return (
                  <div key={category} className="bg-slate-50/50 rounded-2xl border border-slate-200 p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                      <h4 className="font-semibold text-slate-800">{category}</h4>
                      <button
                        type="button"
                        onClick={() => {
                          if (categoryDishes.length > 0) {
                            setSelectedDishes([
                              ...selectedDishes,
                              {
                                dishId: categoryDishes[0].id,
                                dishName: categoryDishes[0].name,
                                quantity: 1,
                                pricePerPlate: Number(categoryDishes[0].pricePerPlate),
                              },
                            ])
                          } else if (dishes.length > 0) {
                            handleAddDish() // Fallback
                          }
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium w-fit"
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
                              className="flex-1 min-w-[200px] px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900"
                            >
                              {categoryDishes.map(d => (
                                <option key={d.id} value={d.id}>
                                  {d.name} - ₹{d.pricePerPlate}/plate
                                </option>
                              ))}
                            </select>
                            <input
                              type="number"
                              min="1"
                              value={dish.quantity}
                              onChange={e => handleUpdateDish(dish.originalIndex, 'quantity', parseInt(e.target.value))}
                              className="w-24 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900"
                              placeholder="Qty"
                            />
                            <div className="w-24 text-right font-semibold text-slate-900">
                              ₹{(dish.quantity * dish.pricePerPlate).toLocaleString()}
                            </div>
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
            <div>
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
                        placeholder="Service name"
                      />
                      <input
                        type="number"
                        min="0"
                        value={service.price}
                        onChange={e => handleUpdateService(index, 'price', parseFloat(e.target.value))}
                        className="w-32 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900"
                        placeholder="Price"
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

            {/* Total Amount */}
            <div className="p-6 bg-slate-900 rounded-2xl">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-medium">Total Quotation Amount</span>
                <span className="text-3xl font-bold text-white">₹{calculateTotal().toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-6 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3 z-10 sticky bottom-0">
            <button
              type="button"
              onClick={onClose}
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
        </form >
      </div >
    </div >
  )
}
