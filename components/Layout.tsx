
import React from 'react';
import { TabType } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'dashboard', label: 'Daily Dose', icon: 'fa-house' },
    { id: 'research', label: 'Research Lab', icon: 'fa-microscope' },
    { id: 'resources', label: 'Live Sources', icon: 'fa-play' },
    { id: 'quiz', label: 'Self Test', icon: 'fa-pen-to-square' },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      {/* Sidebar - Desktop (Hidden on print) */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white p-6 sticky top-0 h-screen no-print">
        <div className="flex items-center gap-3 mb-10">
          <div className="bg-orange-500 p-2 rounded-lg">
            <i className="fa-solid fa-graduation-cap text-xl"></i>
          </div>
          <h1 className="text-xl font-bold tracking-tight">RAS Companion</h1>
        </div>
        
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as TabType)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.id 
                ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20' 
                : 'hover:bg-slate-800 text-slate-400'
              }`}
            >
              <i className={`fa-solid ${item.icon} w-5`}></i>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-800">
          <p className="text-xs text-slate-500 mb-2">Powered by Gemini AI</p>
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            Online & Ready
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 p-4 md:px-8 flex items-center justify-between no-print">
          <div className="md:hidden flex items-center gap-2">
             <i className="fa-solid fa-graduation-cap text-orange-500 text-xl"></i>
             <span className="font-bold">RAS Companion</span>
          </div>
          <h2 className="text-lg font-semibold text-gray-800 capitalize hidden md:block">
            {activeTab === 'dashboard' ? 'Rajasthan Current Affairs' : activeTab}
          </h2>
          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <i className="fa-solid fa-bell"></i>
            </button>
            <div className="w-8 h-8 rounded-full bg-orange-100 border border-orange-200 flex items-center justify-center text-orange-600 font-bold">
              R
            </div>
          </div>
        </header>

        <div className="p-4 md:p-8 max-w-6xl mx-auto">
          {children}
        </div>

        {/* Mobile Navigation (Hidden on print) */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center p-3 z-50 no-print">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as TabType)}
              className={`flex flex-col items-center gap-1 transition-colors ${
                activeTab === item.id ? 'text-orange-500' : 'text-gray-400'
              }`}
            >
              <i className={`fa-solid ${item.icon} text-lg`}></i>
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
      </main>
    </div>
  );
};

export default Layout;
