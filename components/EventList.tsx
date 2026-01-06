
import React from 'react';
import { ChurchEvent, ItemStatus } from '../types';
import { Calendar, Clock, PlusCircle, CheckCircle, Ban } from 'lucide-react';

interface EventListProps {
  events: ChurchEvent[];
  onSelectEvent: (event: ChurchEvent) => void;
  onAddEvent?: () => void;
}

const EventList: React.FC<EventListProps> = ({ events, onSelectEvent, onAddEvent }) => {
  const parseLocalDatePicker = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const sortedEvents = [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const getStatusDisplay = (event: ChurchEvent) => {
    switch (event.status) {
      case 'completed':
        return { label: 'Concluído', color: 'bg-emerald-500 text-white', icon: <CheckCircle className="w-3 h-3" /> };
      case 'cancelled':
        return { label: 'Cancelado', color: 'bg-red-500 text-white', icon: <Ban className="w-3 h-3" /> };
      default:
        return { label: 'Em Planejamento', color: 'bg-blue-500 text-white', icon: null };
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Meus Eventos</h2>
          <p className="text-slate-500">Gerencie o planejamento e orçamento de suas atividades.</p>
        </div>
        {onAddEvent && (
          <button
            onClick={onAddEvent}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-blue-100 transition-all active:scale-95 no-print"
          >
            <PlusCircle className="w-5 h-5" />
            Novo Evento
          </button>
        )}
      </header>

      {events.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-20 flex flex-col items-center text-center">
          <div className="bg-slate-50 p-6 rounded-full mb-4">
            <Calendar className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-800">Nenhum evento criado</h3>
          <p className="text-slate-500 mt-2 max-w-sm">
            Comece criando o primeiro evento da sua igreja clicando no botão "Novo Evento".
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {sortedEvents.map((event) => {
            const totalQuoted = event.items.reduce((acc, i) => acc + i.estimatedPrice, 0);
            
            // Total confirmado só considera itens com status Confirmado
            const totalConfirmed = event.items
              .filter(i => i.status === ItemStatus.CONFIRMED)
              .reduce((acc, i) => acc + i.actualPrice, 0);

            const statusInfo = getStatusDisplay(event);
            const localDate = parseLocalDatePicker(event.date);

            return (
              <button
                key={event.id}
                onClick={() => onSelectEvent(event)}
                className={`group text-left bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all duration-300 relative overflow-hidden ${
                  event.status === 'cancelled' ? 'opacity-75 grayscale-[0.5]' : ''
                }`}
              >
                {/* Status Badge */}
                <div className={`absolute top-0 right-0 px-4 py-1.5 rounded-bl-2xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 ${statusInfo.color}`}>
                  {statusInfo.icon}
                  {statusInfo.label}
                </div>

                <div className="mb-4">
                   <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${
                     event.status === 'completed' ? 'bg-emerald-50 text-emerald-500' : 
                     event.status === 'cancelled' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'
                   }`}>
                    <Calendar className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-1 group-hover:text-blue-600 transition-colors">{event.name}</h3>
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <Clock className="w-4 h-4" />
                    <span>{localDate.toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>

                <p className="text-slate-500 text-sm line-clamp-2 mb-6 min-h-[40px]">
                  {event.description || 'Sem descrição definida.'}
                </p>

                <div className="grid grid-cols-2 gap-4 mt-auto pt-6 border-t border-slate-50">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-amber-500 uppercase tracking-tighter">Total Cotado</span>
                    <span className="text-md font-bold text-slate-700">R$ {totalQuoted.toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="flex flex-col border-l border-slate-50 pl-4">
                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-tighter">Confirmado</span>
                    <span className="text-md font-bold text-slate-900">R$ {totalConfirmed.toLocaleString('pt-BR')}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EventList;
