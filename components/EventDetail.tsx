
import React, { useState, useEffect, useMemo } from 'react';
import { ChurchEvent, Budget, ItemStatus, ItemCategory, PaymentMethod, PaymentPlan } from '../types';
import { 
  ArrowLeft, Plus, Trash2, Printer, 
  CheckCircle, Clock, AlertTriangle, 
  Sparkles, FileText, CreditCard, User, 
  Wallet, Layers, ListFilter
} from 'lucide-react';
import { getBudgetAdvice } from '../services/geminiService';

interface EventDetailProps {
  event: ChurchEvent;
  onBack: () => void;
  onUpdateEvent: (updatedEvent: ChurchEvent) => void;
  onDeleteEvent: (id: string) => void;
}

const EventDetail: React.FC<EventDetailProps> = ({ event, onBack, onUpdateEvent, onDeleteEvent }) => {
  const [items, setItems] = useState<Budget[]>(event.items);
  const [showItemForm, setShowItemForm] = useState(false);
  const [advice, setAdvice] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<ItemStatus | 'TODOS'>('TODOS');

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

  const handleAddItem = () => {
    if (!newItem.name) return;
    const itemToAdd: Budget = {
      ...newItem as Budget,
      id: crypto.randomUUID(),
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
        // Initialize payment fields if confirmed and they don't exist
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

  // Totals calculations
  const totalEstimated = items.reduce((acc, i) => acc + i.estimatedPrice, 0);
  const totalQuoted = items.filter(i => i.status === ItemStatus.QUOTED || i.status === ItemStatus.CONFIRMED).reduce((acc, i) => acc + i.actualPrice, 0);
  const totalConfirmed = items.filter(i => i.status === ItemStatus.CONFIRMED).reduce((acc, i) => acc + i.actualPrice, 0);

  const handlePrint = () => {
    window.print();
  };

  const fetchAdvice = async () => {
    setIsAnalyzing(true);
    const result = await getBudgetAdvice(event);
    setAdvice(result || null);
    setIsAnalyzing(false);
  };

  const getStatusColor = (status: ItemStatus) => {
    switch (status) {
      case ItemStatus.CONFIRMED: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case ItemStatus.QUOTED: return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
      {/* Navigation & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-3 hover:bg-white hover:shadow-md rounded-2xl transition-all"
          >
            <ArrowLeft className="w-6 h-6 text-slate-600" />
          </button>
          <div>
            <h2 className="text-3xl font-bold text-slate-800">{event.name}</h2>
            <div className="flex items-center gap-2 text-slate-500 text-sm">
               <span>{new Date(event.date).toLocaleDateString('pt-BR')}</span>
               <span>•</span>
               <span className="font-medium">{event.description}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAdvice}
            disabled={isAnalyzing}
            className="flex items-center gap-2 bg-indigo-50 text-indigo-600 px-5 py-3 rounded-2xl font-bold hover:bg-indigo-100 transition-all active:scale-95 disabled:opacity-50"
          >
            <Sparkles className={`w-5 h-5 ${isAnalyzing ? 'animate-pulse' : ''}`} />
            {isAnalyzing ? 'Analisando...' : 'IA Assistente'}
          </button>
          
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-slate-100 text-slate-700 px-5 py-3 rounded-2xl font-bold hover:bg-slate-200 transition-all active:scale-95"
          >
            <Printer className="w-5 h-5" />
            Relatório
          </button>

          <button
            onClick={() => { if(confirm('Excluir este evento?')) { onDeleteEvent(event.id); onBack(); } }}
            className="p-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-2xl transition-all active:scale-95"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 no-print">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Estimado</p>
          <h3 className="text-2xl font-black text-slate-700">R$ {totalEstimated.toLocaleString('pt-BR')}</h3>
          <p className="text-[10px] text-slate-400 mt-2">Expectativa inicial</p>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 ring-2 ring-amber-100">
          <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">Total Cotado</p>
          <h3 className="text-2xl font-black text-amber-600">R$ {totalQuoted.toLocaleString('pt-BR')}</h3>
          <p className="text-[10px] text-amber-400 mt-2">Valores pesquisados</p>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 ring-4 ring-emerald-50">
          <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-1">Total Confirmado</p>
          <h3 className="text-2xl font-black text-emerald-600">R$ {totalConfirmed.toLocaleString('pt-BR')}</h3>
          <p className="text-[10px] text-emerald-400 mt-2">Pagamentos assumidos</p>
        </div>
      </div>

      {/* Item List Header and Tabs */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col gap-4">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <ListFilter className="w-5 h-5 text-indigo-500" />
              Gestão de Cotações
            </h3>
            <div className="flex flex-wrap gap-2 no-print">
              {(['TODOS', ...Object.values(ItemStatus)] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    statusFilter === status 
                      ? 'bg-indigo-600 text-white shadow-md' 
                      : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  {status === 'TODOS' ? 'Todos os Itens' : status}
                  <span className="ml-2 px-1.5 py-0.5 bg-black/10 rounded-md text-[10px]">
                    {status === 'TODOS' ? items.length : items.filter(i => i.status === status).length}
                  </span>
                </button>
              ))}
            </div>
          </div>
          <button 
            onClick={() => setShowItemForm(true)}
            className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95 no-print"
          >
            <Plus className="w-5 h-5" />
            Adicionar Item
          </button>
        </div>

        {/* Item Cards / Detailed Rows */}
        <div className="p-4 space-y-4">
          {filteredItems.map((item) => (
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
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Estimado</label>
                      <div className="flex items-center gap-1">
                        <span className="text-slate-300 text-sm">R$</span>
                        <input 
                          type="number"
                          value={item.estimatedPrice}
                          onChange={(e) => handleUpdateItemField(item.id, 'estimatedPrice', parseFloat(e.target.value) || 0)}
                          className="bg-transparent font-medium text-slate-600 w-full outline-none focus:border-b border-indigo-200 no-print"
                        />
                        <span className="print-only">{item.estimatedPrice}</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block mb-1">Valor Cotado</label>
                      <div className="flex items-center gap-1">
                        <span className="text-amber-300 text-sm font-bold">R$</span>
                        <input 
                          type="number"
                          value={item.actualPrice}
                          onChange={(e) => handleUpdateItemField(item.id, 'actualPrice', parseFloat(e.target.value) || 0)}
                          className="bg-amber-50/30 font-bold text-amber-700 w-full px-2 py-1 rounded-lg outline-none focus:ring-1 ring-amber-200 no-print"
                        />
                        <span className="print-only">{item.actualPrice}</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Fornecedor</label>
                      <input 
                        type="text"
                        value={item.supplier}
                        placeholder="Nome do Fornecedor"
                        onChange={(e) => handleUpdateItemField(item.id, 'supplier', e.target.value)}
                        className="bg-transparent text-sm font-medium text-slate-600 w-full outline-none no-print"
                      />
                      <span className="print-only">{item.supplier}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Details Section - Only visible if confirmed */}
              {item.status === ItemStatus.CONFIRMED && (
                <div className="mt-8 pt-6 border-t border-emerald-100 animate-in slide-in-from-top-2 duration-300">
                  <div className="flex items-center gap-2 mb-6 text-emerald-700">
                    <CreditCard className="w-4 h-4" />
                    <h5 className="text-sm font-bold uppercase tracking-widest">Informações de Pagamento</h5>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Forma de Pagamento</label>
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
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100' 
                                : 'bg-white text-slate-400 border-slate-100 hover:border-indigo-200'
                            }`}
                          >
                            {plan}
                          </button>
                        ))}
                      </div>
                    </div>

                    {item.paymentPlan === PaymentPlan.INSTALLMENTS && (
                      <div className="animate-in zoom-in-95 duration-200">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Nº de Parcelas</label>
                        <div className="relative">
                          <Layers className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input 
                            type="number"
                            min="2"
                            value={item.installmentsCount || 2}
                            onChange={(e) => handleUpdateItemField(item.id, 'installmentsCount', parseInt(e.target.value) || 2)}
                            className="w-full bg-white border border-slate-100 rounded-xl pl-10 pr-4 py-2 text-sm font-bold outline-none focus:ring-1 ring-indigo-500"
                          />
                        </div>
                      </div>
                    )}

                    {item.paymentMethod === PaymentMethod.REIMBURSEMENT && (
                      <div className="col-span-1 md:col-span-2 lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in zoom-in-95 duration-200">
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Quem recebe?</label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input 
                              type="text"
                              value={item.reimbursementRecipient || ''}
                              placeholder="Nome da pessoa"
                              onChange={(e) => handleUpdateItemField(item.id, 'reimbursementRecipient', e.target.value)}
                              className="w-full bg-white border border-slate-100 rounded-xl pl-10 pr-4 py-2 text-sm font-medium outline-none focus:ring-1 ring-emerald-500"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Dados (PIX/Banco)</label>
                          <div className="relative">
                            <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input 
                              type="text"
                              value={item.reimbursementDetails || ''}
                              placeholder="Chave PIX ou Ag/Cc"
                              onChange={(e) => handleUpdateItemField(item.id, 'reimbursementDetails', e.target.value)}
                              className="w-full bg-white border border-slate-100 rounded-xl pl-10 pr-4 py-2 text-sm font-medium outline-none focus:ring-1 ring-emerald-500"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}

          {filteredItems.length === 0 && (
            <div className="p-20 text-center flex flex-col items-center">
              <FileText className="w-12 h-12 text-slate-200 mb-4" />
              <p className="text-slate-400 font-medium">Nenhum item encontrado nesta categoria.</p>
            </div>
          )}
        </div>
      </div>

      {/* Report Header for Print - Repetition of information but styled for printer */}
      <div className="print-only mt-10">
        <h3 className="text-xl font-bold border-b pb-2 mb-4">Lista Detalhada de Itens</h3>
        <div className="space-y-4">
          {items.map(item => (
            <div key={item.id} className="border-b pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold">{item.name} ({item.category})</p>
                  <p className="text-xs text-slate-500">Status: {item.status} | Fornecedor: {item.supplier || 'N/A'}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">Real: R$ {item.actualPrice.toLocaleString('pt-BR')}</p>
                  <p className="text-xs text-slate-400">Estimado: R$ {item.estimatedPrice.toLocaleString('pt-BR')}</p>
                </div>
              </div>
              {item.status === ItemStatus.CONFIRMED && item.paymentMethod && (
                <div className="mt-2 text-xs italic bg-slate-50 p-2 rounded">
                  Pagamento: {item.paymentMethod} ({item.paymentPlan}) 
                  {item.paymentMethod === PaymentMethod.REIMBURSEMENT && ` | Para: ${item.reimbursementRecipient} - ${item.reimbursementDetails}`}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Modal - Add Item */}
      {showItemForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 no-print">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-bold text-slate-800 mb-6">Adicionar Item</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Nome do Item</label>
                <input 
                  type="text" 
                  value={newItem.name}
                  placeholder="Ex: Aluguel de Som"
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3 outline-none focus:ring-2 ring-indigo-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Categoria</label>
                  <select 
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value as ItemCategory })}
                    className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3 outline-none focus:ring-2 ring-indigo-500"
                  >
                    {Object.values(ItemCategory).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                   <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Estimado (R$)</label>
                   <input 
                    type="number" 
                    value={newItem.estimatedPrice}
                    onChange={(e) => setNewItem({ ...newItem, estimatedPrice: parseFloat(e.target.value) })}
                    className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3 outline-none focus:ring-2 ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Fornecedor (Opcional)</label>
                <input 
                  type="text" 
                  value={newItem.supplier}
                  placeholder="Ex: LocaSom LTDA"
                  onChange={(e) => setNewItem({ ...newItem, supplier: e.target.value })}
                  className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3 outline-none focus:ring-2 ring-indigo-500"
                />
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
                  className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
                >
                  Confirmar
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
