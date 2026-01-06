
import React, { useMemo } from 'react';
import { ChurchEvent } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { DollarSign, Calendar, TrendingUp, AlertCircle } from 'lucide-react';

interface DashboardProps {
  events: ChurchEvent[];
}

const COLORS = ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#f59e0b', '#10b981'];

const Dashboard: React.FC<DashboardProps> = ({ events }) => {
  const stats = useMemo(() => {
    const activeEvents = events.filter(e => !e.isArchived);
    const totalBudget = events.reduce((acc, e) => {
      return acc + e.items.reduce((iAcc, item) => iAcc + (item.actualPrice || item.estimatedPrice), 0);
    }, 0);
    
    const yearTotal = events.reduce((acc, e) => {
      // Extrai o ano diretamente da string YYYY-MM-DD para evitar erro de fuso
      const year = parseInt(e.date.split('-')[0]);
      if (year === new Date().getFullYear()) {
        return acc + e.items.reduce((iAcc, item) => iAcc + (item.actualPrice || item.estimatedPrice), 0);
      }
      return acc;
    }, 0);

    const chartData = events.map(e => ({
      name: e.name.length > 15 ? e.name.substring(0, 12) + '...' : e.name,
      total: e.items.reduce((acc, i) => acc + (i.actualPrice || i.estimatedPrice), 0)
    })).sort((a, b) => b.total - a.total).slice(0, 6);

    return { activeEventsCount: activeEvents.length, totalBudget, yearTotal, chartData };
  }, [events]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header>
        <h2 className="text-3xl font-bold text-slate-800">Visão Geral</h2>
        <p className="text-slate-500">Acompanhamento financeiro dos eventos do ano.</p>
      </header>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Geral</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">R$ {stats.totalBudget.toLocaleString('pt-BR')}</h3>
            <p className="text-xs text-blue-600 mt-2 font-medium flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Histórico acumulado
            </p>
          </div>
          <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Este Ano</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">R$ {stats.yearTotal.toLocaleString('pt-BR')}</h3>
            <p className="text-xs text-emerald-600 mt-2 font-medium flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Ano: {new Date().getFullYear()}
            </p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Eventos Ativos</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.activeEventsCount}</h3>
            <p className="text-xs text-amber-600 mt-2 font-medium">Em planejamento</p>
          </div>
          <div className="p-3 bg-amber-50 rounded-2xl text-amber-600">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Status Financeiro</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">Saudável</h3>
            <p className="text-xs text-slate-500 mt-2 font-medium">Todos orçamentos ok</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-2xl text-slate-600">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h4 className="text-lg font-bold text-slate-800 mb-6">Investimento por Evento (Maiores)</h4>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(val) => `R$ ${val}`} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}} 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
                />
                <Bar dataKey="total" radius={[8, 8, 0, 0]}>
                  {stats.chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center">
          <h4 className="text-lg font-bold text-slate-800 mb-6 self-start">Distribuição Financeira</h4>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="total"
                >
                  {stats.chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4 w-full">
            {stats.chartData.map((entry, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[index % COLORS.length]}} />
                <span className="text-xs text-slate-600 truncate max-w-[100px]">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
