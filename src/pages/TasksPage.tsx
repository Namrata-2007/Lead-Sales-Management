import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Calendar,
  AlertTriangle,
  Clock,
  User,
  Trash2,
  CheckCircle2,
  Search,
  Filter,
  X,
  Sparkles
} from 'lucide-react';
import { Task, TaskPriority, TaskStatus, User as UserType } from '../types';
import { api } from '../api';

interface TasksPageProps {
  tasks: Task[];
  users: UserType[];
  loading: boolean;
  onRefresh: () => void;
  onShowToast: (type: 'success' | 'warning' | 'error' | 'info', message: string, title?: string) => void;
}

export const TasksPage: React.FC<TasksPageProps> = ({
  tasks,
  users,
  loading,
  onRefresh,
  onShowToast
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    assignedUserId: users[0]?.id || 'usr_sales_01',
    dueDate: new Date(Date.now() + 24 * 3600000).toISOString().split('T')[0],
    priority: 'medium' as TaskPriority
  });

  const filtered = tasks.filter((t) => {
    const q = search.toLowerCase();
    const matchQ = t.title.toLowerCase().includes(q) || (t.description && t.description.toLowerCase().includes(q));
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchQ && matchStatus;
  });

  const handleToggleStatus = async (task: Task) => {
    const nextStatus: TaskStatus = task.status === 'completed' ? 'in_progress' : 'completed';
    try {
      await api.updateTask(task.id, { status: nextStatus });
      onShowToast('success', `Task marked as ${nextStatus.replace('_', ' ')}.`);
      onRefresh();
    } catch (err: any) {
      onShowToast('error', err.message);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteTask(id);
      onShowToast('info', 'Task removed.');
      onRefresh();
    } catch (err: any) {
      onShowToast('error', err.message);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.dueDate) {
      onShowToast('error', 'Title and due date are required');
      return;
    }
    try {
      await api.createTask({
        ...form,
        dueDate: new Date(form.dueDate).toISOString()
      });
      onShowToast('success', 'Task created successfully');
      setShowAddModal(false);
      onRefresh();
      setForm({
        title: '',
        description: '',
        assignedUserId: users[0]?.id || 'usr_sales_01',
        dueDate: new Date(Date.now() + 24 * 3600000).toISOString().split('T')[0],
        priority: 'medium'
      });
    } catch (err: any) {
      onShowToast('error', err.message);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Tasks & Follow-up Actions</h2>
          <div className="text-xs text-slate-400 mt-0.5">
            Automated customer outreach tasks, survey inspections, and engineering milestones
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-md transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Task</span>
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded text-slate-200 placeholder-slate-500 focus:outline-hidden"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-xs bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-300"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>

      <div className="space-y-2.5">
        {filtered.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 p-12 text-center text-xs text-slate-500 rounded-lg">
            No tasks match your filters.
          </div>
        ) : (
          filtered.map((t) => {
            const isCompleted = t.status === 'completed';
            const isOverdue =
              t.status === 'overdue' ||
              (new Date(t.dueDate).getTime() < Date.now() && t.status !== 'completed');
            const assigned = users.find((u) => u.id === t.assignedUserId);

            return (
              <div
                key={t.id}
                className={`p-4 bg-slate-900 border rounded-lg flex items-start justify-between gap-4 transition-all ${
                  isCompleted
                    ? 'border-slate-800/50 opacity-60'
                    : isOverdue
                    ? 'border-rose-900/60 bg-rose-950/10'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <button
                    onClick={() => handleToggleStatus(t)}
                    className={`mt-0.5 p-1 rounded transition-colors ${
                      isCompleted ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <CheckCircle2 className={`w-5 h-5 ${isCompleted ? 'fill-emerald-500/20' : ''}`} />
                  </button>

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm font-semibold ${
                          isCompleted ? 'line-through text-slate-500' : 'text-slate-200'
                        }`}
                      >
                        {t.title}
                      </span>
                      {t.isAutomated && (
                        <span className="text-[10px] uppercase font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                          Automated
                        </span>
                      )}
                    </div>

                    {t.description && (
                      <p className="text-xs text-slate-400 whitespace-pre-line leading-relaxed max-w-3xl">
                        {t.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-1">
                      <span className="flex items-center gap-1 font-mono">
                        <Calendar className="w-3.5 h-3.5 text-slate-600" />
                        Due: {new Date(t.dueDate).toLocaleDateString()}
                      </span>
                      <span className="text-slate-700">·</span>
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-600" />
                        {assigned?.name || 'Assigned Rep'}
                      </span>
                      <span className="text-slate-700">·</span>
                      <span
                        className={`uppercase font-mono font-bold ${
                          t.priority === 'urgent'
                            ? 'text-rose-400'
                            : t.priority === 'high'
                            ? 'text-amber-400'
                            : 'text-slate-400'
                        }`}
                      >
                        {t.priority} Priority
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100">Create Task</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Follow up on civil shaft dimension drawing..."
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Description / Instructions</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 mb-1">Assignee</label>
                  <select
                    value={form.assignedUserId}
                    onChange={(e) => setForm({ ...form, assignedUserId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Priority</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value as TaskPriority })}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Due Date *</label>
                <input
                  type="date"
                  required
                  value={form.dueDate}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 font-mono"
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
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
