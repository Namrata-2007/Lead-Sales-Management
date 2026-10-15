import { db } from './db';
import { Lead, LeadStatus, User } from './types';
import { analyzeLeadWithAI } from './ai';
import { sendLeadAcknowledgementEmail } from './email';

export async function executeNewLeadAutomation(leadId: string): Promise<Lead> {
  const lead = db.getLeadById(leadId);
  if (!lead) throw new Error('Lead not found for automation');

  const settings = db.getSettings();
  const startTime = Date.now();

  try {
    // 1. Run AI Lead Analysis & Scoring
    const aiResult = await analyzeLeadWithAI(lead);
    lead.aiScore = aiResult.score;
    lead.aiAnalysis = aiResult;
    lead.priority = aiResult.priority;
    lead.buildingType = aiResult.buildingType || lead.buildingType;
    lead.elevatorType = aiResult.elevatorType || lead.elevatorType;
    if (aiResult.extractedRequirements?.floors && !lead.floors) {
      lead.floors = aiResult.extractedRequirements.floors;
    }

    // 2. Automated Salesperson Assignment (Workload balancing)
    if (settings.automation.autoAssignEnabled && !lead.assignedUserId) {
      const activeSalespeople = db.getUsers().filter((u) => u.isActive && (u.role === 'salesperson' || u.role === 'sales_manager'));
      if (activeSalespeople.length > 0) {
        // Count active leads per salesperson
        const leads = db.getLeads();
        const workloadMap = new Map<string, number>();
        activeSalespeople.forEach((u) => workloadMap.set(u.id, 0));

        leads.forEach((l) => {
          if (l.assignedUserId && workloadMap.has(l.assignedUserId) && l.status !== 'won' && l.status !== 'lost') {
            workloadMap.set(l.assignedUserId, (workloadMap.get(l.assignedUserId) || 0) + 1);
          }
        });

        // Find salesperson with lowest current workload
        let chosen = activeSalespeople[0];
        let minWorkload = Infinity;
        for (const sp of activeSalespeople) {
          const current = workloadMap.get(sp.id) || 0;
          if (current < minWorkload) {
            minWorkload = current;
            chosen = sp;
          }
        }

        lead.assignedUserId = chosen.id;

        // Log assignment activity
        db.addActivity({
          id: `act_${Date.now()}_assign`,
          leadId: lead.id,
          userId: chosen.id,
          userName: chosen.name,
          type: 'lead_assigned',
          title: `Lead Auto-Assigned to ${chosen.name}`,
          description: `Intelligent workload balancing allocated ${lead.name} (${lead.companyName || 'Private'}) to ${chosen.name}.`,
          timestamp: new Date().toISOString()
        });

        // Notify salesperson
        db.addNotification({
          id: `notif_${Date.now()}_assign`,
          userId: chosen.id,
          title: `New Elevator Lead Assigned: ${lead.name}`,
          message: `${lead.buildingType} project (${lead.floors} floors) with AI Score: ${aiResult.score}/100.`,
          type: aiResult.score >= settings.ai.urgentScoreThreshold ? 'urgent' : 'info',
          link: '/leads',
          isRead: false,
          createdAt: new Date().toISOString()
        });
      }
    }

    // 3. Customer Acknowledgement Email
    if (settings.email.sendLeadAcknowledgement && lead.email) {
      await sendLeadAcknowledgementEmail(lead);
      db.addActivity({
        id: `act_${Date.now()}_ack`,
        leadId: lead.id,
        type: 'email_sent',
        title: 'Customer Acknowledgement Email Dispatched',
        description: `Instant technical confirmation delivered to ${lead.email}.`,
        timestamp: new Date().toISOString()
      });
    }

    // 4. Follow-up and Task Creation
    const dueDate = new Date(Date.now() + 24 * 3600000).toISOString();
    lead.nextFollowupDate = dueDate;

    db.addTask({
      id: `tsk_${Date.now()}_auto`,
      title: `Initial Technical Review: ${lead.name} (${lead.floors} Floors)`,
      description: `Review AI analysis: ${aiResult.recommendedNextAction}\nSuggested Response: ${aiResult.suggestedSalespersonResponse}`,
      assignedUserId: lead.assignedUserId || 'usr_sales_01',
      leadId: lead.id,
      dueDate,
      priority: aiResult.score >= settings.ai.urgentScoreThreshold ? 'urgent' : 'high',
      status: 'pending',
      isAutomated: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    db.addFollowup({
      id: `fol_${Date.now()}_auto`,
      leadId: lead.id,
      assignedUserId: lead.assignedUserId || 'usr_sales_01',
      channel: 'email',
      scheduledDate: dueDate,
      status: 'scheduled',
      suggestedTemplate: aiResult.suggestedSalespersonResponse,
      createdAt: new Date().toISOString()
    });

    // 5. High-Priority Alert if Score >= Threshold
    if (aiResult.score >= settings.ai.urgentScoreThreshold) {
      const managers = db.getUsers().filter((u) => u.role === 'admin' || u.role === 'sales_manager');
      managers.forEach((m) => {
        db.addNotification({
          id: `notif_${Date.now()}_mgr_${m.id}`,
          userId: m.id,
          title: `🔥 High Priority Lead Alert (${aiResult.score}/100)`,
          message: `${lead.name} - ${lead.elevatorRequirement} (${lead.floors} floors) requires priority attention.`,
          type: 'urgent',
          link: '/leads',
          isRead: false,
          createdAt: new Date().toISOString()
        });
      });
    }

    // 6. External n8n Webhook Dispatch (if configured)
    if (settings.automation.n8nWebhookUrl) {
      triggerN8nWebhook(settings.automation.n8nWebhookUrl, {
        event: 'lead.created',
        lead: {
          id: lead.id,
          name: lead.name,
          company: lead.companyName,
          email: lead.email,
          phone: lead.phone,
          floors: lead.floors,
          buildingType: lead.buildingType,
          elevatorType: lead.elevatorType,
          aiScore: aiResult.score,
          assignedUser: lead.assignedUserId
        }
      });
    }

    // 7. Update database record
    db.updateLead(lead.id, lead);

    // 8. Record Automation Log
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    db.addAutomationLog({
      id: `autolog_${Date.now()}`,
      workflowId: 'wf_new_lead',
      workflowName: 'New Lead Intelligent Intake & Scoring',
      leadId: lead.id,
      actionTaken: `Scored ${aiResult.score}/100, assigned to ${lead.assignedUserId}, scheduled 24h follow-up.`,
      status: 'success',
      details: `Execution took ${duration}s. AI analysis and email log generated.`,
      timestamp: new Date().toISOString()
    });

    // Update workflow stats
    const wf = db.getAutomationWorkflows().find((w) => w.id === 'wf_new_lead');
    if (wf) {
      db.updateAutomationWorkflow(wf.id, {
        executionCount: wf.executionCount + 1,
        lastExecutedAt: new Date().toISOString()
      });
    }

    return lead;
  } catch (error: any) {
    console.error('Automation execution failed for lead:', error);
    db.addAutomationLog({
      id: `autolog_${Date.now()}`,
      workflowId: 'wf_new_lead',
      workflowName: 'New Lead Intelligent Intake & Scoring',
      leadId: lead.id,
      actionTaken: 'Encountered error during automated processing',
      status: 'failed',
      details: error.message || 'Unknown automation error',
      timestamp: new Date().toISOString()
    });
    return lead;
  }
}

export async function handleLeadStatusChange(leadId: string, newStatus: LeadStatus, currentUserId?: string) {
  const lead = db.getLeadById(leadId);
  if (!lead) return;

  const previousStatus = lead.status;
  lead.status = newStatus;
  lead.updatedAt = new Date().toISOString();

  // If moved to proposal_sent -> Schedule 3-day follow-up
  if (newStatus === 'proposal_sent') {
    const followupDate = new Date(Date.now() + 3 * 86400000).toISOString();
    lead.nextFollowupDate = followupDate;

    db.addTask({
      id: `tsk_${Date.now()}_prop`,
      title: `Follow up on Proposal: ${lead.name}`,
      description: `Proposal was sent. Follow up with client regarding quotation review and engineering specs.`,
      assignedUserId: lead.assignedUserId || currentUserId || 'usr_sales_01',
      leadId: lead.id,
      dueDate: followupDate,
      priority: 'high',
      status: 'pending',
      isAutomated: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    db.addActivity({
      id: `act_${Date.now()}_stage`,
      leadId: lead.id,
      userId: currentUserId,
      type: 'status_changed',
      title: `Pipeline Stage: Proposal Sent`,
      description: `Automated 72-hour customer follow-up engine activated.`,
      timestamp: new Date().toISOString()
    });
  } else if (newStatus === 'won') {
    // If moved to won -> Celebrate and create engineering handover project
    db.addActivity({
      id: `act_${Date.now()}_won`,
      leadId: lead.id,
      userId: currentUserId,
      type: 'deal_won',
      title: `🎉 Deal Won: ${lead.name} (${lead.companyName || 'Private'})`,
      description: `Value: $${(lead.budget || 150000).toLocaleString()}. Handover to installation team.`,
      timestamp: new Date().toISOString()
    });

    // Notify all managers
    db.getUsers().filter((u) => u.role === 'admin' || u.role === 'sales_manager').forEach((mgr) => {
      db.addNotification({
        id: `notif_${Date.now()}_won_${mgr.id}`,
        userId: mgr.id,
        title: `🏆 DEAL WON: ${lead.companyName || lead.name}`,
        message: `$${(lead.budget || 150000).toLocaleString()} contract closed!`,
        type: 'success',
        link: '/leads',
        isRead: false,
        createdAt: new Date().toISOString()
      });
    });
  } else {
    db.addActivity({
      id: `act_${Date.now()}_stage`,
      leadId: lead.id,
      userId: currentUserId,
      type: 'status_changed',
      title: `Stage Updated: ${previousStatus} → ${newStatus}`,
      description: `Lead status changed to ${newStatus.replace(/_/g, ' ')}.`,
      timestamp: new Date().toISOString()
    });
  }

  db.updateLead(lead.id, lead);
}

export async function runInactiveLeadEscalationEngine(): Promise<{ checked: number; escalated: number }> {
  const leads = db.getLeads();
  const settings = db.getSettings();
  const escalationThresholdMs = (settings.automation.escalationHours || 48) * 3600000;
  const now = Date.now();

  let escalated = 0;
  const activeLeads = leads.filter((l) => l.status !== 'won' && l.status !== 'lost');

  for (const lead of activeLeads) {
    const lastTime = lead.lastContactedAt ? new Date(lead.lastContactedAt).getTime() : new Date(lead.createdAt).getTime();
    if (now - lastTime > escalationThresholdMs) {
      escalated++;

      // Escalation notification to manager
      const managers = db.getUsers().filter((u) => u.role === 'sales_manager' || u.role === 'admin');
      managers.forEach((mgr) => {
        db.addNotification({
          id: `notif_${Date.now()}_esc_${lead.id}_${mgr.id}`,
          userId: mgr.id,
          title: `⚠️ Escalation: Inactive Lead (${lead.name})`,
          message: `No activity for >48 hours on ${lead.companyName || lead.name} (${lead.status}).`,
          type: 'warning',
          link: '/leads',
          isRead: false,
          createdAt: new Date().toISOString()
        });
      });

      db.addActivity({
        id: `act_${Date.now()}_esc`,
        leadId: lead.id,
        type: 'escalation_triggered',
        title: 'Inactive Lead Escalated to Management',
        description: `Lead remained untouched for more than 48h. Management notified.`,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Update workflow stats
  const wf = db.getAutomationWorkflows().find((w) => w.id === 'wf_inactive_escalation');
  if (wf) {
    db.updateAutomationWorkflow(wf.id, {
      executionCount: wf.executionCount + 1,
      lastExecutedAt: new Date().toISOString()
    });
  }

  return { checked: activeLeads.length, escalated };
}

async function triggerN8nWebhook(webhookUrl: string, payload: any) {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    await fetch(webhookUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });
  } catch (err) {
    console.warn('n8n webhook dispatch attempted:', err);
  }
}
