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
      <div className="max-w-xl mx-auto px-4 py-16">
        <div className="bg-ink-900 border border-ink-border p-8 text-center">
          <div className="w-12 h-12 rounded-lg border border-rule bg-paper-inset flex items-center justify-center mx-auto mb-5">
            <Lock className="w-5 h-5 text-amber" />
          </div>
          <h2 className="text-xl font-semibold text-paper tracking-tight mb-2">Team & Project Management is Locked</h2>
          <p className="text-paper/70 text-sm max-w-lg mx-auto mb-6 leading-relaxed">
            You are currently on the <strong className="text-paper">{features.tier.toUpperCase()}</strong> tier. Upgrades happen
            in-place: no second account, no database migration, no lost history.
          </p>
          <div className="p-4 bg-ink-800 border border-ink-border text-left text-sm text-paper/80 space-y-2 mb-6">
            <div className="font-semibold flex items-center gap-1.5 text-amber">
              <Sparkles className="w-4 h-4 text-amber" />
              What Team Tier Unlocks (Section 5 & 11):
            </div>
            <p>• Multi-user workspace with 10–50 seats</p>
            <p>• Role-based permissions: Admin, Manager, Member</p>
            <p>• Project boards, task assignments, and time tracking</p>
            <p>• Delegated automation and shared activity visibility</p>
          </div>
          <button
            onClick={() => onUpgradeInPlace('team')}
            className="px-5 py-2.5 bg-amber hover:opacity-90 text-ink-950 text-sm font-semibold transition-colors"
          >
            Upgrade in-place to Team Tier
          </button>
        </div>
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
    { id: 'todo', label: 'To Do', accent: 'border-t-ink-muted' },
    { id: 'in_progress', label: 'In Progress', accent: 'border-t-amber' },
    { id: 'review', label: 'Under Review', accent: 'border-t-warn' },
    { id: 'done', label: 'Completed', accent: 'border-t-ok' },
  ];

  const priorityColors: Record<ProjectTask['priority'], string> = {
    low: 'bg-paper-inset text-ink-muted border-rule',
    medium: 'bg-warn-bg text-ink-text border-amber/30',
    high: 'bg-warn-bg text-ink-muted border-amber/40',
    critical: 'bg-danger-bg text-danger border-danger/40 font-bold',
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

  const fieldClass = 'w-full px-3 py-2 border border-rule bg-paper-raised text-ink-text text-sm placeholder:text-ink-muted/70 focus:outline-none focus:border-amber';
  const overlayClass = 'fixed inset-0 z-50 bg-ink-950/80 flex items-center justify-center p-4';
  const modalClass = 'bg-paper-raised max-w-md w-full p-6 border border-rule';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="bg-warn-bg border border-amber/30 p-3.5 flex items-start gap-3 text-sm text-ink-text">
        <Sparkles className="w-4 h-4 text-ink-muted shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold block text-ink-text">Team is the system of execution</span>
          <p className="text-ink-muted mt-0.5">
            Sprint boards, seat permissions, and task assignment. Work stays in one workspace when the tier changes.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-paper-raised p-5 border border-rule">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-ink-muted bg-warn-bg px-2 py-0.5 border border-amber/30">
              Team Tier Module Unlocked
            </span>
            <span className="text-sm text-ink-muted">• System of Execution: Multi-Seat Coordination</span>
          </div>
          <h1 className="text-xl font-semibold text-ink-text mt-1 tracking-tight">Projects & Team Coordination</h1>
          <p className="text-sm text-ink-muted">
            RBAC delegation, project sprints, task allocation, and active seat management.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex border border-rule p-1 bg-paper-inset text-sm">
            <button
              onClick={() => setActiveTab('board')}
              className={`px-3 py-1.5 font-medium transition-colors ${
                activeTab === 'board' ? 'bg-amber text-ink-950' : 'text-ink-muted hover:text-ink-text'
              }`}
            >
              Task Board ({tasks.length})
            </button>
            <button
              onClick={() => setActiveTab('members')}
              className={`px-3 py-1.5 font-medium transition-colors ${
                activeTab === 'members' ? 'bg-amber text-ink-950' : 'text-ink-muted hover:text-ink-text'
              }`}
            >
              Roster & Seats ({members.length}/{features.max_seats})
            </button>
          </div>

          <button
            onClick={() => setShowNewTaskModal(true)}
            className="px-3 py-1.5 bg-amber hover:opacity-90 text-ink-950 text-sm font-semibold flex items-center gap-1 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Task</span>
          </button>
          <button
            onClick={() => setShowInviteModal(true)}
            className="px-3 py-1.5 bg-paper hover:bg-paper-inset text-ink-text border border-rule text-sm font-medium flex items-center gap-1 transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Invite Member</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-paper-raised p-4 border border-rule">
          <div className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider flex items-center gap-1.5">
            <CheckSquare className="w-3.5 h-3.5 text-ok" />
            Completion Rate
          </div>
          <div className="text-xl font-semibold text-ink-text font-mono mt-1">
            {completionRate}%
          </div>
          <div className="text-[11px] text-ink-muted mt-0.5">{completedTasks} of {totalTasks} tasks finished</div>
        </div>

        <div className="bg-paper-raised p-4 border border-rule">
          <div className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-ink-muted" />
            Active Sprints
          </div>
          <div className="text-xl font-semibold text-ink-text font-mono mt-1">
            {inProgressTasks}
          </div>
          <div className="text-[11px] text-ink-muted mt-0.5">Tasks currently in execution</div>
        </div>

        <div className="bg-paper-raised p-4 border border-rule">
          <div className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-ok" />
            Hours Logged
          </div>
          <div className="text-xl font-semibold text-ink-text font-mono mt-1">
            {totalHours} hrs
          </div>
          <div className="text-[11px] text-ink-muted mt-0.5">Billable & internal execution</div>
        </div>

        <div className="bg-paper-raised p-4 border border-rule">
          <div className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-ink-muted" />
            Active Team Seats
          </div>
          <div className="text-xl font-semibold text-ink-text font-mono mt-1">
            {members.length} / {features.max_seats}
          </div>
          <div className="w-full bg-paper-inset h-1.5 overflow-hidden mt-1.5">
            <div
              className="quota-fill bg-amber h-full"
              style={{ width: `${Math.min(100, (members.length / features.max_seats) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 bg-paper-raised p-3 border border-rule">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-ink-muted absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks, descriptions, or assignees..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-rule bg-paper-raised text-ink-text placeholder:text-ink-muted/70 focus:outline-none focus:border-amber"
          />
        </div>

        {activeTab === 'board' && (
          <>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as any)}
              className="text-sm border border-rule px-2.5 py-2 text-ink-text bg-paper-raised"
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
              className="text-sm border border-rule px-2.5 py-2 text-ink-text bg-paper-raised"
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {statusColumns.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.id);

            return (
              <div
                key={col.id}
                className={`bg-paper-inset border border-rule p-3 flex flex-col border-t-[3px] ${col.accent}`}
              >
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-rule">
                  <span className="text-sm font-semibold text-ink-text">{col.label}</span>
                  <span className="text-[11px] font-mono text-ink-muted bg-paper-raised px-1.5 py-0.5 border border-rule">
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
                        className="bg-paper-raised border border-rule p-3 hover:border-amber/40 transition-colors text-left"
                      >
                        <div className="flex items-start justify-between gap-1 mb-1">
                          <span
                            className={`text-[10px] font-mono uppercase px-1.5 py-0.5 border ${
                              priorityColors[task.priority]
                            }`}
                          >
                            {task.priority}
                          </span>
                          {onDeleteTask && (
                            <button
                              onClick={() => onDeleteTask(task.id)}
                              className="text-ink-muted hover:text-danger transition-colors p-0.5"
                              title="Delete task"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>

                        <h4 className="text-sm font-semibold text-ink-text leading-snug mb-1">
                          {task.title}
                        </h4>

                        {task.description && (
                          <p className="text-[13px] text-ink-muted line-clamp-2 mb-2 leading-tight">
                            {task.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t border-rule text-[13px] text-ink-muted">
                          <span className="flex items-center gap-1 font-medium text-ink-text">
                            <UserCheck className="w-3 h-3 text-ink-muted" />
                            {task.assignee_name}
                          </span>
                          <span className="flex items-center gap-1 font-mono text-ink-muted">
                            <Clock className="w-3 h-3" />
                            {task.time_spent_hours}h
                          </span>
                        </div>

                        <div className="mt-2.5 pt-2 border-t border-rule flex items-center justify-between gap-1">
                          <div className="flex items-center gap-1">
                            {onAddTimeSpent && (
                              <>
                                <button
                                  onClick={() => onAddTimeSpent(task.id, 1)}
                                  className="text-[11px] text-ink-muted hover:text-ink-text font-mono px-1.5 py-0.5 border border-rule hover:bg-warn-bg transition-colors"
                                  title="Add 1 hour logged"
                                >
                                  +1h
                                </button>
                                <button
                                  onClick={() => onAddTimeSpent(task.id, 2)}
                                  className="text-[11px] text-ink-muted hover:text-ink-text font-mono px-1.5 py-0.5 border border-rule hover:bg-warn-bg transition-colors"
                                  title="Add 2 hours logged"
                                >
                                  +2h
                                </button>
                              </>
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            {prevStatus && onUpdateTaskStatus && (
                              <button
                                onClick={() => onUpdateTaskStatus(task.id, prevStatus)}
                                className="text-[11px] text-ink-muted hover:text-ink-text p-1 hover:bg-paper-inset"
                                title={`Move back to ${prevStatus}`}
                              >
                                <ChevronLeft className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {nextStatus && onUpdateTaskStatus && (
                              <button
                                onClick={() => onUpdateTaskStatus(task.id, nextStatus)}
                                className="text-[11px] text-ink-text font-medium flex items-center gap-0.5 px-1.5 py-0.5 bg-paper-inset hover:bg-amber hover:text-ink-950"
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
                    <div className="text-center py-8 text-[13px] text-ink-muted border border-dashed border-rule">
                      No tasks in {col.label}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-paper-raised border border-rule p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-rule">
            <div>
              <h3 className="text-lg font-semibold text-ink-text tracking-tight">Workspace Member Roster</h3>
              <p className="text-sm text-ink-muted">
                Seat limits and access scopes are bound to workspace tier configuration.
              </p>
            </div>
            <button
              onClick={() => setShowInviteModal(true)}
              className="px-3 py-1.5 bg-amber hover:opacity-90 text-ink-950 text-sm font-semibold flex items-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Invite Teammate
            </button>
          </div>

          <div className="divide-y divide-rule">
            {members.map((member) => (
              <div key={member.id} className="py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-amber text-ink-950 font-bold text-xs flex items-center justify-center border border-ink-border font-mono">
                    {member.avatar || member.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-ink-text flex items-center gap-2">
                      {member.name}
                      {member.status === 'invited' && (
                        <span className="text-[10px] font-mono text-ink-muted bg-warn-bg px-1.5 py-0.5 border border-amber/30">
                          Invite Pending
                        </span>
                      )}
                    </div>
                    <div className="text-[13px] text-ink-muted font-mono">{member.email}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`text-[11px] font-mono uppercase px-2 py-0.5 border font-semibold ${
                      member.role === 'admin'
                        ? 'bg-danger-bg text-danger border-danger/40'
                        : member.role === 'manager'
                        ? 'bg-warn-bg text-ink-muted border-amber/40'
                        : 'bg-paper-inset text-ink-muted border-rule'
                    }`}
                  >
                    {member.role}
                  </span>
                  <button
                    onClick={() => onTriggerAction(`Audit task allocation and review recent activities for ${member.name}`)}
                    className="text-sm text-ink-muted hover:text-ink-text font-medium px-2 py-1 hover:bg-warn-bg"
                  >
                    Audit Workload
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showNewTaskModal && (
        <div className={overlayClass}>
          <div className={modalClass}>
            <div className="flex items-center justify-between pb-3 border-b border-rule mb-4">
              <h3 className="text-lg font-semibold text-ink-text tracking-tight">Create New Project Task</h3>
              <button onClick={() => setShowNewTaskModal(false)} className="text-ink-muted hover:text-ink-text">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3 text-sm">
              <div>
                <label className="block font-medium text-ink-text mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Implement ISO compliance residency check"
                  className={fieldClass}
                />
              </div>
              <div>
                <label className="block font-medium text-ink-text mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Details, acceptance criteria, or links..."
                  className={fieldClass}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-ink-text mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className={fieldClass}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-ink-text mb-1">Assignee</label>
                  <select
                    value={newAssignee}
                    onChange={(e) => setNewAssignee(e.target.value)}
                    className={fieldClass}
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
                <label className="block font-medium text-ink-text mb-1">Target Due Date</label>
                <input
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className={fieldClass}
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-rule">
                <button
                  type="button"
                  onClick={() => setShowNewTaskModal(false)}
                  className="px-3 py-1.5 text-ink-muted hover:text-ink-text"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber hover:opacity-90 text-ink-950 font-semibold"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showInviteModal && (
        <div className={overlayClass}>
          <div className={modalClass}>
            <div className="flex items-center justify-between pb-3 border-b border-rule mb-4">
              <h3 className="text-lg font-semibold text-ink-text tracking-tight">Invite Team Member</h3>
              <button onClick={() => setShowInviteModal(false)} className="text-ink-muted hover:text-ink-text">
                <X className="w-4 h-4" />
              </button>
            </div>
            {inviteError && (
              <div className="p-3 mb-3 bg-danger-bg border border-danger/40 text-sm text-danger">
                {inviteError}
              </div>
            )}
            <form onSubmit={handleInvite} className="space-y-3 text-sm">
              <div>
                <label className="block font-medium text-ink-text mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="e.g. Liam Vance"
                  className={fieldClass}
                />
              </div>
              <div>
                <label className="block font-medium text-ink-text mb-1">Work Email Address *</label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="liam@apexhorizon.io"
                  className={fieldClass}
                />
              </div>
              <div>
                <label className="block font-medium text-ink-text mb-1">Workspace RBAC Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className={fieldClass}
                >
                  <option value="member">Member (Can execute assigned tasks)</option>
                  <option value="manager">Manager (Can approve safe & medium risk actions)</option>
                  <option value="admin">Admin (Full approval & configuration governance)</option>
                </select>
              </div>
              <div className="p-2.5 bg-paper-inset border border-rule text-[13px] text-ink-muted">
                Current seats allocated: <strong className="text-ink-text">{members.length} / {features.max_seats}</strong>.
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-rule">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-3 py-1.5 text-ink-muted hover:text-ink-text"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber hover:opacity-90 text-ink-950 font-semibold"
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
