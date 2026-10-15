import React, { useState } from 'react';
import {
  Layers,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Building,
  Mail,
  Phone,
  ArrowLeft,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { BuildingType } from '../types';
import { api } from '../api';

interface PublicLeadPortalProps {
  onBackToCRM: () => void;
  onShowToast: (type: 'success' | 'warning' | 'error' | 'info', message: string, title?: string) => void;
}

export const PublicLeadPortal: React.FC<PublicLeadPortalProps> = ({
  onBackToCRM,
  onShowToast
}) => {
  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    email: '',
    phone: '',
    location: '',
    buildingType: 'commercial' as BuildingType,
    floors: 6,
    quantity: 2,
    elevatorRequirement: '',
    budget: 180000,
    expectedInstallationDate: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedLeadId, setSubmittedLeadId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone) {
      onShowToast('error', 'Please fill in your name, email, and contact phone.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.submitPublicLead(formData);
      setSubmittedLeadId(res.leadId);
      onShowToast(
        'success',
        'Inquiry submitted! AI engineering scoring and salesperson assignment completed.',
        'Requirement Received'
      );
    } catch (err: any) {
      onShowToast('error', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-amber-400 selection:text-slate-950 flex flex-col justify-between">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Layers className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="font-bold text-sm tracking-tight text-white">Apex Elevator Dynamics</div>
            <div className="text-[11px] text-slate-400">Turnkey Architectural & Commercial Vertical Solutions</div>
          </div>
        </div>

        <button
          onClick={onBackToCRM}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-md transition-colors border border-slate-700"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Internal CRM</span>
        </button>
      </header>

      {/* Main Form Content */}
      <main className="max-w-4xl mx-auto w-full p-6 my-8 space-y-8">
        {submittedLeadId ? (
          <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-8 text-center space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-xs uppercase font-mono tracking-wider text-emerald-400 font-bold">
                Inquiry Logged & AI Qualified
              </span>
              <h2 className="text-2xl font-bold text-white">Thank You, {formData.name}!</h2>
              <p className="text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
                Your elevator requirement has been processed by our autonomous engineering intake system. A dedicated solutions engineer has received your parameters and will deliver customized shaft layout drawings within 24 hours.
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-lg max-w-sm mx-auto text-xs font-mono text-slate-400 border border-slate-800 space-y-1">
              <div>Reference ID: <span className="text-amber-400 font-bold">{submittedLeadId}</span></div>
              <div>Estimated Delivery: <span className="text-slate-200">8 - 12 Weeks</span></div>
            </div>

            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={() => {
                  setSubmittedLeadId(null);
                  setFormData({
                    name: '',
                    companyName: '',
                    email: '',
                    phone: '',
                    location: '',
                    buildingType: 'commercial',
                    floors: 6,
                    quantity: 2,
                    elevatorRequirement: '',
                    budget: 180000,
                    expectedInstallationDate: ''
                  });
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors"
              >
                Submit Another Inquiry
              </button>
              <button
                onClick={onBackToCRM}
                className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-semibold rounded-lg transition-colors"
              >
                View in CRM Dashboard
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Explanation Column */}
            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-3">
                <span className="text-xs uppercase font-mono font-bold tracking-wider text-amber-400">
                  Instant Project Specification
                </span>
                <h1 className="text-3xl font-extrabold text-white tracking-tight leading-tight">
                  Design & Price Your Elevator System
                </h1>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Provide your building height, stop parameters, and architectural preferences. Our AI system will calculate speed requirements, traffic flow capacity, and generate an itemized engineering quotation.
                </p>
              </div>

              <div className="space-y-3 text-xs text-slate-300 pt-2">
                <div className="flex items-start gap-3 p-3 bg-slate-900 border border-slate-800 rounded-lg">
                  <Zap className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-semibold text-slate-100 block">Instant AI Qualification</span>
                    <span className="text-slate-400">
                      Calculates optimal traction motor power, VVVF speed curves, and door clearances instantly.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-slate-900 border border-slate-800 rounded-lg">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-semibold text-slate-100 block">ASME A17.1 & EN 81 Compliant</span>
                    <span className="text-slate-400">
                      All calculations adhere to international vertical transport and seismic safety standards.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Form Card */}
            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Michael Thorne"
                      className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Developer / Firm</label>
                    <input
                      type="text"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      placeholder="e.g. Apex Real Estate Corp"
                      className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Business Email *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="m.thorne@apexrealestate.com"
                      className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Contact Phone *</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+1 (555) 900-2323"
                      className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-slate-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Project Site Location</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g. Chicago, IL"
                      className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Building Profile</label>
                    <select
                      value={formData.buildingType}
                      onChange={(e) => setFormData({ ...formData, buildingType: e.target.value as BuildingType })}
                      className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-slate-200"
                    >
                      <option value="commercial">Commercial Office</option>
                      <option value="residential">Residential High-Rise</option>
                      <option value="hospital">Hospital / Healthcare</option>
                      <option value="industrial">Industrial / Logistics</option>
                      <option value="hotel">Hotel / Hospitality</option>
                      <option value="apartment">Multi-Family Apartment</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Number of Floors</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={formData.floors}
                      onChange={(e) => setFormData({ ...formData, floors: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Elevator Quantity</label>
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
                    <label className="block text-slate-300 font-medium mb-1">Budget Target ($)</label>
                    <input
                      type="number"
                      step="5000"
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Specific Elevator Requirements</label>
                  <textarea
                    rows={3}
                    value={formData.elevatorRequirement}
                    onChange={(e) => setFormData({ ...formData, elevatorRequirement: e.target.value })}
                    placeholder="e.g. Need 2x MRL passenger elevators with glass backs and high-speed destination dispatch..."
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-slate-200"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isSubmitting ? 'Evaluating with Gemini AI...' : 'Submit & Receive Technical Estimate'}</span>
                </button>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        <p>© 2026 Apex Elevator Dynamics Inc. All rights reserved. ISO 9001 Certified Vertical Transportation.</p>
      </footer>
    </div>
  );
};
