import React, { useState } from 'react';
import {
  Cpu,
  Play,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  Settings2,
  RefreshCw,
  ExternalLink,
  Zap,
  Activity
} from 'lucide-react';
import { AutomationWorkflow, AutomationLog } from '../types';
import { api } from '../api';

interface AutomationPageProps {
  workflows: AutomationWorkflow[];
  automationLogs: AutomationLog[];
  loading: boolean;
  onRefresh: () => void;
  onShowToast: (type: 'success' | 'warning' | 'error' | 'info', message: string, title?: string) => void;
}

export const AutomationPage: React.FC<AutomationPageProps> = ({
  workflows,
  automationLogs,
  loading,
  onRefresh,
  onShowToast
}) => {
  const [isRunningAudit, setIsRunningAudit] = useState(false);

  const handleToggleWorkflow = async (workflow: AutomationWorkflow) => {
    try {
      await api.updateWorkflow(workflow.id, { isActive: !workflow.isActive });
      onShowToast(
        'success',
        `Workflow "${workflow.name}" is now ${!workflow.isActive ? 'Active' : 'Disabled'}.`
      );
      onRefresh();
    } catch (err: any) {
      onShowToast('error', err.message);
    }
  };

  const handleRunEscalationAudit = async () => {
    setIsRunningAudit(true);
    try {
      const res = await api.runEscalationTest();
      onShowToast(
        'success',
        `Audited ${res.checked} leads. Escalated ${res.escalated} inactive lead(s) to sales managers.`,
        'Escalation Engine Executed'
      );
      onRefresh();
    } catch (err: any) {
      onShowToast('error', err.message);
    } finally {
      setIsRunningAudit(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Automation Engine & Workflows</h2>
          <div className="text-xs text-slate-400 mt-0.5">
            n8n webhooks and background orchestration for the CAPTURE → SCORE → ASSIGN → FOLLOW UP loop
          </div>
        </div>

        <button
          onClick={handleRunEscalationAudit}
          disabled={isRunningAudit}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-md transition-colors"
        >
          <Play className={`w-3.5 h-3.5 fill-current ${isRunningAudit ? 'animate-spin' : ''}`} />
          <span>{isRunningAudit ? 'Auditing Inactive Leads...' : 'Run Escalation Audit Now'}</span>
        </button>
      </div>

      {/* Workflows Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {workflows.map((wf) => (
          <div
            key={wf.id}
            className={`p-5 rounded-lg border transition-all space-y-4 flex flex-col justify-between ${
              wf.isActive
                ? 'bg-slate-900 border-slate-800 hover:border-slate-700'
                : 'bg-slate-900/50 border-slate-800/40 opacity-70'
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Zap className={`w-4 h-4 ${wf.isActive ? 'text-amber-400' : 'text-slate-500'}`} />
                  <span className="text-xs font-mono text-slate-400 uppercase font-semibold">
                    {wf.triggerEvent}
                  </span>
                </div>

                {/* Enable/Disable Toggle */}
                <button
                  onClick={() => handleToggleWorkflow(wf)}
                  className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded transition-colors ${
                    wf.isActive
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : 'bg-slate-800 text-slate-500 border border-slate-700'
                  }`}
                >
                  {wf.isActive ? 'ACTIVE' : 'DISABLED'}
                </button>
              </div>

              <h3 className="text-sm font-bold text-slate-100">{wf.name}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{wf.description}</p>
            </div>

            <div className="pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs font-mono">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">Runs:</span>
                <span className="text-slate-200 font-bold tabular-nums">{wf.executionCount} Success</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">Failures:</span>
                <span className="text-slate-200 font-bold tabular-nums">{wf.failureCount}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Execution Logs */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-slate-200">Live Automation Execution Logs</h3>
          </div>
          <span className="text-xs font-mono text-slate-500">automation_logs table</span>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
          {automationLogs.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">No automation logs recorded yet.</div>
          ) : (
            automationLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 bg-slate-950 border border-slate-800/80 rounded text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded ${
                        log.status === 'success'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50'
                          : 'bg-rose-950 text-rose-400 border border-rose-800/50'
                      }`}
                    >
                      {log.status}
                    </span>
                    <span className="font-semibold text-slate-200">{log.workflowName}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
                <div className="text-slate-300 font-medium pt-0.5">{log.actionTaken}</div>
                <div className="text-slate-500 text-[11px]">{log.details}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
