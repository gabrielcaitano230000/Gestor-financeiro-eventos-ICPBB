
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
      <aside className="w-full md:w-64 bg-indigo-900 text-white flex flex-col no-print">
        <div className="p-6 flex items-center gap-3">
          <Church className="w-8 h-8 text-indigo-300" />
          <h1 className="text-xl font-bold tracking-tight">ICPBB Planeja</h1>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-2">
          <button
            onClick={() => onTabChange('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === 'dashboard' ? 'bg-indigo-800 text-white shadow-lg' : 'text-indigo-200 hover:bg-indigo-800/50'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="font-medium">Dashboard</span>
          </button>
          
          <button
            onClick={() => onTabChange('events')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === 'events' ? 'bg-indigo-800 text-white shadow-lg' : 'text-indigo-200 hover:bg-indigo-800/50'
            }`}
          >
            <CalendarDays className="w-5 h-5" />
            <span className="font-medium">Meus Eventos</span>
          </button>
        </nav>
        
        <div className="p-4 border-t border-indigo-800">
          <button
            onClick={onAddEvent}
            className="w-full flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white py-3 rounded-xl font-semibold shadow-md transition-all active:scale-95"
          >
            <PlusCircle className="w-5 h-5" />
            Novo Evento
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 overflow-auto">
        {children}
      </main>
    </div>
  );
};

export default Layout;
