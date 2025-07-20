import React from 'react';
import Image from 'next/image';

interface NavbarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onTabChange }) => {
  return (
    <nav className="sticky top-0 z-40 bg-white shadow-lg border-b">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <Image
              src="/logo.png"
              alt="Lindsay Precast Logo"
              width={40}
              height={40}
              className="object-contain w-10 h-10"
            />
            <h1 className="text-2xl font-bold text-gray-900">
              <span className="text-blue-600">Lindsay Precast</span>
              <span className="text-gray-400 font-normal"> | Job Tracker</span>
            </h1>
          </div>
          <div className="flex space-x-8">
            <button
              onClick={() => onTabChange('dashboard')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-blue-100 text-blue-700 border-b-2 border-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => onTabChange('jobs')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'jobs'
                  ? 'bg-blue-100 text-blue-700 border-b-2 border-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Jobs
            </button>
            <button
              onClick={() => onTabChange('tasks')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'tasks'
                  ? 'bg-blue-100 text-blue-700 border-b-2 border-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Tasks
            </button>
            <button
              onClick={() => onTabChange('stats')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'stats'
                  ? 'bg-blue-100 text-blue-700 border-b-2 border-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Stats
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}; 