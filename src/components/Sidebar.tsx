import React from 'react';
import {
  LayoutDashboard,
  Filter,
  Users,
  Building2,
  FileSpreadsheet,
  CheckSquare,
  MessageSquare,
  Cpu,
  BarChart3,
  UserCheck,
  Settings,
  ExternalLink,
  LogOut,
  Layers,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

export type NavTab =
  | 'dashboard'
  | 'leads'
  | 'customers'
  | 'projects'
  | 'quotations'
  | 'tasks'
  | 'messages'
  | 'automation'
  | 'analytics'
  | 'users'
  | 'settings'
  | 'public-portal';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  unreadCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab, unreadCount = 0 }) => {
  const { user, logout, switchDemoRole } = useAuth();

  const navItems = [
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'leads' as NavTab, label: 'Leads & Pipeline', icon: Filter },
    { id: 'customers' as NavTab, label: 'Customers', icon: Users },
    { id: 'projects' as NavTab, label: 'Projects', icon: Building2 },
    { id: 'quotations' as NavTab, label: 'Quotations', icon: FileSpreadsheet },
    { id: 'tasks' as NavTab, label: 'Tasks & Follow-ups', icon: CheckSquare },
    { id: 'messages' as NavTab, label: 'Communications', icon: MessageSquare },
    { id: 'automation' as NavTab, label: 'Automation & n8n', icon: Cpu },
    { id: 'analytics' as NavTab, label: 'Analytics', icon: BarChart3 },
    ...(user?.role === 'admin' || user?.role === 'sales_manager'
      ? [{ id: 'users' as NavTab, label: 'Team & Roles', icon: UserCheck }]
      : []),
    { id: 'settings' as NavTab, label: 'Settings', icon: Settings }
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
            <Layers className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="font-bold text-slate-100 text-sm tracking-tight leading-tight">ElevateAI CRM</div>
            <div className="text-xs text-slate-400">Vertical Systems SaaS</div>
          </div>
        </div>
      </div>

      {/* Public Form Quick Launcher */}
      <div className="px-3 pt-3">
        <button
          onClick={() => onSelectTab('public-portal')}
          className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-md transition-colors border ${
            currentTab === 'public-portal'
              ? 'bg-amber-500/10 text-amber-400 border-amber-500/40'
              : 'bg-slate-950/60 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5" />
            Public Lead Intake Form
          </span>
          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">Live</span>
        </button>
      </div>

      {/* Main Navigation Items */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-3 py-1">CRM Core</div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                isActive
                  ? 'bg-slate-800 text-amber-400 font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.id === 'tasks' && unreadCount > 0 && (
                <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded">
                  {unreadCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Demo Role Switcher */}
      <div className="p-3 mx-3 mb-2 bg-slate-950/60 border border-slate-800 rounded-lg text-xs">
        <div className="text-[11px] text-slate-400 mb-1.5 font-medium flex items-center justify-between">
          <span>Active Role</span>
          <span className="font-mono text-amber-400 uppercase text-[10px]">{user?.role.replace('_', ' ')}</span>
        </div>
        <div className="grid grid-cols-2 gap-1">
          {(['admin', 'sales_manager', 'salesperson', 'support'] as UserRole[]).map((r) => (
            <button
              key={r}
              onClick={() => switchDemoRole(r)}
              className={`px-1.5 py-1 rounded text-[10px] font-medium transition-colors text-center truncate ${
                user?.role === r
                  ? 'bg-slate-800 text-amber-300 border border-amber-500/30'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900'
              }`}
            >
              {r === 'sales_manager' ? 'Manager' : r === 'salesperson' ? 'Sales' : r === 'support' ? 'Support' : 'Admin'}
            </button>
          ))}
        </div>
      </div>

      {/* Current User & Logout */}
      <div className="p-3 border-t border-slate-800 flex items-center justify-between bg-slate-900/80">
        <div className="flex items-center gap-2.5 min-w-0">
          <img
            src={user?.avatar || '/src/assets/images/avatar_sales_manager_1792035800746.jpg'}
            alt={user?.name || 'User'}
            referrerPolicy="no-referrer"
            className="w-8 h-8 rounded-full object-cover border border-slate-700 shrink-0"
          />
          <div className="min-w-0">
            <div className="text-xs font-semibold text-slate-200 truncate">{user?.name}</div>
            <div className="text-[11px] text-slate-500 truncate">{user?.email}</div>
          </div>
        </div>
        <button
          onClick={logout}
          title="Sign out"
          className="text-slate-500 hover:text-rose-400 p-1.5 rounded transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
