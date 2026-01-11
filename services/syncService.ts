
import { ChurchEvent } from "../types";

// Usando um serviço público de Key-Value store para demonstração de sincronismo global
// Em produção, isso seria substituído por Firebase ou Supabase
const API_BASE = "https://api.keyvalue.xyz";

export const syncService = {
  // Gera um ID aleatório seguro e amigável
  generateSyncCode: () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const segment = () => Array.from({length: 4}, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    return `ICPBB-${segment()}-${segment()}`;
  },

  // Salva os dados na nuvem
  saveToCloud: async (syncCode: string, events: ChurchEvent[]): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE}/${syncCode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(events)
      });
      return response.ok;
    } catch (error) {
      console.error("Erro ao salvar na nuvem:", error);
      return false;
    }
  },

  // Busca os dados da nuvem
  loadFromCloud: async (syncCode: string): Promise<ChurchEvent[] | null> => {
    try {
      const response = await fetch(`${API_BASE}/${syncCode}.json`);
      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      console.error("Erro ao carregar da nuvem:", error);
      return null;
    }
  }
};
