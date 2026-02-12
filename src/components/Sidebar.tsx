'use client';

import { useState } from 'react';
import {
  LayoutDashboard,
  CalendarDays,
  Package,
  Users,
  FileText,
  Settings,
  ChefHat,
  Menu,
  X,
  Calculator,
  Wallet,
  UserCog,
} from 'lucide-react';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
  { icon: CalendarDays, label: 'Events', href: '/events' },
  { icon: ChefHat, label: 'Dishes', href: '/dishes' },
  { icon: Package, label: 'Inventory', href: '/inventory' },
  { icon: UserCog, label: 'Staff', href: '/staff' },
  { icon: Users, label: 'Clients', href: '/clients' },
  { icon: Wallet, label: 'Accounting', href: '/accounting' },
  { icon: FileText, label: 'Invoices', href: '/invoices' },
  { icon: Calculator, label: 'Tools', href: '/tools' },
  { icon: Settings, label: 'Settings', href: '/settings' },
];

interface SidebarProps {
  currentPath?: string;
}

export default function Sidebar({ currentPath = '/' }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Header */}
      <header className="fixed left-0 right-0 top-0 z-50 flex h-14 items-center justify-between border-b border-zinc-200 bg-white px-4 lg:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-white">
            <ChefHat className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold text-zinc-900">CaterPro</span>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-zinc-100 text-zinc-600"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </header>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-zinc-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 h-screen w-64 border-r border-zinc-200 bg-white transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center gap-3 px-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 shadow-sm text-white">
              <ChefHat className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-zinc-900 tracking-tight">CaterPro</h1>
              <p className="text-xs font-medium text-zinc-500">v2.0 SaaS</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-6">
            <p className="px-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Platform</p>
            {navItems.map((item) => {
              const isActive = currentPath === item.href;
              return (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`group flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-xl transition-all ${isActive
                    ? 'bg-zinc-900 text-white shadow-md shadow-zinc-900/10'
                    : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
                    }`}
                >
                  <item.icon className={`h-5 w-5 transition-colors ${isActive ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-600'}`} />
                  {item.label}
                </a>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-zinc-100">
            <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-zinc-50 transition-colors cursor-pointer">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-zinc-200 to-zinc-100 border border-zinc-200 text-sm font-bold text-zinc-700">
                AK
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-zinc-900 truncate">Arif Khan</p>
                <p className="text-xs text-zinc-500 truncate">arif@caterpro.com</p>
              </div>
              <Settings className="h-4 w-4 text-zinc-400" />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
