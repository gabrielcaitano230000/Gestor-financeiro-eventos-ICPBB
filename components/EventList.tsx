
import React from 'react';
import { ChurchEvent } from '../types';
import { Calendar, Clock } from 'lucide-react';

interface EventListProps {
  events: ChurchEvent[];
  onSelectEvent: (event: ChurchEvent) => void;
}

const EventList: React.FC<EventListProps> = ({ events, onSelectEvent }) => {
  // Função auxiliar para criar data local sem erro de fuso horário
  const parseLocalDatePicker = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const getDaysRemaining = (dateString: string) => {
    const eventDate = parseLocalDatePicker(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const sortedEvents = [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Meus Eventos</h2>
          <p className="text-slate-500">Gerencie o planejamento e orçamento de suas atividades.</p>
        </div>
      </header>

      {events.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-20 flex flex-col items-center text-center">
          <div className="bg-slate-50 p-6 rounded-full mb-4">
            <Calendar className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-800">Nenhum evento criado</h3>
          <p className="text-slate-500 mt-2 max-w-sm">
            Comece criando o primeiro evento da sua igreja clicando no botão "Novo Evento" na barra lateral.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {sortedEvents.map((event) => {
            const daysLeft = getDaysRemaining(event.date);
            const totalBudget = event.items.reduce((acc, i) => acc + (i.actualPrice || i.estimatedPrice), 0);
            const isFinished = daysLeft < 0;

            // Formata a data ignorando UTC
            const localDate = parseLocalDatePicker(event.date);

            return (
              <button
                key={event.id}
                onClick={() => onSelectEvent(event)}
                className="group text-left bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all duration-300 relative overflow-hidden"
              >
                {/* Status Badge */}
                <div className={`absolute top-0 right-0 px-4 py-1.5 rounded-bl-2xl text-[10px] font-bold uppercase tracking-widest ${
                  isFinished ? 'bg-slate-100 text-slate-500' : 'bg-blue-500 text-white'
                }`}>
                  {isFinished ? 'Finalizado' : 'Em Planejamento'}
                </div>

                <div className="mb-4">
                   <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 mb-4 group-hover:scale-110 transition-transform">
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

                <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-50">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Budget Total</span>
                    <span className="text-lg font-bold text-slate-900">R$ {totalBudget.toLocaleString('pt-BR')}</span>
                  </div>
                  
                  {!isFinished ? (
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-blue-400 uppercase tracking-tighter block">Faltam</span>
                      <span className="text-2xl font-black text-blue-500">{daysLeft} <span className="text-sm font-medium">dias</span></span>
                    </div>
                  ) : (
                    <div className="text-right">
                      <span className="text-xs font-medium text-slate-400 italic">Encerrado</span>
                    </div>
                  )}
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
