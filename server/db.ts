import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  User,
  Company,
  Lead,
  Customer,
  Project,
  Quotation,
  Task,
  Activity,
  Notification,
  EmailLog,
  WhatsAppMessage,
  AutomationWorkflow,
  AutomationLog,
  Followup,
  SystemSettings
} from './types';

export function hashPassword(password: string): string {
  const salt = 'elevate_crm_salt_2026';
  return crypto.scryptSync(password, salt, 32).toString('hex');
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

export interface DatabaseSchema {
  users: User[];
  company: Company;
  leads: Lead[];
  customers: Customer[];
  projects: Project[];
  quotations: Quotation[];
  tasks: Task[];
  followups: Followup[];
  activities: Activity[];
  notifications: Notification[];
  emailLogs: EmailLog[];
  whatsappMessages: WhatsAppMessage[];
  automationWorkflows: AutomationWorkflow[];
  automationLogs: AutomationLog[];
  settings: SystemSettings;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'elevator_crm_db.json');

function getInitialData(): DatabaseSchema {
  const adminId = 'usr_admin_01';
  const managerId = 'usr_mgr_01';
  const salesId = 'usr_sales_01';
  const supportId = 'usr_supp_01';

  const users: User[] = [
    {
      id: adminId,
      name: 'Elena Vance',
      email: 'admin@elevatecrm.io',
      passwordHash: hashPassword('Password123!'),
      role: 'admin',
      phone: '+1 (555) 492-8811',
      avatar: '/src/assets/images/avatar_sales_manager_1792035800746.jpg',
      isActive: true,
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: managerId,
      name: 'Marcus Chen',
      email: 'marcus.chen@elevatecrm.io',
      passwordHash: hashPassword('Password123!'),
      role: 'sales_manager',
      phone: '+1 (555) 782-3344',
      avatar: '/src/assets/images/avatar_sales_manager_1792035800746.jpg',
      isActive: true,
      createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: salesId,
      name: 'David Miller',
      email: 'david.m@elevatecrm.io',
      passwordHash: hashPassword('Password123!'),
      role: 'salesperson',
      phone: '+1 (555) 304-9922',
      avatar: '/src/assets/images/avatar_senior_engineer_1792035800287.jpg',
      isActive: true,
      createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: supportId,
      name: 'Sarah Jenkins',
      email: 'support@elevatecrm.io',
      passwordHash: hashPassword('Password123!'),
      role: 'support',
      phone: '+1 (555) 612-4400',
      avatar: '/src/assets/images/avatar_senior_engineer_1792035800287.jpg',
      isActive: true,
      createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  const company: Company = {
    id: 'cmp_apex_elevators',
    name: 'Apex Elevator Dynamics Inc.',
    tagline: 'Intelligent High-Performance Vertical Transportation Systems',
    logo: '/src/assets/images/hero_elevator_system_1792035799486.jpg',
    address: '450 Industrial Parkway, Tower 4, Suite 1200',
    city: 'Chicago, IL',
    country: 'United States',
    phone: '+1 (800) 555-LIFT',
    email: 'contact@apexelevatordynamics.com',
    taxId: 'US-84920419',
    currency: 'USD',
    currencySymbol: '$',
    createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  };

  const customers: Customer[] = [
    {
      id: 'cust_01',
      name: 'Arthur Sterling',
      companyName: 'Sterling Horizon Real Estate Ltd',
      email: 'a.sterling@sterlinghorizon.com',
      phone: '+1 (555) 891-2300',
      location: 'Chicago, IL',
      taxId: 'TX-77491',
      address: '880 North Michigan Avenue, Chicago, IL 60611',
      totalDealsWon: 2,
      lifetimeValue: 345000,
      notes: 'Premier developer specializing in 20+ floor residential and mixed-use luxury developments.',
      createdAt: new Date(Date.now() - 40 * 86400000).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'cust_02',
      name: 'Dr. Evelyn Reed',
      companyName: 'St. Jude Regional Healthcare Authority',
      email: 'e.reed@stjuderegional.org',
      phone: '+1 (555) 431-7788',
      location: 'Indianapolis, IN',
      taxId: 'MED-9921',
      address: '1400 Hospital Way, Indianapolis, IN 46202',
      totalDealsWon: 1,
      lifetimeValue: 280000,
      notes: 'State-certified healthcare campus requiring seismic zone 3 stretcher bed elevators with emergency medical priority dispatch.',
      createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'cust_03',
      name: 'Vikram Mehta',
      companyName: 'OmniHub Logistics Parks',
      email: 'vmehta@omnihublogistics.com',
      phone: '+1 (555) 700-1122',
      location: 'Columbus, OH',
      taxId: 'IND-8840',
      address: '42 Freight Line Way, Columbus, OH 43215',
      totalDealsWon: 0,
      lifetimeValue: 0,
      notes: 'Industrial warehouse logistics park requiring 5000kg freight elevators for forklift pallets.',
      createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  const leads: Lead[] = [
    {
      id: 'lead_01',
      name: 'Arthur Sterling',
      companyName: 'Sterling Horizon Real Estate Ltd',
      email: 'a.sterling@sterlinghorizon.com',
      phone: '+1 (555) 891-2300',
      location: 'Chicago, IL',
      buildingType: 'commercial',
      floors: 24,
      stops: 24,
      elevatorRequirement: '3x High-Speed Machine Roomless (MRL) Passenger Elevators with Destination Dispatch',
      elevatorType: 'passenger_mrl',
      capacityKg: 1350,
      quantity: 3,
      budget: 380000,
      expectedInstallationDate: '2026-11-15',
      source: 'website',
      status: 'proposal_sent',
      priority: 'urgent',
      aiScore: 92,
      assignedUserId: salesId,
      customerId: 'cust_01',
      notes: 'Client reviewed preliminary layout drawings. Requested updated quotation with titanium finish cab.',
      lastContactedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      nextFollowupDate: new Date(Date.now() + 1 * 86400000).toISOString(),
      createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      aiAnalysis: {
        id: 'ai_01',
        leadId: 'lead_01',
        score: 92,
        priority: 'urgent',
        buildingType: 'commercial',
        elevatorType: 'passenger_mrl',
        extractedRequirements: {
          floors: 24,
          stops: 24,
          capacityKg: 1350,
          passengerCapacity: 18,
          speedMs: 2.5,
          quantity: 3,
          machineRoom: 'MRL',
          doorType: 'Center opening 1100mm fire-rated',
          specialRequirements: ['Destination Dispatch', 'Card Key Integration', 'Glass Observation Front']
        },
        scoreReason: 'Prime commercial skyscraper project with substantial allocated budget ($380k) and immediate Q4 installation timeline.',
        customerIntent: 'Immediate purchase of high-spec passenger elevators with turnkey installation.',
        urgencyLevel: 'critical',
        buyingStage: 'decision',
        recommendedNextAction: 'Deliver revised formal quotation with 3D cabin renders and arrange technical engineer consultation.',
        suggestedSalespersonResponse: 'Hi Arthur, following up on your 24-floor Sterling Horizon project. We have finalized the Destination Dispatch MRL engineering specs for the 3 passenger units and attached the updated quotation.',
        analyzedAt: new Date(Date.now() - 8 * 86400000).toISOString()
      }
    },
    {
      id: 'lead_02',
      name: 'Dr. Evelyn Reed',
      companyName: 'St. Jude Regional Healthcare Authority',
      email: 'e.reed@stjuderegional.org',
      phone: '+1 (555) 431-7788',
      location: 'Indianapolis, IN',
      buildingType: 'hospital',
      floors: 8,
      stops: 8,
      elevatorRequirement: '4x Heavy-Duty Hospital Bed & Stretcher Elevators with Code Blue Priority',
      elevatorType: 'hospital_stretcher',
      capacityKg: 2000,
      quantity: 4,
      budget: 420000,
      expectedInstallationDate: '2026-12-01',
      source: 'referral',
      status: 'negotiation',
      priority: 'high',
      aiScore: 89,
      assignedUserId: salesId,
      customerId: 'cust_02',
      notes: 'Hospital board approved budget. Finalizing antimicrobial stainless steel wall cladding and seismic brackets.',
      lastContactedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      nextFollowupDate: new Date(Date.now() + 2 * 86400000).toISOString(),
      createdAt: new Date(Date.now() - 12 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      aiAnalysis: {
        id: 'ai_02',
        leadId: 'lead_02',
        score: 89,
        priority: 'high',
        buildingType: 'hospital',
        elevatorType: 'hospital_stretcher',
        extractedRequirements: {
          floors: 8,
          stops: 8,
          capacityKg: 2000,
          passengerCapacity: 26,
          speedMs: 1.75,
          quantity: 4,
          machineRoom: 'MRL',
          doorType: 'Side opening 1300mm clear hospital bed width',
          specialRequirements: ['Code Blue emergency override', 'Antibacterial wall finish', 'Emergency backup power generator auto-rescue']
        },
        scoreReason: 'Institutional healthcare buyer with confirmed municipal funding and specific regulatory code requirements.',
        customerIntent: 'Procuring 4 specialized medical stretcher lifts under state healthcare procurement guidelines.',
        urgencyLevel: 'high',
        buyingStage: 'decision',
        recommendedNextAction: 'Review electrical generator interlock schematics and send final revised contract.',
        suggestedSalespersonResponse: 'Dear Dr. Reed, our engineering team has verified the Code Blue override and 1300mm door clearance specs for St. Jude. We are ready to sign the delivery milestone agreement.',
        analyzedAt: new Date(Date.now() - 12 * 86400000).toISOString()
      }
    },
    {
      id: 'lead_03',
      name: 'Vikram Mehta',
      companyName: 'OmniHub Logistics Parks',
      email: 'vmehta@omnihublogistics.com',
      phone: '+1 (555) 700-1122',
      location: 'Columbus, OH',
      buildingType: 'industrial',
      floors: 4,
      stops: 4,
      elevatorRequirement: '2x 5000kg Heavy Freight Elevators with Reinforced Chequered Floor for Forklift Operations',
      elevatorType: 'freight_heavy',
      capacityKg: 5000,
      quantity: 2,
      budget: 210000,
      expectedInstallationDate: '2027-01-20',
      source: 'email',
      status: 'qualified',
      priority: 'high',
      aiScore: 84,
      assignedUserId: salesId,
      customerId: 'cust_03',
      notes: 'Pit depth specifications sent to structural contractor for verification.',
      lastContactedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      nextFollowupDate: new Date(Date.now() + 1 * 86400000).toISOString(),
      createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      aiAnalysis: {
        id: 'ai_03',
        leadId: 'lead_03',
        score: 84,
        priority: 'high',
        buildingType: 'industrial',
        elevatorType: 'freight_heavy',
        extractedRequirements: {
          floors: 4,
          stops: 4,
          capacityKg: 5000,
          speedMs: 0.5,
          quantity: 2,
          machineRoom: 'overhead_machine_room',
          doorType: 'Vertical bi-parting freight doors',
          specialRequirements: ['Reinforced chequered steel floor', 'Forklift loading shock absorption', 'Dual operating car stations']
        },
        scoreReason: 'Clear industrial application with verified pit dimensions and ready budget allocation.',
        customerIntent: 'Needs reliable freight lifts to commence distribution center operations by January.',
        urgencyLevel: 'medium',
        buyingStage: 'evaluation',
        recommendedNextAction: 'Send technical civil construction shaft drawings and warranty details.',
        suggestedSalespersonResponse: 'Hello Vikram, we have mapped out the 5000kg freight traction configuration for OmniHub. The civil shaft guide requirements are ready for your site engineer.',
        analyzedAt: new Date(Date.now() - 6 * 86400000).toISOString()
      }
    },
    {
      id: 'lead_04',
      name: 'Claire Kensington',
      companyName: 'Kensington Heritage Residences',
      email: 'claire@kensingtonestates.com',
      phone: '+1 (555) 234-9090',
      location: 'Milwaukee, WI',
      buildingType: 'residential',
      floors: 3,
      stops: 3,
      elevatorRequirement: '1x Custom Panoramic Glass Circular Villa Lift with Titanium Gold Accents',
      elevatorType: 'panoramic_glass',
      capacityKg: 400,
      quantity: 1,
      budget: 85000,
      expectedInstallationDate: '2026-11-30',
      source: 'website',
      status: 'new',
      priority: 'medium',
      aiScore: 78,
      assignedUserId: salesId,
      notes: 'Inbound through public web portal. High aesthetic requirement for luxury home renovation.',
      createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
      aiAnalysis: {
        id: 'ai_04',
        leadId: 'lead_04',
        score: 78,
        priority: 'medium',
        buildingType: 'residential',
        elevatorType: 'panoramic_glass',
        extractedRequirements: {
          floors: 3,
          stops: 3,
          capacityKg: 400,
          passengerCapacity: 5,
          speedMs: 0.4,
          quantity: 1,
          machineRoom: 'MRL',
          doorType: 'Automatic frameless glass doors',
          specialRequirements: ['Circular 360-degree glass cabin', 'Silent hydraulic or screw drive', 'Titanium finish fixtures']
        },
        scoreReason: 'High aesthetic luxury villa inquiry with immediate timeline and realistic budget.',
        customerIntent: 'Looking for a showpiece residential elevator for a private estate.',
        urgencyLevel: 'medium',
        buyingStage: 'evaluation',
        recommendedNextAction: 'Send private residence glass elevator brochure and schedule home architectural survey.',
        suggestedSalespersonResponse: 'Dear Claire, thank you for contacting Apex Elevator Dynamics. Our architectural residential team specializes in panoramic glass villa lifts. We would love to share sample finish swatches.',
        analyzedAt: new Date(Date.now() - 1 * 86400000).toISOString()
      }
    },
    {
      id: 'lead_05',
      name: 'Jonathan Banks',
      companyName: 'Vanguard Development Group',
      email: 'j.banks@vanguarddev.com',
      phone: '+1 (555) 670-3499',
      location: 'Detroit, MI',
      buildingType: 'apartment',
      floors: 14,
      stops: 14,
      elevatorRequirement: '2x Energy-Efficient Regenerative Passenger Elevators (1000kg, 1.75m/s)',
      elevatorType: 'passenger_mrl',
      capacityKg: 1000,
      quantity: 2,
      budget: 195000,
      expectedInstallationDate: '2027-03-01',
      source: 'phone',
      status: 'contacted',
      priority: 'medium',
      aiScore: 74,
      assignedUserId: salesId,
      notes: 'Spoke on phone. Sent initial technical catalog.',
      lastContactedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
      nextFollowupDate: new Date(Date.now() + 2 * 86400000).toISOString(),
      createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 4 * 86400000).toISOString()
    },
    {
      id: 'lead_06',
      name: 'Grace Hopper City Center',
      companyName: 'Hopper Civic Redevelopment Corp',
      email: 'procurement@hoppercivic.gov',
      phone: '+1 (555) 902-8800',
      location: 'Cleveland, OH',
      buildingType: 'government',
      floors: 6,
      stops: 6,
      elevatorRequirement: 'Modernization of 2 existing hydraulic elevators to high-efficiency MRL traction',
      elevatorType: 'passenger_mrl',
      capacityKg: 1150,
      quantity: 2,
      budget: 160000,
      source: 'advertisement',
      status: 'won',
      priority: 'high',
      aiScore: 88,
      assignedUserId: salesId,
      customerId: 'cust_01',
      notes: 'Contract signed! Manufacturing phase underway in local assembly facility.',
      createdAt: new Date(Date.now() - 45 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 86400000).toISOString()
    }
  ];

  const projects: Project[] = [
    {
      id: 'proj_01',
      customerId: 'cust_01',
      leadId: 'lead_06',
      title: 'Hopper Civic Center Elevator Modernization',
      siteAddress: '300 Lakeside Ave, Cleveland, OH 44114',
      buildingType: 'government',
      numberOfFloors: 6,
      elevatorQuantity: 2,
      status: 'manufacturing',
      estimatedCompletion: '2026-11-20',
      budget: 160000,
      createdAt: new Date(Date.now() - 40 * 86400000).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'proj_02',
      customerId: 'cust_02',
      leadId: 'lead_02',
      title: 'St. Jude Healthcare South Wing Expansion',
      siteAddress: '1400 Hospital Way, Indianapolis, IN 46202',
      buildingType: 'hospital',
      numberOfFloors: 8,
      elevatorQuantity: 4,
      status: 'shaft_construction',
      estimatedCompletion: '2026-12-15',
      budget: 420000,
      createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  const quotations: Quotation[] = [
    {
      id: 'quot_01',
      quotationNumber: 'QT-2026-0891',
      customerId: 'cust_01',
      customerName: 'Arthur Sterling',
      customerCompany: 'Sterling Horizon Real Estate Ltd',
      customerEmail: 'a.sterling@sterlinghorizon.com',
      customerPhone: '+1 (555) 891-2300',
      leadId: 'lead_01',
      projectTitle: 'Sterling Horizon Commercial Tower Elevators',
      items: [
        {
          id: 'item_01',
          description: 'Apex-MRL High-Speed Gearless Permanent Magnet Synchronous Motor (PMSM) Elevator',
          elevatorType: 'passenger_mrl',
          specifications: 'Capacity: 1350kg (18 Passengers) | Speed: 2.5 m/s | Stops: 24 Floors | Machine Roomless',
          quantity: 3,
          unitPrice: 105000,
          totalPrice: 315000
        },
        {
          id: 'item_02',
          description: 'Destination Dispatch Smart Touch Hall Kiosks & Core Group Supervisory Controller',
          elevatorType: 'passenger_mrl',
          specifications: '32-bit microprocessor group control with energy-regenerative variable frequency drive (VVVF)',
          quantity: 1,
          unitPrice: 32000,
          totalPrice: 32000
        },
        {
          id: 'item_03',
          description: 'Custom Titanium-Finished Stainless Steel Cabin with Frameless Mirror & LED Backlit Ceiling',
          elevatorType: 'panoramic_glass',
          specifications: 'Titanium gold mirror finish, marble-look composite flooring, integrated 15-inch multimedia screen',
          quantity: 3,
          unitPrice: 9000,
          totalPrice: 27000
        },
        {
          id: 'item_04',
          description: 'Turnkey Civil Engineering Shaft Guide Rail Installation, Commissioning & State Inspection',
          elevatorType: 'passenger_mrl',
          specifications: 'Includes all brackets, counterweights, governor safety gear, certified laser alignment',
          quantity: 1,
          unitPrice: 21000,
          totalPrice: 21000
        }
      ],
      subtotal: 395000,
      taxRate: 6.5,
      taxAmount: 25675,
      discountAmount: 15000,
      totalAmount: 405675,
      status: 'sent',
      validUntil: '2026-11-15',
      terms: 'Standard warranty 36 months parts & 24 months 24/7 emergency response labor. Delivery 8-10 weeks from civil shaft sign-off.',
      paymentTerms: '30% advance on order confirmation, 40% on dispatch of equipment, 20% on completion of installation, 10% on handover & inspection certification.',
      warrantyYears: 3,
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 86400000).toISOString()
    },
    {
      id: 'quot_02',
      quotationNumber: 'QT-2026-0870',
      customerId: 'cust_02',
      customerName: 'Dr. Evelyn Reed',
      customerCompany: 'St. Jude Regional Healthcare Authority',
      customerEmail: 'e.reed@stjuderegional.org',
      customerPhone: '+1 (555) 431-7788',
      leadId: 'lead_02',
      projectTitle: 'St. Jude Regional Hospital Bed & Stretcher Lifts',
      items: [
        {
          id: 'item_med_01',
          description: 'Hospital Bed Heavy-Duty MRL Stretcher Elevator (Seismic Zone 3 Compliant)',
          elevatorType: 'hospital_stretcher',
          specifications: 'Capacity: 2000kg | 1.75 m/s | 8 Stops | Deep cab dimension 1500mm x 2400mm',
          quantity: 4,
          unitPrice: 94000,
          totalPrice: 376000
        },
        {
          id: 'item_med_02',
          description: 'Code Blue Emergency Priority Override & Hospital Automatic Power Failure Rescue Unit (ARD)',
          elevatorType: 'hospital_stretcher',
          specifications: 'Instant floor recall override with dedicated medical key switch and independent firefighter operation',
          quantity: 4,
          unitPrice: 6500,
          totalPrice: 26000
        }
      ],
      subtotal: 402000,
      taxRate: 0, // Tax exempt hospital authority
      taxAmount: 0,
      discountAmount: 12000,
      totalAmount: 390000,
      status: 'accepted',
      validUntil: '2026-12-01',
      terms: 'Includes 5-year comprehensive maintenance contract with guaranteed 30-minute critical response time.',
      paymentTerms: 'Government / Healthcare milestone billing terms: net 45 days upon verified engineer phase inspections.',
      warrantyYears: 5,
      createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 86400000).toISOString()
    }
  ];

  const tasks: Task[] = [
    {
      id: 'tsk_01',
      title: 'Prepare updated 3D cabin finishes for Arthur Sterling',
      description: 'Customer requested titanium mirror finish details and acoustic floor dampening test reports.',
      assignedUserId: salesId,
      leadId: 'lead_01',
      customerId: 'cust_01',
      dueDate: new Date(Date.now() + 1 * 86400000).toISOString(),
      priority: 'urgent',
      status: 'in_progress',
      isAutomated: false,
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'tsk_02',
      title: 'Verify pit depth drawings with OmniHub structural engineer',
      description: 'Confirm pit depth meets 1600mm requirement for 5000kg freight buffers.',
      assignedUserId: salesId,
      leadId: 'lead_03',
      customerId: 'cust_03',
      dueDate: new Date(Date.now() + 2 * 86400000).toISOString(),
      priority: 'high',
      status: 'pending',
      isAutomated: true,
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'tsk_03',
      title: 'Schedule technical survey for Claire Kensington circular villa lift',
      description: 'Inspect structural load bearing columns and glass shaft diameter.',
      assignedUserId: salesId,
      leadId: 'lead_04',
      dueDate: new Date(Date.now() + 3 * 86400000).toISOString(),
      priority: 'medium',
      status: 'pending',
      isAutomated: true,
      createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'tsk_04',
      title: 'Conduct weekly sales pipeline review with Sales Manager Marcus',
      description: 'Review Q4 conversion forecast and high-priority hospital deal closure.',
      assignedUserId: salesId,
      dueDate: new Date(Date.now() - 1 * 86400000).toISOString(),
      priority: 'high',
      status: 'overdue',
      isAutomated: false,
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  const followups: Followup[] = [
    {
      id: 'fol_01',
      leadId: 'lead_01',
      customerId: 'cust_01',
      assignedUserId: salesId,
      channel: 'email',
      scheduledDate: new Date(Date.now() + 1 * 86400000).toISOString(),
      status: 'scheduled',
      suggestedTemplate: 'Hi Arthur, following up on the destination dispatch quotation sent earlier this week...',
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString()
    },
    {
      id: 'fol_02',
      leadId: 'lead_03',
      customerId: 'cust_03',
      assignedUserId: salesId,
      channel: 'phone_call',
      scheduledDate: new Date(Date.now() + 2 * 86400000).toISOString(),
      status: 'scheduled',
      suggestedTemplate: 'Discuss pit depth and vertical bi-parting freight door safety sensors with Vikram.',
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString()
    }
  ];

  const activities: Activity[] = [
    {
      id: 'act_01',
      leadId: 'lead_01',
      userId: salesId,
      userName: 'David Miller',
      type: 'quotation_sent',
      title: 'Quotation QT-2026-0891 Sent',
      description: 'Delivered revised proposal for 3x High-Speed MRL passenger elevators ($405,675) via email.',
      timestamp: new Date(Date.now() - 2 * 86400000).toISOString()
    },
    {
      id: 'act_02',
      leadId: 'lead_01',
      type: 'ai_analysis',
      title: 'AI Lead Scored 92/100',
      description: 'AI model analyzed 24-floor commercial requirement. Classified as Urgent High-Priority commercial project.',
      timestamp: new Date(Date.now() - 8 * 86400000).toISOString()
    },
    {
      id: 'act_03',
      leadId: 'lead_02',
      userId: salesId,
      userName: 'David Miller',
      type: 'deal_won',
      title: 'Contract Approved by Hospital Board',
      description: 'St. Jude Regional Healthcare approved $390,000 project for 4 stretcher bed elevators.',
      timestamp: new Date(Date.now() - 1 * 86400000).toISOString()
    },
    {
      id: 'act_04',
      leadId: 'lead_04',
      type: 'lead_created',
      title: 'New Inbound Lead via Web Portal',
      description: 'Claire Kensington submitted requirement for 3-floor circular glass villa lift.',
      timestamp: new Date(Date.now() - 1 * 86400000).toISOString()
    },
    {
      id: 'act_05',
      leadId: 'lead_04',
      type: 'lead_assigned',
      title: 'Automated Lead Assignment',
      description: 'Assigned to David Miller based on current regional workload balance.',
      timestamp: new Date(Date.now() - 1 * 86400000 + 30000).toISOString()
    }
  ];

  const notifications: Notification[] = [
    {
      id: 'notif_01',
      userId: adminId,
      title: 'High-Priority Lead Captured',
      message: 'New commercial skyscraper lead scored 92/100 by AI (Sterling Horizon Towers).',
      type: 'urgent',
      link: '/leads',
      isRead: false,
      createdAt: new Date(Date.now() - 2 * 3600000).toISOString()
    },
    {
      id: 'notif_02',
      userId: salesId,
      title: 'Quotation Viewed by Customer',
      message: 'Arthur Sterling opened proposal QT-2026-0891 (Destination Dispatch PMSM).',
      type: 'info',
      link: '/quotations',
      isRead: false,
      createdAt: new Date(Date.now() - 5 * 3600000).toISOString()
    },
    {
      id: 'notif_03',
      userId: managerId,
      title: 'Deal Won: $390,000 St. Jude Hospital',
      message: 'David Miller converted St. Jude Regional Healthcare Authority to Won status!',
      type: 'success',
      link: '/customers',
      isRead: true,
      createdAt: new Date(Date.now() - 24 * 3600000).toISOString()
    }
  ];

  const emailLogs: EmailLog[] = [
    {
      id: 'eml_01',
      leadId: 'lead_01',
      recipientEmail: 'a.sterling@sterlinghorizon.com',
      subject: 'Formal Quotation QT-2026-0891: Apex High-Speed Commercial Elevators',
      bodyPreview: 'Dear Arthur, attached please find the engineering proposal and destination dispatch specifications...',
      status: 'sent',
      sentAt: new Date(Date.now() - 2 * 86400000).toISOString()
    },
    {
      id: 'eml_02',
      leadId: 'lead_04',
      recipientEmail: 'claire@kensingtonestates.com',
      subject: 'Thank You for Contacting Apex Elevator Dynamics',
      bodyPreview: 'Dear Claire, thank you for submitting your custom panoramic glass circular elevator inquiry...',
      status: 'sent',
      sentAt: new Date(Date.now() - 1 * 86400000).toISOString()
    }
  ];

  const whatsappMessages: WhatsAppMessage[] = [
    {
      id: 'wa_01',
      leadId: 'lead_01',
      direction: 'outbound',
      phoneNumber: '+15558912300',
      messageText: 'Hello Arthur, David here from Apex Elevator. I have emailed the updated specifications with the titanium cab interior. Let me know if you would like a brief walkthrough today.',
      status: 'delivered',
      timestamp: new Date(Date.now() - 2 * 86400000).toISOString()
    },
    {
      id: 'wa_02',
      leadId: 'lead_01',
      direction: 'inbound',
      phoneNumber: '+15558912300',
      messageText: 'Thanks David, received! We are reviewing with our architect right now.',
      status: 'read',
      timestamp: new Date(Date.now() - 2 * 86400000 + 1800000).toISOString()
    }
  ];

  const automationWorkflows: AutomationWorkflow[] = [
    {
      id: 'wf_new_lead',
      name: 'New Lead Intelligent Intake & Scoring',
      description: 'Triggered when a new lead enters via public form, API, or email. Executes AI requirement extraction, calculates 0-100 score, assigns salesperson by workload, and dispatches acknowledgement.',
      triggerEvent: 'lead.created',
      isActive: true,
      executionCount: 24,
      failureCount: 0,
      lastExecutedAt: new Date(Date.now() - 1 * 86400000).toISOString()
    },
    {
      id: 'wf_urgent_escalation',
      name: 'High-Priority Urgent Lead Escalation',
      description: 'Triggered when AI lead score exceeds 75/100. Dispatches urgent SMS/WhatsApp alert to Sales Manager and creates 24h priority contact task.',
      triggerEvent: 'lead.scored_high',
      isActive: true,
      executionCount: 16,
      failureCount: 0,
      lastExecutedAt: new Date(Date.now() - 1 * 86400000).toISOString()
    },
    {
      id: 'wf_proposal_followup',
      name: 'Automated Proposal 3-Day Follow-Up',
      description: 'When a quotation is delivered, schedules a personalized AI follow-up 72 hours later if status has not moved to negotiation.',
      triggerEvent: 'quotation.sent',
      isActive: true,
      executionCount: 11,
      failureCount: 0,
      lastExecutedAt: new Date(Date.now() - 2 * 86400000).toISOString()
    },
    {
      id: 'wf_inactive_escalation',
      name: 'Inactive Lead 48h Escalation',
      description: 'Audits pipeline daily. If a high-value lead has had no contact for >48 hours, automatically flags manager and reassigns task.',
      triggerEvent: 'lead.inactive_check',
      isActive: true,
      executionCount: 30,
      failureCount: 0,
      lastExecutedAt: new Date(Date.now() - 6 * 3600000).toISOString()
    },
    {
      id: 'wf_customer_message_ai',
      name: 'Customer Inbound Message Sentiment & Intent',
      description: 'Analyzes inbound customer emails and WhatsApp messages to determine sentiment, urgency, and auto-drafts suggested replies.',
      triggerEvent: 'message.received',
      isActive: true,
      executionCount: 42,
      failureCount: 0,
      lastExecutedAt: new Date(Date.now() - 2 * 86400000).toISOString()
    }
  ];

  const automationLogs: AutomationLog[] = [
    {
      id: 'autolog_01',
      workflowId: 'wf_new_lead',
      workflowName: 'New Lead Intelligent Intake & Scoring',
      leadId: 'lead_04',
      actionTaken: 'Extracted requirements, calculated AI score 78/100, assigned to David Miller, sent customer acknowledgement email.',
      status: 'success',
      details: 'All steps executed successfully in 1.4s. Customer acknowledgement email sent to claire@kensingtonestates.com.',
      timestamp: new Date(Date.now() - 1 * 86400000).toISOString()
    },
    {
      id: 'autolog_02',
      workflowId: 'wf_urgent_escalation',
      workflowName: 'High-Priority Urgent Lead Escalation',
      leadId: 'lead_01',
      actionTaken: 'AI Score 92 triggered manager notification and urgent follow-up task assignment.',
      status: 'success',
      details: 'Created urgent priority task #tsk_01 and alerted Sales Manager Marcus Chen.',
      timestamp: new Date(Date.now() - 8 * 86400000).toISOString()
    }
  ];

  const settings: SystemSettings = {
    company,
    ai: {
      provider: process.env.GROQ_API_KEY
        ? 'groq'
        : process.env.GEMINI_API_KEY
        ? 'gemini'
        : 'algorithmic_fallback',
      model: process.env.AI_MODEL || 'gemini-3.8-flash',
      groqApiKeyConfigured: Boolean(process.env.GROQ_API_KEY),
      groqModel: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
      autoScoringEnabled: true,
      urgentScoreThreshold: 75
    },
    email: {
      provider: 'resend',
      resendApiKeyConfigured: Boolean(process.env.RESEND_API_KEY),
      fromEmail: process.env.EMAIL_FROM || 'sales@apexelevatordynamics.com',
      fromName: 'Apex Elevator Dynamics Sales Team',
      sendLeadAcknowledgement: true
    },
    whatsapp: {
      configured: Boolean(process.env.WHATSAPP_TOKEN),
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
      verifyToken: process.env.WHATSAPP_VERIFY_TOKEN || 'elevator_crm_webhook_verify_token_2026',
      sendInstantReply: true
    },
    automation: {
      autoAssignEnabled: true,
      assignmentStrategy: 'lowest_workload',
      followupDelayHours: 24,
      escalationHours: 48,
      n8nWebhookUrl: process.env.N8N_WEBHOOK_URL
    }
  };

  return {
    users,
    company,
    leads,
    customers,
    projects,
    quotations,
    tasks,
    followups,
    activities,
    notifications,
    emailLogs,
    whatsappMessages,
    automationWorkflows,
    automationLogs,
    settings
  };
}

class Database {
  private data: DatabaseSchema;
  private isSaving = false;

  constructor() {
    this.ensureDataDir();
    this.data = this.load();
  }

  private ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.error('Error reading database file, initializing fresh seed:', e);
    }
    const initial = getInitialData();
    this.saveDirect(initial);
    return initial;
  }

  private saveDirect(dataToSave: DatabaseSchema) {
    try {
      this.ensureDataDir();
      const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
      fs.writeFileSync(tempFile, JSON.stringify(dataToSave, null, 2), 'utf-8');
      fs.renameSync(tempFile, DB_FILE);
    } catch (e) {
      console.error('Failed to write database file:', e);
    }
  }

  public save() {
    if (this.isSaving) return;
    this.isSaving = true;
    try {
      this.saveDirect(this.data);
    } finally {
      this.isSaving = false;
    }
  }

  public resetToSeed() {
    this.data = getInitialData();
    this.save();
    return this.data;
  }

  public getData(): DatabaseSchema {
    return this.data;
  }

  // Users
  public getUsers(): User[] {
    return this.data.users;
  }

  public getUserById(id: string): User | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  public getUserByEmail(email: string): User | undefined {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public addUser(user: User): User {
    this.data.users.push(user);
    this.save();
    return user;
  }

  public updateUser(id: string, updates: Partial<User>): User | undefined {
    const idx = this.data.users.findIndex((u) => u.id === id);
    if (idx === -1) return undefined;
    this.data.users[idx] = { ...this.data.users[idx], ...updates, updatedAt: new Date().toISOString() };
    this.save();
    return this.data.users[idx];
  }

  // Leads
  public getLeads(): Lead[] {
    return [...this.data.leads].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getLeadById(id: string): Lead | undefined {
    return this.data.leads.find((l) => l.id === id);
  }

  public addLead(lead: Lead): Lead {
    this.data.leads.unshift(lead);
    this.save();
    return lead;
  }

  public updateLead(id: string, updates: Partial<Lead>): Lead | undefined {
    const idx = this.data.leads.findIndex((l) => l.id === id);
    if (idx === -1) return undefined;
    this.data.leads[idx] = { ...this.data.leads[idx], ...updates, updatedAt: new Date().toISOString() };
    this.save();
    return this.data.leads[idx];
  }

  public deleteLead(id: string): boolean {
    const prevLen = this.data.leads.length;
    this.data.leads = this.data.leads.filter((l) => l.id !== id);
    if (this.data.leads.length !== prevLen) {
      this.save();
      return true;
    }
    return false;
  }

  // Customers
  public getCustomers(): Customer[] {
    return this.data.customers;
  }

  public getCustomerById(id: string): Customer | undefined {
    return this.data.customers.find((c) => c.id === id);
  }

  public addCustomer(customer: Customer): Customer {
    this.data.customers.push(customer);
    this.save();
    return customer;
  }

  public updateCustomer(id: string, updates: Partial<Customer>): Customer | undefined {
    const idx = this.data.customers.findIndex((c) => c.id === id);
    if (idx === -1) return undefined;
    this.data.customers[idx] = { ...this.data.customers[idx], ...updates, updatedAt: new Date().toISOString() };
    this.save();
    return this.data.customers[idx];
  }

  // Projects
  public getProjects(): Project[] {
    return this.data.projects;
  }

  public getProjectById(id: string): Project | undefined {
    return this.data.projects.find((p) => p.id === id);
  }

  public addProject(project: Project): Project {
    this.data.projects.push(project);
    this.save();
    return project;
  }

  public updateProject(id: string, updates: Partial<Project>): Project | undefined {
    const idx = this.data.projects.findIndex((p) => p.id === id);
    if (idx === -1) return undefined;
    this.data.projects[idx] = { ...this.data.projects[idx], ...updates, updatedAt: new Date().toISOString() };
    this.save();
    return this.data.projects[idx];
  }

  // Quotations
  public getQuotations(): Quotation[] {
    return [...this.data.quotations].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getQuotationById(id: string): Quotation | undefined {
    return this.data.quotations.find((q) => q.id === id);
  }

  public addQuotation(quotation: Quotation): Quotation {
    this.data.quotations.unshift(quotation);
    this.save();
    return quotation;
  }

  public updateQuotation(id: string, updates: Partial<Quotation>): Quotation | undefined {
    const idx = this.data.quotations.findIndex((q) => q.id === id);
    if (idx === -1) return undefined;
    this.data.quotations[idx] = { ...this.data.quotations[idx], ...updates, updatedAt: new Date().toISOString() };
    this.save();
    return this.data.quotations[idx];
  }

  // Tasks
  public getTasks(): Task[] {
    return [...this.data.tasks].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }

  public addTask(task: Task): Task {
    this.data.tasks.unshift(task);
    this.save();
    return task;
  }

  public updateTask(id: string, updates: Partial<Task>): Task | undefined {
    const idx = this.data.tasks.findIndex((t) => t.id === id);
    if (idx === -1) return undefined;
    this.data.tasks[idx] = { ...this.data.tasks[idx], ...updates, updatedAt: new Date().toISOString() };
    this.save();
    return this.data.tasks[idx];
  }

  public deleteTask(id: string): boolean {
    const prev = this.data.tasks.length;
    this.data.tasks = this.data.tasks.filter((t) => t.id !== id);
    if (this.data.tasks.length !== prev) {
      this.save();
      return true;
    }
    return false;
  }

  // Followups
  public getFollowups(): Followup[] {
    return this.data.followups;
  }

  public addFollowup(followup: Followup): Followup {
    this.data.followups.unshift(followup);
    this.save();
    return followup;
  }

  public updateFollowup(id: string, updates: Partial<Followup>): Followup | undefined {
    const idx = this.data.followups.findIndex((f) => f.id === id);
    if (idx === -1) return undefined;
    this.data.followups[idx] = { ...this.data.followups[idx], ...updates };
    this.save();
    return this.data.followups[idx];
  }

  // Activities
  public getActivities(): Activity[] {
    return [...this.data.activities].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public addActivity(activity: Activity): Activity {
    this.data.activities.unshift(activity);
    if (this.data.activities.length > 200) {
      this.data.activities = this.data.activities.slice(0, 200);
    }
    this.save();
    return activity;
  }

  // Notifications
  public getNotifications(userId?: string): Notification[] {
    let list = this.data.notifications;
    if (userId) {
      list = list.filter((n) => n.userId === userId || n.userId === 'all');
    }
    return [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public addNotification(notification: Notification): Notification {
    this.data.notifications.unshift(notification);
    this.save();
    return notification;
  }

  public markNotificationRead(id: string): boolean {
    const n = this.data.notifications.find((item) => item.id === id);
    if (n) {
      n.isRead = true;
      this.save();
      return true;
    }
    return false;
  }

  public markAllNotificationsRead(userId?: string): void {
    this.data.notifications.forEach((n) => {
      if (!userId || n.userId === userId || n.userId === 'all') {
        n.isRead = true;
      }
    });
    this.save();
  }

  // Email Logs
  public getEmailLogs(): EmailLog[] {
    return [...this.data.emailLogs].sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
  }

  public addEmailLog(log: EmailLog): EmailLog {
    this.data.emailLogs.unshift(log);
    this.save();
    return log;
  }

  // WhatsApp Messages
  public getWhatsAppMessages(leadId?: string): WhatsAppMessage[] {
    if (leadId) {
      return this.data.whatsappMessages.filter((m) => m.leadId === leadId);
    }
    return [...this.data.whatsappMessages].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public addWhatsAppMessage(msg: WhatsAppMessage): WhatsAppMessage {
    this.data.whatsappMessages.unshift(msg);
    this.save();
    return msg;
  }

  // Automation Workflows & Logs
  public getAutomationWorkflows(): AutomationWorkflow[] {
    return this.data.automationWorkflows;
  }

  public updateAutomationWorkflow(id: string, updates: Partial<AutomationWorkflow>): AutomationWorkflow | undefined {
    const idx = this.data.automationWorkflows.findIndex((w) => w.id === id);
    if (idx === -1) return undefined;
    this.data.automationWorkflows[idx] = { ...this.data.automationWorkflows[idx], ...updates };
    this.save();
    return this.data.automationWorkflows[idx];
  }

  public getAutomationLogs(): AutomationLog[] {
    return [...this.data.automationLogs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public addAutomationLog(log: AutomationLog): AutomationLog {
    this.data.automationLogs.unshift(log);
    if (this.data.automationLogs.length > 300) {
      this.data.automationLogs = this.data.automationLogs.slice(0, 300);
    }
    this.save();
    return log;
  }

  // Settings
  public getSettings(): SystemSettings {
    return this.data.settings;
  }

  public updateSettings(updates: Partial<SystemSettings>): SystemSettings {
    this.data.settings = {
      ...this.data.settings,
      ...updates,
      company: updates.company ? { ...this.data.settings.company, ...updates.company } : this.data.settings.company,
      ai: updates.ai ? { ...this.data.settings.ai, ...updates.ai } : this.data.settings.ai,
      email: updates.email ? { ...this.data.settings.email, ...updates.email } : this.data.settings.email,
      whatsapp: updates.whatsapp ? { ...this.data.settings.whatsapp, ...updates.whatsapp } : this.data.settings.whatsapp,
      automation: updates.automation ? { ...this.data.settings.automation, ...updates.automation } : this.data.settings.automation
    };
    this.save();
    return this.data.settings;
  }
}

export const db = new Database();
