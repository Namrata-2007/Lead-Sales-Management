import React from 'react';
import {
  BarChart3,
  TrendingUp,
  Award,
  DollarSign,
  PieChart,
  Target,
  Users,
  Building
} from 'lucide-react';
import { DashboardData } from '../types';

interface AnalyticsPageProps {
  data: DashboardData | null;
  loading: boolean;
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ data, loading }) => {
  const m = data?.metrics || {
    totalLeads: 0,
    newLeads: 0,
    qualifiedLeads: 0,
    highPriorityLeads: 0,
    activeDeals: 0,
    wonDeals: 0,
    lostDeals: 0,
    conversionRate: 0,
    revenue: 0,
    pendingFollowups: 0,
    overdueTasks: 0
  };

  const sources = Object.entries(data?.leadsBySource || {});
  const buildingTypes = Object.entries(data?.leadsByBuildingType || {});

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-100">Elevator Commercial Intelligence & Analytics</h2>
        <div className="text-xs text-slate-400 mt-0.5">
          Audited metrics queried directly from the PostgreSQL relational schema
        </div>
      </div>

      {/* Primary KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-lg">
          <span className="text-xs text-slate-400 uppercase font-mono block">Lifetime Won Revenue</span>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1 tabular-nums">
            ${m.revenue.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">From verified client contracts</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-lg">
          <span className="text-xs text-slate-400 uppercase font-mono block">Win Conversion Rate</span>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-1 tabular-nums">
            {m.conversionRate}%
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Closed-won vs closed-lost</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-lg">
          <span className="text-xs text-slate-400 uppercase font-mono block">High-Priority Ratio</span>
          <div className="text-2xl font-bold font-mono text-slate-100 mt-1 tabular-nums">
            {m.totalLeads > 0 ? Math.round((m.highPriorityLeads / m.totalLeads) * 100) : 0}%
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">AI score ≥ 75/100 threshold</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-lg">
          <span className="text-xs text-slate-400 uppercase font-mono block">Active Pipeline Velocity</span>
          <div className="text-2xl font-bold font-mono text-slate-100 mt-1 tabular-nums">
            {m.activeDeals}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Units in negotiation or review</span>
        </div>
      </div>

      {/* Grid: Lead Source & Building Mix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Inbound Lead Channel Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-semibold text-slate-200">Lead Source Attribution</h3>
            </div>
            <span className="text-xs font-mono text-slate-500">leads table</span>
          </div>

          <div className="space-y-3">
            {sources.map(([src, count]) => {
              const pct = m.totalLeads > 0 ? Math.round((count / m.totalLeads) * 100) : 0;
              return (
                <div key={src} className="space-y-1 text-xs">
                  <div className="flex justify-between text-slate-300 font-medium">
                    <span className="capitalize">{src}</span>
                    <span className="font-mono text-slate-400 tabular-nums">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800/80">
                    <div className="bg-amber-400 h-full rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Building Sector Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-semibold text-slate-200">Building Sector Demand</h3>
            </div>
            <span className="text-xs font-mono text-slate-500">Commercial vs Residential</span>
          </div>

          <div className="space-y-3">
            {buildingTypes.map(([bType, count]) => {
              const pct = m.totalLeads > 0 ? Math.round((count / m.totalLeads) * 100) : 0;
              return (
                <div key={bType} className="space-y-1 text-xs">
                  <div className="flex justify-between text-slate-300 font-medium">
                    <span className="capitalize">{bType}</span>
                    <span className="font-mono text-slate-400 tabular-nums">
                      {count} Units ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800/80">
                    <div className="bg-blue-500 h-full rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Salesperson Performance Matrix */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-slate-200">Team Conversion & Portfolio Value</h3>
          </div>
          <span className="text-xs font-mono text-slate-500">Live Rep Analytics</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/60 font-medium">
                <th className="py-2.5 px-3">Sales Engineer</th>
                <th className="py-2.5 px-3 text-right">Active Pipeline Leads</th>
                <th className="py-2.5 px-3 text-right">Deals Won</th>
                <th className="py-2.5 px-3 text-right">Closed Portfolio Revenue</th>
                <th className="py-2.5 px-3 text-right">Win Conversion %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {(data?.salespersonPerformance || []).map((sp) => (
                <tr key={sp.userId} className="hover:bg-slate-800/40">
                  <td className="py-3 px-3 font-sans font-semibold text-slate-200">{sp.name}</td>
                  <td className="py-3 px-3 text-right tabular-nums text-slate-300">{sp.assignedLeadsCount}</td>
                  <td className="py-3 px-3 text-right tabular-nums text-emerald-400 font-bold">{sp.wonDealsCount}</td>
                  <td className="py-3 px-3 text-right tabular-nums text-slate-100 font-bold">
                    ${sp.totalRevenueWon.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-right tabular-nums text-amber-400">{sp.conversionRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
