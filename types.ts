
export enum ItemStatus {
  QUOTED = 'Cotado',
  CONFIRMED = 'Confirmado',
  PENDING = 'Pendente'
}

export enum ItemCategory {
  EQUIPMENT = 'Equipamento',
  SERVICE = 'Serviço',
  FOOD = 'Alimentação',
  DECORATION = 'Decoração',
  OTHER = 'Outro'
}

export enum PaymentMethod {
  DIRECT = 'Direto ao Fornecedor',
  REIMBURSEMENT = 'Reembolso'
}

export enum PaymentPlan {
  FULL = 'À Vista',
  INSTALLMENTS = 'Parcelado'
}

export type EventStatus = 'active' | 'completed' | 'cancelled';

export interface Budget {
  id: string;
  name: string;
  category: ItemCategory;
  estimatedPrice: number; // Agora tratado como "Cotado"
  actualPrice: number;    // Agora tratado como "Confirmado"
  discrepancyNotes?: string; // Observação para diferença de valores
  supplier: string;
  status: ItemStatus;
  notes?: string;
  paymentMethod?: PaymentMethod;
  reimbursementRecipient?: string;
  reimbursementDetails?: string; 
  paymentPlan?: PaymentPlan;
  installmentsCount?: number;
}

export interface ChurchEvent {
  id: string;
  name: string;
  date: string;
  description: string;
  items: Budget[];
  isArchived: boolean;
  status: EventStatus;
}

export interface AppState {
  events: ChurchEvent[];
}
