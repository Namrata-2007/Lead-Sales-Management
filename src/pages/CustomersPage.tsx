import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Building,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  ArrowRight,
  Clock,
  FileSpreadsheet,
  Layers,
  ChevronRight,
  X,
  CheckCircle2
} from 'lucide-react';
import { Customer } from '../types';
import { api } from '../api';

interface CustomersPageProps {
  customers: Customer[];
  loading: boolean;
  onRefresh: () => void;
  onShowToast: (type: 'success' | 'warning' | 'error' | 'info', message: string, title?: string) => void;
}

export const CustomersPage: React.FC<CustomersPageProps> = ({
  customers,
  loading,
  onRefresh,
  onShowToast
}) => {
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [timelineData, setTimelineData] = useState<any | null>(null);
  const [isLoadingTimeline, setIsLoadingTimeline] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Customer Form State
  const [newCust, setNewCust] = useState({
    name: '',
    companyName: '',
    email: '',
    phone: '',
    location: '',
    address: '',
    taxId: '',
    notes: ''
  });

  const filtered = customers.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      (c.companyName && c.companyName.toLowerCase().includes(q)) ||
      c.email.toLowerCase().includes(q) ||
      c.location.toLowerCase().includes(q)
    );
  });

  const handleSelectCustomer = async (cust: Customer) => {
    setSelectedCustomer(cust);
    setIsLoadingTimeline(true);
    try {
      const data = await api.getCustomerTimeline(cust.id);
      setTimelineData(data);
    } catch (err: any) {
      onShowToast('error', err.message);
    } finally {
      setIsLoadingTimeline(false);
    }
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCust.name || !newCust.email) {
      onShowToast('error', 'Customer name and email are required');
      return;
    }

    try {
      await api.createCustomer(newCust);
      onShowToast('success', 'Customer record created successfully');
      setShowAddModal(false);
      onRefresh();
      setNewCust({
        name: '',
        companyName: '',
        email: '',
        phone: '',
        location: '',
        address: '',
        taxId: '',
        notes: ''
      });
    } catch (err: any) {
      onShowToast('error', err.message);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Elevator Accounts & Clients</h2>
          <div className="text-xs text-slate-400 mt-0.5">
            Complete lifecycle timeline from initial engineering inquiry to commissioning and service
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-md transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Account</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search accounts by contact name, company, city, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded text-slate-200 placeholder-slate-500 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((c) => (
          <div
            key={c.id}
            onClick={() => handleSelectCustomer(c)}
            className="bg-slate-900 border border-slate-800 hover:border-amber-500/50 p-5 rounded-lg cursor-pointer transition-all space-y-4 group"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-100 group-hover:text-amber-400 transition-colors">
                  {c.name}
                </h3>
                <div className="text-xs text-slate-400 mt-0.5">{c.companyName || 'Private Developer'}</div>
              </div>
              <span className="text-xs font-mono font-bold text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                {c.totalDealsWon} Won
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span className="truncate">{c.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                <span>{c.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>{c.location}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-500">Lifetime Portfolio:</span>
              <span className="font-mono font-bold text-emerald-400 tabular-nums">
                ${c.lifetimeValue.toLocaleString()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* CUSTOMER TIMELINE DRAWER */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex justify-end z-50">
          <div className="w-full max-w-2xl bg-slate-900 border-l border-slate-800 h-full overflow-y-auto flex flex-col p-6 space-y-6">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs text-amber-400 font-mono uppercase font-semibold">Account History</span>
                <h3 className="text-xl font-bold text-slate-100 mt-0.5">{selectedCustomer.name}</h3>
                <div className="text-xs text-slate-400">{selectedCustomer.companyName} · {selectedCustomer.location}</div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-1 text-slate-400 hover:text-slate-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Overview */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-950 p-3 rounded border border-slate-800">
                <span className="text-slate-500 block">Total Deals Won</span>
                <span className="text-slate-100 font-bold font-mono text-base">{selectedCustomer.totalDealsWon} Deals</span>
              </div>
              <div className="bg-slate-950 p-3 rounded border border-slate-800">
                <span className="text-slate-500 block">Lifetime Portfolio Value</span>
                <span className="text-emerald-400 font-bold font-mono text-base">
                  ${selectedCustomer.lifetimeValue.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Customer Timeline Feed */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Full Customer Engagement Timeline
                </h4>
                <span className="text-[11px] text-slate-500 font-mono">Lead → Proposal → Handover</span>
              </div>

              {isLoadingTimeline ? (
                <div className="p-8 text-center text-xs text-slate-500 animate-pulse">Loading timeline history...</div>
              ) : (
                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                  {timelineData?.activities?.length === 0 ? (
                    <div className="text-xs text-slate-500 py-4">No logged interactions yet.</div>
                  ) : (
                    timelineData?.activities?.map((act: any) => (
                      <div key={act.id} className="relative group">
                        <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-amber-400 border-2 border-slate-900" />
                        <div className="p-3 bg-slate-950 rounded border border-slate-800 text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-200">{act.title}</span>
                            <span className="text-[10px] font-mono text-slate-500">
                              {new Date(act.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-slate-400 text-[11px] leading-relaxed">{act.description}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Linked Quotations */}
            {timelineData?.quotations?.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Associated Quotations</h4>
                <div className="space-y-2">
                  {timelineData.quotations.map((q: any) => (
                    <div
                      key={q.id}
                      className="p-3 bg-slate-950 rounded border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-mono font-bold text-amber-400">{q.quotationNumber}</div>
                        <div className="text-slate-300">{q.projectTitle}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold text-slate-100">${q.totalAmount.toLocaleString()}</div>
                        <span className="text-[10px] uppercase font-mono text-slate-500">{q.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CREATE NEW CUSTOMER MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100">Add Account / Customer</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Contact Name *</label>
                <input
                  type="text"
                  required
                  value={newCust.name}
                  onChange={(e) => setNewCust({ ...newCust, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Company / Organization</label>
                <input
                  type="text"
                  value={newCust.companyName}
                  onChange={(e) => setNewCust({ ...newCust, companyName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={newCust.email}
                    onChange={(e) => setNewCust({ ...newCust, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={newCust.phone}
                    onChange={(e) => setNewCust({ ...newCust, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">City / Location</label>
                <input
                  type="text"
                  value={newCust.location}
                  onChange={(e) => setNewCust({ ...newCust, location: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-400 text-slate-950 font-semibold rounded hover:bg-amber-300"
                >
                  Save Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
