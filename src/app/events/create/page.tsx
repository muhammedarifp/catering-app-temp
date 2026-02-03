'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft, Calendar, Clock, Users, MapPin, ChefHat,
  CheckCircle2, Search, Plus, Minus, ArrowRight, Save,
  Sparkles, Utensils
} from 'lucide-react';
import PageLayout from '@/components/PageLayout';
import {
  menuItems, recipes, formatCurrency,
  calculateRecipeIngredients, calculateEstimatedCost
} from '@/lib/data';
import { EventFormData, EventType, MenuItem, Recipe } from '@/lib/types';
import { useRouter } from 'next/navigation';

// Premium UI Components
const SectionHeader = ({ title, subtitle, icon: Icon }: { title: string, subtitle: string, icon: any }) => (
  <div className="flex items-start gap-4 mb-6">
    <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center flex-shrink-0 text-zinc-900">
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <h2 className="text-lg font-semibold text-zinc-900">{title}</h2>
      <p className="text-sm text-zinc-500">{subtitle}</p>
    </div>
  </div>
);

const InputGroup = ({ label, children, className = "" }: { label: string, children: React.ReactNode, className?: string }) => (
  <div className={`space-y-1.5 ${className}`}>
    <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{label}</label>
    {children}
  </div>
);

// Quick Date Selector Component
const DateSelector = ({ value, onChange }: { value: string, onChange: (date: string) => void }) => {
  // Generate next 7 days for quick access
  const nextDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < 5; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      days.push(d);
    }
    return days;
  }, []);

  return (
    <div className="space-y-3">
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {nextDays.map(date => {
          const dateStr = date.toISOString().split('T')[0];
          const isSelected = value === dateStr;
          return (
            <button
              key={dateStr}
              type="button"
              onClick={() => onChange(dateStr)}
              className={`flex flex-col items-center justify-center min-w-[70px] h-16 rounded-xl border transition-all ${isSelected
                ? 'border-zinc-900 bg-zinc-900 text-white shadow-md'
                : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300'
                }`}
            >
              <span className="text-xs font-medium uppercase opacity-70">
                {date.toLocaleDateString('en-US', { weekday: 'short' })}
              </span>
              <span className="text-lg font-bold">
                {date.getDate()}
              </span>
            </button>
          );
        })}
        <div className="relative flex items-center justify-center min-w-[70px] h-16 rounded-xl border border-dashed border-zinc-300 text-zinc-400 hover:text-zinc-600 hover:border-zinc-400 cursor-pointer group">
          <Calendar className="w-5 h-5" />
          <input
            type="date"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};

export default function CreateEventPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Initial State
  const [formData, setFormData] = useState<EventFormData>({
    name: '',
    eventType: 'wedding',
    serviceType: 'per_plate',
    date: new Date().toISOString().split('T')[0],
    time: '12:00',
    endTime: '16:00',
    client: '',
    clientPhone: '',
    clientEmail: '',
    location: '',
    address: '',
    guests: 100,
    menuItems: [],
    recipes: [],
    eventMenu: [],
    specialRequirements: '',
    amount: 0,
    advanceAmount: 0,
  });

  // Helper to update fields
  const updateField = (field: keyof EventFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Derived States
  const menuTotal = useMemo(() => {
    return formData.menuItems.reduce((total, id) => {
      const item = menuItems.find(m => m.id === id);
      return total + (item ? (item.sellingPricePerPlate || 0) * formData.guests : 0);
    }, 0);
  }, [formData.menuItems, formData.guests]);

  const estimatedCost = useMemo(() => {
    if (formData.serviceType === 'self_cooking') {
      return calculateEstimatedCost(formData.recipes, formData.guests);
    }
    return 0;
  }, [formData.recipes, formData.guests]);

  const handleSave = () => {
    setIsLoading(true);
    // Simulate API
    setTimeout(() => {
      setIsLoading(false);
      console.log('Saved:', formData);
      router.push('/events');
    }, 1000);
  };

  return (
    <PageLayout currentPath="/events">
      <div className="max-w-5xl mx-auto px-4 py-8 lg:px-8">
        {/* Top Navigation */}
        <div className="flex items-center justify-between mb-8 sticky top-0 bg-white/80 backdrop-blur-md py-4 z-10 border-b border-zinc-100">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-zinc-100 rounded-full text-zinc-500">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-zinc-900">New Event</h1>
              <p className="text-xs text-zinc-500">Create a new catering order</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="hidden sm:flex flex-col items-end mr-4">
              <span className="text-xs text-zinc-500">Estimated Value</span>
              <span className="text-lg font-bold text-zinc-900">
                {formatCurrency(formData.serviceType === 'per_plate' ? menuTotal : estimatedCost * 1.5)}
              </span>
            </div>
            <button
              onClick={handleSave}
              disabled={!formData.name || !formData.client}
              className="bg-zinc-900 text-white px-6 py-2.5 rounded-full hover:bg-zinc-800 transition-colors flex items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-zinc-900/10"
            >
              {isLoading ? 'Saving...' : 'Create Event'}
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 pb-20">

          {/* Left Column: Details */}
          <div className="lg:col-span-7 space-y-10">

            {/* 1. Basic Info */}
            <section className="bg-white rounded-3xl p-1">
              <SectionHeader title="Event Details" subtitle="When and where is it happening?" icon={Calendar} />

              <div className="space-y-6 px-2">
                <InputGroup label="Event Name">
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => updateField('name', e.target.value)}
                    placeholder="e.g. Rohith's Wedding Reception"
                    className="w-full text-xl font-medium border-0 border-b border-zinc-200 px-0 py-2 focus:ring-0 focus:border-zinc-900 placeholder:text-zinc-300 transition-colors bg-transparent"
                    autoFocus
                  />
                </InputGroup>

                <div className="grid grid-cols-2 gap-6">
                  <InputGroup label="Event Type">
                    <select
                      value={formData.eventType}
                      onChange={e => updateField('eventType', e.target.value)}
                      className="w-full bg-zinc-50 border-none rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-zinc-900 cursor-pointer hover:bg-zinc-100 transition-colors"
                    >
                      <option value="wedding">Wedding</option>
                      <option value="corporate">Corporate</option>
                      <option value="birthday">Birthday</option>
                      <option value="engagement">Engagement</option>
                      <option value="other">Other</option>
                    </select>
                  </InputGroup>

                  <InputGroup label="Guest Count">
                    <div className="relative">
                      <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                      <input
                        type="number"
                        value={formData.guests}
                        onChange={e => updateField('guests', parseInt(e.target.value) || 0)}
                        className="w-full bg-zinc-50 border-none rounded-xl pl-10 pr-4 py-3 text-sm font-medium focus:ring-2 focus:ring-zinc-900"
                      />
                    </div>
                  </InputGroup>
                </div>

                <div className="space-y-4 pt-2">
                  <InputGroup label="Date">
                    <DateSelector value={formData.date} onChange={d => updateField('date', d)} />
                  </InputGroup>

                  <div className="grid grid-cols-2 gap-4">
                    <InputGroup label="Start Time">
                      <div className="relative">
                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                        <input
                          type="time"
                          value={formData.time}
                          onChange={e => updateField('time', e.target.value)}
                          className="w-full bg-zinc-50 border-none rounded-xl pl-10 pr-4 py-3 text-sm font-medium focus:ring-2 focus:ring-zinc-900"
                        />
                      </div>
                    </InputGroup>
                    <InputGroup label="End Time">
                      <div className="relative">
                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                        <input
                          type="time"
                          value={formData.endTime}
                          onChange={e => updateField('endTime', e.target.value)}
                          className="w-full bg-zinc-50 border-none rounded-xl pl-10 pr-4 py-3 text-sm font-medium focus:ring-2 focus:ring-zinc-900"
                        />
                      </div>
                    </InputGroup>
                  </div>
                </div>

                <InputGroup label="Venue Location">
                  <div className="flex gap-2">
                    <MapPin className="w-5 h-5 text-zinc-400 mt-2 flex-shrink-0" />
                    <div className="w-full space-y-2">
                      <input
                        type="text"
                        value={formData.location}
                        onChange={e => updateField('location', e.target.value)}
                        placeholder="Venue Name (e.g. Grand Palace)"
                        className="w-full text-sm font-medium border-0 border-b border-zinc-200 px-0 py-2 focus:ring-0 focus:border-zinc-900 placeholder:text-zinc-300"
                      />
                      <input
                        type="text"
                        value={formData.address}
                        onChange={e => updateField('address', e.target.value)}
                        placeholder="Full Address"
                        className="w-full text-sm text-zinc-500 border-0 border-b border-zinc-200 px-0 py-2 focus:ring-0 focus:border-zinc-900 placeholder:text-zinc-300"
                      />
                    </div>
                  </div>
                </InputGroup>
              </div>
            </section>

            <hr className="border-zinc-100" />

            {/* 2. Client Info */}
            <section className="bg-white rounded-3xl p-1">
              <SectionHeader title="Client Information" subtitle="Who are we serving?" icon={Users} />

              <div className="px-2 grid gap-6">
                <InputGroup label="Client Name">
                  <input
                    type="text"
                    value={formData.client}
                    onChange={e => updateField('client', e.target.value)}
                    placeholder="Full Name"
                    className="w-full bg-zinc-50 border-none rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-zinc-900 placeholder:text-zinc-400"
                  />
                </InputGroup>

                <div className="grid grid-cols-2 gap-4">
                  <InputGroup label="Phone">
                    <input
                      type="tel"
                      value={formData.clientPhone}
                      onChange={e => updateField('clientPhone', e.target.value)}
                      placeholder="+91 00000 00000"
                      className="w-full bg-zinc-50 border-none rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-zinc-900 placeholder:text-zinc-400"
                    />
                  </InputGroup>
                  <InputGroup label="Email (Optional)">
                    <input
                      type="email"
                      value={formData.clientEmail}
                      onChange={e => updateField('clientEmail', e.target.value)}
                      placeholder="client@email.com"
                      className="w-full bg-zinc-50 border-none rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-zinc-900 placeholder:text-zinc-400"
                    />
                  </InputGroup>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: Menu & Costing */}
          <div className="lg:col-span-5 space-y-8">

            {/* Service Type Selection */}
            <div className="bg-zinc-900 rounded-3xl p-6 text-white shadow-xl shadow-zinc-900/10">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-zinc-400" /> Service Model
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => updateField('serviceType', 'per_plate')}
                  className={`p-4 rounded-2xl text-left transition-all border ${formData.serviceType === 'per_plate'
                    ? 'bg-zinc-800 border-zinc-700 ring-2 ring-zinc-700'
                    : 'bg-transparent border-zinc-800 hover:bg-zinc-800/50'
                    }`}
                >
                  <span className="block text-sm font-bold mb-1">Per Plate</span>
                  <span className="block text-xs text-zinc-400">Complete Catering</span>
                </button>
                <button
                  onClick={() => updateField('serviceType', 'self_cooking')}
                  className={`p-4 rounded-2xl text-left transition-all border ${formData.serviceType === 'self_cooking'
                    ? 'bg-zinc-800 border-zinc-700 ring-2 ring-zinc-700'
                    : 'bg-transparent border-zinc-800 hover:bg-zinc-800/50'
                    }`}
                >
                  <span className="block text-sm font-bold mb-1">Self Cooking</span>
                  <span className="block text-xs text-zinc-400">Inventory Only</span>
                </button>
              </div>
            </div>

            {/* Menu Selection */}
            <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2 text-zinc-900">
                <Utensils className="w-5 h-5 text-zinc-400" /> Menu Selection
              </h3>
              <p className="text-sm text-zinc-500 mb-6">Select dishes to calculate accurate pricing</p>

              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {(formData.serviceType === 'per_plate' ? menuItems : recipes).map(item => {
                  const isSelected = formData.serviceType === 'per_plate'
                    ? formData.menuItems.includes(item.id)
                    : formData.recipes.includes(item.id);

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        if (formData.serviceType === 'per_plate') {
                          const newMenu = isSelected
                            ? formData.menuItems.filter(id => id !== item.id)
                            : [...formData.menuItems, item.id];
                          updateField('menuItems', newMenu);
                        } else {
                          const newMenu = isSelected
                            ? formData.recipes.filter(id => id !== item.id)
                            : [...formData.recipes, item.id];
                          updateField('recipes', newMenu);
                        }
                      }}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${isSelected
                        ? 'border-zinc-900 bg-zinc-50'
                        : 'border-zinc-100 hover:border-zinc-200'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${item.isVeg ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        <div className="text-left">
                          <p className={`text-sm font-medium ${isSelected ? 'text-zinc-900' : 'text-zinc-600'}`}>
                            {item.name}
                          </p>
                          <p className="text-xs text-zinc-400 capitalize">{item.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-sm ${isSelected ? 'text-zinc-900 font-medium' : 'text-zinc-500'}`}>
                          {formData.serviceType === 'per_plate'
                            ? formatCurrency(item.sellingPricePerPlate || 0)
                            : `~${formatCurrency(item.estimatedCostPerPlate || 0)}/p`
                          }
                        </span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-zinc-900" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
