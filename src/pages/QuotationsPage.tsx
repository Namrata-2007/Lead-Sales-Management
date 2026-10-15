import React, { useState } from 'react';
import {
  Plus,
  Send,
  Printer,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  DollarSign,
  Building,
  Mail,
  User,
  X,
  Trash2,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { Quotation, QuotationItem, ElevatorType } from '../types';
import { api } from '../api';

interface QuotationsPageProps {
  quotations: Quotation[];
  loading: boolean;
  onRefresh: () => void;
  onShowToast: (type: 'success' | 'warning' | 'error' | 'info', message: string, title?: string) => void;
  preselectedLead?: any;
}

export const QuotationsPage: React.FC<QuotationsPageProps> = ({
  quotations,
  loading,
  onRefresh,
  onShowToast,
  preselectedLead
}) => {
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(Boolean(preselectedLead));
  const [isSending, setIsSending] = useState(false);

  // Form State
  const [customerName, setCustomerName] = useState(preselectedLead?.name || '');
  const [customerCompany, setCustomerCompany] = useState(preselectedLead?.companyName || '');
  const [customerEmail, setCustomerEmail] = useState(preselectedLead?.email || '');
  const [customerPhone, setCustomerPhone] = useState(preselectedLead?.phone || '');
  const [projectTitle, setProjectTitle] = useState(
    preselectedLead
      ? `${preselectedLead.companyName || preselectedLead.name} Elevator Modernization`
      : 'Apex High-Speed Elevator Installation'
  );
  const [leadId, setLeadId] = useState(preselectedLead?.id || '');
  const [taxRate, setTaxRate] = useState(6.5);
  const [discountAmount, setDiscountAmount] = useState(10000);
  const [warrantyYears, setWarrantyYears] = useState(3);
  const [validUntil, setValidUntil] = useState(
    new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
  );

  const [items, setItems] = useState<Array<Partial<QuotationItem>>>([
    {
      description: 'Apex-MRL High-Speed Gearless Permanent Magnet Synchronous Motor (PMSM)',
      elevatorType: 'passenger_mrl',
      specifications: 'Capacity: 1350kg (18 Passengers) | Speed: 2.0 m/s | Machine Roomless',
      quantity: preselectedLead?.quantity || 2,
      unitPrice: 95000,
      totalPrice: (preselectedLead?.quantity || 2) * 95000
    },
    {
      description: 'Variable Voltage Variable Frequency (VVVF) Digital Group Dispatch Controller',
      elevatorType: 'passenger_mrl',
      specifications: 'Regenerative drive system with emergency battery automatic rescue device (ARD)',
      quantity: 1,
      unitPrice: 28000,
      totalPrice: 28000
    },
    {
      description: 'Architectural Titanium Stainless Steel Cabin Cladding & LED Ambient Ceiling',
      elevatorType: 'panoramic_glass',
      specifications: 'Brushed titanium, full height rear safety glass mirror, COP with 10.4-inch multimedia display',
      quantity: preselectedLead?.quantity || 2,
      unitPrice: 8500,
      totalPrice: (preselectedLead?.quantity || 2) * 8500
    }
  ]);

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        description: 'Guide Rail System & Civil Shaft Mechanical Hardware Installation',
        elevatorType: 'passenger_mrl',
        specifications: 'Machined steel guide rails, counterweight frame, seismic safety gear brackets',
        quantity: 1,
        unitPrice: 15000,
        totalPrice: 15000
      }
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: string, val: any) => {
    const updated = [...items];
    (updated[index] as any)[field] = val;
    if (field === 'quantity' || field === 'unitPrice') {
      const q = Number(updated[index].quantity) || 1;
      const u = Number(updated[index].unitPrice) || 0;
      updated[index].totalPrice = q * u;
    }
    setItems(updated);
  };

  const subtotal = items.reduce((sum, it) => sum + (Number(it.totalPrice) || 0), 0);
  const taxable = Math.max(0, subtotal - discountAmount);
  const taxAmount = (taxable * taxRate) / 100;
  const grandTotal = taxable + taxAmount;

  const handleCreateQuotation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerEmail || items.length === 0) {
      onShowToast('error', 'Please provide customer name, email, and at least one item.');
      return;
    }

    try {
      const created = await api.createQuotation({
        customerName,
        customerCompany,
        customerEmail,
        customerPhone,
        projectTitle,
        leadId: leadId || undefined,
        items: items as QuotationItem[],
        subtotal,
        taxRate,
        taxAmount,
        discountAmount,
        totalAmount: grandTotal,
        warrantyYears,
        validUntil
      });

      onShowToast('success', `Proposal ${created.quotationNumber} saved as draft!`);
      setShowCreateModal(false);
      onRefresh();
      setSelectedQuotation(created);
    } catch (err: any) {
      onShowToast('error', err.message);
    }
  };

  const handleSendQuotation = async (quotationId: string) => {
    setIsSending(true);
    try {
      await api.sendQuotation(quotationId);
      onShowToast(
        'success',
        'Official quotation dispatched via email to customer. Stage updated to Proposal Sent.'
      );
      onRefresh();
      if (selectedQuotation && selectedQuotation.id === quotationId) {
        setSelectedQuotation({ ...selectedQuotation, status: 'sent' });
      }
    } catch (err: any) {
      onShowToast('error', err.message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Elevator Engineering Quotations</h2>
          <div className="text-xs text-slate-400 mt-0.5">
            Create itemized proposals with mechanical specs, delivery milestones, and automated follow-up
          </div>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-md transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Proposal</span>
        </button>
      </div>

      {/* Quotations List */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/60 font-medium">
                <th className="py-3 px-4">Ref Number</th>
                <th className="py-3 px-3">Project / Customer</th>
                <th className="py-3 px-3">Valid Until</th>
                <th className="py-3 px-3">Warranty</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Total Amount</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {quotations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No quotations generated yet. Click "New Proposal" to create one.
                  </td>
                </tr>
              ) : (
                quotations.map((q) => (
                  <tr
                    key={q.id}
                    onClick={() => setSelectedQuotation(q)}
                    className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-amber-400">{q.quotationNumber}</td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-200">{q.projectTitle}</div>
                      <div className="text-[11px] text-slate-400">
                        {q.customerName} {q.customerCompany ? `· ${q.customerCompany}` : ''}
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-400">{q.validUntil}</td>
                    <td className="py-3 px-3 text-slate-300">{q.warrantyYears} Years</td>
                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                          q.status === 'accepted'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : q.status === 'sent'
                            ? 'bg-blue-950 text-blue-400 border border-blue-800'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {q.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-100 tabular-nums">
                      ${q.totalAmount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        {q.status === 'draft' && (
                          <button
                            onClick={() => handleSendQuotation(q.id)}
                            className="px-2 py-1 bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 text-[11px] font-medium rounded border border-amber-500/30 transition-colors flex items-center gap-1"
                          >
                            <Send className="w-3 h-3" />
                            <span>Send</span>
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedQuotation(q)}
                          className="p-1 text-slate-400 hover:text-slate-100 rounded"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PRINTABLE PROPOSAL SHEET / MODAL */}
      {selectedQuotation && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-3xl w-full p-6 space-y-6 shadow-2xl my-8">
            {/* Action Bar */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-amber-400" />
                <span className="font-mono font-bold text-slate-100 text-sm">
                  {selectedQuotation.quotationNumber}
                </span>
                <span className="text-slate-600">·</span>
                <span className="text-xs text-slate-400 capitalize">{selectedQuotation.status}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded transition-colors flex items-center gap-1.5 border border-slate-700"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / PDF</span>
                </button>

                {selectedQuotation.status === 'draft' && (
                  <button
                    disabled={isSending}
                    onClick={() => handleSendQuotation(selectedQuotation.id)}
                    className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-semibold rounded transition-colors flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSending ? 'Sending...' : 'Email to Client'}</span>
                  </button>
                )}

                <button
                  onClick={() => setSelectedQuotation(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Branded Elevator Proposal Header */}
            <div className="border border-slate-800 bg-slate-950 p-6 rounded-lg space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">Apex Elevator Dynamics Inc.</h3>
                  <p className="text-xs text-slate-400">Intelligent High-Performance Vertical Systems</p>
                  <p className="text-[11px] text-slate-500 mt-1">450 Industrial Parkway, Chicago, IL 60611</p>
                </div>

                <div className="text-right sm:text-right text-xs">
                  <div className="font-mono font-bold text-amber-400 text-sm">{selectedQuotation.quotationNumber}</div>
                  <div className="text-slate-400 mt-0.5">Valid Until: {selectedQuotation.validUntil}</div>
                  <div className="text-slate-500">Date: {new Date(selectedQuotation.createdAt).toLocaleDateString()}</div>
                </div>
              </div>

              {/* Client Info */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 block uppercase font-mono text-[10px]">Prepared For:</span>
                  <div className="font-semibold text-slate-200 text-sm mt-0.5">{selectedQuotation.customerName}</div>
                  {selectedQuotation.customerCompany && (
                    <div className="text-slate-400">{selectedQuotation.customerCompany}</div>
                  )}
                  <div className="text-slate-400">{selectedQuotation.customerEmail}</div>
                  {selectedQuotation.customerPhone && (
                    <div className="text-slate-400">{selectedQuotation.customerPhone}</div>
                  )}
                </div>

                <div>
                  <span className="text-slate-500 block uppercase font-mono text-[10px]">Project Title:</span>
                  <div className="font-semibold text-slate-200 text-sm mt-0.5">{selectedQuotation.projectTitle}</div>
                  <div className="text-slate-400 mt-1 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{selectedQuotation.warrantyYears} Years Comprehensive Warranty</span>
                  </div>
                </div>
              </div>

              {/* Items Breakdown */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 bg-slate-900/60 font-medium">
                      <th className="py-2.5 px-3">Item Description</th>
                      <th className="py-2.5 px-2 text-center">Qty</th>
                      <th className="py-2.5 px-3 text-right">Unit Price</th>
                      <th className="py-2.5 px-3 text-right">Total Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {selectedQuotation.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/40">
                        <td className="py-3 px-3">
                          <div className="font-semibold text-slate-200">{item.description}</div>
                          <div className="text-[11px] text-slate-400 mt-0.5">{item.specifications}</div>
                        </td>
                        <td className="py-3 px-2 text-center font-mono tabular-nums text-slate-300">
                          {item.quantity}
                        </td>
                        <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-300">
                          ${item.unitPrice.toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold tabular-nums text-slate-100">
                          ${item.totalPrice.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-slate-800">
                      <td colSpan={3} className="py-2 px-3 text-right font-medium text-slate-400">
                        Subtotal:
                      </td>
                      <td className="py-2 px-3 text-right font-mono tabular-nums text-slate-200 font-semibold">
                        ${selectedQuotation.subtotal.toLocaleString()}
                      </td>
                    </tr>
                    {selectedQuotation.discountAmount > 0 && (
                      <tr>
                        <td colSpan={3} className="py-1 px-3 text-right text-emerald-400 font-medium">
                          Commercial Discount:
                        </td>
                        <td className="py-1 px-3 text-right font-mono tabular-nums text-emerald-400 font-semibold">
                          -${selectedQuotation.discountAmount.toLocaleString()}
                        </td>
                      </tr>
                    )}
                    {selectedQuotation.taxAmount > 0 && (
                      <tr>
                        <td colSpan={3} className="py-1 px-3 text-right text-slate-400 font-medium">
                          Estimated Tax ({selectedQuotation.taxRate}%):
                        </td>
                        <td className="py-1 px-3 text-right font-mono tabular-nums text-slate-200">
                          ${selectedQuotation.taxAmount.toLocaleString()}
                        </td>
                      </tr>
                    )}
                    <tr className="border-t-2 border-slate-700 bg-slate-900 font-bold text-sm">
                      <td colSpan={3} className="py-3 px-3 text-right text-white">
                        Grand Total (USD):
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-amber-400">
                        ${selectedQuotation.totalAmount.toLocaleString()}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Terms and Warranty */}
              <div className="bg-slate-900 p-4 rounded text-xs space-y-2 border border-slate-800 text-slate-300">
                <div>
                  <span className="font-semibold text-slate-200 block">Terms & Deliverables:</span>
                  <p className="text-slate-400 leading-relaxed">{selectedQuotation.terms}</p>
                </div>
                <div>
                  <span className="font-semibold text-slate-200 block">Payment Schedule:</span>
                  <p className="text-slate-400 leading-relaxed">{selectedQuotation.paymentTerms}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE NEW QUOTATION MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-3xl w-full p-6 space-y-5 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-100">Create Elevator Quotation</h3>
                <p className="text-xs text-slate-400">
                  Itemize mechanical components, traction machines, doors, and warranty terms.
                </p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateQuotation} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Customer / Client Name *</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Company Name</label>
                  <input
                    type="text"
                    value={customerCompany}
                    onChange={(e) => setCustomerCompany(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Customer Email *</label>
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-slate-300 font-medium mb-1">Project Proposal Title *</label>
                  <input
                    type="text"
                    required
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
                  />
                </div>
              </div>

              {/* Line Items Editor */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200">Elevator Equipment & Installation Line Items</span>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {items.map((it, idx) => (
                    <div key={idx} className="p-3 bg-slate-950 border border-slate-800 rounded space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Description"
                          value={it.description}
                          onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                          className="flex-1 bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-200 font-medium"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="text-slate-500 hover:text-rose-400 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <input
                        type="text"
                        placeholder="Technical Specifications (Capacity, Speed, Doors, Finishes)"
                        value={it.specifications}
                        onChange={(e) => handleItemChange(idx, 'specifications', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-300 text-[11px]"
                      />

                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="text-[10px] text-slate-500">Quantity</label>
                          <input
                            type="number"
                            min="1"
                            value={it.quantity}
                            onChange={(e) => handleItemChange(idx, 'quantity', Number(e.target.value))}
                            className="w-full bg-slate-900 border border-slate-800 rounded p-1 text-slate-200 font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500">Unit Price ($)</label>
                          <input
                            type="number"
                            step="100"
                            value={it.unitPrice}
                            onChange={(e) => handleItemChange(idx, 'unitPrice', Number(e.target.value))}
                            className="w-full bg-slate-900 border border-slate-800 rounded p-1 text-slate-200 font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500">Total ($)</label>
                          <input
                            type="number"
                            disabled
                            value={it.totalPrice}
                            className="w-full bg-slate-900/60 border border-slate-800 rounded p-1 text-amber-400 font-mono font-bold"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Commercial Terms & Rates */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="text-slate-400 block mb-1">Commercial Discount ($)</label>
                  <input
                    type="number"
                    step="500"
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Tax Rate (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={taxRate}
                    onChange={(e) => setTaxRate(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Warranty (Years)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={warrantyYears}
                    onChange={(e) => setWarrantyYears(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded border border-slate-800 flex justify-between items-center text-sm font-bold">
                <span className="text-slate-300">Total Proposal Value:</span>
                <span className="text-amber-400 font-mono">${grandTotal.toLocaleString()}</span>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold rounded text-xs transition-colors"
                >
                  Save Formal Quotation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
