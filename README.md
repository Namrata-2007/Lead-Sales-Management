# ElevateAI CRM — AI-Automated Elevator SaaS

ElevateAI CRM is a modern, enterprise SaaS web platform built specifically for vertical transportation manufacturers, elevator modernization contractors, and commercial lift engineering companies.

Unlike traditional CRMs that act as passive databases, ElevateAI implements an autonomous operational loop:
> **CAPTURE → UNDERSTAND → SCORE → ASSIGN → COMMUNICATE → FOLLOW UP → CONVERT → ANALYZE**

Every incoming elevator lead is analyzed with **Gemini AI**, scored from 0–100, classified by building profile (Hospital, Commercial, High-Rise Residential, Industrial Freight), routed to the least-busy solutions engineer, acknowledged via email, and scheduled for multi-day follow-up.

---

## 1. Key Features

- **Autonomous AI Lead Qualification & Scoring:** Real-time extraction of floor stops, machine room requirements (MRL vs overhead), speed ($m/s$), cab dimensions, passenger capacity, and urgency scoring (0–100).
- **Intelligent Workload Balancing:** Dynamic auto-assignment routing leads to available sales engineers with the lowest active pipeline count.
- **Kanban Sales Pipeline:** Drag-and-drop / stage selector (`New` → `Contacted` → `Qualified` → `Proposal Sent` → `Negotiation` → `Won` / `Lost`) with automated workflow triggers.
- **Quotation Engineering & Itemized Proposals:** Generates comprehensive elevator equipment breakdown (PMSM gearless traction motors, regenerative VVVF controllers, titanium cab finishes, infrared door curtains, guide rail civil kits) with taxes, discounts, and printable PDF previews.
- **Automated Outreach & Follow-Up Engine:** Integrated workflows with scheduled 24-hour initial contact, 72-hour proposal follow-up, and 48-hour inactive lead manager escalations.
- **Multi-Channel Communications Hub:** Transactional email logging with Resend API support and official WhatsApp Business / Cloud API webhook architecture.
- **Account Lifecycles & Timelines:** Full audit logs tracking initial inquiry → AI qualification → proposal delivery → board sign-off → installation handover.
- **Commercial PostgreSQL Schema & Analytics:** Real-time analytics computed directly from the relational database schema, with sector distribution, win conversion %, and salesperson revenue leaderboards.
- **Public Lead Intake Portal:** Live customer-facing project submission page at `/public-portal` for immediate client inquiries.

---

## 2. Tech Stack & Architecture

- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Framer Motion.
- **Backend:** Node.js Express server running REST APIs with Vite middlewares on Port 3000, plus standalone Python FastAPI (`backend/app/main.py`) with SQLAlchemy ORM (`backend/app/models/elevator_models.py`).
- **Database:** Persistent relational store (`data/elevator_crm_db.json`) with ACID file-locking + full PostgreSQL schema definitions.
- **AI Intelligence:** Ultra-fast **Groq Cloud API** (`GROQ_API_KEY`, supporting `llama-3.3-70b-versatile`) with `@google/genai` (`gemini-3.8-flash`) support.
- **Automation:** n8n workflow engine (`n8n/workflows/elevator_crm_lead_flow.json`) via direct webhooks.
- **Transactional Email:** Resend API.
- **Instant Messaging:** WhatsApp Cloud API (Graph API v19.0).

---

## 3. Environment Variables

Create `.env` using `.env.example`:

```bash
# Groq AI Inference API Key (Ultra Low Latency LPU)
GROQ_API_KEY="gsk_your_groq_api_key_here"
GROQ_MODEL="llama-3.3-70b-versatile"

# Gemini AI API Key (Injected by AI Studio)
GEMINI_API_KEY="your-gemini-api-key"
AI_MODEL="gemini-3.8-flash"

# Port and Application URL
PORT=3000
APP_URL="https://your-domain.com"

# Authentication
JWT_SECRET="super-secret-jwt-key-minimum-32-chars-long"

# Database
DATABASE_URL="postgresql://elevator_admin:secure_pass@localhost:5432/elevator_crm_db"

# Transactional Email (Resend)
RESEND_API_KEY="re_123456789_abcdefg"
EMAIL_FROM="sales@apexelevatordynamics.com"

# WhatsApp Cloud API
WHATSAPP_TOKEN="EAAB..."
WHATSAPP_PHONE_NUMBER_ID="109876543210"
WHATSAPP_VERIFY_TOKEN="elevator_crm_webhook_verify_token_2026"

# n8n Automation Engine (Direct Webhooks)
N8N_WEBHOOK_URL="https://n8n.yourcompany.com/webhook/elevator-lead-automation"
```

---

## 4. Quick Start & Local Execution

### Unified Full-Stack Node / React Service (Port 3000)

```bash
# Install dependencies
npm install

# Start unified development server (Express API + Vite React client)
npm run dev

# Or build and run production server
npm run build
npm start
```

### Standalone Python FastAPI Service (Optional)

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Run Automated Tests

```bash
python3 backend/tests/test_crm.py
```

### Seed Database

```bash
python3 seed.py
```

### Run with Docker Compose

```bash
docker-compose up -d
```
Starts:
- Elevator CRM Full-Stack App on `http://localhost:3000`
- PostgreSQL 15 on `localhost:5432`
- n8n Automation Engine on `http://localhost:5678`

---

## 5. Demo Accounts

For demonstration and testing, use any of the pre-configured role accounts (password for all: `Password123!`):

| Role | Name | Email | Permissions |
|---|---|---|---|
| **Admin** | Elena Vance | `admin@elevatecrm.io` | Full system access & settings |
| **Sales Manager** | Marcus Chen | `marcus.chen@elevatecrm.io` | Pipeline management & assignments |
| **Salesperson** | David Miller | `david.m@elevatecrm.io` | Assigned leads, follow-ups & quotes |
| **Support** | Sarah Jenkins | `support@elevatecrm.io` | Client accounts & communications |

---

## 6. Official WhatsApp & n8n Integration

- **WhatsApp Webhook URL:** `https://<your-domain>/api/webhooks/whatsapp`
- **Verify Token:** `elevator_crm_webhook_verify_token_2026`
- **n8n Webhook Workflow:** Import `n8n/workflows/elevator_crm_lead_flow.json` into your n8n workspace to automatically receive high-priority lead triggers and orchestrate 24-hour reminder loops.
