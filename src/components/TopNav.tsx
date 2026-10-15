import React, { useState } from 'react';
import { Bell, Plus, RefreshCw, CheckCircle2, AlertTriangle, AlertCircle, Info, ChevronDown } from 'lucide-react';
import { Notification } from '../types';
import { api } from '../api';

interface TopNavProps {
  title: string;
  subtitle?: string;
  notifications: Notification[];
  onRefreshData?: () => void;
  onOpenNewLeadModal?: () => void;
  onOpenNewQuotationModal?: () => void;
  onNotificationClick?: (n: Notification) => void;
  onMarkAllRead?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  title,
  subtitle,
  notifications,
  onRefreshData,
  onOpenNewLeadModal,
  onOpenNewQuotationModal,
  onNotificationClick,
  onMarkAllRead
}) => {
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const unreadList = notifications.filter((n) => !n.isRead);

  return (
    <header className="h-14 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between gap-8 shrink-0 z-30">
      {/* Zone 1: Contextual Title & Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <h1 className="text-sm font-bold text-slate-100 whitespace-nowrap tracking-tight">{title}</h1>
        {subtitle && (
          <>
            <span className="text-slate-600 text-xs" aria-hidden="true">·</span>
            <span className="text-xs text-slate-400 truncate">{subtitle}</span>
          </>
        )}
      </div>

      {/* Zone 2 & 3: Actions & Notifications */}
      <div className="flex items-center gap-3 shrink-0">
        {onRefreshData && (
          <button
            onClick={onRefreshData}
            title="Refresh CRM data"
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="relative p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadList.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500" />
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-lg shadow-2xl py-2 z-50">
              <div className="px-3 py-2 border-b border-slate-800 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200">System Notifications</span>
                {unreadList.length > 0 && onMarkAllRead && (
                  <button
                    onClick={onMarkAllRead}
                    className="text-[11px] text-amber-400 hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/60">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500">No recent notifications</div>
                ) : (
                  notifications.slice(0, 6).map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        onNotificationClick?.(n);
                        setShowNotifMenu(false);
                      }}
                      className={`p-3 text-xs cursor-pointer hover:bg-slate-800/60 transition-colors ${
                        !n.isRead ? 'bg-amber-500/5' : ''
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {n.type === 'urgent' && <AlertTriangle className="w-3.5 h-3.5 text-rose-400 mt-0.5 shrink-0" />}
                        {n.type === 'success' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />}
                        {n.type === 'warning' && <AlertCircle className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />}
                        {n.type === 'info' && <Info className="w-3.5 h-3.5 text-blue-400 mt-0.5 shrink-0" />}
                        <div className="flex-1 min-w-0">
                          <div className={`font-medium ${!n.isRead ? 'text-slate-100' : 'text-slate-300'}`}>
                            {n.title}
                          </div>
                          <div className="text-slate-400 text-[11px] mt-0.5 line-clamp-2">{n.message}</div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Primary Action Buttons */}
        {onOpenNewQuotationModal && (
          <button
            onClick={onOpenNewQuotationModal}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-md transition-colors whitespace-nowrap shrink-0 border border-slate-700"
          >
            <Plus className="w-3.5 h-3.5 text-slate-400" />
            <span>Create Quote</span>
          </button>
        )}

        {onOpenNewLeadModal && (
          <button
            onClick={onOpenNewLeadModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-md transition-colors whitespace-nowrap shrink-0 font-semibold shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Inbound Lead</span>
          </button>
        )}
      </div>
    </header>
  );
};
