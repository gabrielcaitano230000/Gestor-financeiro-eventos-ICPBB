
import React, { useState, useEffect, useMemo } from 'react';
import { ChurchEvent, Budget, ItemStatus, ItemCategory, PaymentMethod, PaymentPlan, EventStatus } from '../types';
import { 
  ArrowLeft, Plus, Trash2, Printer, 
  CreditCard, User, 
  Layers, ListFilter, Edit3, Save, X, CheckCircle, Ban, AlertCircle
} from 'lucide-react';

interface EventDetailProps {
  event: ChurchEvent;
  onBack: () => void;
  onUpdateEvent: (updatedEvent: ChurchEvent) => void;
  onDeleteEvent: (id: string) => void;
}

const EventDetail: React.FC<EventDetailProps> = ({ event, onBack, onUpdateEvent, onDeleteEvent }) => {
  const [items, setItems] = useState<Budget[]>(event.items);
  const [showItemForm, setShowItemForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState<ItemStatus | 'TODOS'>('TODOS');
  
  const [isEditingHeader, setIsEditingHeader] = useState(false);
  const [editName, setEditName] = useState(event.name);
  const [editDate, setEditDate] = useState(event.date);
  const [editDescription, setEditDescription] = useState(event.description);

  const [newItem, setNewItem] = useState<Partial<Budget>>({
    name: '',
    category: ItemCategory.EQUIPMENT,
    status: ItemStatus.PENDING,
    estimatedPrice: 0,
    actualPrice: 0,
    supplier: ''
  });

  useEffect(() => {
    setItems(event.items);
  }, [event]);

  const parseLocalDatePicker = (dateString: string) => {
    if (!dateString) return new Date();
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const handleUpdateHeader = () => {
    onUpdateEvent({
      ...event,
      name: editName,
      date: editDate,
      description: editDescription
    });
    setIsEditingHeader(false);
  };

  const setEventStatus = (status: EventStatus) => {
    onUpdateEvent({ ...event, status });
  };

  const handleAddItem = () => {
    if (!newItem.name) return;
    const itemToAdd: Budget = {
      ...newItem as Budget,
      id: crypto.randomUUID(),
      status: ItemStatus.PENDING, // Garante que novo item sempre nasce pendente
      estimatedPrice: Number(newItem.estimatedPrice) || 0,
      actualPrice: Number(newItem.actualPrice) || 0,
    };
    const updatedItems = [...items, itemToAdd];
    onUpdateEvent({ ...event, items: updatedItems });
    setNewItem({
      name: '',
      category: ItemCategory.EQUIPMENT,
      status: ItemStatus.PENDING,
      estimatedPrice: 0,
      actualPrice: 0,
      supplier: ''
    });
    setShowItemForm(false);
  };

  const handleDeleteItem = (id: string) => {
    const updatedItems = items.filter(i => i.id !== id);
    onUpdateEvent({ ...event, items: updatedItems });
  };

  const handleUpdateItemStatus = (id: string, status: ItemStatus) => {
    const updatedItems = items.map(i => {
      if (i.id === id) {
        const updated = { ...i, status };
        if (status === ItemStatus.CONFIRMED && !i.paymentMethod) {
          updated.paymentMethod = PaymentMethod.DIRECT;
          updated.paymentPlan = PaymentPlan.FULL;
        }
        return updated;
      }
      return i;
    });
    onUpdateEvent({ ...event, items: updatedItems });
  };

  const handleUpdateItemField = (id: string, field: keyof Budget, value: any) => {
    const updatedItems = items.map(i => i.id === id ? { ...i, [field]: value } : i);
    onUpdateEvent({ ...event, items: updatedItems });
  };

  const filteredItems = useMemo(() => {
    if (statusFilter === 'TODOS') return items;
    return items.filter(i => i.status === statusFilter);
  }, [items, statusFilter]);

  // Total Cotado é a soma de todas as referências do planejamento
  const totalQuoted = items.reduce((acc, i) => acc + i.estimatedPrice, 0);
  
  // Total Confirmado soma APENAS os itens marcados como Confirmado
  const totalConfirmed = items
    .filter(i => i.status === ItemStatus.CONFIRMED)
    .reduce((acc, i) => acc + i.actualPrice, 0);

  const handlePrint = () => {
    window.print();
  };

  const getStatusColor = (status: ItemStatus) => {
    switch (status) {
      case ItemStatus.CONFIRMED: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const localDateStr = parseLocalDatePicker(event.date).toLocaleDateString('pt-BR');

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
      {/* Navigation & Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 no-print bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="flex items-start gap-4 flex-1">
          <button 
            onClick={onBack}
            className="p-3 hover:bg-slate-50 rounded-2xl transition-all mt-1"
          >
            <ArrowLeft className="w-6 h-6 text-slate-600" />
          </button>
          
          {isEditingHeader ? (
            <div className="flex-1 space-y-4 pr-4">
              <input 
                type="text" 
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="text-3xl font-bold text-slate-800 w-full border-b-2 border-blue-500 outline-none pb-1"
                placeholder="Nome do Evento"
              />
              <div className="flex gap-4">
                <input 
                  type="date" 
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="bg-slate-50 px-3 py-2 rounded-xl outline-none text-slate-600 font-medium"
                />
              </div>
              <textarea 
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="w-full bg-slate-50 p-3 rounded-xl outline-none text-slate-600 text-sm resize-none"
                rows={2}
                placeholder="Descrição do evento..."
              />
              <div className="flex gap-2">
                <button 
                  onClick={handleUpdateHeader}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg shadow-blue-100 hover:bg-blue-700"
                >
                  <Save className="w-4 h-4" /> Salvar Alterações
                </button>
                <button 
                  onClick={() => setIsEditingHeader(false)}
                  className="flex items-center gap-2 bg-slate-100 text-slate-600 px-4 py-2 rounded-xl font-bold text-sm hover:bg-slate-200"
                >
                  <X className="w-4 h-4" /> Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-bold text-slate-800">{event.name}</h2>
                <button 
                  onClick={() => setIsEditingHeader(true)}
                  className="p-1.5 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                  title="Editar dados do evento"
                >
                  <Edit3 className="w-5 h-5" />
                </button>
                {event.status === 'completed' && <CheckCircle className="w-6 h-6 text-emerald-500" />}
                {event.status === 'cancelled' && <Ban className="w-6 h-6 text-red-500" />}
              </div>
              <div className="flex items-center gap-2 text-slate-500 text-sm mt-1">
                 <span className="font-semibold text-blue-600">{localDateStr}</span>
                 <span>•</span>
                 <span className="font-medium italic">{event.description || 'Sem descrição'}</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 self-end md:self-start">
          <button
            onClick={() => setEventStatus('completed')}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold transition-all active:scale-95 ${
              event.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
            }`}
          >
            <CheckCircle className="w-5 h-5" />
            Concluir Evento
          </button>

          <button
            onClick={() => setEventStatus('cancelled')}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold transition-all active:scale-95 ${
              event.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-red-50 text-red-600 hover:bg-red-100'
            }`}
          >
            <Ban className="w-5 h-5" />
            Cancelar Evento
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-slate-100 text-slate-700 px-5 py-3 rounded-2xl font-bold hover:bg-slate-200 transition-all active:scale-95"
          >
            <Printer className="w-5 h-5" />
            Relatório
          </button>

          <button
            onClick={() => { if(confirm('Excluir permanentemente este evento?')) { onDeleteEvent(event.id); onBack(); } }}
            className="p-3 bg-slate-100 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 no-print">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 ring-2 ring-amber-50">
          <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">Total Cotado (Referência)</p>
          <h3 className="text-3xl font-black text-slate-700">R$ {totalQuoted.toLocaleString('pt-BR')}</h3>
          <p className="text-[10px] text-slate-400 mt-2">Soma de todas as cotações levantadas</p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 ring-4 ring-emerald-50">
          <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-1">Total Confirmado (Pago)</p>
          <h3 className="text-3xl font-black text-emerald-600">R$ {totalConfirmed.toLocaleString('pt-BR')}</h3>
          <p className="text-[10px] text-emerald-400 mt-2">Valores de itens com status "Confirmado"</p>
        </div>
      </div>

      {/* Item List */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col gap-4">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <ListFilter className="w-5 h-5 text-blue-500" />
              Itens do Orçamento
            </h3>
            <div className="flex gap-2">
              {(['TODOS', ...Object.values(ItemStatus)] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    statusFilter === status 
                      ? 'bg-blue-500 text-white shadow-md' 
                      : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  {status === 'TODOS' ? 'Todos' : status}
                </button>
              ))}
            </div>
          </div>
          <button 
            onClick={() => setShowItemForm(true)}
            className="flex items-center justify-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-600 shadow-lg shadow-blue-100 transition-all active:scale-95 no-print"
          >
            <Plus className="w-5 h-5" />
            Adicionar Item
          </button>
        </div>

        <div className="p-4 space-y-4">
          {filteredItems.map((item) => {
            const hasDiscrepancy = item.estimatedPrice !== item.actualPrice && item.actualPrice > 0;
            
            return (
              <div 
                key={item.id} 
                className={`bg-white border rounded-3xl p-6 transition-all group ${
                  item.status === ItemStatus.CONFIRMED ? 'border-emerald-200 bg-emerald-50/10' : 'border-slate-100'
                }`}
              >
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-bold text-slate-800">{item.name}</h4>
                        <div className="flex gap-2 mt-1">
                          <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full font-bold uppercase">{item.category}</span>
                          <span className={`text-[10px] px-2 py-0.5 border rounded-full font-bold uppercase ${getStatusColor(item.status)}`}>
                            {item.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 no-print">
                        <select 
                          value={item.status} 
                          onChange={(e) => handleUpdateItemStatus(item.id, e.target.value as ItemStatus)}
                          className="text-xs font-bold bg-slate-50 border-none rounded-xl px-3 py-1.5 outline-none cursor-pointer"
                        >
                          {Object.values(ItemStatus).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <button 
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="text-[10px] font-bold text-amber-500 uppercase tracking-widest block mb-1">Valor Cotado</label>
                        <div className="flex items-center gap-1">
                          <span className="text-amber-300 text-sm font-bold">R$</span>
                          <input 
                            type="number"
                            value={item.estimatedPrice}
                            onChange={(e) => handleUpdateItemField(item.id, 'estimatedPrice', parseFloat(e.target.value) || 0)}
                            className="bg-transparent font-bold text-slate-600 w-full outline-none border-b border-transparent focus:border-amber-200 no-print"
                          />
                          <span className="print-only font-semibold">{item.estimatedPrice}</span>
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest block mb-1">Valor Confirmado</label>
                        <div className="flex items-center gap-1">
                          <span className="text-emerald-300 text-sm font-bold">R$</span>
                          <input 
                            type="number"
                            value={item.actualPrice}
                            onChange={(e) => handleUpdateItemField(item.id, 'actualPrice', parseFloat(e.target.value) || 0)}
                            className="bg-emerald-50/30 font-bold text-emerald-700 w-full px-2 py-1 rounded-lg outline-none focus:ring-1 ring-emerald-200 no-print"
                          />
                          <span className="print-only font-bold text-emerald-700">{item.actualPrice}</span>
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Fornecedor</label>
                        <input 
                          type="text"
                          value={item.supplier}
                          placeholder="Quem fornecerá?"
                          onChange={(e) => handleUpdateItemField(item.id, 'supplier', e.target.value)}
                          className="bg-transparent text-sm font-medium text-slate-600 w-full outline-none no-print"
                        />
                        <span className="print-only">{item.supplier}</span>
                      </div>
                    </div>

                    {/* Justificativa automática se houver diferença e item for confirmado */}
                    {hasDiscrepancy && item.status === ItemStatus.CONFIRMED && (
                      <div className="mt-4 p-4 bg-amber-50 border border-amber-100 rounded-2xl animate-in slide-in-from-top-2 duration-300">
                        <div className="flex items-center gap-2 mb-2 text-amber-700">
                          <AlertCircle className="w-4 h-4" />
                          <label className="text-[10px] font-bold uppercase tracking-widest">Justificativa da diferença de valores</label>
                        </div>
                        <textarea
                          value={item.discrepancyNotes || ''}
                          onChange={(e) => handleUpdateItemField(item.id, 'discrepancyNotes', e.target.value)}
                          placeholder="Por que o valor confirmado é diferente do cotado?"
                          className="w-full bg-white border-none rounded-xl p-3 text-sm text-slate-600 outline-none focus:ring-1 ring-amber-300"
                          rows={2}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {item.status === ItemStatus.CONFIRMED && (
                  <div className="mt-8 pt-6 border-t border-emerald-100">
                    <div className="flex items-center gap-2 mb-6 text-emerald-700">
                      <CreditCard className="w-4 h-4" />
                      <h5 className="text-sm font-bold uppercase tracking-widest">Pagamento</h5>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Forma</label>
                        <div className="flex gap-2">
                          {Object.values(PaymentMethod).map(method => (
                            <button
                              key={method}
                              onClick={() => handleUpdateItemField(item.id, 'paymentMethod', method)}
                              className={`flex-1 py-2 px-3 rounded-xl text-[10px] font-bold border transition-all ${
                                item.paymentMethod === method 
                                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-100' 
                                  : 'bg-white text-slate-400 border-slate-100 hover:border-emerald-200'
                              }`}
                            >
                              {method}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Plano</label>
                        <div className="flex gap-2">
                          {Object.values(PaymentPlan).map(plan => (
                            <button
                              key={plan}
                              onClick={() => handleUpdateItemField(item.id, 'paymentPlan', plan)}
                              className={`flex-1 py-2 px-3 rounded-xl text-[10px] font-bold border transition-all ${
                                item.paymentPlan === plan 
                                  ? 'bg-blue-500 text-white border-blue-500 shadow-md shadow-blue-100' 
                                  : 'bg-white text-slate-400 border-slate-100 hover:border-blue-200'
                              }`}
                            >
                              {plan}
                            </button>
                          ))}
                        </div>
                      </div>

                      {item.paymentPlan === PaymentPlan.INSTALLMENTS && (
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Parcelas</label>
                          <div className="relative">
                            <Layers className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input 
                              type="number"
                              min="2"
                              value={item.installmentsCount || 2}
                              onChange={(e) => handleUpdateItemField(item.id, 'installmentsCount', parseInt(e.target.value) || 2)}
                              className="w-full bg-white border border-slate-100 rounded-xl pl-10 pr-4 py-2 text-sm font-bold outline-none focus:ring-1 ring-blue-500"
                            />
                          </div>
                        </div>
                      )}

                      {item.paymentMethod === PaymentMethod.REIMBURSEMENT && (
                        <div className="col-span-1 md:col-span-2 lg:col-span-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Recebedor</label>
                          <input 
                            type="text"
                            value={item.reimbursementRecipient || ''}
                            placeholder="Nome / PIX"
                            onChange={(e) => handleUpdateItemField(item.id, 'reimbursementRecipient', e.target.value)}
                            className="w-full bg-white border border-slate-100 rounded-xl px-4 py-2 text-sm outline-none"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal - Add Item */}
      {showItemForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 no-print">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-bold text-slate-800 mb-6">Novo Item</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">O que está comprando?</label>
                <input 
                  type="text" 
                  value={newItem.name}
                  placeholder="Ex: Kit de Microfone"
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3 outline-none focus:ring-2 ring-blue-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Categoria</label>
                  <select 
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value as ItemCategory })}
                    className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3 outline-none focus:ring-2 ring-blue-500"
                  >
                    {Object.values(ItemCategory).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                   <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Valor Cotado (R$)</label>
                   <input 
                    type="number" 
                    value={newItem.estimatedPrice}
                    onChange={(e) => setNewItem({ ...newItem, estimatedPrice: parseFloat(e.target.value) })}
                    className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3 outline-none focus:ring-2 ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-6">
                <button 
                  onClick={() => setShowItemForm(false)}
                  className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-all"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleAddItem}
                  className="flex-1 py-3 bg-blue-500 text-white font-bold rounded-2xl shadow-lg shadow-blue-100 hover:bg-blue-600 transition-all active:scale-95"
                >
                  Salvar Item
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDetail;
