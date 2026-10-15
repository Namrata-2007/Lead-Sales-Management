export type UserRole = 'admin' | 'sales_manager' | 'salesperson' | 'support';

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal_sent' | 'negotiation' | 'won' | 'lost';

export type LeadPriority = 'low' | 'medium' | 'high' | 'urgent';

export type LeadSource = 'website' | 'whatsapp' | 'email' | 'phone' | 'referral' | 'advertisement' | 'other';

export type ElevatorType = 
  | 'passenger_mrl' 
  | 'passenger_geared' 
  | 'panoramic_glass' 
  | 'freight_heavy' 
  | 'hospital_stretcher' 
  | 'villa_hydraulic' 
  | 'automobile' 
  | 'dumbwaiter';

export type BuildingType = 
  | 'residential' 
  | 'commercial' 
  | 'industrial' 
  | 'hospital' 
  | 'hotel' 
  | 'apartment' 
  | 'government' 
  | 'other';

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'overdue';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type QuotationStatus = 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired';

export type EmailStatus = 'pending' | 'sent' | 'failed' | 'opened' | 'clicked';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Company {
  id: string;
  name: string;
  tagline: string;
  logo?: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  taxId: string;
  currency: string;
  currencySymbol: string;
  createdAt: string;
  updatedAt: string;
}

export interface AIAnalysis {
  id: string;
  leadId: string;
  score: number; // 0 - 100
  priority: LeadPriority;
  buildingType: BuildingType;
  elevatorType: ElevatorType;
  extractedRequirements: {
    floors?: number;
    stops?: number;
    capacityKg?: number;
    passengerCapacity?: number;
    speedMs?: number;
    quantity?: number;
    machineRoom?: 'MRL' | 'overhead_machine_room' | 'hydraulic_tank';
    doorType?: string;
    specialRequirements?: string[];
  };
  scoreReason: string;
  customerIntent: string;
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  buyingStage: 'awareness' | 'evaluation' | 'decision' | 'ready_to_buy';
  recommendedNextAction: string;
  suggestedSalespersonResponse: string;
  analyzedAt: string;
}

export interface Lead {
  id: string;
  name: string;
  companyName?: string;
  email: string;
  phone: string;
  location: string;
  buildingType: BuildingType;
  floors: number;
  stops: number;
  elevatorRequirement: string;
  elevatorType: ElevatorType;
  capacityKg?: number;
  quantity: number;
  budget?: number;
  expectedInstallationDate?: string;
  source: LeadSource;
  status: LeadStatus;
  priority: LeadPriority;
  aiScore?: number;
  assignedUserId?: string;
  customerId?: string;
  notes?: string;
  lastContactedAt?: string;
  nextFollowupDate?: string;
  aiAnalysis?: AIAnalysis;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  companyName?: string;
  email: string;
  phone: string;
  location: string;
  taxId?: string;
  address?: string;
  totalDealsWon: number;
  lifetimeValue: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  customerId: string;
  leadId?: string;
  title: string;
  siteAddress: string;
  buildingType: BuildingType;
  numberOfFloors: number;
  elevatorQuantity: number;
  status: 'planning' | 'shaft_construction' | 'manufacturing' | 'installation' | 'testing_commissioning' | 'handover' | 'maintenance';
  estimatedCompletion?: string;
  budget: number;
  createdAt: string;
  updatedAt: string;
}

export interface QuotationItem {
  id: string;
  description: string;
  elevatorType: ElevatorType;
  specifications: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Quotation {
  id: string;
  quotationNumber: string;
  customerId: string;
  customerName: string;
  customerCompany?: string;
  customerEmail: string;
  customerPhone?: string;
  leadId?: string;
  projectId?: string;
  projectTitle: string;
  items: QuotationItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  status: QuotationStatus;
  validUntil: string;
  terms: string;
  paymentTerms: string;
  warrantyYears: number;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  assignedUserId: string;
  leadId?: string;
  customerId?: string;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
  isAutomated: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Followup {
  id: string;
  leadId: string;
  customerId?: string;
  assignedUserId: string;
  channel: 'email' | 'whatsapp' | 'phone_call' | 'site_visit';
  scheduledDate: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  suggestedTemplate?: string;
  notes?: string;
  completedAt?: string;
  createdAt: string;
}

export interface Activity {
  id: string;
  leadId?: string;
  customerId?: string;
  userId?: string;
  userName?: string;
  type: 
    | 'lead_created' 
    | 'ai_analysis' 
    | 'lead_scored' 
    | 'lead_assigned' 
    | 'status_changed' 
    | 'email_sent' 
    | 'whatsapp_sent' 
    | 'task_created' 
    | 'quotation_created' 
    | 'quotation_sent' 
    | 'deal_won' 
    | 'deal_lost' 
    | 'escalation_triggered';
  title: string;
  description: string;
  timestamp: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'urgent';
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface EmailLog {
  id: string;
  leadId?: string;
  customerId?: string;
  recipientEmail: string;
  subject: string;
  bodyPreview: string;
  status: EmailStatus;
  errorMessage?: string;
  sentAt: string;
}

export interface WhatsAppMessage {
  id: string;
  leadId?: string;
  customerId?: string;
  direction: 'inbound' | 'outbound';
  phoneNumber: string;
  messageText: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  errorMessage?: string;
  timestamp: string;
}

export interface AutomationWorkflow {
  id: string;
  name: string;
  description: string;
  triggerEvent: string;
  isActive: boolean;
  executionCount: number;
  failureCount: number;
  lastExecutedAt?: string;
}

export interface AutomationLog {
  id: string;
  workflowId: string;
  workflowName: string;
  leadId?: string;
  actionTaken: string;
  status: 'success' | 'failed';
  details: string;
  timestamp: string;
}

export interface SystemSettings {
  company: Company;
  ai: {
    provider: 'groq' | 'gemini' | 'algorithmic_fallback';
    model: string;
    groqApiKeyConfigured: boolean;
    groqModel: string;
    autoScoringEnabled: boolean;
    urgentScoreThreshold: number; // e.g. 75
  };
  email: {
    provider: 'resend' | 'smtp';
    resendApiKeyConfigured: boolean;
    fromEmail: string;
    fromName: string;
    sendLeadAcknowledgement: boolean;
  };
  whatsapp: {
    configured: boolean;
    phoneNumberId?: string;
    businessAccountId?: string;
    verifyToken: string;
    sendInstantReply: boolean;
  };
  automation: {
    autoAssignEnabled: boolean;
    assignmentStrategy: 'round_robin' | 'lowest_workload';
    followupDelayHours: number; // default 24
    escalationHours: number; // default 48
    n8nWebhookUrl?: string;
  };
}
