'use client';

import { useState, useEffect } from 'react';
import {
  CalendarCheck,
  CalendarDays,
  IndianRupee,
  Plus,
  CheckCircle2,
  FileText,
  ListTodo
} from 'lucide-react';
import PageLayout from '@/components/PageLayout';
import AddEnquiryModal from '@/components/AddEnquiryModal';
import EnquiriesList from '@/components/EnquiriesList';
import { getEnquiries } from '@/lib/actions/enquiries';
import { getEvents } from '@/lib/actions/events';
import { getDishes } from '@/lib/actions/dishes';
import { getTodos, toggleTodoComplete } from '@/lib/actions/todos';
import { useAuth } from '@/contexts/AuthContext';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function Dashboard() {
  const greeting = getGreeting();
  const { user } = useAuth();

  // State
  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState(false);
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [dishes, setDishes] = useState<any[]>([]);
  const [todos, setTodos] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    cashIncome: 0,
    totalEnquiries: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);

      // Load all data
      const [enquiriesRes, eventsRes, dishesRes, todosRes] = await Promise.all([
        getEnquiries(),
        getEvents(),
        getDishes(undefined, true), // Only active dishes
        getTodos(false), // Only incomplete todos
      ]);

      if (enquiriesRes.success && enquiriesRes.data) setEnquiries(enquiriesRes.data);
      if (eventsRes.success && eventsRes.data) setEvents(eventsRes.data);
      if (dishesRes.success && dishesRes.data) setDishes(dishesRes.data);
      if (todosRes.success && todosRes.data) setTodos(todosRes.data);

      // Calculate stats
      const totalOrders = eventsRes.success && eventsRes.data ? eventsRes.data.length : 0;
      const cashIncome = eventsRes.success && eventsRes.data
        ? eventsRes.data.reduce((sum: number, e: any) => sum + Number(e.paidAmount), 0)
        : 0;
      const totalEnquiries = enquiriesRes.success && enquiriesRes.data ? enquiriesRes.data.length : 0;

      setStats({
        totalOrders,
        cashIncome,
        totalEnquiries,
      });
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  }

  const upcomingEvents = events
    .filter(e => e.status === 'UPCOMING')
    .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
    .slice(0, 5);

  const handleToggleTodo = async (id: string, isCompleted: boolean) => {
    const result = await toggleTodoComplete(id, !isCompleted);
    if (result.success) {
      loadData();
    }
  };

  const handleViewEnquiryDetails = (id: string) => {
    // TODO: Implement enquiry details view
    window.location.href = `/enquiries/${id}`;
  };

  return (
    <PageLayout currentPath="/">
      <div className="min-h-screen bg-slate-50/50 pb-12">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 lg:py-12 space-y-8">

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Dashboard</p>
              <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
                {greeting}, Admin.
              </h1>
              <div className="mt-3 flex items-center gap-2 text-slate-600">
                <div className={`w-2 h-2 rounded-full ${upcomingEvents.length > 0 ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                <p>
                  You have <span className="font-semibold text-slate-900">{upcomingEvents.length} upcoming events</span> and{' '}
                  <span className="font-semibold text-slate-900">{stats.totalEnquiries} enquiries</span>.
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <button
              onClick={() => setIsEnquiryModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-slate-900/10"
            >
              <Plus className="w-5 h-5" />
              <span>Add Enquiry</span>
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Orders */}
            <div className="bg-white rounded-3xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                  <CalendarCheck className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100">
                  Orders
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500 mb-1">Total Orders</p>
                <p className="text-3xl font-black text-slate-900 tracking-tight">{stats.totalOrders}</p>
              </div>
            </div>

            {/* Cash Income */}
            <div className="bg-white rounded-3xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                  <IndianRupee className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100">
                  Income
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500 mb-1">Cash Income</p>
                <p className="text-3xl font-black text-emerald-600 tracking-tight">
                  ₹{stats.cashIncome.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Total Enquiries */}
            <div className="bg-white rounded-3xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                  <FileText className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-lg border border-amber-100">
                  Enquiries
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500 mb-1">Total Enquiries</p>
                <p className="text-3xl font-black text-slate-900 tracking-tight">{stats.totalEnquiries}</p>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left Column: Todo List & Upcoming Events */}
            <div className="lg:col-span-1 space-y-6">

              {/* Todo List */}
              <div className="bg-white rounded-3xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <ListTodo className="w-5 h-5 text-indigo-500" /> Todo List
                  </h3>
                  <button className="text-sm font-medium text-slate-500 hover:text-slate-900">
                    + Add
                  </button>
                </div>
                <div className="space-y-3 max-h-100 overflow-y-auto">
                  {todos.length > 0 ? (
                    todos.map((todo) => (
                      <div key={todo.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                        <button
                          onClick={() => handleToggleTodo(todo.id, todo.isCompleted)}
                          className="mt-0.5"
                        >
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${todo.isCompleted
                              ? 'bg-emerald-500 border-emerald-500'
                              : 'border-slate-300 hover:border-slate-400'
                            }`}>
                            {todo.isCompleted && <CheckCircle2 className="w-3 h-3 text-white" />}
                          </div>
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${todo.isCompleted ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                            {todo.title}
                          </p>
                          {todo.description && (
                            <p className="text-xs text-slate-500 mt-1">{todo.description}</p>
                          )}
                          {todo.dueDate && (
                            <p className="text-xs text-amber-600 mt-1">
                              Due: {new Date(todo.dueDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-slate-400">
                      <p className="text-sm">No todos yet. Click + Add to create one.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Upcoming Events */}
              <div className="bg-white rounded-3xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <CalendarDays className="w-5 h-5 text-indigo-500" /> Upcoming Events
                  </h3>
                  <a href="/events" className="text-sm font-medium text-slate-500 hover:text-slate-900">
                    View All
                  </a>
                </div>
                <div className="space-y-3">
                  {upcomingEvents.length > 0 ? (
                    upcomingEvents.map((event) => (
                      <div key={event.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-slate-900 text-sm">{event.name}</h4>
                          <span className={`text-xs px-2 py-1 rounded-md font-medium ${event.eventType === 'LOCAL_ORDER'
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-purple-50 text-purple-700'
                            }`}>
                            {event.eventType === 'LOCAL_ORDER' ? 'Local' : 'Main Event'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <CalendarDays className="w-3.5 h-3.5" />
                          <span>{new Date(event.eventDate).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>{event.eventTime}</span>
                        </div>
                        <div className="mt-2 text-xs text-slate-600">
                          <span className="font-medium">{event.guestCount} guests</span> • {event.location}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-slate-400">
                      <CalendarCheck className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No upcoming events</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Enquiries List */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-3xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-slate-900 text-xl">Enquiries & Quotations</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-500">{enquiries.length} total</span>
                  </div>
                </div>
                <EnquiriesList
                  enquiries={enquiries}
                  onViewDetails={handleViewEnquiryDetails}
                />
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Add Enquiry Modal */}
      <AddEnquiryModal
        isOpen={isEnquiryModalOpen}
        onClose={() => {
          setIsEnquiryModalOpen(false);
          loadData(); // Reload data after closing modal
        }}
        dishes={dishes}
        userId={user?.id || ''}
      />
    </PageLayout>
  );
}
