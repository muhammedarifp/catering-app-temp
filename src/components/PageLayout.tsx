'use client';

import { useState } from 'react';
import Sidebar from './Sidebar';
import ProtectedRoute from './ProtectedRoute';

interface PageLayoutProps {
  children: React.ReactNode;
  currentPath?: string;
  requiredPermission?: string;
}

export default function PageLayout({ children, currentPath, requiredPermission }: PageLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <ProtectedRoute requiredPage={currentPath} requiredPermission={requiredPermission}>
      <Sidebar
        currentPath={currentPath}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />
      <main className={`min-h-screen pt-14 lg:pt-0 transition-all duration-300 ${isCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        {children}
      </main>
    </ProtectedRoute>
  );
}
