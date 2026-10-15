import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar, NavTab } from './components/Sidebar';
import { TopNav } from './components/TopNav';
import { ToastContainer, ToastMessage } from './components/Toast';
import { DashboardPage } from './pages/DashboardPage';
import { LeadsPage } from './pages/LeadsPage';
import { CustomersPage } from './pages/CustomersPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { QuotationsPage } from './pages/QuotationsPage';
import { TasksPage } from './pages/TasksPage';
import { MessagesPage } from './pages/MessagesPage';
import { AutomationPage } from './pages/AutomationPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { UsersPage } from './pages/UsersPage';
import { SettingsPage } from './pages/SettingsPage';
import { PublicLeadPortal } from './pages/PublicLeadPortal';
import { AuthPage } from './pages/AuthPage';
import {
  Lead,
  Customer,
  Project,
  Quotation,
  Task,
  Notification,
  EmailLog,
  WhatsAppMessage,
  AutomationWorkflow,
  AutomationLog,
  SystemSettings,
  DashboardData,
  User
} from './types';
import { api } from './api';

function MainLayout() {
  const { user, loading: authLoading } = useAuth();
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // State Entities
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [whatsappMessages, setWhatsappMessages] = useState<WhatsAppMessage[]>([]);
  const [workflows, setWorkflows] = useState<AutomationWorkflow[]>([]);
  const [automationLogs, setAutomationLogs] = useState<AutomationLog[]>([]);
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [teamUsers, setTeamUsers] = useState<User[]>([]);

  const [loading, setLoading] = useState(true);
  const [preselectedLeadForQuotation, setPreselectedLeadForQuotation] = useState<Lead | null>(null);

  const showToast = useCallback((type: 'success' | 'warning' | 'error' | 'info', message: string, title?: string) => {
    const newToast: ToastMessage = {
      id: `toast_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      type,
      message,
      title
    };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
    }, 5000);
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const loadAllData = useCallback(async () => {
    if (!user) return;
    try {
      const [
        dashRes,
        leadsRes,
        custRes,
        projRes,
        quotRes,
        taskRes,
        notifRes,
        emailRes,
        waRes,
        wfRes,
        autoLogRes,
        settRes,
        usersRes
      ] = await Promise.all([
        api.getDashboardAnalytics().catch(() => null),
        api.getLeads().then((r) => r.data).catch(() => []),
        api.getCustomers().catch(() => []),
        api.getProjects().catch(() => []),
        api.getQuotations().catch(() => []),
        api.getTasks().catch(() => []),
        api.getNotifications().catch(() => []),
        api.getEmailLogs().catch(() => []),
        api.getWhatsAppMessages().catch(() => []),
        api.getWorkflows().catch(() => []),
        api.getAutomationLogs().catch(() => []),
        api.getSettings().catch(() => null),
        api.getUsers().catch(() => [])
      ]);

      if (dashRes) setDashboardData(dashRes);
      setLeads(leadsRes);
      setCustomers(custRes);
      setProjects(projRes);
      setQuotations(quotRes);
      setTasks(taskRes);
      setNotifications(notifRes);
      setEmailLogs(emailRes);
      setWhatsappMessages(waRes);
      setWorkflows(wfRes);
      setAutomationLogs(autoLogRes);
      if (settRes) setSettings(settRes);
      setTeamUsers(usersRes);
    } catch (err: any) {
      console.error('Error refreshing application data:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadAllData();
      // Regular polling for real-time CRM updates
      const interval = setInterval(loadAllData, 15000);
      return () => clearInterval(interval);
    }
  }, [user, loadAllData]);

  // If viewing public lead portal
  if (currentTab === 'public-portal') {
    return (
      <>
        <PublicLeadPortal
          onBackToCRM={() => setCurrentTab('dashboard')}
          onShowToast={showToast}
        />
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </>
    );
  }

  // Not logged in
  if (!user && !authLoading) {
    return (
      <>
        <AuthPage onShowToast={showToast} />
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </>
    );
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-xs font-mono">
        Authenticating ElevateAI CRM...
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleCreateQuotationForLead = (lead: Lead) => {
    setPreselectedLeadForQuotation(lead);
    setCurrentTab('quotations');
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      showToast('info', 'All notifications marked as read.');
    } catch (err: any) {
      showToast('error', err.message);
    }
  };

  const getSectionTitle = (tab: NavTab) => {
    switch (tab) {
      case 'dashboard':
        return { title: 'Executive Overview', subtitle: 'Live Vertical Transportation Pipeline' };
      case 'leads':
        return { title: 'Lead Management & Kanban', subtitle: 'AI Scoring & Workload Routing' };
      case 'customers':
        return { title: 'Accounts & Portfolios', subtitle: 'Customer Engagement Timeline' };
      case 'projects':
        return { title: 'Elevator Installations', subtitle: 'Civil Shaft & Manufacturing Progress' };
      case 'quotations':
        return { title: 'Quotations & Proposals', subtitle: 'Itemized Mechanical Specifications' };
      case 'tasks':
        return { title: 'Tasks & Follow-ups', subtitle: 'Automated 24h & 72h Outreach Workflows' };
      case 'messages':
        return { title: 'Communications & Messaging', subtitle: 'Official WhatsApp Cloud & Resend Email' };
      case 'automation':
        return { title: 'Autonomous Workflow Engine', subtitle: 'n8n Webhook Architecture & Audit Logs' };
      case 'analytics':
        return { title: 'Commercial Analytics', subtitle: 'Real-time PostgreSQL Relational Query Data' };
      case 'users':
        return { title: 'Team Members & RBAC', subtitle: 'Role-Based Access Control' };
      case 'settings':
        return { title: 'System Configuration', subtitle: 'Branding, AI Provider & Webhook Endpoints' };
      default:
        return { title: 'ElevateAI CRM', subtitle: 'Workspace' };
    }
  };

  const { title, subtitle } = getSectionTitle(currentTab);

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          if (tab !== 'quotations') {
            setPreselectedLeadForQuotation(null);
          }
          setCurrentTab(tab);
        }}
        unreadCount={unreadCount}
      />

      {/* Main Viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopNav
          title={title}
          subtitle={subtitle}
          notifications={notifications}
          onRefreshData={loadAllData}
          onOpenNewLeadModal={() => setCurrentTab('leads')}
          onOpenNewQuotationModal={() => {
            setPreselectedLeadForQuotation(null);
            setCurrentTab('quotations');
          }}
          onNotificationClick={(n) => {
            if (n.link === '/leads') setCurrentTab('leads');
            else if (n.link === '/quotations') setCurrentTab('quotations');
            else if (n.link === '/messages') setCurrentTab('messages');
          }}
          onMarkAllRead={handleMarkAllRead}
        />

        <main className="flex-1 overflow-y-auto bg-slate-950">
          {currentTab === 'dashboard' && (
            <DashboardPage
              data={dashboardData}
              loading={loading}
              onNavigateTab={(tab) => setCurrentTab(tab)}
            />
          )}

          {currentTab === 'leads' && (
            <LeadsPage
              leads={leads}
              users={teamUsers}
              loading={loading}
              onRefresh={loadAllData}
              onCreateQuotationForLead={handleCreateQuotationForLead}
              onShowToast={showToast}
            />
          )}

          {currentTab === 'customers' && (
            <CustomersPage
              customers={customers}
              loading={loading}
              onRefresh={loadAllData}
              onShowToast={showToast}
            />
          )}

          {currentTab === 'projects' && (
            <ProjectsPage
              projects={projects}
              loading={loading}
              onRefresh={loadAllData}
              onShowToast={showToast}
            />
          )}

          {currentTab === 'quotations' && (
            <QuotationsPage
              quotations={quotations}
              loading={loading}
              onRefresh={loadAllData}
              onShowToast={showToast}
              preselectedLead={preselectedLeadForQuotation}
            />
          )}

          {currentTab === 'tasks' && (
            <TasksPage
              tasks={tasks}
              users={teamUsers}
              loading={loading}
              onRefresh={loadAllData}
              onShowToast={showToast}
            />
          )}

          {currentTab === 'messages' && (
            <MessagesPage
              emailLogs={emailLogs}
              whatsappMessages={whatsappMessages}
              settings={settings}
              loading={loading}
              onRefresh={loadAllData}
              onShowToast={showToast}
            />
          )}

          {currentTab === 'automation' && (
            <AutomationPage
              workflows={workflows}
              automationLogs={automationLogs}
              loading={loading}
              onRefresh={loadAllData}
              onShowToast={showToast}
            />
          )}

          {currentTab === 'analytics' && (
            <AnalyticsPage data={dashboardData} loading={loading} />
          )}

          {currentTab === 'users' && (
            <UsersPage
              users={teamUsers}
              loading={loading}
              onRefresh={loadAllData}
              onShowToast={showToast}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsPage
              settings={settings}
              loading={loading}
              onRefresh={loadAllData}
              onShowToast={showToast}
            />
          )}
        </main>
      </div>

      {/* Global Toast Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}
