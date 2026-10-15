import {
  User,
  Lead,
  Customer,
  Project,
  Quotation,
  Task,
  Followup,
  Activity,
  Notification,
  EmailLog,
  WhatsAppMessage,
  AutomationWorkflow,
  AutomationLog,
  SystemSettings,
  DashboardData
} from './types';

const BASE_URL = '/api';

function getHeaders(): HeadersInit {
  const token = localStorage.getItem('elevate_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const headers = { ...getHeaders(), ...(options.headers || {}) };

  const res = await fetch(url, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const errorMsg = data.error || data.message || `Request failed with status ${res.status}`;
    throw new Error(errorMsg);
  }

  return data as T;
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }),

  register: (payload: { name: string; email: string; password: string; role?: string; phone?: string }) =>
    request<{ token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  getMe: () => request<{ user: User }>('/auth/me'),

  forgotPassword: (email: string) =>
    request<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    }),

  // Public Lead Capture
  submitPublicLead: (data: any) =>
    request<{ success: boolean; message: string; leadId: string }>('/public/lead', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // Leads
  getLeads: (params: Record<string, string> = {}) => {
    const q = new URLSearchParams(params).toString();
    return request<{ data: Lead[]; pagination: { total: number; page: number; limit: number; totalPages: number } }>(
      `/leads${q ? `?${q}` : ''}`
    );
  },

  getLeadById: (id: string) => request<Lead>(`/leads/${id}`),

  createLead: (data: Partial<Lead>) =>
    request<Lead>('/leads', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  updateLead: (id: string, updates: Partial<Lead>) =>
    request<Lead>(`/leads/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    }),

  deleteLead: (id: string) =>
    request<{ success: boolean }>(`/leads/${id}`, {
      method: 'DELETE'
    }),

  assignLead: (id: string, userId: string) =>
    request<Lead>(`/leads/${id}/assign`, {
      method: 'POST',
      body: JSON.stringify({ userId })
    }),

  reAnalyzeLeadAI: (id: string) =>
    request<{ lead: Lead; analysis: any }>(`/leads/${id}/ai-analyze`, {
      method: 'POST'
    }),

  // Customers
  getCustomers: () => request<Customer[]>('/customers'),
  getCustomerById: (id: string) => request<Customer>(`/customers/${id}`),
  createCustomer: (data: Partial<Customer>) =>
    request<Customer>('/customers', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  getCustomerTimeline: (id: string) =>
    request<{
      customer: Customer;
      leads: Lead[];
      quotations: Quotation[];
      projects: Project[];
      tasks: Task[];
      emails: EmailLog[];
      activities: Activity[];
    }>(`/customers/${id}/timeline`),

  // Projects
  getProjects: () => request<Project[]>('/projects'),
  createProject: (data: Partial<Project>) =>
    request<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // Quotations
  getQuotations: () => request<Quotation[]>('/quotations'),
  createQuotation: (data: Partial<Quotation>) =>
    request<Quotation>('/quotations', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  sendQuotation: (id: string) =>
    request<{ success: boolean; quotation: Quotation }>(`/quotations/${id}/send`, {
      method: 'POST'
    }),

  // Tasks & Followups
  getTasks: () => request<Task[]>('/tasks'),
  createTask: (data: Partial<Task>) =>
    request<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updateTask: (id: string, updates: Partial<Task>) =>
    request<Task>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    }),
  deleteTask: (id: string) =>
    request<{ success: boolean }>(`/tasks/${id}`, {
      method: 'DELETE'
    }),
  getFollowups: () => request<Followup[]>('/followups'),
  updateFollowup: (id: string, updates: Partial<Followup>) =>
    request<Followup>(`/followups/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    }),

  // Activities & Notifications
  getActivities: () => request<Activity[]>('/activities'),
  getNotifications: () => request<Notification[]>('/notifications'),
  markNotificationRead: (id: string) =>
    request<{ success: boolean }>(`/notifications/${id}/read`, {
      method: 'PUT'
    }),
  markAllNotificationsRead: () =>
    request<{ success: boolean }>('/notifications/mark-all-read', {
      method: 'POST'
    }),

  // Messages & Logs
  getEmailLogs: () => request<EmailLog[]>('/messages/emails'),
  getWhatsAppMessages: (leadId?: string) =>
    request<WhatsAppMessage[]>(`/messages/whatsapp${leadId ? `?leadId=${leadId}` : ''}`),
  sendEmail: (payload: { to: string; subject: string; html: string; leadId?: string; customerId?: string }) =>
    request<{ success: boolean; id?: string }>('/messages/send-email', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  sendWhatsApp: (payload: { phoneNumber: string; messageText: string; leadId?: string; customerId?: string }) =>
    request<{ success: boolean; id?: string }>('/messages/send-whatsapp', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  // AI Assistant Services
  generateFollowup: (leadId: string, channel: 'email' | 'whatsapp' = 'email', dealContext?: string) =>
    request<{ subject: string; body: string }>('/ai/generate-followup', {
      method: 'POST',
      body: JSON.stringify({ leadId, channel, dealContext })
    }),
  analyzeMessage: (messageText: string, leadContext?: string) =>
    request<{
      intent: string;
      sentiment: string;
      urgency: string;
      buyingStage: string;
      recommendedAction: string;
      draftReply: string;
    }>('/ai/analyze-message', {
      method: 'POST',
      body: JSON.stringify({ messageText, leadContext })
    }),

  // Automation
  getWorkflows: () => request<AutomationWorkflow[]>('/automation/workflows'),
  updateWorkflow: (id: string, updates: Partial<AutomationWorkflow>) =>
    request<AutomationWorkflow>(`/automation/workflows/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    }),
  getAutomationLogs: () => request<AutomationLog[]>('/automation/logs'),
  runEscalationTest: () =>
    request<{ success: boolean; checked: number; escalated: number }>('/automation/run-escalation', {
      method: 'POST'
    }),

  // Analytics
  getDashboardAnalytics: () => request<DashboardData>('/analytics/dashboard'),

  // Users & Settings
  getUsers: () => request<User[]>('/users'),
  createUser: (data: any) =>
    request<User>('/users', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updateUser: (id: string, data: any) =>
    request<User>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  getSettings: () => request<SystemSettings>('/settings'),
  updateSettings: (data: Partial<SystemSettings>) =>
    request<SystemSettings>('/settings', {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  resetDatabase: () =>
    request<{ success: boolean; message: string }>('/system/seed', {
      method: 'POST'
    })
};
