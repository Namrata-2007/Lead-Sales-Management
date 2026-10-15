import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Search,
  Calendar,
  CheckCircle2,
  Clock,
  Layers,
  MapPin,
  DollarSign,
  X
} from 'lucide-react';
import { Project, BuildingType } from '../types';
import { api } from '../api';

interface ProjectsPageProps {
  projects: Project[];
  loading: boolean;
  onRefresh: () => void;
  onShowToast: (type: 'success' | 'warning' | 'error' | 'info', message: string, title?: string) => void;
}

export const ProjectsPage: React.FC<ProjectsPageProps> = ({
  projects,
  loading,
  onRefresh,
  onShowToast
}) => {
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const [form, setForm] = useState({
    customerId: 'cust_01',
    title: '',
    siteAddress: '',
    buildingType: 'commercial' as BuildingType,
    numberOfFloors: 10,
    elevatorQuantity: 2,
    budget: 250000,
    status: 'planning' as const,
    estimatedCompletion: ''
  });

  const filtered = projects.filter((p) => {
    const q = search.toLowerCase();
    return p.title.toLowerCase().includes(q) || p.siteAddress.toLowerCase().includes(q);
  });

  const getStatusColor = (st: string) => {
    switch (st) {
      case 'manufacturing':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'installation':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
      case 'testing_commissioning':
        return 'text-purple-400 bg-purple-500/10 border-purple-500/30';
      case 'handover':
      case 'maintenance':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      default:
        return 'text-slate-400 bg-slate-800 border-slate-700';
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title) {
      onShowToast('error', 'Project title is required');
      return;
    }
    try {
      await api.createProject(form);
      onShowToast('success', 'Project created successfully');
      setShowAddModal(false);
      onRefresh();
    } catch (err: any) {
      onShowToast('error', err.message);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Elevator Installation & Civil Projects</h2>
          <div className="text-xs text-slate-400 mt-0.5">
            Track site readiness, shaft civil engineering, manufacturing, and state commissioning milestones
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-md transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Project</span>
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search active elevator projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded text-slate-200 placeholder-slate-500 focus:outline-hidden"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((proj) => (
          <div
            key={proj.id}
            className="bg-slate-900 border border-slate-800 p-5 rounded-lg space-y-4 hover:border-slate-700 transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-100">{proj.title}</h3>
                <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span>{proj.siteAddress || 'Site address pending'}</span>
                </div>
              </div>
              <span
                className={`text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded border ${getStatusColor(
                  proj.status
                )}`}
              >
                {proj.status.replace(/_/g, ' ')}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs pt-2 border-t border-slate-800/80">
              <div className="bg-slate-950 p-2.5 rounded border border-slate-800/60">
                <span className="text-[10px] text-slate-500 uppercase font-mono block">Building</span>
                <span className="font-semibold text-slate-200 capitalize">{proj.buildingType}</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded border border-slate-800/60">
                <span className="text-[10px] text-slate-500 uppercase font-mono block">Lifts & Floors</span>
                <span className="font-semibold text-slate-200">
                  {proj.elevatorQuantity} Units · {proj.numberOfFloors} Fl
                </span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded border border-slate-800/60">
                <span className="text-[10px] text-slate-500 uppercase font-mono block">Contract Value</span>
                <span className="font-semibold font-mono text-emerald-400">
                  ${proj.budget.toLocaleString()}
                </span>
              </div>
            </div>

            {proj.estimatedCompletion && (
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Est. Handover: {proj.estimatedCompletion}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100">Create Installation Project</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Project Name *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Grand Horizon South Tower 3x Elevators"
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Site Address</label>
                <input
                  type="text"
                  value={form.siteAddress}
                  onChange={(e) => setForm({ ...form, siteAddress: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 mb-1">Building Profile</label>
                  <select
                    value={form.buildingType}
                    onChange={(e) => setForm({ ...form, buildingType: e.target.value as BuildingType })}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
                  >
                    <option value="commercial">Commercial</option>
                    <option value="residential">Residential</option>
                    <option value="hospital">Hospital</option>
                    <option value="industrial">Industrial</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
                  >
                    <option value="planning">Planning</option>
                    <option value="shaft_construction">Shaft Construction</option>
                    <option value="manufacturing">Manufacturing</option>
                    <option value="installation">Installation</option>
                    <option value="testing_commissioning">Testing & Commissioning</option>
                    <option value="handover">Handover</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-300 mb-1">Floors</label>
                  <input
                    type="number"
                    value={form.numberOfFloors}
                    onChange={(e) => setForm({ ...form, numberOfFloors: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Quantity</label>
                  <input
                    type="number"
                    value={form.elevatorQuantity}
                    onChange={(e) => setForm({ ...form, elevatorQuantity: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Budget ($)</label>
                  <input
                    type="number"
                    value={form.budget}
                    onChange={(e) => setForm({ ...form, budget: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 font-mono"
                  />
                </div>
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
                  Save Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
