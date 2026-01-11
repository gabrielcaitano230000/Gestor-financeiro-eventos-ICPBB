
import React from 'react';
import { LayoutDashboard, CalendarDays, PlusCircle, Church, Cloud, CloudOff, RefreshCw, Settings } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: 'dashboard' | 'events';
  onTabChange: (tab: 'dashboard' | 'events') => void;
  onAddEvent: () => void;
  onOpenSync: () => void;
  syncStatus: {
    isConnected: boolean;
    isSyncing: boolean;
    lastSynced: string | null;
  };
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange, onAddEvent, onOpenSync, syncStatus }) => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-blue-600 text-white flex flex-col no-print md:sticky md:top-0 md:h-screen">
        <div className="p-6 flex items-center gap-3">
          <Church className="w-8 h-8 text-blue-200" />
          <h1 className="text-xl font-bold tracking-tight leading-tight">Financeiro ICPBB</h1>
        </div>
        
        {/* Novo Evento */}
        <div className="px-4 pb-4">
          <button
            onClick={onAddEvent}
            className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl font-bold shadow-sm transition-all active:scale-95 border border-white/10"
          >
            <PlusCircle className="w-5 h-5" />
            Novo Evento
          </button>
        </div>

        <nav className="flex-1 px-4 py-2 space-y-1">
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

        {/* Sync Status Section */}
        <div className="p-4 mt-auto border-t border-white/10 bg-blue-700/30">
          <button 
            onClick={onOpenSync}
            className="w-full group text-left space-y-2 hover:bg-white/5 p-3 rounded-2xl transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-blue-200">Sincronização</span>
              {syncStatus.isSyncing ? (
                <RefreshCw className="w-3 h-3 text-blue-300 animate-spin" />
              ) : syncStatus.isConnected ? (
                <Cloud className="w-3 h-3 text-emerald-400" />
              ) : (
                <CloudOff className="w-3 h-3 text-blue-300/50" />
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${syncStatus.isConnected ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 'bg-slate-400'}`} />
              <span className="text-sm font-bold truncate">
                {syncStatus.isConnected ? 'Nuvem Ativa' : 'Apenas Local'}
              </span>
            </div>
            {syncStatus.lastSynced && (
              <p className="text-[10px] text-blue-200/60 font-medium">
                Sincronizado: {syncStatus.lastSynced}
              </p>
            )}
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
