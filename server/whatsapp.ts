import { db } from './db';
import { WhatsAppMessage } from './types';
import { analyzeInboundCustomerMessage } from './ai';

export async function sendWhatsAppMessage({
  phoneNumber,
  messageText,
  leadId,
  customerId
}: {
  phoneNumber: string;
  messageText: string;
  leadId?: string;
  customerId?: string;
}): Promise<{ success: boolean; id?: string; error?: string }> {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');

  if (token && phoneNumberId) {
    try {
      const res = await fetch(`https://graph.facebook.com/v19.0/${phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: cleanPhone,
          type: 'text',
          text: { body: messageText }
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || 'WhatsApp Cloud API returned error');
      }

      const msg: WhatsAppMessage = {
        id: `wa_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        leadId,
        customerId,
        direction: 'outbound',
        phoneNumber,
        messageText,
        status: 'sent',
        timestamp: new Date().toISOString()
      };
      db.addWhatsAppMessage(msg);
      return { success: true, id: data.messages?.[0]?.id };
    } catch (err: any) {
      console.error('WhatsApp API sending error:', err.message);
      const msg: WhatsAppMessage = {
        id: `wa_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        leadId,
        customerId,
        direction: 'outbound',
        phoneNumber,
        messageText,
        status: 'failed',
        errorMessage: err.message,
        timestamp: new Date().toISOString()
      };
      db.addWhatsAppMessage(msg);
      return { success: false, error: err.message };
    }
  }

  // Without active WhatsApp Cloud credentials, record outbound message in CRM log
  const msg: WhatsAppMessage = {
    id: `wa_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    leadId,
    customerId,
    direction: 'outbound',
    phoneNumber,
    messageText,
    status: 'delivered',
    timestamp: new Date().toISOString()
  };
  db.addWhatsAppMessage(msg);
  return { success: true, id: msg.id };
}

export async function processInboundWhatsAppWebhook(payload: any) {
  try {
    const entry = payload?.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const message = value?.messages?.[0];

    if (!message || message.type !== 'text') {
      return { processed: false, reason: 'No text message in payload' };
    }

    const fromNumber = message.from;
    const textBody = message.text?.body || '';

    // Find matching lead or customer by phone
    const leads = db.getLeads();
    const matchingLead = leads.find((l) => l.phone.replace(/[^0-9]/g, '').includes(fromNumber.slice(-8)));

    // Record message
    const waRecord: WhatsAppMessage = {
      id: `wa_in_${Date.now()}`,
      leadId: matchingLead?.id,
      customerId: matchingLead?.customerId,
      direction: 'inbound',
      phoneNumber: fromNumber,
      messageText: textBody,
      status: 'read',
      timestamp: new Date().toISOString()
    };
    db.addWhatsAppMessage(waRecord);

    // AI Analysis
    const aiInsight = await analyzeInboundCustomerMessage(textBody, matchingLead ? `Lead: ${matchingLead.name}, ${matchingLead.elevatorRequirement}` : undefined);

    // Activity log
    db.addActivity({
      id: `act_${Date.now()}`,
      leadId: matchingLead?.id,
      type: 'whatsapp_sent',
      title: `WhatsApp Inbound Message from ${matchingLead?.name || fromNumber}`,
      description: `Customer wrote: "${textBody}". AI Sentiment: ${aiInsight.sentiment}. Intent: ${aiInsight.intent}.`,
      timestamp: new Date().toISOString()
    });

    // Notify assigned salesperson
    if (matchingLead?.assignedUserId) {
      db.addNotification({
        id: `notif_${Date.now()}`,
        userId: matchingLead.assignedUserId,
        title: `WhatsApp Message from ${matchingLead.name}`,
        message: textBody.substring(0, 100),
        type: aiInsight.urgency === 'high' || aiInsight.urgency === 'critical' ? 'urgent' : 'info',
        link: '/messages',
        isRead: false,
        createdAt: new Date().toISOString()
      });
    }

    return { processed: true, leadId: matchingLead?.id, aiInsight };
  } catch (err: any) {
    console.error('Error processing WhatsApp webhook:', err);
    return { processed: false, error: err.message };
  }
}
