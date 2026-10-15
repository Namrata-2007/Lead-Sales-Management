import { GoogleGenAI } from '@google/genai';
import { AIAnalysis, BuildingType, ElevatorType, Lead, Customer } from './types';

// Gemini client initialization
const aiClient = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    })
  : null;

const GEMINI_MODEL = process.env.AI_MODEL || 'gemini-3.8-flash';
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

/**
 * Execute LLM call via Groq Cloud API
 * Uses OpenAI-compatible endpoints with ultra-fast inference
 */
async function callGroqAPI(
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  jsonMode: boolean = true
): Promise<string | null> {
  const groqApiKey = process.env.GROQ_API_KEY;
  if (!groqApiKey) return null;

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages,
        temperature: 0.2,
        ...(jsonMode ? { response_format: { type: 'json_object' } } : {})
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.warn('Groq API returned non-OK status:', res.status, err);
      return null;
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (err) {
    console.warn('Error invoking Groq API:', err);
    return null;
  }
}

export async function analyzeLeadWithAI(lead: Partial<Lead>): Promise<AIAnalysis> {
  const systemPrompt = `You are a Principal Elevator Engineering & Commercial Sales AI Analyst for an industrial elevator SaaS.
Your evaluation must follow real elevator engineering logic:
1. High-rise (>15 floors) or commercial/hospital or multi-unit (>2 lifts) projects have high value and urgency.
2. Calculate an accurate commercial lead score from 0 to 100:
   - 80-100: Urgent high priority (approved budget, commercial/hospital high-capacity, immediate timeline)
   - 65-79: Medium priority (residential/standard commercial, moderate timeline)
   - 40-64: Low priority (speculative, exploratory, missing basic specs)
3. Return a clean JSON object matching this schema:
{
  "score": number, // 0-100
  "priority": "low" | "medium" | "high" | "urgent",
  "buildingType": "residential" | "commercial" | "industrial" | "hospital" | "hotel" | "apartment" | "government" | "other",
  "elevatorType": "passenger_mrl" | "passenger_geared" | "panoramic_glass" | "freight_heavy" | "hospital_stretcher" | "villa_hydraulic" | "automobile" | "dumbwaiter",
  "extractedRequirements": {
    "floors": number,
    "stops": number,
    "capacityKg": number,
    "passengerCapacity": number,
    "speedMs": number,
    "quantity": number,
    "machineRoom": "MRL" | "overhead_machine_room" | "hydraulic_tank",
    "doorType": string,
    "specialRequirements": string[]
  },
  "scoreReason": string,
  "customerIntent": string,
  "urgencyLevel": "low" | "medium" | "high" | "critical",
  "buyingStage": "awareness" | "evaluation" | "decision" | "ready_to_buy",
  "recommendedNextAction": string,
  "suggestedSalespersonResponse": string
}`;

  const userPrompt = `Project Name/Client: ${lead.name || 'Unknown'}
Company: ${lead.companyName || 'N/A'}
Location: ${lead.location || 'N/A'}
Building Type: ${lead.buildingType || 'unspecified'}
Floors: ${lead.floors || 'unspecified'}
Stops: ${lead.stops || lead.floors || 'unspecified'}
Elevator Requirement Note: "${lead.elevatorRequirement || 'General elevator inquiry'}"
Quantity: ${lead.quantity || 1}
Budget: ${lead.budget ? `$${lead.budget}` : 'Unspecified'}
Expected Installation Date: ${lead.expectedInstallationDate || 'Unspecified'}
Notes: ${lead.notes || 'None'}`;

  // 1. Try Groq API first if configured
  if (process.env.GROQ_API_KEY) {
    const groqResponse = await callGroqAPI([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ]);

    if (groqResponse) {
      try {
        const parsed = JSON.parse(groqResponse);
        return formatAIAnalysisResult(parsed, lead, 'groq');
      } catch (err) {
        console.warn('Failed to parse Groq response JSON:', err);
      }
    }
  }

  // 2. Try Gemini API
  if (aiClient) {
    try {
      const response = await aiClient.models.generateContent({
        model: GEMINI_MODEL,
        contents: `${systemPrompt}\n\nAnalyze this inbound elevator project lead and output structured JSON:\n${userPrompt}`,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const text = response.text?.trim() || '{}';
      const parsed = JSON.parse(text);
      return formatAIAnalysisResult(parsed, lead, 'gemini');
    } catch (err) {
      console.warn('Gemini API call returned error, falling back to algorithmic analyzer:', err);
    }
  }

  // 3. Deterministic Elevator Domain Analyzer Fallback
  return fallbackElevatorLeadAnalysis(lead);
}

function formatAIAnalysisResult(parsed: any, lead: Partial<Lead>, engine: string): AIAnalysis {
  return {
    id: `ai_${engine}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    leadId: lead.id || '',
    score: typeof parsed.score === 'number' ? Math.min(100, Math.max(0, parsed.score)) : 75,
    priority: parsed.priority || (parsed.score >= 80 ? 'urgent' : parsed.score >= 65 ? 'high' : 'medium'),
    buildingType: (parsed.buildingType as BuildingType) || lead.buildingType || 'commercial',
    elevatorType: (parsed.elevatorType as ElevatorType) || lead.elevatorType || 'passenger_mrl',
    extractedRequirements: {
      floors: parsed.extractedRequirements?.floors || lead.floors || 5,
      stops: parsed.extractedRequirements?.stops || lead.stops || lead.floors || 5,
      capacityKg: parsed.extractedRequirements?.capacityKg || (lead.buildingType === 'hospital' ? 1600 : lead.buildingType === 'industrial' ? 3000 : 1000),
      passengerCapacity: parsed.extractedRequirements?.passengerCapacity || 13,
      speedMs: parsed.extractedRequirements?.speedMs || (lead.floors && lead.floors > 15 ? 2.5 : 1.75),
      quantity: parsed.extractedRequirements?.quantity || lead.quantity || 1,
      machineRoom: parsed.extractedRequirements?.machineRoom || 'MRL',
      doorType: parsed.extractedRequirements?.doorType || 'Automatic Center Opening 1100mm',
      specialRequirements: parsed.extractedRequirements?.specialRequirements || ['Firefighter emergency operation', 'Seismic compliance']
    },
    scoreReason: parsed.scoreReason || 'Automated engineering evaluation based on project floors, quantity, and budget.',
    customerIntent: parsed.customerIntent || 'Commercial inquiry for turnkey elevator supply and installation.',
    urgencyLevel: parsed.urgencyLevel || 'high',
    buyingStage: parsed.buyingStage || 'evaluation',
    recommendedNextAction: parsed.recommendedNextAction || 'Deliver comprehensive technical layout drawings and quotation.',
    suggestedSalespersonResponse: parsed.suggestedSalespersonResponse || `Hello ${lead.name || 'there'}, thank you for contacting our elevator engineering team regarding your project. We have reviewed your shaft parameters and are ready to present the optimal traction configuration.`,
    analyzedAt: new Date().toISOString()
  };
}

function fallbackElevatorLeadAnalysis(lead: Partial<Lead>): AIAnalysis {
  const floors = lead.floors || 4;
  const qty = lead.quantity || 1;
  const bType = lead.buildingType || 'commercial';
  const budget = lead.budget || 0;

  let score = 50;
  if (floors >= 20) score += 25;
  else if (floors >= 10) score += 18;
  else if (floors >= 4) score += 10;

  if (qty >= 4) score += 20;
  else if (qty >= 2) score += 14;
  else score += 5;

  if (bType === 'hospital' || bType === 'commercial') score += 15;
  if (budget >= 250000) score += 15;

  score = Math.min(96, Math.max(35, score));
  const priority = score >= 85 ? 'urgent' : score >= 70 ? 'high' : score >= 55 ? 'medium' : 'low';

  let elType: ElevatorType = 'passenger_mrl';
  let speed = 1.0;
  let capacity = 800;
  let machineRoom: 'MRL' | 'overhead_machine_room' = 'MRL';

  if (bType === 'hospital') {
    elType = 'hospital_stretcher';
    capacity = 2000;
    speed = 1.75;
  } else if (bType === 'industrial') {
    elType = 'freight_heavy';
    capacity = 5000;
    speed = 0.5;
    machineRoom = 'overhead_machine_room';
  } else if (bType === 'residential' && floors <= 4) {
    elType = 'panoramic_glass';
    capacity = 450;
    speed = 0.4;
  } else if (floors > 15) {
    elType = 'passenger_mrl';
    speed = 2.5;
    capacity = 1350;
  }

  return {
    id: `ai_algo_${Date.now()}`,
    leadId: lead.id || '',
    score,
    priority,
    buildingType: bType,
    elevatorType: elType,
    extractedRequirements: {
      floors,
      stops: lead.stops || floors,
      capacityKg: capacity,
      passengerCapacity: Math.round(capacity / 75),
      speedMs: speed,
      quantity: qty,
      machineRoom,
      doorType: bType === 'hospital' ? '1300mm Wide Side Opening' : '1100mm Center Opening Fire Rated',
      specialRequirements: ['Variable Voltage Variable Frequency (VVVF) drive', 'Automatic Rescue Device (ARD)', 'Seismic detection system']
    },
    scoreReason: `Commercial viability score (${score}/100) based on ${floors} floors, ${qty} elevator unit(s), and ${bType} building profile.`,
    customerIntent: `Seeking procurement and installation of ${qty}x ${elType.replace(/_/g, ' ')} systems.`,
    urgencyLevel: score >= 85 ? 'critical' : score >= 70 ? 'high' : 'medium',
    buyingStage: budget > 0 ? 'decision' : 'evaluation',
    recommendedNextAction: 'Review civil shaft dimensions, send technical proposal with warranty schedule, and arrange engineering survey.',
    suggestedSalespersonResponse: `Dear ${lead.name || 'Valued Customer'}, thank you for submitting your ${floors}-floor ${bType} requirement. We have verified the preliminary load and speed metrics (${capacity}kg at ${speed} m/s) and have prepared custom options for your review.`,
    analyzedAt: new Date().toISOString()
  };
}

export async function generatePersonalizedFollowup(
  lead: Lead,
  customer?: Customer,
  channel: 'email' | 'whatsapp' = 'email',
  dealContext?: string
): Promise<{ subject: string; body: string }> {
  const systemPrompt = `You are a senior sales manager at Apex Elevator Dynamics.
Generate a polite, highly persuasive, technically informed sales follow-up message to a client for ${channel} channel.
Return JSON:
{
  "subject": string,
  "body": string
}`;

  const userPrompt = `Client Name: ${lead.name}
Company: ${lead.companyName || customer?.companyName || 'Your Firm'}
Building Type: ${lead.buildingType}
Floors/Stops: ${lead.floors} floors
Elevator Requirement: ${lead.elevatorRequirement}
Lead Status: ${lead.status}
Deal Context: ${dealContext || 'Quotation was sent recently'}
Channel: ${channel}`;

  // 1. Try Groq
  if (process.env.GROQ_API_KEY) {
    const groqResponse = await callGroqAPI([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ]);
    if (groqResponse) {
      try {
        const parsed = JSON.parse(groqResponse);
        if (parsed.body) {
          return {
            subject: parsed.subject || `Follow-up: Elevator Solutions for ${lead.companyName || lead.name}`,
            body: parsed.body
          };
        }
      } catch (err) {
        console.warn('Groq parse error on followup:', err);
      }
    }
  }

  // 2. Try Gemini
  if (aiClient) {
    try {
      const response = await aiClient.models.generateContent({
        model: GEMINI_MODEL,
        contents: `${systemPrompt}\n\n${userPrompt}`,
        config: {
          responseMimeType: 'application/json'
        }
      });
      const parsed = JSON.parse(response.text?.trim() || '{}');
      if (parsed.body) {
        return {
          subject: parsed.subject || `Follow-up: Elevator Solutions for ${lead.companyName || lead.name}`,
          body: parsed.body
        };
      }
    } catch (err) {
      console.warn('Gemini follow-up generation fallback:', err);
    }
  }

  // Fallback
  if (channel === 'whatsapp') {
    return {
      subject: `Elevator Project Follow-up: ${lead.buildingType}`,
      body: `Hi ${lead.name}, I hope your week is going well! I am following up on the ${lead.floors}-floor elevator specification we discussed for ${lead.companyName || 'your project'}. Would you be free for a 5-minute call today to address any questions regarding the layout drawings and lead times? - David from Apex Elevator`
    };
  }

  return {
    subject: `Update regarding your ${lead.floors}-floor elevator project - Apex Elevator Dynamics`,
    body: `Dear ${lead.name},\n\nI hope this email finds you well.\n\nI wanted to follow up on your elevator requirement for the ${lead.floors}-floor ${lead.buildingType} project in ${lead.location}.\n\nOur engineering team has finalized the performance simulations for the ${lead.elevatorType.replace(/_/g, ' ')} units to ensure optimal wait times and energy efficiency. Please let us know if you would like to arrange a brief technical consultation with our lead project engineer this week.\n\nBest regards,\n\nDavid Miller\nSenior Solutions Engineer\nApex Elevator Dynamics Inc.\n+1 (800) 555-LIFT`
  };
}

export async function analyzeInboundCustomerMessage(
  messageText: string,
  leadContext?: string
): Promise<{
  intent: string;
  sentiment: 'positive' | 'neutral' | 'negative' | 'urgent';
  urgency: 'low' | 'medium' | 'high' | 'critical';
  buyingStage: string;
  recommendedAction: string;
  draftReply: string;
}> {
  const systemPrompt = `Analyze this incoming customer message regarding an elevator installation/maintenance project.
Determine customer intent, sentiment, urgency, buying stage, recommended next action, and draft a high-quality salesperson reply.
Return JSON:
{
  "intent": string,
  "sentiment": "positive" | "neutral" | "negative" | "urgent",
  "urgency": "low" | "medium" | "high" | "critical",
  "buyingStage": string,
  "recommendedAction": string,
  "draftReply": string
}`;

  const userPrompt = `Message: "${messageText}"\nContext: ${leadContext || 'Active elevator sales lead'}`;

  // 1. Try Groq
  if (process.env.GROQ_API_KEY) {
    const groqResponse = await callGroqAPI([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ]);
    if (groqResponse) {
      try {
        const parsed = JSON.parse(groqResponse);
        if (parsed.intent) return parsed;
      } catch (err) {
        console.warn('Groq parse error on message analysis:', err);
      }
    }
  }

  // 2. Try Gemini
  if (aiClient) {
    try {
      const response = await aiClient.models.generateContent({
        model: GEMINI_MODEL,
        contents: `${systemPrompt}\n\n${userPrompt}`,
        config: {
          responseMimeType: 'application/json'
        }
      });
      const parsed = JSON.parse(response.text?.trim() || '{}');
      if (parsed.intent) {
        return parsed;
      }
    } catch (err) {
      console.warn('Gemini message analysis fallback:', err);
    }
  }

  const isUrgent = messageText.toLowerCase().includes('urgent') || messageText.toLowerCase().includes('today') || messageText.toLowerCase().includes('asap');
  return {
    intent: 'Inquiry / Technical clarification',
    sentiment: isUrgent ? 'urgent' : 'positive',
    urgency: isUrgent ? 'high' : 'medium',
    buyingStage: 'decision',
    recommendedAction: 'Acknowledge immediately and provide requested technical specification / quotation.',
    draftReply: `Thank you for your update. We have noted your request and our technical sales lead will share the details promptly.`
  };
}
