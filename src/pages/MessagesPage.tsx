import React, { useState } from 'react';
import {
  MessageSquare,
  Mail,
  Send,
  Sparkles,
  Phone,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  ShieldAlert,
  Bot,
  User,
  RefreshCw,
  Plus
} from 'lucide-react';
import { EmailLog, WhatsAppMessage, SystemSettings } from '../types';
import { api } from '../api';

interface MessagesPageProps {
  emailLogs: EmailLog[];
  whatsappMessages: WhatsAppMessage[];
  settings: SystemSettings | null;
  loading: boolean;
  onRefresh: () => void;
  onShowToast: (type: 'success' | 'warning' | 'error' | 'info', message: string, title?: string) => void;
}

export const MessagesPage: React.FC<MessagesPageProps> = ({
  emailLogs,
  whatsappMessages,
  settings,
  loading,
  onRefresh,
  onShowToast
}) => {
  const [activeTab, setActiveTab] = useState<'whatsapp' | 'email' | 'ai_analyzer'>('whatsapp');

  // Manual WhatsApp Send Form
  const [waPhone, setWaPhone] = useState('+15558912300');
  const [waText, setWaText] = useState(
    'Hello Arthur, following up on the elevator layout drawings sent earlier today. Do you need any adjustments to the shaft dimensions?'
  );
  const [isSendingWa, setIsSendingWa] = useState(false);

  // Manual Email Send Form
  const [emailTo, setEmailTo] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // AI Message Analyzer Form
  const [incomingMessageInput, setIncomingMessageInput] = useState(
    'Can you send the revised traction elevator quotation today? We need the elevator installed next month for our occupancy inspection.'
  );
  const [analyzedResult, setAnalyzedResult] = useState<any | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const isWhatsAppConfigured = Boolean(settings?.whatsapp?.configured);

  const handleSendWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!waPhone || !waText) {
      onShowToast('error', 'Phone number and message text are required');
      return;
    }

    setIsSendingWa(true);
    try {
      const res = await api.sendWhatsApp({
        phoneNumber: waPhone,
        messageText: waText
      });
      onShowToast('success', 'WhatsApp message logged and dispatched!');
      onRefresh();
    } catch (err: any) {
      onShowToast('error', err.message);
    } finally {
      setIsSendingWa(false);
    }
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailTo || !emailSubject || !emailBody) {
      onShowToast('error', 'Recipient, subject, and content are required');
      return;
    }

    setIsSendingEmail(true);
    try {
      await api.sendEmail({
        to: emailTo,
        subject: emailSubject,
        html: `<p>${emailBody.replace(/\n/g, '<br/>')}</p>`
      });
      onShowToast('success', 'Email dispatched and recorded to email_logs table');
      setEmailTo('');
      setEmailSubject('');
      setEmailBody('');
      onRefresh();
    } catch (err: any) {
      onShowToast('error', err.message);
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleRunAIAnalysis = async () => {
    if (!incomingMessageInput.trim()) return;
    setIsAnalyzing(true);
    try {
      const res = await api.analyzeMessage(incomingMessageInput);
      setAnalyzedResult(res);
      onShowToast('success', 'AI conversation analysis complete');
    } catch (err: any) {
      onShowToast('error', err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Customer Communications Hub</h2>
          <div className="text-xs text-slate-400 mt-0.5">
            Official WhatsApp Business API stream, Resend transactional email logs, and Gemini AI message sentiment
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-1 text-xs">
          <button
            onClick={() => setActiveTab('whatsapp')}
            className={`px-3 py-1.5 rounded font-medium transition-colors ${
              activeTab === 'whatsapp'
                ? 'bg-slate-800 text-amber-400 shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            WhatsApp Business ({whatsappMessages.length})
          </button>
          <button
            onClick={() => setActiveTab('email')}
            className={`px-3 py-1.5 rounded font-medium transition-colors ${
              activeTab === 'email'
                ? 'bg-slate-800 text-amber-400 shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Transactional Emails ({emailLogs.length})
          </button>
          <button
            onClick={() => setActiveTab('ai_analyzer')}
            className={`px-3 py-1.5 rounded font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'ai_analyzer'
                ? 'bg-slate-800 text-amber-400 shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Intent Analyzer</span>
          </button>
        </div>
      </div>

      {/* WHATSAPP TAB */}
      {activeTab === 'whatsapp' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Messages Feed */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-slate-200">WhatsApp Messages Ledger</h3>
              </div>
              <span className="text-xs font-mono text-slate-500">whatsapp_messages table</span>
            </div>

            <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
              {whatsappMessages.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-500">No WhatsApp messages yet.</div>
              ) : (
                whatsappMessages.map((msg) => {
                  const isInbound = msg.direction === 'inbound';
                  return (
                    <div
                      key={msg.id}
                      className={`p-3.5 rounded-lg border text-xs space-y-1.5 ${
                        isInbound
                          ? 'bg-slate-950/80 border-slate-800 ml-0 mr-8 text-slate-200'
                          : 'bg-emerald-950/20 border-emerald-800/40 ml-8 mr-0 text-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span className="font-semibold text-slate-300">
                          {isInbound ? `Inbound (${msg.phoneNumber})` : 'Outbound Sales Rep'}
                        </span>
                        <span className="font-mono text-slate-500">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="leading-relaxed whitespace-pre-line">{msg.messageText}</p>
                      <div className="text-[10px] font-mono uppercase text-right text-slate-500">
                        Status: <span className="text-emerald-400">{msg.status}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* WhatsApp API Configuration / Send Box */}
          <div className="lg:col-span-5 space-y-4">
            {/* Live WhatsApp Config Banner */}
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className={`w-4 h-4 ${isWhatsAppConfigured ? 'text-emerald-400' : 'text-amber-400'}`} />
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  WhatsApp Cloud API Credentials
                </h4>
              </div>

              {isWhatsAppConfigured ? (
                <div className="p-3 bg-emerald-950/20 border border-emerald-800/40 rounded text-xs text-emerald-300">
                  Official WhatsApp Cloud API is connected and active. Outbound messages route to Meta's production endpoint.
                </div>
              ) : (
                <div className="p-3 bg-amber-950/20 border border-amber-800/40 rounded text-xs space-y-2 text-amber-200">
                  <p className="leading-relaxed">
                    Official WhatsApp Cloud API is not connected via environment variables (<code className="font-mono text-amber-300">WHATSAPP_TOKEN</code>).
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Per production CRM requirements, messages are currently logged in the database ledger without pretending live delivery. Configure token in Settings to enable live webhook delivery.
                  </p>
                </div>
              )}
            </div>

            {/* Outbound WhatsApp Sender */}
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-3">
              <h4 className="text-xs font-semibold text-slate-200">Send WhatsApp Message</h4>
              <form onSubmit={handleSendWhatsApp} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Destination Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={waPhone}
                    onChange={(e) => setWaPhone(e.target.value)}
                    placeholder="+15551234567"
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Message Text</label>
                  <textarea
                    rows={4}
                    required
                    value={waText}
                    onChange={(e) => setWaText(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSendingWa}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSendingWa ? 'Sending...' : 'Send WhatsApp Message'}</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* EMAIL TAB */}
      {activeTab === 'email' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Email Logs Table */}
          <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-semibold text-slate-200">Email Dispatch Audit Logs</h3>
              </div>
              <span className="text-xs font-mono text-slate-500">email_logs table</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/60 font-medium">
                    <th className="py-2.5 px-3">Recipient</th>
                    <th className="py-2.5 px-3">Subject</th>
                    <th className="py-2.5 px-2">Status</th>
                    <th className="py-2.5 px-3 text-right">Dispatched</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {emailLogs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-500">
                        No transactional emails sent yet.
                      </td>
                    </tr>
                  ) : (
                    emailLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 font-mono text-slate-300 truncate max-w-[160px]">
                          {log.recipientEmail}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-slate-200 truncate max-w-[280px]">
                            {log.subject}
                          </div>
                          <div className="text-[11px] text-slate-500 truncate max-w-[280px]">
                            {log.bodyPreview}
                          </div>
                        </td>
                        <td className="py-2.5 px-2">
                          <span
                            className={`text-[10px] font-mono uppercase font-bold px-1.5 py-0.5 rounded ${
                              log.status === 'sent'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
                                : log.status === 'failed'
                                ? 'bg-rose-950 text-rose-400 border border-rose-800/40'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {log.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-500 whitespace-nowrap">
                          {new Date(log.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Manual Email Send */}
          <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
            <h4 className="text-xs font-semibold text-slate-200">Send Direct Sales Email</h4>
            <form onSubmit={handleSendEmail} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">To Email Address *</label>
                <input
                  type="email"
                  required
                  value={emailTo}
                  onChange={(e) => setEmailTo(e.target.value)}
                  placeholder="client@domain.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Subject Line *</label>
                <input
                  type="text"
                  required
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Elevator Layout Drawings & Technical Specs"
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Message Content *</label>
                <textarea
                  rows={5}
                  required
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  placeholder="Dear client, following our discussion..."
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
                />
              </div>

              <button
                type="submit"
                disabled={isSendingEmail}
                className="w-full py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold rounded text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSendingEmail ? 'Dispatching...' : 'Dispatch Email (Resend)'}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* AI MESSAGE ANALYZER TAB */}
      {activeTab === 'ai_analyzer' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-semibold text-slate-200">Inbound Customer Message Analysis</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Whenever a customer sends an email or WhatsApp message, Gemini extracts intent, sentiment, urgency, and auto-drafts the optimal salesperson reply.
            </p>

            <div className="space-y-2">
              <label className="text-xs text-slate-300 font-medium block">Test Customer Message Input:</label>
              <textarea
                rows={4}
                value={incomingMessageInput}
                onChange={(e) => setIncomingMessageInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-xs text-slate-200"
              />
            </div>

            <button
              onClick={handleRunAIAnalysis}
              disabled={isAnalyzing}
              className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold rounded text-xs transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isAnalyzing ? 'Analyzing with Gemini...' : 'Analyze Message Intent'}</span>
            </button>
          </div>

          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-200">Extracted Intelligence & CRM Directives</h3>

            {analyzedResult ? (
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-950 p-3 rounded border border-slate-800">
                    <span className="text-slate-500 block uppercase font-mono text-[10px]">Intent:</span>
                    <span className="text-slate-200 font-semibold mt-0.5 block">{analyzedResult.intent}</span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded border border-slate-800">
                    <span className="text-slate-500 block uppercase font-mono text-[10px]">Urgency / Sentiment:</span>
                    <span className="text-rose-400 font-semibold uppercase font-mono mt-0.5 block">
                      {analyzedResult.urgency} · {analyzedResult.sentiment}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded border border-slate-800 space-y-1">
                  <span className="text-slate-500 block uppercase font-mono text-[10px]">Recommended CRM Action:</span>
                  <p className="text-slate-200 leading-relaxed">{analyzedResult.recommendedAction}</p>
                </div>

                <div className="bg-slate-950 p-3 rounded border border-amber-500/30 space-y-1">
                  <span className="text-amber-400 block uppercase font-mono text-[10px] font-semibold">
                    Auto-Drafted Salesperson Response:
                  </span>
                  <p className="text-slate-200 leading-relaxed italic">"{analyzedResult.draftReply}"</p>
                </div>
              </div>
            ) : (
              <div className="py-16 text-center text-xs text-slate-500">
                Click "Analyze Message Intent" to inspect real-time extraction.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
