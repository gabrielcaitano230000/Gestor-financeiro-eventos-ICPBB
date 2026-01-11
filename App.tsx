
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import EventList from './components/EventList';
import EventDetail from './components/EventDetail';
import { ChurchEvent, SyncState } from './types';
import { syncService } from './services/syncService';
import { X, Cloud, Copy, RefreshCw, Smartphone, Key, AlertCircle, CheckCircle2 } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'events'>('dashboard');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [events, setEvents] = useState<ChurchEvent[]>([]);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  
  // Sync States
  const [syncState, setSyncState] = useState<SyncState>({
    syncCode: localStorage.getItem('church_sync_code'),
    lastSynced: null,
    isSyncing: false,
    error: null
  });
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const syncTimeoutRef = useRef<number | null>(null);

  // Inicialização e Persistência Local
  useEffect(() => {
    const savedEvents = localStorage.getItem('church_events_data');
    if (savedEvents) {
      try {
        setEvents(JSON.parse(savedEvents));
      } catch (e) { console.error(e); }
    }

    // Se já tem código, tenta baixar a versão mais nova ao abrir
    if (syncState.syncCode) {
      handlePullFromCloud(syncState.syncCode);
    }
  }, []);

  // Persistência local e acionador de sincronização
  useEffect(() => {
    localStorage.setItem('church_events_data', JSON.stringify(events));
    
    // Auto-sync debounce
    if (syncState.syncCode) {
      if (syncTimeoutRef.current) window.clearTimeout(syncTimeoutRef.current);
      syncTimeoutRef.current = window.setTimeout(() => {
        handlePushToCloud(syncState.syncCode!, events);
      }, 2000);
    }
  }, [events, syncState.syncCode]);

  const handlePushToCloud = async (code: string, data: ChurchEvent[]) => {
    setSyncState(prev => ({ ...prev, isSyncing: true, error: null }));
    const success = await syncService.saveToCloud(code, data);
    if (success) {
      setSyncState(prev => ({ 
        ...prev, 
        isSyncing: false, 
        lastSynced: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) 
      }));
    } else {
      setSyncState(prev => ({ ...prev, isSyncing: false, error: 'Falha na conexão' }));
    }
  };

  const handlePullFromCloud = async (code: string) => {
    setSyncState(prev => ({ ...prev, isSyncing: true }));
    const data = await syncService.loadFromCloud(code);
    if (data) {
      setEvents(data);
      setSyncState(prev => ({ 
        ...prev, 
        syncCode: code,
        isSyncing: false, 
        lastSynced: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) 
      }));
      localStorage.setItem('church_sync_code', code);
    } else {
      setSyncState(prev => ({ ...prev, isSyncing: false, error: 'Código não encontrado' }));
    }
  };

  const handleConnectSync = (code: string) => {
    handlePullFromCloud(code);
    setIsSyncModalOpen(false);
  };

  const handleCreateSync = async () => {
    const newCode = syncService.generateSyncCode();
    setSyncState(prev => ({ ...prev, syncCode: newCode }));
    localStorage.setItem('church_sync_code', newCode);
    await handlePushToCloud(newCode, events);
    // Modal continua aberto para o usuário ver o código gerado
  };

  const handleDisconnectSync = () => {
    if (confirm("Deseja desconectar deste ID? O aplicativo parará de sincronizar, mas seus dados locais continuarão salvos.")) {
      setSyncState({ syncCode: null, lastSynced: null, isSyncing: false, error: null });
      localStorage.removeItem('church_sync_code');
      setIsSyncModalOpen(false);
    }
  };

  const handleAddEvent = (name: string, date: string, description: string) => {
    const newEvent: ChurchEvent = {
      id: crypto.randomUUID(),
      name, date, description,
      items: [],
      isArchived: false,
      status: 'active'
    };
    setEvents(prev => [...prev, newEvent]);
    setIsAddingEvent(false);
    setActiveTab('events');
  };

  const handleUpdateEvent = (updated: ChurchEvent) => {
    setEvents(prev => prev.map(e => e.id === updated.id ? updated : e));
  };

  const handleDeleteEvent = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
    setSelectedEventId(null);
  };

  const selectedEvent = events.find(e => e.id === selectedEventId);

  return (
    <Layout 
      activeTab={activeTab} 
      onTabChange={(tab) => { setActiveTab(tab); setSelectedEventId(null); }}
      onAddEvent={() => setIsAddingEvent(true)}
      onOpenSync={() => setIsSyncModalOpen(true)}
      syncStatus={{
        isConnected: !!syncState.syncCode,
        isSyncing: syncState.isSyncing,
        lastSynced: syncState.lastSynced
      }}
    >
      {selectedEvent ? (
        <EventDetail 
          event={selectedEvent} 
          onBack={() => setSelectedEventId(null)}
          onUpdateEvent={handleUpdateEvent}
          onDeleteEvent={handleDeleteEvent}
        />
      ) : activeTab === 'dashboard' ? (
        <Dashboard events={events} />
      ) : (
        <EventList 
          events={events} 
          onSelectEvent={(e) => setSelectedEventId(e.id)} 
          onAddEvent={() => setIsAddingEvent(true)}
        />
      )}

      {/* New Event Modal */}
      {isAddingEvent && (
        <NewEventModal onClose={() => setIsAddingEvent(false)} onSubmit={handleAddEvent} />
      )}

      {/* Sync Modal */}
      {isSyncModalOpen && (
        <SyncModal 
          state={syncState}
          onClose={() => setIsSyncModalOpen(false)}
          onConnect={handleConnectSync}
          onCreate={handleCreateSync}
          onDisconnect={handleDisconnectSync}
          onRefresh={() => syncState.syncCode && handlePullFromCloud(syncState.syncCode)}
        />
      )}
    </Layout>
  );
};

// --- Modais Auxiliares ---

const SyncModal: React.FC<{
  state: SyncState;
  onClose: () => void;
  onConnect: (code: string) => void;
  onCreate: () => void;
  onDisconnect: () => void;
  onRefresh: () => void;
}> = ({ state, onClose, onConnect, onCreate, onDisconnect, onRefresh }) => {
  const [inputCode, setInputCode] = useState('');
  const [copyFeedback, setCopyFeedback] = useState(false);

  const handleCopy = () => {
    if (state.syncCode) {
      navigator.clipboard.writeText(state.syncCode);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden relative">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800 leading-tight">Sincronização Nuvem</h3>
              <p className="text-xs text-slate-400 font-medium">Acesse de qualquer dispositivo</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        {state.syncCode ? (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-100 rounded-3xl p-6 text-center">
              <p className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em] mb-3">Seu Código de Sincronia</p>
              <div className="flex items-center justify-center gap-3 mb-2">
                <span className="text-2xl font-black text-blue-700 tracking-wider font-mono">{state.syncCode}</span>
                <button 
                  onClick={handleCopy}
                  className="p-2 bg-white text-blue-500 rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95 border border-blue-100"
                >
                  {copyFeedback ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-[10px] text-blue-600/70 font-medium">Copie este código e insira em outro dispositivo.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={onRefresh}
                disabled={state.isSyncing}
                className="flex items-center justify-center gap-2 py-3 bg-slate-50 text-slate-700 font-bold rounded-2xl hover:bg-slate-100 transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${state.isSyncing ? 'animate-spin' : ''}`} />
                Atualizar
              </button>
              <button 
                onClick={onDisconnect}
                className="py-3 text-red-500 font-bold rounded-2xl hover:bg-red-50 transition-all"
              >
                Desconectar
              </button>
            </div>

            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium bg-slate-50 p-3 rounded-xl">
              <AlertCircle className="w-3 h-3" />
              <span>Dica: Use em tablets, PCs e celulares para o financeiro estar sempre em dia.</span>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="relative">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Conectar via Código</label>
                <div className="relative group">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                  <input 
                    type="text" 
                    value={inputCode}
                    placeholder="ICPBB-XXXX-XXXX"
                    onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-100 rounded-2xl pl-12 pr-4 py-4 outline-none focus:ring-2 ring-blue-500/20 text-lg font-bold placeholder:text-slate-300 transition-all"
                  />
                </div>
                <button 
                  disabled={inputCode.length < 10 || state.isSyncing}
                  onClick={() => onConnect(inputCode)}
                  className="w-full mt-3 py-4 bg-blue-500 text-white font-bold rounded-2xl shadow-lg shadow-blue-100 hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-50"
                >
                  {state.isSyncing ? <RefreshCw className="w-5 h-5 animate-spin mx-auto" /> : 'Conectar e Baixar Dados'}
                </button>
              </div>

              <div className="flex items-center gap-4 py-2">
                <div className="h-px bg-slate-100 flex-1"></div>
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Ou</span>
                <div className="h-px bg-slate-100 flex-1"></div>
              </div>

              <button 
                onClick={onCreate}
                className="w-full py-4 border-2 border-dashed border-blue-200 text-blue-600 font-bold rounded-2xl hover:bg-blue-50 hover:border-blue-300 transition-all group"
              >
                <div className="flex items-center justify-center gap-2">
                  <Smartphone className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Gerar Novo ID de Nuvem
                </div>
              </button>
            </div>
            
            <p className="text-[10px] text-center text-slate-400 font-medium px-4 leading-relaxed">
              Ao gerar um ID, seus eventos locais serão enviados para a nuvem de forma segura. Use este ID para compartilhar o planejamento com sua equipe.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const NewEventModal: React.FC<{ onClose: () => void; onSubmit: (n: string, d: string, desc: string) => void }> = ({ onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-bold text-slate-800">Novo Evento</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>
        
        <div className="space-y-6">
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Nome do Evento</label>
            <input 
              autoFocus
              type="text" 
              value={name}
              placeholder="Ex: Conferência de Jovens"
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 outline-none focus:ring-2 ring-blue-500 text-lg font-medium"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Data do Evento</label>
            <input 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 outline-none focus:ring-2 ring-blue-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Breve Descrição</label>
            <textarea 
              value={description}
              rows={3}
              placeholder="Descreva o propósito ou local do evento..."
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 outline-none focus:ring-2 ring-blue-500 resize-none"
            />
          </div>

          <button 
            disabled={!name || !date}
            onClick={() => onSubmit(name, date, description)}
            className="w-full py-4 bg-blue-500 text-white font-bold rounded-2xl shadow-lg shadow-blue-100 hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            Criar Planejamento
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
