'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '../../components/Navbar';

export default function CompletedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const handleTabChange = (tab: string) => {
    switch (tab) {
      case 'dashboard':
        router.push('/');
        break;
      case 'tasks':
        router.push('/?tab=tasks');
        break;
      case 'stats':
        router.push('/?tab=stats');
        break;
      case 'completed':
        router.push('/completed');
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar activeTab="completed" onTabChange={handleTabChange} />
      {children}
    </div>
  );
} 