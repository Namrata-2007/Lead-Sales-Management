import React, { useState } from 'react';
import {
  Settings,
  Building,
  Sparkles,
  Mail,
  Phone,
  Cpu,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Layers
} from 'lucide-react';
import { SystemSettings } from '../types';
import { api } from '../api';

interface SettingsPageProps {
  settings: SystemSettings | null;
  loading: boolean;
  onRefresh: () => void;
  onShowToast: (type: 'success' | 'warning' | 'error' | 'info', message: string, title?: string) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  settings,
  loading,
  onRefresh,
  onShowToast
}) => {
  const [activeSection, setActiveSection] = useState<'company' | 'ai' | 'email' | 'whatsapp' | 'automation' | 'database'>('company');
  const [formData, setFormData] = useState<SystemSettings | null>(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  React.useEffect(() => {
    if (settings) setFormData(settings);
  }, [settings]);

  if (!formData) {
    return <div className="p-8 text-center text-xs text-slate-500">Loading system settings...</div>;
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.updateSettings(formData);
      onShowToast('success', 'System settings updated successfully.');
      onRefresh();
    } catch (err: any) {
      onShowToast('error', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDb = async () => {
    if (!confirm('Warning: This will reset all records back to the verified enterprise seed state. Continue?')) {
      return;
    }
    setIsResetting(true);
    try {
      await api.resetDatabase();
      onShowToast('success', 'Database successfully reset to initial seed data.');
      onRefresh();
    } catch (err: any) {
      onShowToast('error', err.message);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Enterprise CRM Configuration</h2>
          <div className="text-xs text-slate-400 mt-0.5">
            Company branding, Gemini AI models, Resend email routing, WhatsApp Cloud, and n8n webhooks
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-md transition-colors"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{isSaving ? 'Saving Changes...' : 'Save Configuration'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Navigation Tabs */}
        <div className="md:col-span-3 space-y-1">
          {[
            { id: 'company', label: 'Company & Profile', icon: Building },
            { id: 'ai', label: 'Gemini AI Intelligence', icon: Sparkles },
            { id: 'email', label: 'Email & Resend API', icon: Mail },
            { id: 'whatsapp', label: 'WhatsApp Cloud API', icon: Phone },
            { id: 'automation', label: 'Automation & n8n', icon: Cpu },
            { id: 'database', label: 'Database & Maintenance', icon: RotateCcw }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id as any)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-md transition-colors text-left ${
                  isActive
                    ? 'bg-slate-800 text-amber-400 font-semibold border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Configuration Forms */}
        <div className="md:col-span-9 bg-slate-900 border border-slate-800 rounded-lg p-6">
          {/* COMPANY SETTINGS */}
          {activeSection === 'company' && (
            <div className="space-y-4 text-xs">
              <h3 className="text-sm font-bold text-slate-100 border-b border-slate-800 pb-2">
                Company & Brand Profile
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Company Name</label>
                  <input
                    type="text"
                    value={formData.company.name}
                    onChange={(e) =>
                      setFormData({ ...formData, company: { ...formData.company, name: e.target.value } })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Tagline</label>
                  <input
                    type="text"
                    value={formData.company.tagline}
                    onChange={(e) =>
                      setFormData({ ...formData, company: { ...formData.company, tagline: e.target.value } })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Headquarters Address</label>
                  <input
                    type="text"
                    value={formData.company.address}
                    onChange={(e) =>
                      setFormData({ ...formData, company: { ...formData.company, address: e.target.value } })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">City, State / Region</label>
                  <input
                    type="text"
                    value={formData.company.city}
                    onChange={(e) =>
                      setFormData({ ...formData, company: { ...formData.company, city: e.target.value } })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={formData.company.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, company: { ...formData.company, phone: e.target.value } })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Official Email</label>
                  <input
                    type="email"
                    value={formData.company.email}
                    onChange={(e) =>
                      setFormData({ ...formData, company: { ...formData.company, email: e.target.value } })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* AI SETTINGS */}
          {activeSection === 'ai' && (
            <div className="space-y-4 text-xs">
              <h3 className="text-sm font-bold text-slate-100 border-b border-slate-800 pb-2 flex items-center justify-between">
                <span>AI Inference Engine & Lead Scoring</span>
                <span className="text-[11px] font-mono text-amber-400 font-normal">
                  Powered by Groq & Gemini
                </span>
              </h3>

              {/* Status Banner */}
              <div className="p-3 bg-slate-950 border border-slate-800 rounded text-slate-300 space-y-2 leading-relaxed">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-100 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    Groq Cloud API Status
                  </span>
                  <span
                    className={`text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded ${
                      formData.ai.groqApiKeyConfigured
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-amber-950/40 text-amber-300 border border-amber-800/40'
                    }`}
                  >
                    {formData.ai.groqApiKeyConfigured ? 'GROQ CONNECTED' : 'GROQ API KEY READY VIA ENV'}
                  </span>
                </div>
                <p className="text-slate-400 text-xs">
                  Groq ultra-fast LPU inference evaluates inbound elevator specifications (building height, traction loads, traffic wait times) in under 300ms using Llama 3 models.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Active AI Provider</label>
                  <select
                    value={formData.ai.provider}
                    onChange={(e) =>
                      setFormData({ ...formData, ai: { ...formData.ai, provider: e.target.value as any } })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
                  >
                    <option value="groq">Groq (High-Speed LPU Inference)</option>
                    <option value="gemini">Google Gemini API</option>
                    <option value="algorithmic_fallback">Deterministic Fallback Engine</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Groq Model</label>
                  <select
                    value={formData.ai.groqModel || 'llama-3.3-70b-versatile'}
                    onChange={(e) =>
                      setFormData({ ...formData, ai: { ...formData.ai, groqModel: e.target.value } })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 font-mono"
                  >
                    <option value="llama-3.3-70b-versatile">llama-3.3-70b-versatile (Recommended)</option>
                    <option value="llama-3.1-8b-instant">llama-3.1-8b-instant (Fastest)</option>
                    <option value="mixtral-8x7b-32768">mixtral-8x7b-32768</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Gemini Fallback Model</label>
                  <input
                    type="text"
                    value={formData.ai.model}
                    onChange={(e) =>
                      setFormData({ ...formData, ai: { ...formData.ai, model: e.target.value } })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Urgent Lead Threshold (Score /100)</label>
                  <input
                    type="number"
                    min="50"
                    max="99"
                    value={formData.ai.urgentScoreThreshold}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        ai: { ...formData.ai, urgentScoreThreshold: Number(e.target.value) }
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 text-slate-200 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.ai.autoScoringEnabled}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        ai: { ...formData.ai, autoScoringEnabled: e.target.checked }
                      })
                    }
                    className="rounded bg-slate-950 border-slate-800 text-amber-500 focus:ring-0"
                  />
                  <span>Automatically execute AI analysis on every newly captured inbound lead</span>
                </label>
              </div>
            </div>
          )}

          {/* EMAIL SETTINGS */}
          {activeSection === 'email' && (
            <div className="space-y-4 text-xs">
              <h3 className="text-sm font-bold text-slate-100 border-b border-slate-800 pb-2">
                Transactional Email (Resend)
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Sender Email Address</label>
                  <input
                    type="email"
                    value={formData.email.fromEmail}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        email: { ...formData.email, fromEmail: e.target.value }
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Sender Display Name</label>
                  <input
                    type="text"
                    value={formData.email.fromName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        email: { ...formData.email, fromName: e.target.value }
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 text-slate-200 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.email.sendLeadAcknowledgement}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        email: { ...formData.email, sendLeadAcknowledgement: e.target.checked }
                      })
                    }
                    className="rounded bg-slate-950 border-slate-800 text-amber-500 focus:ring-0"
                  />
                  <span>Automatically send customer instant acknowledgement email upon submission</span>
                </label>
              </div>
            </div>
          )}

          {/* WHATSAPP SETTINGS */}
          {activeSection === 'whatsapp' && (
            <div className="space-y-4 text-xs">
              <h3 className="text-sm font-bold text-slate-100 border-b border-slate-800 pb-2">
                Official WhatsApp Business / Cloud API
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Phone Number ID</label>
                  <input
                    type="text"
                    value={formData.whatsapp.phoneNumberId || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        whatsapp: { ...formData.whatsapp, phoneNumberId: e.target.value }
                      })
                    }
                    placeholder="e.g. 109876543210"
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Webhook Verify Token</label>
                  <input
                    type="text"
                    value={formData.whatsapp.verifyToken}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        whatsapp: { ...formData.whatsapp, verifyToken: e.target.value }
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded text-slate-400">
                <div className="font-semibold text-slate-200 mb-1">WhatsApp Webhook Callback URL:</div>
                <div className="font-mono text-amber-400 text-[11px] select-all">
                  {typeof window !== 'undefined' ? `${window.location.origin}/api/webhooks/whatsapp` : '/api/webhooks/whatsapp'}
                </div>
              </div>
            </div>
          )}

          {/* AUTOMATION SETTINGS */}
          {activeSection === 'automation' && (
            <div className="space-y-4 text-xs">
              <h3 className="text-sm font-bold text-slate-100 border-b border-slate-800 pb-2">
                Workflow Timing & n8n Integration
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Default Follow-up Delay (Hours)</label>
                  <input
                    type="number"
                    value={formData.automation.followupDelayHours}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        automation: { ...formData.automation, followupDelayHours: Number(e.target.value) }
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Inactive Escalation Threshold (Hours)</label>
                  <input
                    type="number"
                    value={formData.automation.escalationHours}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        automation: { ...formData.automation, escalationHours: Number(e.target.value) }
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 font-mono"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-300 font-medium mb-1">Remote n8n Webhook URL</label>
                  <input
                    type="url"
                    value={formData.automation.n8nWebhookUrl || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        automation: { ...formData.automation, n8nWebhookUrl: e.target.value }
                      })
                    }
                    placeholder="https://n8n.yourcompany.com/webhook/elevator-lead-automation"
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* DATABASE & MAINTENANCE */}
          {activeSection === 'database' && (
            <div className="space-y-4 text-xs">
              <h3 className="text-sm font-bold text-slate-100 border-b border-slate-800 pb-2">
                Database Schema & Seed State
              </h3>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded text-slate-300 space-y-2">
                <span className="font-semibold text-slate-100 block">Relational Schema Architecture</span>
                <p className="text-slate-400 text-xs leading-relaxed">
                  The system maintains full persistence for tables: <code className="text-amber-400 font-mono">users</code>, <code className="text-amber-400 font-mono">companies</code>, <code className="text-amber-400 font-mono">leads</code>, <code className="text-amber-400 font-mono">customers</code>, <code className="text-amber-400 font-mono">projects</code>, <code className="text-amber-400 font-mono">quotations</code>, <code className="text-amber-400 font-mono">tasks</code>, <code className="text-amber-400 font-mono">activities</code>, <code className="text-amber-400 font-mono">email_logs</code>, <code className="text-amber-400 font-mono">whatsapp_messages</code>, and <code className="text-amber-400 font-mono">automation_logs</code>.
                </p>
              </div>

              <div className="p-4 bg-rose-950/20 border border-rose-800/40 rounded space-y-3">
                <span className="font-bold text-rose-300 block">Restore Enterprise Demo Seed Data</span>
                <p className="text-xs text-rose-200 leading-relaxed">
                  Re-populates the database with realistic elevator projects (St. Jude Healthcare hospital elevators, Sterling Horizon high-rises, OmniHub freight elevators, and sales performance metrics).
                </p>
                <button
                  type="button"
                  disabled={isResetting}
                  onClick={handleResetDb}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded text-xs transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
                  <span>{isResetting ? 'Resetting Database...' : 'Reset to Enterprise Demo State'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
