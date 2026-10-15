import React from 'react';
import {
  TrendingUp,
  Award,
  DollarSign,
  AlertCircle,
  Calendar,
  Layers,
  ArrowUpRight,
  Sparkles,
  Building,
  Target
} from 'lucide-react';
import { DashboardData } from '../types';

interface DashboardPageProps {
  data: DashboardData | null;
  loading: boolean;
  onNavigateTab: (tab: any) => void;
  onSelectLeadId?: (id: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  data,
  loading,
  onNavigateTab,
  onSelectLeadId
}) => {
  if (loading && !data) {
    return (
      <div className="p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-900 border border-slate-800 rounded-lg animate-pulse" />
          ))}
        </div>
        <div className="h-64 bg-slate-900 border border-slate-800 rounded-lg animate-pulse" />
      </div>
    );
  }

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

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Hero Banner with High-End Elevator Visual */}
      <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900 shadow-xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
          <div className="p-6 lg:p-8 lg:col-span-7 flex flex-col justify-between space-y-6 z-10">
            <div>
              <div className="flex items-center gap-2 text-xs font-medium text-amber-400 mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Automated Sales Intelligence Active</span>
                <span className="text-slate-600" aria-hidden="true">·</span>
                <span className="text-slate-400">Autonomous Intake & Scoring</span>
              </div>
              <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-white leading-tight">
                Apex Elevator Dynamics
              </h2>
              <p className="text-sm text-slate-400 mt-2 max-w-xl leading-relaxed">
                Autonomous CRM engine for commercial, residential, and industrial vertical transportation.
                Every inquiry is classified, engineered, and routed in under 2 seconds.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onNavigateTab('leads')}
                className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold rounded-lg text-xs transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <span>View Live Pipeline</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onNavigateTab('automation')}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition-colors"
              >
                Workflow Engine
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 relative min-h-[200px] lg:min-h-full">
            <img
              src="/src/assets/images/hero_elevator_system_1792035799486.jpg"
              alt="High-Speed Observation Glass Elevator"
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover object-center opacity-85"
            />
            <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-slate-900 via-slate-900/60 to-transparent" />
          </div>
        </div>
      </div>

      {/* KPI Stat Cards (100% Calculated from Database) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg">
          <div className="text-xs text-slate-400 font-medium">Total Inbound</div>
          <div className="text-2xl font-bold text-slate-100 mt-1 font-mono tabular-nums">{m.totalLeads}</div>
          <div className="text-[11px] text-slate-500 mt-1">{m.newLeads} awaiting review</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg">
          <div className="text-xs text-slate-400 font-medium">Qualified Leads</div>
          <div className="text-2xl font-bold text-slate-100 mt-1 font-mono tabular-nums">{m.qualifiedLeads}</div>
          <div className="text-[11px] text-emerald-400 mt-1 font-medium">{m.highPriorityLeads} high priority</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg">
          <div className="text-xs text-slate-400 font-medium">Active Deals</div>
          <div className="text-2xl font-bold text-amber-400 mt-1 font-mono tabular-nums">{m.activeDeals}</div>
          <div className="text-[11px] text-slate-500 mt-1">In negotiation / proposal</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg">
          <div className="text-xs text-slate-400 font-medium">Deals Won</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1 font-mono tabular-nums">{m.wonDeals}</div>
          <div className="text-[11px] text-slate-500 mt-1">{m.lostDeals} closed lost</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg">
          <div className="text-xs text-slate-400 font-medium">Conversion Rate</div>
          <div className="text-2xl font-bold text-slate-100 mt-1 font-mono tabular-nums">{m.conversionRate}%</div>
          <div className="text-[11px] text-slate-500 mt-1">Closed-won ratio</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg">
          <div className="text-xs text-slate-400 font-medium">Contract Revenue</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1 font-mono tabular-nums truncate">
            ${m.revenue.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Accepted proposals</div>
        </div>
      </div>

      {/* Pipeline Stage Distribution Strip */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-slate-200">Elevator Sales Pipeline Velocity</h3>
          </div>
          <button
            onClick={() => onNavigateTab('leads')}
            className="text-xs text-amber-400 hover:text-amber-300 font-medium transition-colors"
          >
            Open Kanban Board →
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {Object.entries(data?.pipelineStages || {}).map(([stage, count]) => {
            const isWon = stage === 'won';
            const isLost = stage === 'lost';
            const label = stage.replace('_', ' ');
            return (
              <div
                key={stage}
                onClick={() => onNavigateTab('leads')}
                className={`p-3 rounded border cursor-pointer transition-all hover:bg-slate-800/80 ${
                  isWon
                    ? 'bg-emerald-950/20 border-emerald-800/50 text-emerald-300'
                    : isLost
                    ? 'bg-rose-950/20 border-rose-800/50 text-rose-300'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300'
                }`}
              >
                <div className="text-[11px] uppercase tracking-wider text-slate-400 truncate">{label}</div>
                <div className="text-xl font-bold font-mono tabular-nums mt-1">{count}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid: AI Score & Sales Rep Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Salesperson Leaderboard */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-semibold text-slate-200">Sales Engineering Performance</h3>
            </div>
            <span className="text-xs text-slate-500 font-mono">Live Workload & Revenue</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-2.5 font-medium">Engineer / Rep</th>
                  <th className="pb-2.5 font-medium text-right">Active Leads</th>
                  <th className="pb-2.5 font-medium text-right">Won Deals</th>
                  <th className="pb-2.5 font-medium text-right">Won Revenue</th>
                  <th className="pb-2.5 font-medium text-right">Win Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {(data?.salespersonPerformance || []).map((sp) => (
                  <tr key={sp.userId} className="hover:bg-slate-800/40">
                    <td className="py-2.5 pr-2 font-sans font-medium text-slate-200 flex items-center gap-2">
                      <img
                        src={sp.avatar || '/src/assets/images/avatar_senior_engineer_1792035800287.jpg'}
                        alt={sp.name}
                        referrerPolicy="no-referrer"
                        className="w-6 h-6 rounded-full object-cover border border-slate-700"
                      />
                      <span>{sp.name}</span>
                    </td>
                    <td className="py-2.5 text-right text-slate-300 tabular-nums">{sp.assignedLeadsCount}</td>
                    <td className="py-2.5 text-right text-emerald-400 font-semibold tabular-nums">{sp.wonDealsCount}</td>
                    <td className="py-2.5 text-right text-slate-100 tabular-nums">${sp.totalRevenueWon.toLocaleString()}</td>
                    <td className="py-2.5 text-right text-amber-400 tabular-nums">{sp.conversionRate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Scoring Distribution & Urgent Tasks */}
        <div className="lg:col-span-5 space-y-6">
          {/* AI Score Breakdown */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-semibold text-slate-200">AI Lead Score Distribution</h3>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">0-100 Score</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-rose-400 font-medium">Urgent Priority (90 - 100)</span>
                <span className="font-mono font-bold text-slate-200 tabular-nums">
                  {data?.scoreDistribution.urgent90Plus || 0}
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-rose-500 h-full rounded-full"
                  style={{ width: `${Math.min(100, ((data?.scoreDistribution.urgent90Plus || 0) / (m.totalLeads || 1)) * 100)}%` }}
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-amber-400 font-medium">High Priority (75 - 89)</span>
                <span className="font-mono font-bold text-slate-200 tabular-nums">
                  {data?.scoreDistribution.high75To89 || 0}
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full"
                  style={{ width: `${Math.min(100, ((data?.scoreDistribution.high75To89 || 0) / (m.totalLeads || 1)) * 100)}%` }}
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-blue-400 font-medium">Standard / Medium (50 - 74)</span>
                <span className="font-mono font-bold text-slate-200 tabular-nums">
                  {data?.scoreDistribution.medium50To74 || 0}
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-blue-500 h-full rounded-full"
                  style={{ width: `${Math.min(100, ((data?.scoreDistribution.medium50To74 || 0) / (m.totalLeads || 1)) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Pending Tasks & Follow-ups */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-semibold text-slate-200">Urgent Pending Follow-ups</h3>
              </div>
              <button
                onClick={() => onNavigateTab('tasks')}
                className="text-xs text-amber-400 hover:underline"
              >
                All Tasks ({m.pendingFollowups})
              </button>
            </div>

            <div className="space-y-2">
              {(data?.urgentTasks || []).length === 0 ? (
                <div className="text-center py-4 text-xs text-slate-500">All tasks up to date!</div>
              ) : (
                (data?.urgentTasks || []).map((t) => (
                  <div
                    key={t.id}
                    onClick={() => onNavigateTab('tasks')}
                    className="p-2.5 rounded bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 cursor-pointer text-xs transition-colors flex items-start justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="font-medium text-slate-200 truncate">{t.title}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Due: {new Date(t.dueDate).toLocaleDateString()}
                      </div>
                    </div>
                    {t.isAutomated && (
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-amber-400 shrink-0">
                        Auto
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Log */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-200">Real-Time CRM & Automation Audit Trail</h3>
          <span className="text-xs text-slate-500 font-mono">activity_logs table</span>
        </div>

        <div className="space-y-2">
          {(data?.recentActivities || []).map((act) => (
            <div
              key={act.id}
              className="p-3 bg-slate-950/40 border border-slate-800/60 rounded flex items-start justify-between gap-4 text-xs"
            >
              <div className="space-y-0.5 min-w-0">
                <div className="font-semibold text-slate-200">{act.title}</div>
                <div className="text-slate-400 text-[11px]">{act.description}</div>
              </div>
              <div className="text-[11px] font-mono text-slate-500 shrink-0 whitespace-nowrap">
                {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
