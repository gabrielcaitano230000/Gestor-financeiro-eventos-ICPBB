
import { GoogleGenAI, Type } from "@google/genai";
import { ChurchEvent } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getBudgetAdvice = async (event: ChurchEvent) => {
  try {
    const totalActual = event.items.reduce((acc, curr) => acc + curr.actualPrice, 0);
    const totalEstimated = event.items.reduce((acc, curr) => acc + curr.estimatedPrice, 0);
    
    const prompt = `Analise o orçamento do evento da igreja: "${event.name}". 
    Data: ${event.date}.
    Descrição: ${event.description}.
    Total Estimado: R$ ${totalEstimated.toFixed(2)}.
    Total Real (Confirmado): R$ ${totalActual.toFixed(2)}.
    Itens Atuais: ${event.items.map(i => `${i.name} (${i.category}): R$ ${i.actualPrice}`).join(', ')}.
    
    Por favor, forneça dicas práticas de como economizar ou itens essenciais que podem estar faltando para este tipo de evento. Seja encorajador e específico para o contexto de igreja. Responda em Português do Brasil.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Não foi possível carregar sugestões no momento. Verifique sua conexão.";
  }
};
