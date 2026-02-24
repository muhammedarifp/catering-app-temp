'use client';

import { useState } from 'react';
import {
  Compass,
  CalendarDays,
  Package,
  Users,
  Inbox,
  Settings,
  UtensilsCrossed,
  Menu,
  X,
  Calculator,
  ReceiptText,
  UserCog,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChefHat
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useMemo } from 'react';

const navItems = [
  { icon: Compass, label: 'Home', href: '/' },
  { icon: Inbox, label: 'Enquiries', href: '/enquiries' },
  { icon: CalendarDays, label: 'Events', href: '/events' },
  { icon: UtensilsCrossed, label: 'Dishes', href: '/dishes' },
  { icon: ReceiptText, label: 'Other Expenses', href: '/other-expenses' },
  { icon: Settings, label: 'Settings', href: '/settings' },
];

// Hidden but kept in code for future use
const hiddenNavItems = [
  { icon: Package, label: 'Inventory', href: '/inventory' },
  { icon: UserCog, label: 'Staff', href: '/staff' },
  { icon: Users, label: 'Clients', href: '/clients' },
  { icon: ReceiptText, label: 'Accounting', href: '/accounting' },
  { icon: Inbox, label: 'Invoices', href: '/invoices' },
  { icon: Calculator, label: 'Tools', href: '/tools' },
];

interface SidebarProps {
  currentPath?: string;
  isCollapsed: boolean;
  setIsCollapsed: (v: boolean) => void;
}

export default function Sidebar({ currentPath = '/', isCollapsed, setIsCollapsed }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout, hasAccess } = useAuth();

  const visibleNavItems = useMemo(() => {
    if (!user || user.role === 'SUPER_ADMIN') return navItems;
    return navItems.filter(item => hasAccess(item.href));
  }, [user, hasAccess]);

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
        className={`fixed left-0 top-0 z-50 h-screen border-r border-zinc-200 bg-white transition-all duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'} ${isCollapsed ? 'w-20' : 'w-64'}`}
      >
        <div className="flex h-full flex-col relative">
          {/* Collapse Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex absolute -right-3 top-6 h-6 w-6 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-500 hover:text-zinc-900 shadow-sm z-50 transition-colors"
          >
            {isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
          </button>

          {/* Logo */}
          <div className={`flex h-16 items-center ${isCollapsed ? 'justify-center px-0' : 'px-6 gap-3'}`}>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-900 shadow-sm text-white transition-all">
              <ChefHat className="h-6 w-6" />
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden transition-all whitespace-nowrap">
                <h1 className="text-lg font-bold text-zinc-900 tracking-tight">CaterPro</h1>
                <p className="text-xs font-medium text-zinc-500">v2.0 SaaS</p>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2 px-3 py-6 overflow-y-auto overflow-x-hidden">
            {!isCollapsed && <p className="px-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Platform</p>}
            {visibleNavItems.map((item) => {
              const isActive = currentPath === item.href;
              return (
                <a
                  key={item.label}
                  href={item.href}
                  title={isCollapsed ? item.label : undefined}
                  onClick={() => setIsOpen(false)}
                  className={`group flex items-center ${isCollapsed ? 'justify-center p-2.5 mx-auto w-12' : 'gap-3 px-3 py-2.5'} text-sm font-medium rounded-xl transition-all ${isActive
                    ? 'bg-zinc-900 text-white shadow-md shadow-zinc-900/10'
                    : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
                    }`}
                >
                  <item.icon className={`h-5 w-5 shrink-0 transition-colors ${isActive ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-600'}`} />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </a>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="p-3 border-t border-zinc-100 space-y-2">
            {!isCollapsed ? (
              <div className="flex items-center gap-3 p-2 rounded-xl bg-zinc-50 mb-2">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-linear-to-tr from-zinc-700 to-zinc-900 border border-zinc-800 text-sm font-bold text-white">
                  {user?.name.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-zinc-900 truncate">{user?.name || 'User'}</p>
                  <p className="text-xs text-zinc-500 truncate">{user?.email || ''}</p>
                </div>
              </div>
            ) : (
              <div className="flex justify-center p-1 mb-2">
                <div title={user?.name || 'User'} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-linear-to-tr from-zinc-700 to-zinc-900 border border-zinc-800 text-sm font-bold text-white cursor-help">
                  {user?.name.charAt(0).toUpperCase() || 'U'}
                </div>
              </div>
            )}
            <button
              onClick={logout}
              title={isCollapsed ? "Logout" : undefined}
              className={`flex items-center ${isCollapsed ? 'justify-center p-2.5 mx-auto w-12' : 'w-full gap-2 px-3 py-2'} text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-all`}
            >
              <LogOut className="h-5 w-5 shrink-0" />
              {!isCollapsed && <span>Logout</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
