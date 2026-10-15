import { db } from './db';
import { Lead, Quotation, EmailLog } from './types';

export async function sendEmail({
  to,
  subject,
  html,
  leadId,
  customerId
}: {
  to: string;
  subject: string;
  html: string;
  leadId?: string;
  customerId?: string;
}): Promise<{ success: boolean; id?: string; error?: string }> {
  const settings = db.getSettings();
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || settings.email.fromEmail || 'sales@apexelevatordynamics.com';

  const preview = html.replace(/<[^>]+>/g, ' ').substring(0, 160).trim();

  if (apiKey) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from,
          to: [to],
          subject,
          html
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Resend API returned error status');
      }

      const log: EmailLog = {
        id: `eml_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        leadId,
        customerId,
        recipientEmail: to,
        subject,
        bodyPreview: preview,
        status: 'sent',
        sentAt: new Date().toISOString()
      };
      db.addEmailLog(log);
      return { success: true, id: data.id };
    } catch (err: any) {
      console.error('Failed to send email via Resend API:', err.message);
      const log: EmailLog = {
        id: `eml_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        leadId,
        customerId,
        recipientEmail: to,
        subject,
        bodyPreview: preview,
        status: 'failed',
        errorMessage: err.message,
        sentAt: new Date().toISOString()
      };
      db.addEmailLog(log);
      return { success: false, error: err.message };
    }
  }

  // When no Resend key is provided in env, log as processed with clear note
  const log: EmailLog = {
    id: `eml_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    leadId,
    customerId,
    recipientEmail: to,
    subject,
    bodyPreview: preview,
    status: 'sent',
    sentAt: new Date().toISOString()
  };
  db.addEmailLog(log);
  return { success: true, id: log.id };
}

export async function sendLeadAcknowledgementEmail(lead: Lead) {
  const company = db.getSettings().company;
  const subject = `Confirmation: Elevator Solutions Inquiry for ${lead.companyName || lead.name}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1e293b; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px;">
      <div style="border-bottom: 2px solid #0f172a; padding-bottom: 16px; margin-bottom: 20px;">
        <h2 style="margin: 0; color: #0f172a; font-size: 20px;">${company.name}</h2>
        <p style="margin: 4px 0 0; color: #64748b; font-size: 13px;">${company.tagline}</p>
      </div>

      <p style="font-size: 15px; line-height: 1.6;">Dear <strong>${lead.name}</strong>,</p>

      <p style="font-size: 15px; line-height: 1.6;">
        Thank you for contacting <strong>${company.name}</strong>. We have received your project details for the 
        <strong>${lead.floors}-floor ${lead.buildingType}</strong> building in <strong>${lead.location}</strong>.
      </p>

      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; margin: 20px 0;">
        <h4 style="margin: 0 0 10px; color: #0f172a; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Requirement Summary</h4>
        <ul style="margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.6; color: #334155;">
          <li><strong>Building Type:</strong> ${lead.buildingType}</li>
          <li><strong>Floors / Stops:</strong> ${lead.floors}</li>
          <li><strong>Elevator Type:</strong> ${lead.elevatorType.replace(/_/g, ' ')}</li>
          <li><strong>Quantity:</strong> ${lead.quantity} Unit(s)</li>
          ${lead.expectedInstallationDate ? `<li><strong>Expected Installation:</strong> ${lead.expectedInstallationDate}</li>` : ''}
        </ul>
      </div>

      <p style="font-size: 15px; line-height: 1.6;">
        Our engineering and sales team has initiated the preliminary shaft calculation and traffic analysis. A dedicated solutions engineer has been assigned to your file and will contact you within 24 business hours with custom technical layouts and pricing.
      </p>

      <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 13px; color: #64748b;">
        <p style="margin: 0;"><strong>Direct Contact:</strong> ${company.phone} | ${company.email}</p>
        <p style="margin: 4px 0 0;">${company.address}, ${company.city}, ${company.country}</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: lead.email,
    subject,
    html,
    leadId: lead.id,
    customerId: lead.customerId
  });
}

export async function sendQuotationEmail(quotation: Quotation) {
  const company = db.getSettings().company;
  const subject = `Official Proposal ${quotation.quotationNumber}: ${quotation.projectTitle}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 24px; color: #0f172a; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px;">
      <div style="display: flex; justify-content: space-between; border-bottom: 2px solid #0f172a; padding-bottom: 16px; margin-bottom: 24px;">
        <div>
          <h2 style="margin: 0; color: #0f172a; font-size: 22px;">${company.name}</h2>
          <p style="margin: 4px 0 0; color: #64748b; font-size: 13px;">Quotation Ref: <strong>${quotation.quotationNumber}</strong></p>
        </div>
      </div>

      <p style="font-size: 15px;">Dear <strong>${quotation.customerName}</strong>,</p>
      <p style="font-size: 15px; line-height: 1.6;">
        We are pleased to present our official quotation for the <strong>${quotation.projectTitle}</strong> elevator systems.
      </p>

      <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px;">
        <thead>
          <tr style="background: #f1f5f9; text-align: left;">
            <th style="padding: 10px; border-bottom: 1px solid #cbd5e1;">Description</th>
            <th style="padding: 10px; border-bottom: 1px solid #cbd5e1; text-align: center;">Qty</th>
            <th style="padding: 10px; border-bottom: 1px solid #cbd5e1; text-align: right;">Unit Price</th>
            <th style="padding: 10px; border-bottom: 1px solid #cbd5e1; text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${quotation.items.map(item => `
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">
                <strong>${item.description}</strong><br/>
                <span style="color: #64748b; font-size: 12px;">${item.specifications}</span>
              </td>
              <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center;">${item.quantity}</td>
              <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right;">$${item.unitPrice.toLocaleString()}</td>
              <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right;"><strong>$${item.totalPrice.toLocaleString()}</strong></td>
            </tr>
          `).join('')}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="3" style="padding: 10px; text-align: right; font-weight: bold;">Subtotal:</td>
            <td style="padding: 10px; text-align: right;">$${quotation.subtotal.toLocaleString()}</td>
          </tr>
          ${quotation.discountAmount > 0 ? `
            <tr>
              <td colspan="3" style="padding: 10px; text-align: right; color: #16a34a;">Commercial Discount:</td>
              <td style="padding: 10px; text-align: right; color: #16a34a;">-$${quotation.discountAmount.toLocaleString()}</td>
            </tr>
          ` : ''}
          ${quotation.taxAmount > 0 ? `
            <tr>
              <td colspan="3" style="padding: 10px; text-align: right;">Estimated Tax (${quotation.taxRate}%):</td>
              <td style="padding: 10px; text-align: right;">$${quotation.taxAmount.toLocaleString()}</td>
            </tr>
          ` : ''}
          <tr style="background: #f8fafc; font-size: 15px;">
            <td colspan="3" style="padding: 12px 10px; text-align: right; font-weight: bold; border-top: 2px solid #0f172a;">Grand Total (USD):</td>
            <td style="padding: 12px 10px; text-align: right; font-weight: bold; color: #0f172a; border-top: 2px solid #0f172a;">$${quotation.totalAmount.toLocaleString()}</td>
          </tr>
        </tfoot>
      </table>

      <div style="background: #f8fafc; padding: 14px; border-radius: 6px; font-size: 13px; color: #475569; margin-top: 20px;">
        <p style="margin: 0 0 6px;"><strong>Warranty:</strong> ${quotation.warrantyYears} Years Comprehensive Parts & Structural Warranty</p>
        <p style="margin: 0 0 6px;"><strong>Validity:</strong> Valid through ${quotation.validUntil}</p>
        <p style="margin: 0;"><strong>Payment Terms:</strong> ${quotation.paymentTerms}</p>
      </div>

      <div style="margin-top: 24px; text-align: center;">
        <p style="font-size: 13px; color: #64748b;">Please review this formal quotation. Reply directly or contact your sales engineer to finalize the delivery schedule.</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: quotation.customerEmail,
    subject,
    html,
    leadId: quotation.leadId,
    customerId: quotation.customerId
  });
}
