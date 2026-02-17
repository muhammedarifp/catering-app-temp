'use client';

import Sidebar from './Sidebar';
import ProtectedRoute from './ProtectedRoute';

interface PageLayoutProps {
  children: React.ReactNode;
  currentPath?: string;
  requiredPermission?: string;
}

export default function PageLayout({ children, currentPath, requiredPermission }: PageLayoutProps) {
  return (
    <ProtectedRoute requiredPage={currentPath} requiredPermission={requiredPermission}>
      <Sidebar currentPath={currentPath} />
      <main className="min-h-screen pt-14 lg:ml-64 lg:pt-0">
        {children}
      </main>
    </ProtectedRoute>
  );
}
