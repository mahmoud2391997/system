import React, { useState } from 'react';
import {
  CheckSquare,
  Users,
  Clock,
  Plus,
  Lock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Calendar,
  UserCheck,
  Search,
  Filter,
  Trash2,
  ChevronRight,
  ChevronLeft,
  X,
  UserPlus,
  Shield,
  Activity,
  Flame,
} from 'lucide-react';
import { ProjectTask, WorkspaceMember, WorkspaceFeatures } from '../types';

interface TeamViewProps {
  features: WorkspaceFeatures;
  tasks: ProjectTask[];
  members: WorkspaceMember[];
  onUpgradeInPlace: (targetTier: 'team') => void;
  onCreateTask: (task: { title: string; description?: string; priority: ProjectTask['priority']; assignee_name: string; due_date?: string }) => void;
  onTriggerAction: (prompt: string) => void;
  onUpdateTaskStatus?: (taskId: string, status: ProjectTask['status']) => Promise<void>;
  onAddTimeSpent?: (taskId: string, hours: number) => Promise<void>;
  onDeleteTask?: (taskId: string) => Promise<void>;
  onInviteMember?: (member: { name: string; email: string; role: WorkspaceMember['role'] }) => Promise<void>;
}

export const TeamView: React.FC<TeamViewProps> = ({
  features,
  tasks,
  members,
  onUpgradeInPlace,
  onCreateTask,
  onTriggerAction,
  onUpdateTaskStatus,
  onAddTimeSpent,
  onDeleteTask,
  onInviteMember,
}) => {
  const [activeTab, setActiveTab] = useState<'board' | 'members'>('board');
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'all' | ProjectTask['priority']>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<'all' | string>('all');

  // Modals
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  // New task form state
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPriority, setNewPriority] = useState<ProjectTask['priority']>('medium');
  const [newAssignee, setNewAssignee] = useState(members[0]?.name || 'Sarah Chen');
  const [newDueDate, setNewDueDate] = useState('2026-09-30');

  // Invite member form state
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<WorkspaceMember['role']>('member');
  const [inviteError, setInviteError] = useState<string | null>(null);

  if (!features.team_enabled) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto mb-5 text-slate-400">
          <Lock className="w-8 h-8 text-slate-500" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Team & Project Management is Locked</h2>
        <p className="text-slate-600 text-sm max-w-lg mx-auto mb-6 leading-relaxed">
          You are currently on the <strong>{features.tier.toUpperCase()}</strong> tier. Upgrades happen
          in-place: no second account, no database migration, no lost history.
        </p>
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl max-w-md mx-auto mb-6 text-left text-xs text-purple-900 space-y-2">
          <div className="font-semibold flex items-center gap-1.5 text-purple-950">
            <Sparkles className="w-4 h-4 text-purple-600" />
            What Team Tier Unlocks (Section 5 & 11):
          </div>
          <p>• Multi-user workspace with 10–50 seats</p>
          <p>• Role-based permissions: Admin, Manager, Member</p>
          <p>• Project boards, task assignments, and time tracking</p>
          <p>• Delegated automation and shared activity visibility</p>
        </div>
        <button
          onClick={() => onUpgradeInPlace('team')}
          className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
        >
          Upgrade in-place to Team Tier
        </button>
      </div>
    );
  }

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onCreateTask({
      title: newTitle,
      description: newDescription,
      priority: newPriority,
      assignee_name: newAssignee,
      due_date: newDueDate,
    });
    setNewTitle('');
    setNewDescription('');
    setShowNewTaskModal(false);
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError(null);
    if (!inviteName.trim() || !inviteEmail.trim()) return;

    if (members.length >= features.max_seats) {
      setInviteError(`Seat limit reached (${features.max_seats} seats on ${features.tier.toUpperCase()} tier). Upgrade tier for more seats.`);
      return;
    }

    if (onInviteMember) {
      await onInviteMember({
        name: inviteName,
        email: inviteEmail,
        role: inviteRole,
      });
    }
    setInviteName('');
    setInviteEmail('');
    setShowInviteModal(false);
  };

  const statusColumns: { id: ProjectTask['status']; label: string; accent: string }[] = [
    { id: 'todo', label: 'To Do', accent: 'border-t-slate-400' },
    { id: 'in_progress', label: 'In Progress', accent: 'border-t-blue-500' },
    { id: 'review', label: 'Under Review', accent: 'border-t-purple-500' },
    { id: 'done', label: 'Completed', accent: 'border-t-emerald-500' },
  ];

  const priorityColors: Record<ProjectTask['priority'], string> = {
    low: 'bg-slate-100 text-slate-700 border-slate-200',
    medium: 'bg-blue-50 text-blue-800 border-blue-200',
    high: 'bg-amber-50 text-amber-800 border-amber-200',
    critical: 'bg-red-50 text-red-800 border-red-200 font-bold',
  };

  // Metrics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'done').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress').length;
  const totalHours = Math.round(tasks.reduce((acc, t) => acc + (t.time_spent_hours || 0), 0) * 10) / 10;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Filtered tasks
  const filteredTasks = tasks.filter((t) => {
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
    if (assigneeFilter !== 'all' && t.assignee_name !== assigneeFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q)) ||
        (t.assignee_name && t.assignee_name.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
              Team Tier Module Unlocked
            </span>
            <span className="text-xs text-slate-600">• System of Execution: Multi-Seat Coordination</span>
          </div>
          <h1 className="text-lg font-bold text-slate-900 mt-1">Projects & Team Coordination</h1>
          <p className="text-xs text-slate-600">
            RBAC delegation, project sprints, task allocation, and active seat management.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-lg border border-slate-200 p-1 bg-slate-50 text-xs">
            <button
              onClick={() => setActiveTab('board')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeTab === 'board' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Task Board ({tasks.length})
            </button>
            <button
              onClick={() => setActiveTab('members')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeTab === 'members' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Roster & Seats ({members.length}/{features.max_seats})
            </button>
          </div>

          <button
            onClick={() => setShowNewTaskModal(true)}
            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Task</span>
          </button>
          <button
            onClick={() => setShowInviteModal(true)}
            className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Invite Member</span>
          </button>
        </div>
      </div>

      {/* KPI Workload Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <CheckSquare className="w-3.5 h-3.5 text-purple-600" />
            Completion Rate
          </div>
          <div className="text-xl font-bold text-purple-600 font-mono mt-1">
            {completionRate}%
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">{completedTasks} of {totalTasks} tasks finished</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-blue-600" />
            Active Sprints
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono mt-1">
            {inProgressTasks}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Tasks currently in execution</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-emerald-600" />
            Hours Logged
          </div>
          <div className="text-xl font-bold text-emerald-600 font-mono mt-1">
            {totalHours} hrs
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Billable & internal execution</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-indigo-600" />
            Active Team Seats
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono mt-1">
            {members.length} / {features.max_seats}
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1.5">
            <div
              className="bg-indigo-600 h-full rounded-full"
              style={{ width: `${Math.min(100, (members.length / features.max_seats) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks, descriptions, or assignees..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>

        {activeTab === 'board' && (
          <>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as any)}
              className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 bg-white"
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <select
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 bg-white"
            >
              <option value="all">All Assignees</option>
              {members.map((m) => (
                <option key={m.id} value={m.name}>
                  {m.name}
                </option>
              ))}
            </select>
          </>
        )}
      </div>

      {activeTab === 'board' ? (
        /* Task Kanban Columns */
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {statusColumns.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.id);

            return (
              <div
                key={col.id}
                className={`bg-slate-50/70 rounded-xl border border-slate-200 p-3 flex flex-col border-t-4 ${col.accent}`}
              >
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200">
                  <span className="text-xs font-bold text-slate-800">{col.label}</span>
                  <span className="text-[11px] font-mono text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                    {colTasks.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1">
                  {colTasks.map((task) => {
                    const statusSequence: ProjectTask['status'][] = ['todo', 'in_progress', 'review', 'done'];
                    const currentIndex = statusSequence.indexOf(task.status);
                    const prevStatus = currentIndex > 0 ? statusSequence[currentIndex - 1] : null;
                    const nextStatus = currentIndex < statusSequence.length - 1 ? statusSequence[currentIndex + 1] : null;

                    return (
                      <div
                        key={task.id}
                        className="bg-white rounded-lg border border-slate-200 p-3 shadow-xs hover:shadow-sm transition-shadow text-left"
                      >
                        <div className="flex items-start justify-between gap-1 mb-1">
                          <span
                            className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border ${
                              priorityColors[task.priority]
                            }`}
                          >
                            {task.priority}
                          </span>
                          {onDeleteTask && (
                            <button
                              onClick={() => onDeleteTask(task.id)}
                              className="text-slate-300 hover:text-red-600 transition-colors p-0.5"
                              title="Delete task"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>

                        <h4 className="text-xs font-semibold text-slate-900 leading-snug mb-1">
                          {task.title}
                        </h4>

                        {task.description && (
                          <p className="text-[11px] text-slate-500 line-clamp-2 mb-2 leading-tight">
                            {task.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                          <span className="flex items-center gap-1 font-medium text-slate-700">
                            <UserCheck className="w-3 h-3 text-slate-400" />
                            {task.assignee_name}
                          </span>
                          <span className="flex items-center gap-1 font-mono text-slate-600">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {task.time_spent_hours}h
                          </span>
                        </div>

                        {/* Interactive Task Actions: Time Logging & Column Move */}
                        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
                          {/* Quick Time Tracker */}
                          <div className="flex items-center gap-1">
                            {onAddTimeSpent && (
                              <>
                                <button
                                  onClick={() => onAddTimeSpent(task.id, 1)}
                                  className="text-[10px] text-slate-600 hover:text-purple-700 font-mono px-1.5 py-0.5 rounded border border-slate-200 hover:bg-purple-50 transition-colors"
                                  title="Add 1 hour logged"
                                >
                                  +1h
                                </button>
                                <button
                                  onClick={() => onAddTimeSpent(task.id, 2)}
                                  className="text-[10px] text-slate-600 hover:text-purple-700 font-mono px-1.5 py-0.5 rounded border border-slate-200 hover:bg-purple-50 transition-colors"
                                  title="Add 2 hours logged"
                                >
                                  +2h
                                </button>
                              </>
                            )}
                          </div>

                          {/* Column status jump */}
                          <div className="flex items-center gap-1">
                            {prevStatus && onUpdateTaskStatus && (
                              <button
                                onClick={() => onUpdateTaskStatus(task.id, prevStatus)}
                                className="text-[10px] text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-100"
                                title={`Move back to ${prevStatus}`}
                              >
                                <ChevronLeft className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {nextStatus && onUpdateTaskStatus && (
                              <button
                                onClick={() => onUpdateTaskStatus(task.id, nextStatus)}
                                className="text-[10px] text-purple-700 hover:text-purple-900 font-medium flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-purple-50 hover:bg-purple-100"
                              >
                                Move <ChevronRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {colTasks.length === 0 && (
                    <div className="text-center py-8 text-[11px] text-slate-400 border border-dashed border-slate-200 rounded-lg">
                      No tasks in {col.label}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Team Members & Roster Directory */
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Workspace Member Roster</h3>
              <p className="text-xs text-slate-500">
                Seat limits and access scopes are bound to workspace tier configuration.
              </p>
            </div>
            <button
              onClick={() => setShowInviteModal(true)}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Invite Teammate
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {members.map((member) => (
              <div key={member.id} className="py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-800 font-bold text-xs flex items-center justify-center border border-purple-200">
                    {member.avatar || member.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                      {member.name}
                      {member.status === 'invited' && (
                        <span className="text-[10px] font-mono text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                          Invite Pending
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500">{member.email}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`text-[11px] font-mono uppercase px-2 py-0.5 rounded border font-semibold ${
                      member.role === 'admin'
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : member.role === 'manager'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {member.role}
                  </span>
                  <button
                    onClick={() => onTriggerAction(`Audit task allocation and review recent activities for ${member.name}`)}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium px-2 py-1 rounded hover:bg-indigo-50"
                  >
                    Audit Workload
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Task Modal */}
      {showNewTaskModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">Create New Project Task</h3>
              <button onClick={() => setShowNewTaskModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Implement ISO compliance residency check"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Details, acceptance criteria, or links..."
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assignee</label>
                  <select
                    value={newAssignee}
                    onChange={(e) => setNewAssignee(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300"
                  >
                    {members.map((m) => (
                      <option key={m.id} value={m.name}>
                        {m.name} ({m.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Due Date</label>
                <input
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewTaskModal(false)}
                  className="px-3 py-1.5 text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invite Teammate Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">Invite Team Member</h3>
              <button onClick={() => setShowInviteModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            {inviteError && (
              <div className="p-3 mb-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800">
                {inviteError}
              </div>
            )}
            <form onSubmit={handleInvite} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="e.g. Liam Vance"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Work Email Address *</label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="liam@apexhorizon.io"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Workspace RBAC Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300"
                >
                  <option value="member">Member (Can execute assigned tasks)</option>
                  <option value="manager">Manager (Can approve safe & medium risk actions)</option>
                  <option value="admin">Admin (Full approval & configuration governance)</option>
                </select>
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600">
                Current seats allocated: <strong>{members.length} / {features.max_seats}</strong>.
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-3 py-1.5 text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
