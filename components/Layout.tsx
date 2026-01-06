
import React from 'react';
import { LayoutDashboard, CalendarDays, PlusCircle, Church } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: 'dashboard' | 'events';
  onTabChange: (tab: 'dashboard' | 'events') => void;
  onAddEvent: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange, onAddEvent }) => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-blue-600 text-white flex flex-col no-print md:sticky md:top-0 md:h-screen">
        <div className="p-6 flex items-center gap-3">
          <Church className="w-8 h-8 text-blue-200" />
          <h1 className="text-xl font-bold tracking-tight">Financeiro Eventos ICPBB</h1>
        </div>
        
        {/* Novo Evento moved to top */}
        <div className="px-4 pb-6">
          <button
            onClick={onAddEvent}
            className="w-full flex items-center justify-center gap-2 bg-blue-400 hover:bg-blue-300 text-white py-3 rounded-xl font-semibold shadow-md transition-all active:scale-95"
          >
            <PlusCircle className="w-5 h-5" />
            Novo Evento
          </button>
        </div>

        <nav className="flex-1 px-4 py-2 space-y-2">
          <button
            onClick={() => onTabChange('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === 'dashboard' ? 'bg-blue-700 text-white shadow-lg' : 'text-blue-100 hover:bg-blue-700/50'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="font-medium">Visão Geral</span>
          </button>
          
          <button
            onClick={() => onTabChange('events')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === 'events' ? 'bg-blue-700 text-white shadow-lg' : 'text-blue-100 hover:bg-blue-700/50'
            }`}
          >
            <CalendarDays className="w-5 h-5" />
            <span className="font-medium">Meus Eventos</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 overflow-auto">
        {children}
      </main>
    </div>
  );
};

export default Layout;
