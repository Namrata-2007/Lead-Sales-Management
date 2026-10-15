import React, { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  Layers,
  Sparkles,
  ArrowRight,
  MoreVertical,
  Calendar,
  DollarSign,
  User,
  Building,
  RefreshCw,
  Mail,
  Phone,
  FileText,
  Trash2,
  X,
  CheckCircle2,
  Clock,
  ChevronRight
} from 'lucide-react';
import { Lead, LeadStatus, LeadPriority, BuildingType, ElevatorType, User as UserType } from '../types';
import { api } from '../api';

interface LeadsPageProps {
  leads: Lead[];
  users: UserType[];
  loading: boolean;
  onRefresh: () => void;
  onCreateQuotationForLead?: (lead: Lead) => void;
  onShowToast: (type: 'success' | 'warning' | 'error' | 'info', message: string, title?: string) => void;
}

export const LeadsPage: React.FC<LeadsPageProps> = ({
  leads,
  users,
  loading,
  onRefresh,
  onCreateQuotationForLead,
  onShowToast
}) => {
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [buildingFilter, setBuildingFilter] = useState<string>('all');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Form State for New Lead
  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    email: '',
    phone: '',
    location: '',
    buildingType: 'commercial' as BuildingType,
    floors: 6,
    stops: 6,
    elevatorRequirement: '',
    elevatorType: 'passenger_mrl' as ElevatorType,
    quantity: 1,
    budget: 150000,
    expectedInstallationDate: '',
    source: 'website' as const,
    notes: ''
  });

  // Filtered Leads
  const filteredLeads = leads.filter((l) => {
    const q = search.toLowerCase();
    const matchQuery =
      l.name.toLowerCase().includes(q) ||
      (l.companyName && l.companyName.toLowerCase().includes(q)) ||
      l.email.toLowerCase().includes(q) ||
      l.location.toLowerCase().includes(q) ||
      l.elevatorRequirement.toLowerCase().includes(q);

    const matchStatus = statusFilter === 'all' || l.status === statusFilter;
    const matchPriority = priorityFilter === 'all' || l.priority === priorityFilter;
    const matchBuilding = buildingFilter === 'all' || l.buildingType === buildingFilter;

    return matchQuery && matchStatus && matchPriority && matchBuilding;
  });

  // Pipeline Columns
  const pipelineStages: LeadStatus[] = [
    'new',
    'contacted',
    'qualified',
    'proposal_sent',
    'negotiation',
    'won',
    'lost'
  ];

  const handleStageChange = async (leadId: string, newStage: LeadStatus) => {
    try {
      await api.updateLead(leadId, { status: newStage });
      onShowToast('success', `Lead moved to ${newStage.replace('_', ' ')}.`);
      onRefresh();
      if (selectedLead && selectedLead.id === leadId) {
        setSelectedLead({ ...selectedLead, status: newStage });
      }
    } catch (err: any) {
      onShowToast('error', err.message);
    }
  };

  const handleReAnalyze = async (leadId: string) => {
    setIsAnalyzing(true);
    try {
      const res = await api.reAnalyzeLeadAI(leadId);
      onShowToast('success', `AI Analysis complete! Score: ${res.analysis.score}/100.`);
      onRefresh();
      setSelectedLead(res.lead);
    } catch (err: any) {
      onShowToast('error', err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAssignLead = async (leadId: string, userId: string) => {
    try {
      const updated = await api.assignLead(leadId, userId);
      onShowToast('success', 'Assigned salesperson updated.');
      onRefresh();
      setSelectedLead(updated);
    } catch (err: any) {
      onShowToast('error', err.message);
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;
    try {
      await api.deleteLead(leadId);
      onShowToast('info', 'Lead removed.');
      setSelectedLead(null);
      onRefresh();
    } catch (err: any) {
      onShowToast('error', err.message);
    }
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone) {
      onShowToast('error', 'Please fill in Name, Email, and Phone number.');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await api.createLead(formData);
      onShowToast(
        'success',
        `Lead created! AI scored: ${created.aiScore ?? 'N/A'}/100 with automated routing.`,
        'Intelligent Lead Intake Complete'
      );
      setShowAddModal(false);
      onRefresh();
      setSelectedLead(created);
      // Reset form
      setFormData({
        name: '',
        companyName: '',
        email: '',
        phone: '',
        location: '',
        buildingType: 'commercial',
        floors: 6,
        stops: 6,
        elevatorRequirement: '',
        elevatorType: 'passenger_mrl',
        quantity: 1,
        budget: 150000,
        expectedInstallationDate: '',
        source: 'website',
        notes: ''
      });
    } catch (err: any) {
      onShowToast('error', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      {/* Action Header & View Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Elevator Sales Leads</h2>
          <div className="text-xs text-slate-400 mt-0.5">
            Real-time pipeline with automated AI qualification and routing
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Segmented Control */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-1 text-xs">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded font-medium transition-colors ${
                viewMode === 'table' ? 'bg-slate-800 text-amber-400 shadow-xs' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Table Grid ({filteredLeads.length})
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 rounded font-medium transition-colors ${
                viewMode === 'kanban' ? 'bg-slate-800 text-amber-400 shadow-xs' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Pipeline Kanban
            </button>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-md transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Lead</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search leads by name, company, email, location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-amber-500/60"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-xs bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-300 focus:outline-hidden"
        >
          <option value="all">All Stages</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="qualified">Qualified</option>
          <option value="proposal_sent">Proposal Sent</option>
          <option value="negotiation">Negotiation</option>
          <option value="won">Won</option>
          <option value="lost">Lost</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="text-xs bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-300 focus:outline-hidden"
        >
          <option value="all">All Priorities</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <select
          value={buildingFilter}
          onChange={(e) => setBuildingFilter(e.target.value)}
          className="text-xs bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-300 focus:outline-hidden"
        >
          <option value="all">All Building Types</option>
          <option value="residential">Residential</option>
          <option value="commercial">Commercial</option>
          <option value="industrial">Industrial</option>
          <option value="hospital">Hospital</option>
          <option value="apartment">Apartment</option>
          <option value="hotel">Hotel</option>
          <option value="government">Government</option>
        </select>

        {(statusFilter !== 'all' || priorityFilter !== 'all' || buildingFilter !== 'all' || search) && (
          <button
            onClick={() => {
              setStatusFilter('all');
              setPriorityFilter('all');
              setBuildingFilter('all');
              setSearch('');
            }}
            className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* TABLE GRID VIEW */}
      {viewMode === 'table' ? (
        <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/60 font-medium">
                  <th className="py-3 px-4">Lead / Company</th>
                  <th className="py-3 px-3">Floors & Type</th>
                  <th className="py-3 px-3 text-center">AI Score</th>
                  <th className="py-3 px-3">Stage</th>
                  <th className="py-3 px-3">Priority</th>
                  <th className="py-3 px-3">Assigned To</th>
                  <th className="py-3 px-3 text-right">Est. Budget</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-500">
                      No leads matching your current criteria.
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => {
                    const assignedUser = users.find((u) => u.id === lead.assignedUserId);
                    const isHighPriority = lead.priority === 'urgent' || lead.priority === 'high';
                    return (
                      <tr
                        key={lead.id}
                        onClick={() => setSelectedLead(lead)}
                        className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-100">{lead.name}</div>
                          <div className="text-[11px] text-slate-400">
                            {lead.companyName || lead.location} · {lead.source}
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <div className="text-slate-200">
                            {lead.floors} fl · {lead.quantity}x {lead.elevatorType.replace(/_/g, ' ')}
                          </div>
                          <div className="text-[11px] text-slate-500 capitalize">{lead.buildingType}</div>
                        </td>

                        <td className="py-3 px-3 text-center">
                          {lead.aiScore ? (
                            <div className="inline-flex items-center gap-1 font-mono font-bold text-xs">
                              <span
                                className={
                                  lead.aiScore >= 85
                                    ? 'text-rose-400'
                                    : lead.aiScore >= 70
                                    ? 'text-amber-400'
                                    : 'text-slate-300'
                                }
                              >
                                {lead.aiScore}
                              </span>
                              <span className="text-[10px] text-slate-600 font-sans">/100</span>
                            </div>
                          ) : (
                            <span className="text-slate-600 font-mono">-</span>
                          )}
                        </td>

                        <td className="py-3 px-3">
                          <span className="text-xs text-slate-300 font-medium capitalize">
                            {lead.status.replace('_', ' ')}
                          </span>
                        </td>

                        <td className="py-3 px-3">
                          <span
                            className={`text-xs font-medium uppercase font-mono ${
                              lead.priority === 'urgent'
                                ? 'text-rose-400'
                                : lead.priority === 'high'
                                ? 'text-amber-400'
                                : 'text-slate-400'
                            }`}
                          >
                            {lead.priority}
                          </span>
                        </td>

                        <td className="py-3 px-3">
                          <div className="text-slate-300 truncate max-w-[140px]">
                            {assignedUser ? assignedUser.name : <span className="text-slate-600 italic">Unassigned</span>}
                          </div>
                        </td>

                        <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-200 font-medium">
                          {lead.budget ? `$${lead.budget.toLocaleString()}` : <span className="text-slate-600">N/A</span>}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedLead(lead);
                            }}
                            className="p-1 text-slate-400 hover:text-amber-400 rounded transition-colors"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* KANBAN PIPELINE VIEW */
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-[1200px]">
            {pipelineStages.map((stage) => {
              const stageLeads = filteredLeads.filter((l) => l.status === stage);
              return (
                <div
                  key={stage}
                  className="flex-1 min-w-[260px] bg-slate-900 border border-slate-800 rounded-lg flex flex-col max-h-[750px]"
                >
                  {/* Column Header */}
                  <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
                    <div className="text-xs font-semibold text-slate-200 capitalize">
                      {stage.replace('_', ' ')}
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                      {stageLeads.length}
                    </span>
                  </div>

                  {/* Cards List */}
                  <div className="p-2 space-y-2.5 overflow-y-auto flex-1">
                    {stageLeads.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-600 italic">No leads in stage</div>
                    ) : (
                      stageLeads.map((lead) => (
                        <div
                          key={lead.id}
                          onClick={() => setSelectedLead(lead)}
                          className="p-3 bg-slate-950 border border-slate-800 hover:border-amber-500/50 rounded-lg cursor-pointer transition-all space-y-2 shadow-xs group"
                        >
                          <div className="flex items-start justify-between gap-1">
                            <div className="font-semibold text-xs text-slate-100 group-hover:text-amber-300 transition-colors">
                              {lead.name}
                            </div>
                            {lead.aiScore && (
                              <span className="text-[11px] font-mono font-bold text-amber-400">
                                {lead.aiScore}
                              </span>
                            )}
                          </div>

                          <div className="text-[11px] text-slate-400 leading-tight">
                            {lead.companyName || lead.location} · {lead.floors} fl ({lead.quantity}x)
                          </div>

                          <div className="flex items-center justify-between text-[11px] pt-1 text-slate-400 border-t border-slate-800/80">
                            <span className="font-mono tabular-nums text-slate-300 font-semibold">
                              {lead.budget ? `$${(lead.budget / 1000).toFixed(0)}k` : 'TBD'}
                            </span>

                            {/* Stage advance button */}
                            <select
                              value={lead.status}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => handleStageChange(lead.id, e.target.value as LeadStatus)}
                              className="text-[10px] bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-slate-300"
                            >
                              {pipelineStages.map((s) => (
                                <option key={s} value={s}>
                                  → {s.replace('_', ' ')}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* LEAD DETAILS DRAWER / MODAL */}
      {selectedLead && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex justify-end z-50">
          <div className="w-full max-w-xl bg-slate-900 border-l border-slate-800 h-full overflow-y-auto flex flex-col p-6 space-y-6">
            {/* Drawer Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <div className="text-xs text-amber-400 font-medium uppercase font-mono tracking-wider">
                  Lead File #{selectedLead.id}
                </div>
                <h3 className="text-xl font-bold text-slate-100 mt-1">{selectedLead.name}</h3>
                <div className="text-xs text-slate-400 mt-0.5">
                  {selectedLead.companyName} · {selectedLead.location}
                </div>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className="p-1 text-slate-400 hover:text-slate-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* AI Analysis Card */}
            <div className="bg-slate-950/80 border border-amber-500/30 p-4 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-slate-200">AI Project Intelligence</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-xs font-mono font-bold text-amber-400">
                    Score: {selectedLead.aiScore || 'N/A'}/100
                  </div>
                  <button
                    disabled={isAnalyzing}
                    onClick={() => handleReAnalyze(selectedLead.id)}
                    className="p-1 text-slate-400 hover:text-amber-400 rounded transition-colors disabled:opacity-50"
                    title="Re-run Gemini AI scoring"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {selectedLead.aiAnalysis ? (
                <div className="space-y-2.5 text-xs text-slate-300">
                  <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                    <span className="font-semibold text-slate-200 block mb-0.5">AI Evaluation Reason:</span>
                    <p className="text-slate-400 leading-relaxed">{selectedLead.aiAnalysis.scoreReason}</p>
                  </div>

                  <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                    <span className="font-semibold text-slate-200 block mb-0.5">Recommended Next Action:</span>
                    <p className="text-slate-400 leading-relaxed">{selectedLead.aiAnalysis.recommendedNextAction}</p>
                  </div>

                  <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                    <span className="font-semibold text-amber-400 block mb-0.5">Suggested Salesperson Response:</span>
                    <p className="text-slate-300 italic leading-relaxed">"{selectedLead.aiAnalysis.suggestedSalespersonResponse}"</p>
                  </div>

                  {selectedLead.aiAnalysis.extractedRequirements && (
                    <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                      <div className="bg-slate-900 p-2 rounded border border-slate-800">
                        <span className="text-slate-500 block">Drive/Machine:</span>
                        <span className="text-slate-200">{selectedLead.aiAnalysis.extractedRequirements.machineRoom || 'MRL'}</span>
                      </div>
                      <div className="bg-slate-900 p-2 rounded border border-slate-800">
                        <span className="text-slate-500 block">Door Type:</span>
                        <span className="text-slate-200 truncate">{selectedLead.aiAnalysis.extractedRequirements.doorType || 'Auto Center 1100mm'}</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-xs text-slate-400 py-2">
                  No AI evaluation cached. Click re-analyze to run Gemini.
                </div>
              )}
            </div>

            {/* Specifications & Parameters */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Elevator Technical Specs
              </h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 bg-slate-950 rounded border border-slate-800">
                  <span className="text-slate-500 block">Floors / Stops</span>
                  <span className="text-slate-200 font-semibold">{selectedLead.floors} Floors</span>
                </div>
                <div className="p-2.5 bg-slate-950 rounded border border-slate-800">
                  <span className="text-slate-500 block">Elevator Type</span>
                  <span className="text-slate-200 font-semibold capitalize">{selectedLead.elevatorType.replace(/_/g, ' ')}</span>
                </div>
                <div className="p-2.5 bg-slate-950 rounded border border-slate-800">
                  <span className="text-slate-500 block">Quantity</span>
                  <span className="text-slate-200 font-semibold">{selectedLead.quantity} Unit(s)</span>
                </div>
                <div className="p-2.5 bg-slate-950 rounded border border-slate-800">
                  <span className="text-slate-500 block">Estimated Budget</span>
                  <span className="text-slate-200 font-semibold font-mono">
                    {selectedLead.budget ? `$${selectedLead.budget.toLocaleString()}` : 'Unspecified'}
                  </span>
                </div>
              </div>

              <div className="p-2.5 bg-slate-950 rounded border border-slate-800 text-xs">
                <span className="text-slate-500 block mb-1">Requirement Notes:</span>
                <p className="text-slate-300 leading-relaxed">{selectedLead.elevatorRequirement}</p>
              </div>
            </div>

            {/* Assignment & Pipeline Controls */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Assignment & Stage
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Assigned Sales Engineer</label>
                  <select
                    value={selectedLead.assignedUserId || ''}
                    onChange={(e) => handleAssignLead(selectedLead.id, e.target.value)}
                    className="w-full text-xs bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
                  >
                    <option value="">Unassigned</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Sales Stage</label>
                  <select
                    value={selectedLead.status}
                    onChange={(e) => handleStageChange(selectedLead.id, e.target.value as LeadStatus)}
                    className="w-full text-xs bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 capitalize"
                  >
                    {pipelineStages.map((s) => (
                      <option key={s} value={s}>
                        {s.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="pt-4 border-t border-slate-800 flex flex-wrap gap-2">
              {onCreateQuotationForLead && (
                <button
                  onClick={() => onCreateQuotationForLead(selectedLead)}
                  className="flex-1 px-3 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold text-xs rounded transition-colors flex items-center justify-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Generate Quotation</span>
                </button>
              )}
              <button
                onClick={() => handleDeleteLead(selectedLead.id)}
                className="px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs rounded border border-rose-500/30 transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE NEW LEAD MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-100">Add New Elevator Project Lead</h3>
                <p className="text-xs text-slate-400">
                  New leads are immediately evaluated by Gemini AI and routed to sales engineers.
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Client / Contact Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Arthur Sterling"
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Company / Developer Name</label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="e.g. Sterling Horizon Real Estate"
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="client@domain.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Site Location / City</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Chicago, IL"
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Building Profile</label>
                  <select
                    value={formData.buildingType}
                    onChange={(e) => setFormData({ ...formData, buildingType: e.target.value as BuildingType })}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
                  >
                    <option value="commercial">Commercial</option>
                    <option value="residential">Residential</option>
                    <option value="hospital">Hospital / Medical</option>
                    <option value="industrial">Industrial / Warehouse</option>
                    <option value="apartment">High-Rise Apartment</option>
                    <option value="hotel">Hotel / Hospitality</option>
                    <option value="government">Government / Civic</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Number of Floors / Stops</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={formData.floors}
                    onChange={(e) =>
                      setFormData({ ...formData, floors: Number(e.target.value), stops: Number(e.target.value) })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Elevator System Type</label>
                  <select
                    value={formData.elevatorType}
                    onChange={(e) => setFormData({ ...formData, elevatorType: e.target.value as ElevatorType })}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
                  >
                    <option value="passenger_mrl">Passenger MRL (Machine Roomless)</option>
                    <option value="passenger_geared">Passenger Overhead Machine Room</option>
                    <option value="panoramic_glass">Panoramic Glass Observation</option>
                    <option value="hospital_stretcher">Hospital Stretcher Bed Elevator</option>
                    <option value="freight_heavy">Heavy Duty Industrial Freight</option>
                    <option value="villa_hydraulic">Private Villa Hydraulic</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Number of Elevators (Quantity)</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Allocated Budget (USD)</label>
                  <input
                    type="number"
                    step="1000"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="text-xs">
                <label className="block text-slate-300 font-medium mb-1">Elevator Requirement Notes</label>
                <textarea
                  rows={3}
                  value={formData.elevatorRequirement}
                  onChange={(e) => setFormData({ ...formData, elevatorRequirement: e.target.value })}
                  placeholder="e.g. 3 high-speed traction elevators with destination dispatch and card access integration..."
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold rounded text-xs transition-colors flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Evaluating & Saving...' : 'Analyze & Create Lead'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
