'use client';

import Sidebar from './Sidebar';

interface PageLayoutProps {
  children: React.ReactNode;
  currentPath?: string;
}

export default function PageLayout({ children, currentPath }: PageLayoutProps) {
  return (
    <>
      <Sidebar currentPath={currentPath} />
      <main className="min-h-screen pt-14 lg:ml-64 lg:pt-0">
        {children}
      </main>
    </>
  );
}
