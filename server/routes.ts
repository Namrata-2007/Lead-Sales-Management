import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db, hashPassword, verifyPassword } from './db';
import { User, Lead, Customer, Project, Quotation, Task, Followup, Activity, UserRole, LeadStatus } from './types';
import { analyzeLeadWithAI, generatePersonalizedFollowup, analyzeInboundCustomerMessage } from './ai';
import { executeNewLeadAutomation, handleLeadStatusChange, runInactiveLeadEscalationEngine } from './automation';
import { sendEmail, sendQuotationEmail } from './email';
import { sendWhatsAppMessage, processInboundWhatsAppWebhook } from './whatsapp';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'elevate_crm_jwt_secret_production_2026';

// Authentication Middleware
export interface AuthenticatedRequest extends Request {
  user?: User;
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string };
    const user = db.getUserById(decoded.id);
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'User not found or disabled' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired authentication token' });
  }
}

export function requireRole(allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions for this action' });
    }
    next();
  };
}

// -----------------------------------------------------------------------------
// AUTHENTICATION ROUTES
// -----------------------------------------------------------------------------
router.post('/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = db.getUserByEmail(email);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  if (!user.isActive) {
    return res.status(403).json({ error: 'Account has been disabled. Contact your administrator.' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  const { passwordHash, ...safeUser } = user;
  return res.json({ token, user: safeUser });
});

router.post('/auth/register', (req: Request, res: Response) => {
  const { name, email, password, phone, role } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  if (db.getUserByEmail(email)) {
    return res.status(400).json({ error: 'A user with this email already exists' });
  }

  const newUser: User = {
    id: `usr_${Date.now()}`,
    name,
    email,
    passwordHash: hashPassword(password),
    role: (role as UserRole) || 'salesperson',
    phone,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.addUser(newUser);

  const token = jwt.sign(
    { id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  const { passwordHash, ...safeUser } = newUser;
  return res.status(201).json({ token, user: safeUser });
});

router.get('/auth/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
  const { passwordHash, ...safeUser } = req.user;
  return res.json({ user: safeUser });
});

router.post('/auth/forgot-password', (req: Request, res: Response) => {
  const { email } = req.body;
  const user = db.getUserByEmail(email);
  if (!user) {
    // Return standard response for security
    return res.json({ message: 'If an account exists with this email, instructions have been sent.' });
  }

  return res.json({
    message: 'Reset instructions sent. For demonstration, your default password is Password123!'
  });
});

// -----------------------------------------------------------------------------
// PUBLIC LEAD CAPTURE ROUTE (No Auth Required)
// -----------------------------------------------------------------------------
router.post('/public/lead', async (req: Request, res: Response) => {
  try {
    const {
      name,
      companyName,
      email,
      phone,
      location,
      buildingType,
      floors,
      elevatorRequirement,
      quantity,
      budget,
      expectedInstallationDate
    } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({ error: 'Name, email, and phone number are required.' });
    }

    const newLead: Lead = {
      id: `lead_${Date.now()}`,
      name,
      companyName: companyName || '',
      email,
      phone,
      location: location || 'Unspecified',
      buildingType: buildingType || 'commercial',
      floors: Number(floors) || 4,
      stops: Number(floors) || 4,
      elevatorRequirement: elevatorRequirement || 'General elevator solution requested',
      elevatorType: 'passenger_mrl',
      quantity: Number(quantity) || 1,
      budget: budget ? Number(budget) : undefined,
      expectedInstallationDate,
      source: 'website',
      status: 'new',
      priority: 'medium',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.addLead(newLead);

    db.addActivity({
      id: `act_${Date.now()}`,
      leadId: newLead.id,
      type: 'lead_created',
      title: `Public Lead Inbound: ${newLead.name}`,
      description: `Inquiry submitted via public web capture portal.`,
      timestamp: new Date().toISOString()
    });

    // Run Automation in background
    executeNewLeadAutomation(newLead.id).catch((err) => console.error('Public lead automation err:', err));

    return res.status(201).json({
      success: true,
      message: 'Thank you! Your elevator requirement has been received. Our solutions engineer will contact you shortly.',
      leadId: newLead.id
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// -----------------------------------------------------------------------------
// LEADS CRUD & PIPELINE ROUTES
// -----------------------------------------------------------------------------
router.get('/leads', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { search, status, priority, buildingType, assignedTo, page = '1', limit = '50' } = req.query;
  let leads = db.getLeads();

  // Role filtering: Salesperson only sees assigned leads unless manager/admin
  if (req.user?.role === 'salesperson') {
    leads = leads.filter((l) => l.assignedUserId === req.user?.id);
  } else if (assignedTo) {
    leads = leads.filter((l) => l.assignedUserId === String(assignedTo));
  }

  if (search) {
    const q = String(search).toLowerCase();
    leads = leads.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        (l.companyName && l.companyName.toLowerCase().includes(q)) ||
        l.email.toLowerCase().includes(q) ||
        l.location.toLowerCase().includes(q) ||
        l.elevatorRequirement.toLowerCase().includes(q)
    );
  }

  if (status) {
    leads = leads.filter((l) => l.status === status);
  }

  if (priority) {
    leads = leads.filter((l) => l.priority === priority);
  }

  if (buildingType) {
    leads = leads.filter((l) => l.buildingType === buildingType);
  }

  const pageNum = parseInt(String(page), 10) || 1;
  const limitNum = parseInt(String(limit), 10) || 50;
  const total = leads.length;
  const startIndex = (pageNum - 1) * limitNum;
  const paginated = leads.slice(startIndex, startIndex + limitNum);

  return res.json({
    data: paginated,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum)
    }
  });
});

router.post('/leads', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const leadData = req.body;
    if (!leadData.name || !leadData.email || !leadData.phone) {
      return res.status(400).json({ error: 'Name, email, and phone are required' });
    }

    const newLead: Lead = {
      id: `lead_${Date.now()}`,
      name: leadData.name,
      companyName: leadData.companyName,
      email: leadData.email,
      phone: leadData.phone,
      location: leadData.location || 'Unspecified',
      buildingType: leadData.buildingType || 'commercial',
      floors: Number(leadData.floors) || 4,
      stops: Number(leadData.stops || leadData.floors) || 4,
      elevatorRequirement: leadData.elevatorRequirement || 'Turnkey Elevator Installation',
      elevatorType: leadData.elevatorType || 'passenger_mrl',
      capacityKg: leadData.capacityKg ? Number(leadData.capacityKg) : undefined,
      quantity: Number(leadData.quantity) || 1,
      budget: leadData.budget ? Number(leadData.budget) : undefined,
      expectedInstallationDate: leadData.expectedInstallationDate,
      source: leadData.source || 'website',
      status: (leadData.status as LeadStatus) || 'new',
      priority: leadData.priority || 'medium',
      assignedUserId: leadData.assignedUserId,
      customerId: leadData.customerId,
      notes: leadData.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.addLead(newLead);

    db.addActivity({
      id: `act_${Date.now()}`,
      leadId: newLead.id,
      userId: req.user?.id,
      userName: req.user?.name,
      type: 'lead_created',
      title: `Lead Created: ${newLead.name}`,
      description: `Manual entry by ${req.user?.name}.`,
      timestamp: new Date().toISOString()
    });

    // Run intelligent automation (scoring, assignment, email)
    const processedLead = await executeNewLeadAutomation(newLead.id);
    return res.status(201).json(processedLead);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/leads/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const lead = db.getLeadById(req.params.id);
  if (!lead) return res.status(404).json({ error: 'Lead not found' });
  return res.json(lead);
});

router.put('/leads/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const lead = db.getLeadById(req.params.id);
  if (!lead) return res.status(404).json({ error: 'Lead not found' });

  const prevStatus = lead.status;
  const updates = req.body;

  const updated = db.updateLead(lead.id, updates);

  if (updates.status && updates.status !== prevStatus) {
    await handleLeadStatusChange(lead.id, updates.status as LeadStatus, req.user?.id);
  }

  return res.json(updated);
});

router.delete('/leads/:id', requireAuth, requireRole(['admin', 'sales_manager']), (req: AuthenticatedRequest, res: Response) => {
  const deleted = db.deleteLead(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Lead not found' });
  return res.json({ success: true });
});

router.post('/leads/:id/assign', requireAuth, requireRole(['admin', 'sales_manager']), (req: AuthenticatedRequest, res: Response) => {
  const { userId } = req.body;
  const targetUser = db.getUserById(userId);
  if (!targetUser) return res.status(400).json({ error: 'User to assign does not exist' });

  const lead = db.getLeadById(req.params.id);
  if (!lead) return res.status(404).json({ error: 'Lead not found' });

  lead.assignedUserId = targetUser.id;
  db.updateLead(lead.id, lead);

  db.addActivity({
    id: `act_${Date.now()}`,
    leadId: lead.id,
    userId: req.user?.id,
    userName: req.user?.name,
    type: 'lead_assigned',
    title: `Assigned to ${targetUser.name}`,
    description: `Reassigned by ${req.user?.name}.`,
    timestamp: new Date().toISOString()
  });

  db.addNotification({
    id: `notif_${Date.now()}`,
    userId: targetUser.id,
    title: `Lead Reassigned: ${lead.name}`,
    message: `${lead.buildingType} (${lead.floors} floors) assigned to you by ${req.user?.name}.`,
    type: 'info',
    link: '/leads',
    isRead: false,
    createdAt: new Date().toISOString()
  });

  return res.json(lead);
});

router.post('/leads/:id/ai-analyze', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const lead = db.getLeadById(req.params.id);
  if (!lead) return res.status(404).json({ error: 'Lead not found' });

  const analysis = await analyzeLeadWithAI(lead);
  lead.aiScore = analysis.score;
  lead.aiAnalysis = analysis;
  lead.priority = analysis.priority;
  db.updateLead(lead.id, lead);

  db.addActivity({
    id: `act_${Date.now()}`,
    leadId: lead.id,
    userId: req.user?.id,
    userName: req.user?.name,
    type: 'ai_analysis',
    title: `AI Analysis Refreshed: ${analysis.score}/100`,
    description: analysis.scoreReason,
    timestamp: new Date().toISOString()
  });

  return res.json({ lead, analysis });
});

// -----------------------------------------------------------------------------
// CUSTOMERS & TIMELINE
// -----------------------------------------------------------------------------
router.get('/customers', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  return res.json(db.getCustomers());
});

router.post('/customers', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { name, companyName, email, phone, location, address, taxId, notes } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Customer name and email are required' });
  }

  const customer: Customer = {
    id: `cust_${Date.now()}`,
    name,
    companyName,
    email,
    phone,
    location: location || 'Unspecified',
    address,
    taxId,
    notes,
    totalDealsWon: 0,
    lifetimeValue: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.addCustomer(customer);
  return res.status(201).json(customer);
});

router.get('/customers/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const customer = db.getCustomerById(req.params.id);
  if (!customer) return res.status(404).json({ error: 'Customer not found' });
  return res.json(customer);
});

router.get('/customers/:id/timeline', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const customerId = req.params.id;
  const customer = db.getCustomerById(customerId);
  if (!customer) return res.status(404).json({ error: 'Customer not found' });

  const leads = db.getLeads().filter((l) => l.customerId === customerId || l.email === customer.email);
  const quotations = db.getQuotations().filter((q) => q.customerId === customerId);
  const projects = db.getProjects().filter((p) => p.customerId === customerId);
  const tasks = db.getTasks().filter((t) => t.customerId === customerId);
  const emails = db.getEmailLogs().filter((e) => e.customerId === customerId || e.recipientEmail === customer.email);
  const activities = db.getActivities().filter((a) => a.customerId === customerId);

  return res.json({
    customer,
    leads,
    quotations,
    projects,
    tasks,
    emails,
    activities
  });
});

// -----------------------------------------------------------------------------
// PROJECTS
// -----------------------------------------------------------------------------
router.get('/projects', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  return res.json(db.getProjects());
});

router.post('/projects', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { customerId, title, siteAddress, buildingType, numberOfFloors, elevatorQuantity, budget, status, estimatedCompletion } = req.body;
  if (!customerId || !title) {
    return res.status(400).json({ error: 'Customer and project title are required' });
  }

  const project: Project = {
    id: `proj_${Date.now()}`,
    customerId,
    title,
    siteAddress: siteAddress || '',
    buildingType: buildingType || 'commercial',
    numberOfFloors: Number(numberOfFloors) || 5,
    elevatorQuantity: Number(elevatorQuantity) || 1,
    budget: Number(budget) || 100000,
    status: status || 'planning',
    estimatedCompletion,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.addProject(project);
  return res.status(201).json(project);
});

// -----------------------------------------------------------------------------
// QUOTATIONS
// -----------------------------------------------------------------------------
router.get('/quotations', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  return res.json(db.getQuotations());
});

router.post('/quotations', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const data = req.body;
  if (!data.customerName || !data.customerEmail || !data.items || data.items.length === 0) {
    return res.status(400).json({ error: 'Customer name, email, and at least one quotation line item are required' });
  }

  const subtotal = data.items.reduce((sum: number, it: any) => sum + (Number(it.totalPrice) || (Number(it.unitPrice) * Number(it.quantity))), 0);
  const discountAmount = Number(data.discountAmount) || 0;
  const taxRate = Number(data.taxRate) || 0;
  const taxable = Math.max(0, subtotal - discountAmount);
  const taxAmount = (taxable * taxRate) / 100;
  const totalAmount = taxable + taxAmount;

  const quotation: Quotation = {
    id: `quot_${Date.now()}`,
    quotationNumber: `QT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    customerId: data.customerId || `cust_${Date.now()}`,
    customerName: data.customerName,
    customerCompany: data.customerCompany,
    customerEmail: data.customerEmail,
    customerPhone: data.customerPhone,
    leadId: data.leadId,
    projectId: data.projectId,
    projectTitle: data.projectTitle || 'Commercial Elevator Installation Proposal',
    items: data.items.map((it: any, idx: number) => ({
      id: it.id || `item_${idx}_${Date.now()}`,
      description: it.description,
      elevatorType: it.elevatorType || 'passenger_mrl',
      specifications: it.specifications || '',
      quantity: Number(it.quantity) || 1,
      unitPrice: Number(it.unitPrice) || 0,
      totalPrice: Number(it.totalPrice) || (Number(it.unitPrice) * Number(it.quantity))
    })),
    subtotal,
    taxRate,
    taxAmount,
    discountAmount,
    totalAmount,
    status: 'draft',
    validUntil: data.validUntil || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    terms: data.terms || '36 months comprehensive warranty on permanent magnet gearless traction motor and control panel.',
    paymentTerms: data.paymentTerms || '30% Advance, 40% on Delivery, 20% on Mechanical Installation, 10% on Commissioning Certificate.',
    warrantyYears: Number(data.warrantyYears) || 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.addQuotation(quotation);

  db.addActivity({
    id: `act_${Date.now()}`,
    leadId: quotation.leadId,
    userId: req.user?.id,
    userName: req.user?.name,
    type: 'quotation_created',
    title: `Quotation Created (${quotation.quotationNumber})`,
    description: `Total amount: $${quotation.totalAmount.toLocaleString()} for ${quotation.customerName}.`,
    timestamp: new Date().toISOString()
  });

  return res.status(201).json(quotation);
});

router.post('/quotations/:id/send', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const quotation = db.getQuotationById(req.params.id);
  if (!quotation) return res.status(404).json({ error: 'Quotation not found' });

  try {
    await sendQuotationEmail(quotation);
    quotation.status = 'sent';
    quotation.updatedAt = new Date().toISOString();
    db.updateQuotation(quotation.id, quotation);

    if (quotation.leadId) {
      await handleLeadStatusChange(quotation.leadId, 'proposal_sent', req.user?.id);
    }

    db.addActivity({
      id: `act_${Date.now()}`,
      leadId: quotation.leadId,
      userId: req.user?.id,
      userName: req.user?.name,
      type: 'quotation_sent',
      title: `Quotation ${quotation.quotationNumber} Delivered`,
      description: `Dispatched to ${quotation.customerEmail}.`,
      timestamp: new Date().toISOString()
    });

    return res.json({ success: true, quotation });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// -----------------------------------------------------------------------------
// TASKS & FOLLOWUPS
// -----------------------------------------------------------------------------
router.get('/tasks', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  let tasks = db.getTasks();
  if (req.user?.role === 'salesperson') {
    tasks = tasks.filter((t) => t.assignedUserId === req.user?.id);
  }
  return res.json(tasks);
});

router.post('/tasks', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { title, description, assignedUserId, leadId, customerId, dueDate, priority } = req.body;
  if (!title || !dueDate) {
    return res.status(400).json({ error: 'Title and due date are required' });
  }

  const task: Task = {
    id: `tsk_${Date.now()}`,
    title,
    description,
    assignedUserId: assignedUserId || req.user?.id || 'usr_sales_01',
    leadId,
    customerId,
    dueDate,
    priority: priority || 'medium',
    status: 'pending',
    isAutomated: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.addTask(task);
  return res.status(201).json(task);
});

router.put('/tasks/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const task = db.getTasks().find((t) => t.id === req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });

  const updated = db.updateTask(task.id, req.body);
  return res.json(updated);
});

router.delete('/tasks/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const success = db.deleteTask(req.params.id);
  if (!success) return res.status(404).json({ error: 'Task not found' });
  return res.json({ success: true });
});

router.get('/followups', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  return res.json(db.getFollowups());
});

router.put('/followups/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const updated = db.updateFollowup(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Followup not found' });
  return res.json(updated);
});

// -----------------------------------------------------------------------------
// ACTIVITIES & NOTIFICATIONS
// -----------------------------------------------------------------------------
router.get('/activities', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  return res.json(db.getActivities());
});

router.get('/notifications', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  return res.json(db.getNotifications(req.user?.id));
});

router.put('/notifications/:id/read', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  db.markNotificationRead(req.params.id);
  return res.json({ success: true });
});

router.post('/notifications/mark-all-read', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  db.markAllNotificationsRead(req.user?.id);
  return res.json({ success: true });
});

// -----------------------------------------------------------------------------
// AI GENERATION & CONVERSATION ANALYSIS
// -----------------------------------------------------------------------------
router.post('/ai/generate-followup', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { leadId, channel = 'email', dealContext } = req.body;
    const lead = db.getLeadById(leadId);
    if (!lead) return res.status(404).json({ error: 'Lead not found' });

    const customer = lead.customerId ? db.getCustomerById(lead.customerId) : undefined;
    const generated = await generatePersonalizedFollowup(lead, customer, channel, dealContext);
    return res.json(generated);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/ai/analyze-message', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { messageText, leadContext } = req.body;
    if (!messageText) return res.status(400).json({ error: 'Message text is required' });

    const analysis = await analyzeInboundCustomerMessage(messageText, leadContext);
    return res.json(analysis);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// -----------------------------------------------------------------------------
// MESSAGES & COMMUNICATION LOGS
// -----------------------------------------------------------------------------
router.get('/messages/emails', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  return res.json(db.getEmailLogs());
});

router.get('/messages/whatsapp', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const leadId = req.query.leadId ? String(req.query.leadId) : undefined;
  return res.json(db.getWhatsAppMessages(leadId));
});

router.post('/messages/send-email', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { to, subject, html, leadId, customerId } = req.body;
  if (!to || !subject || !html) {
    return res.status(400).json({ error: 'Recipient email, subject, and content are required' });
  }

  const result = await sendEmail({ to, subject, html, leadId, customerId });
  if (!result.success) {
    return res.status(502).json({ error: result.error || 'Failed to send email' });
  }

  return res.json({ success: true, id: result.id });
});

router.post('/messages/send-whatsapp', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { phoneNumber, messageText, leadId, customerId } = req.body;
  if (!phoneNumber || !messageText) {
    return res.status(400).json({ error: 'Phone number and message text are required' });
  }

  const result = await sendWhatsAppMessage({ phoneNumber, messageText, leadId, customerId });
  if (!result.success) {
    return res.status(502).json({ error: result.error || 'Failed to send WhatsApp message' });
  }

  return res.json({ success: true, id: result.id });
});

// -----------------------------------------------------------------------------
// AUTOMATION WORKFLOWS & ENGINE
// -----------------------------------------------------------------------------
router.get('/automation/workflows', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  return res.json(db.getAutomationWorkflows());
});

router.put('/automation/workflows/:id', requireAuth, requireRole(['admin']), (req: AuthenticatedRequest, res: Response) => {
  const updated = db.updateAutomationWorkflow(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Workflow not found' });
  return res.json(updated);
});

router.get('/automation/logs', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  return res.json(db.getAutomationLogs());
});

router.post('/automation/run-escalation', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const outcome = await runInactiveLeadEscalationEngine();
  return res.json({ success: true, ...outcome });
});

// -----------------------------------------------------------------------------
// ANALYTICS DASHBOARD (CALCULATED DIRECTLY FROM DATABASE)
// -----------------------------------------------------------------------------
router.get('/analytics/dashboard', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const leads = db.getLeads();
  const quotations = db.getQuotations();
  const tasks = db.getTasks();
  const users = db.getUsers();

  const totalLeads = leads.length;
  const newLeads = leads.filter((l) => l.status === 'new').length;
  const qualifiedLeads = leads.filter((l) => l.status === 'qualified').length;
  const highPriorityLeads = leads.filter((l) => l.priority === 'urgent' || l.priority === 'high').length;
  const activeDeals = leads.filter((l) => l.status !== 'won' && l.status !== 'lost').length;
  const wonDeals = leads.filter((l) => l.status === 'won').length;
  const lostDeals = leads.filter((l) => l.status === 'lost').length;

  const closedDeals = wonDeals + lostDeals;
  const conversionRate = closedDeals > 0 ? Number(((wonDeals / closedDeals) * 100).toFixed(1)) : 0;

  // Real revenue calculated from accepted quotations + won leads
  const quotationRevenue = quotations
    .filter((q) => q.status === 'accepted')
    .reduce((sum, q) => sum + q.totalAmount, 0);

  const pendingFollowups = tasks.filter((t) => t.status === 'pending' || t.status === 'in_progress').length;
  const overdueTasks = tasks.filter((t) => t.status === 'overdue' || (new Date(t.dueDate).getTime() < Date.now() && t.status !== 'completed')).length;

  // Source breakdown
  const sourceMap: Record<string, number> = {};
  leads.forEach((l) => {
    sourceMap[l.source] = (sourceMap[l.source] || 0) + 1;
  });

  // Building Type breakdown
  const buildingMap: Record<string, number> = {};
  leads.forEach((l) => {
    buildingMap[l.buildingType] = (buildingMap[l.buildingType] || 0) + 1;
  });

  // Stage Pipeline breakdown
  const stageMap: Record<string, number> = {
    new: 0,
    contacted: 0,
    qualified: 0,
    proposal_sent: 0,
    negotiation: 0,
    won: 0,
    lost: 0
  };
  leads.forEach((l) => {
    stageMap[l.status] = (stageMap[l.status] || 0) + 1;
  });

  // Salesperson performance metrics
  const salespeople = users.filter((u) => u.role === 'salesperson' || u.role === 'sales_manager');
  const salespersonPerformance = salespeople.map((sp) => {
    const spLeads = leads.filter((l) => l.assignedUserId === sp.id);
    const spWon = spLeads.filter((l) => l.status === 'won').length;
    const spWonRevenue = quotations
      .filter((q) => q.status === 'accepted' && spLeads.some((l) => l.id === q.leadId))
      .reduce((sum, q) => sum + q.totalAmount, 0);

    return {
      userId: sp.id,
      name: sp.name,
      avatar: sp.avatar,
      assignedLeadsCount: spLeads.length,
      wonDealsCount: spWon,
      totalRevenueWon: spWonRevenue,
      conversionRate: spLeads.length > 0 ? Math.round((spWon / spLeads.length) * 100) : 0
    };
  });

  // AI Score Distribution
  const scoreDistribution = {
    urgent90Plus: leads.filter((l) => (l.aiScore || 0) >= 90).length,
    high75To89: leads.filter((l) => (l.aiScore || 0) >= 75 && (l.aiScore || 0) < 90).length,
    medium50To74: leads.filter((l) => (l.aiScore || 0) >= 50 && (l.aiScore || 0) < 75).length,
    lowBelow50: leads.filter((l) => (l.aiScore || 0) < 50).length
  };

  return res.json({
    metrics: {
      totalLeads,
      newLeads,
      qualifiedLeads,
      highPriorityLeads,
      activeDeals,
      wonDeals,
      lostDeals,
      conversionRate,
      revenue: quotationRevenue,
      pendingFollowups,
      overdueTasks
    },
    pipelineStages: stageMap,
    leadsBySource: sourceMap,
    leadsByBuildingType: buildingMap,
    scoreDistribution,
    salespersonPerformance,
    recentActivities: db.getActivities().slice(0, 8),
    urgentTasks: tasks.filter((t) => t.status !== 'completed').slice(0, 5)
  });
});

// -----------------------------------------------------------------------------
// USER MANAGEMENT
// -----------------------------------------------------------------------------
router.get('/users', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const users = db.getUsers().map(({ passwordHash, ...u }) => u);
  return res.json(users);
});

router.post('/users', requireAuth, requireRole(['admin']), (req: AuthenticatedRequest, res: Response) => {
  const { name, email, password, role, phone } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  if (db.getUserByEmail(email)) {
    return res.status(400).json({ error: 'User with this email already exists' });
  }

  const newUser: User = {
    id: `usr_${Date.now()}`,
    name,
    email,
    passwordHash: hashPassword(password),
    role: role || 'salesperson',
    phone,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.addUser(newUser);
  const { passwordHash, ...safe } = newUser;
  return res.status(201).json(safe);
});

router.put('/users/:id', requireAuth, requireRole(['admin']), (req: AuthenticatedRequest, res: Response) => {
  const user = db.getUserById(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const updates: Partial<User> = { ...req.body };
  if (req.body.password) {
    updates.passwordHash = hashPassword(req.body.password);
    delete (updates as any).password;
  }

  const updated = db.updateUser(user.id, updates);
  if (!updated) return res.status(500).json({ error: 'Failed to update user' });
  const { passwordHash, ...safe } = updated;
  return res.json(safe);
});

// -----------------------------------------------------------------------------
// SETTINGS
// -----------------------------------------------------------------------------
router.get('/settings', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  return res.json(db.getSettings());
});

router.put('/settings', requireAuth, requireRole(['admin']), (req: AuthenticatedRequest, res: Response) => {
  const updated = db.updateSettings(req.body);
  return res.json(updated);
});

// -----------------------------------------------------------------------------
// WEBHOOKS: n8n and WhatsApp
// -----------------------------------------------------------------------------
router.post('/webhooks/n8n', async (req: Request, res: Response) => {
  try {
    const { event, leadId, action, details } = req.body;
    db.addAutomationLog({
      id: `autolog_n8n_${Date.now()}`,
      workflowId: 'n8n_external_webhook',
      workflowName: 'n8n Remote Automation Callback',
      leadId,
      actionTaken: action || `Received ${event} event`,
      status: 'success',
      details: details || JSON.stringify(req.body),
      timestamp: new Date().toISOString()
    });
    return res.json({ received: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// WhatsApp Webhook verification (Meta Cloud API requirement)
router.get('/webhooks/whatsapp', (req: Request, res: Response) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  const expectedToken = db.getSettings().whatsapp.verifyToken || 'elevator_crm_webhook_verify_token_2026';

  if (mode === 'subscribe' && token === expectedToken) {
    return res.status(200).send(challenge);
  }
  return res.status(403).send('Verification token mismatch');
});

// WhatsApp incoming message event
router.post('/webhooks/whatsapp', async (req: Request, res: Response) => {
  const result = await processInboundWhatsAppWebhook(req.body);
  return res.json(result);
});

// -----------------------------------------------------------------------------
// SYSTEM RESET / SEED
// -----------------------------------------------------------------------------
router.post('/system/seed', requireAuth, requireRole(['admin']), (req: AuthenticatedRequest, res: Response) => {
  const fresh = db.resetToSeed();
  return res.json({ success: true, message: 'Database reset to initial enterprise demo state.' });
});

export default router;
