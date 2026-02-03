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
} from 'lucide-react';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
  { icon: CalendarDays, label: 'Events', href: '/events' },
  { icon: ChefHat, label: 'Dishes', href: '/dishes' },
  { icon: Package, label: 'Inventory', href: '/inventory' },
  { icon: Users, label: 'Clients', href: '/clients' },
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
          <div className="flex h-8 w-8 items-center justify-center bg-zinc-900">
            <ChefHat className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-semibold text-zinc-900">CaterPro</span>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex h-10 w-10 items-center justify-center text-zinc-600"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </header>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
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
          <div className="flex h-14 items-center gap-3 border-b border-zinc-200 px-4 lg:h-16 lg:px-6">
            <div className="flex h-8 w-8 items-center justify-center bg-zinc-900 lg:h-10 lg:w-10">
              <ChefHat className="h-5 w-5 text-white lg:h-6 lg:w-6" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-zinc-900 lg:text-lg">CaterPro</h1>
              <p className="hidden text-xs text-zinc-500 lg:block">Catering Management</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-2 py-3 lg:px-3 lg:py-4">
            {navItems.map((item) => {
              const isActive = currentPath === item.href;
              return (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors ${isActive
                    ? 'bg-zinc-900 text-white'
                    : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                    }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </a>
              );
            })}
          </nav>

          {/* User */}
          <div className="border-t border-zinc-200 p-3 lg:p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center bg-zinc-200 text-sm font-semibold text-zinc-700 lg:h-10 lg:w-10">
                AK
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-900">Arif Khan</p>
                <p className="text-xs text-zinc-500">Owner</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
