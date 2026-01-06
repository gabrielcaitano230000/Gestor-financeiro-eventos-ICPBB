
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

export interface Budget {
  id: string;
  name: string;
  category: ItemCategory;
  estimatedPrice: number;
  actualPrice: number;
  supplier: string;
  status: ItemStatus;
  notes?: string;
  // Payment details (only used when status is CONFIRMED)
  paymentMethod?: PaymentMethod;
  reimbursementRecipient?: string;
  reimbursementDetails?: string; // PIX or Bank info
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
}

export interface AppState {
  events: ChurchEvent[];
}
