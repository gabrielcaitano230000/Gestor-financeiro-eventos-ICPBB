
export enum ItemStatus {
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
  estimatedPrice: number; // Referência (Valor Cotado)
  actualPrice: number;    // Valor Pago (Valor Confirmado)
  discrepancyNotes?: string; 
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
