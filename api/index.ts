import express, { Request, Response } from 'express';
import apiRouter from '../server/routes';

const app = express();

// Parse JSON and form-urlencoded bodies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Permissive CORS for Vercel production and preview domains
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Diagnostic & Health Check route
app.get(['/health', '/api/health'], (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'ElevateAI CRM SaaS Serverless API',
    environment: process.env.VERCEL ? 'vercel-serverless' : 'node-server',
    timestamp: new Date().toISOString()
  });
});

// Service info endpoint for browser inspection of /api
app.get(['/', '/api'], (req: Request, res: Response) => {
  res.json({
    name: 'ElevateAI CRM SaaS API',
    status: 'operational',
    endpoints: {
      authLogin: 'POST /api/auth/login',
      authRegister: 'POST /api/auth/register',
      leads: 'GET /api/leads',
      customers: 'GET /api/customers',
      quotations: 'GET /api/quotations',
      dashboard: 'GET /api/analytics/dashboard',
      health: 'GET /api/health'
    }
  });
});

// Mount CRM REST API Router
// Mounted at both '/api' and '/' so requests routed via Vercel rewrites (/api/auth/login or /auth/login) match
app.use('/api', apiRouter);
app.use('/', apiRouter);

export default app;
