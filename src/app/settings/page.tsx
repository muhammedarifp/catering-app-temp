'use client';

import PageLayout from '@/components/PageLayout';
import { User, Bell, Shield, Database, Save, Download } from 'lucide-react';

export default function SettingsPage() {
   return (
      <PageLayout currentPath="/settings">
         <div className="max-w-4xl mx-auto px-4 py-8 lg:px-8 space-y-8">

            <div>
               <h1 className="text-2xl font-semibold text-zinc-900">Settings</h1>
               <p className="text-sm text-zinc-500">Manage your account and application preferences</p>
            </div>

            {/* Profile */}
            <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
               <div className="px-6 py-4 border-b border-zinc-200 bg-zinc-50/50 flex items-center gap-3">
                  <div className="p-2 bg-zinc-100 rounded-lg">
                     <User className="w-5 h-5 text-zinc-600" />
                  </div>
                  <div>
                     <h2 className="font-semibold text-zinc-900">Business Profile</h2>
                     <p className="text-xs text-zinc-500">Your catering business details</p>
                  </div>
               </div>
               <div className="p-6 grid gap-6 sm:grid-cols-2">
                  <div>
                     <label className="block text-sm font-medium text-zinc-700 mb-1">Business Name</label>
                     <input type="text" defaultValue="CaterPro Services" className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900" />
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-zinc-700 mb-1">Owner Name</label>
                     <input type="text" defaultValue="Arif Khan" className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900" />
                  </div>
                  <div className="sm:col-span-2">
                     <label className="block text-sm font-medium text-zinc-700 mb-1">Address</label>
                     <input type="text" defaultValue="123, Food Street, Kitchen City" className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900" />
                  </div>
               </div>
               <div className="px-6 py-4 border-t border-zinc-100 flex justify-end">
                  <button className="text-sm font-medium text-white bg-zinc-900 px-4 py-2 rounded-lg hover:bg-zinc-800">
                     Save Changes
                  </button>
               </div>
            </div>

            {/* Preferences */}
            <div className="grid gap-6 sm:grid-cols-2">
               <div className="bg-white rounded-xl border border-zinc-200 p-6">
                  <div className="flex items-center gap-3 mb-4">
                     <Bell className="w-5 h-5 text-zinc-400" />
                     <h3 className="font-semibold text-zinc-900">Notifications</h3>
                  </div>
                  <div className="space-y-3">
                     <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" defaultChecked className="w-4 h-4 text-zinc-900 border-zinc-300 rounded focus:ring-zinc-900" />
                        <span className="text-sm text-zinc-600">Low stock alerts</span>
                     </label>
                     <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" defaultChecked className="w-4 h-4 text-zinc-900 border-zinc-300 rounded focus:ring-zinc-900" />
                        <span className="text-sm text-zinc-600">Event reminders (24h before)</span>
                     </label>
                     <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" className="w-4 h-4 text-zinc-900 border-zinc-300 rounded focus:ring-zinc-900" />
                        <span className="text-sm text-zinc-600">Payment overdue digest</span>
                     </label>
                  </div>
               </div>

               <div className="bg-white rounded-xl border border-zinc-200 p-6">
                  <div className="flex items-center gap-3 mb-4">
                     <Database className="w-5 h-5 text-zinc-400" />
                     <h3 className="font-semibold text-zinc-900">Data Management</h3>
                  </div>
                  <p className="text-sm text-zinc-500 mb-4">
                     Export your data for backup or analysis.
                  </p>
                  <div className="space-y-2">
                     <button className="w-full text-sm font-medium text-zinc-700 bg-zinc-50 border border-zinc-200 px-4 py-2 rounded-lg hover:bg-zinc-100 text-left flex justify-between items-center group">
                        Export All Events
                        <Download className="w-4 h-4 text-zinc-400 group-hover:text-zinc-600" />
                     </button>
                     <button className="w-full text-sm font-medium text-zinc-700 bg-zinc-50 border border-zinc-200 px-4 py-2 rounded-lg hover:bg-zinc-100 text-left flex justify-between items-center group">
                        Export Inventory
                        <Download className="w-4 h-4 text-zinc-400 group-hover:text-zinc-600" />
                     </button>
                  </div>
               </div>
            </div>

         </div>
      </PageLayout>
   );
}
