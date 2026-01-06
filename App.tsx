
import React, { useState, useEffect, useCallback } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import EventList from './components/EventList';
import EventDetail from './components/EventDetail';
import { ChurchEvent, AppState } from './types';
import { X } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'events'>('dashboard');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [events, setEvents] = useState<ChurchEvent[]>([]);
  const [isAddingEvent, setIsAddingEvent] = useState(false);

  // Persistence
  useEffect(() => {
    const saved = localStorage.getItem('church_events_data');
    if (saved) {
      try {
        setEvents(JSON.parse(saved));
      } catch (e) {
        console.error("Error loading saved data", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('church_events_data', JSON.stringify(events));
  }, [events]);

  const handleAddEvent = (name: string, date: string, description: string) => {
    const newEvent: ChurchEvent = {
      id: crypto.randomUUID(),
      name,
      date,
      description,
      items: [],
      isArchived: false
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
      onTabChange={(tab) => {
        setActiveTab(tab);
        setSelectedEventId(null);
      }}
      onAddEvent={() => setIsAddingEvent(true)}
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
        <NewEventModal 
          onClose={() => setIsAddingEvent(false)} 
          onSubmit={handleAddEvent} 
        />
      )}
    </Layout>
  );
};

interface NewEventModalProps {
  onClose: () => void;
  onSubmit: (name: string, date: string, description: string) => void;
}

const NewEventModal: React.FC<NewEventModalProps> = ({ onClose, onSubmit }) => {
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
