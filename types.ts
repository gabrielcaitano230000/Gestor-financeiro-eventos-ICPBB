
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
  estimatedPrice: number; 
  actualPrice: number;    
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

export interface SyncState {
  syncCode: string | null;
  lastSynced: string | null;
  isSyncing: boolean;
  error: string | null;
}

export interface AppState {
  events: ChurchEvent[];
  sync: SyncState;
}
