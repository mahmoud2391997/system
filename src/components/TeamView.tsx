import React, { useEffect, useMemo, useState } from 'react';
import { Building2, CheckSquare, Lock, Plus, Search, Users } from 'lucide-react';
import {
  TeamCatalog,
  TeamDepartment,
  TeamEmployee,
  TeamInvitation,
  TeamMemberAccount,
  TeamNotification,
  TeamRoleDefinition,
  TeamTask,
  WorkspaceFeatures,
} from '../types';
import {
  EMPLOYEE_STATUSES,
  STATUS_LABEL,
  TEAM_PERMISSIONS,
  TEAM_PRIORITIES,
  TEAM_STATUSES,
} from '../teamCatalog';

interface TeamViewProps {
  features: WorkspaceFeatures;
  catalog: TeamCatalog;
  onUpgradeInPlace: (targetTier: 'team') => void;
}

type Section = 'dashboard' | 'employees' | 'departments' | 'tasks' | 'members' | 'roles' | 'settings' | 'profile' | 'notifications' | 'create-team';
type TaskScope = 'all' | 'mine' | 'created';

const SECTION_GROUPS: { label: string; items: { id: Section; label: string }[] }[] = [
  {
    label: 'Main',
    items: [
      { id: 'dashboard', label: 'Dashboard' },
      { id: 'employees', label: 'Employees' },
      { id: 'departments', label: 'Departments' },
      { id: 'tasks', label: 'Tasks' },
    ],
  },
  {
    label: 'Team',
    items: [
      { id: 'members', label: 'Members' },
      { id: 'roles', label: 'Roles & Permissions' },
      { id: 'settings', label: 'Settings' },
    ],
  },
  {
    label: 'Account',
    items: [
      { id: 'profile', label: 'Profile' },
      { id: 'notifications', label: 'Notifications' },
      { id: 'create-team', label: 'Create Team' },
    ],
  },
];

const SECTION_COPY: Record<Section, string> = {
  dashboard: "Welcome back! Here's an overview of your team.",
  employees: 'Manage your team members and their assignments',
  departments: 'Manage your organizational departments',
  tasks: 'Manage and track team tasks',
  members: 'Invite and manage your team members',
  roles: 'View your role and permissions',
  settings: 'Manage your team',
  profile: 'View your account details and reset your password',
  notifications: 'All caught up',
  'create-team': 'Set up a new team to get started',
};

const fieldClass = 'w-full px-3 py-2 border border-rule bg-paper-raised text-ink-text text-sm placeholder:text-ink-muted/70 focus:outline-none focus:border-amber';

function money(value: number) {
  return `$${value.toLocaleString()}`;
}

function priorityClass(priority: string) {
  if (priority === 'URGENT') return 'bg-danger-bg text-danger border-danger/30';
  if (priority === 'HIGH') return 'bg-warn-bg text-warn border-warn/30';
  if (priority === 'LOW') return 'bg-ok-bg text-ok border-ok/30';
  return 'bg-paper-inset text-ink-muted border-rule';
}

function statusClass(status: string) {
  if (status === 'ACTIVE' || status === 'COMPLETED') return 'bg-ok-bg text-ok border-ok/30';
  if (status === 'INACTIVE') return 'bg-paper-inset text-ink-muted border-rule';
  if (status === 'ON_LEAVE' || status === 'REVIEW') return 'bg-warn-bg text-warn border-warn/30';
  if (status === 'IN_PROGRESS') return 'bg-paper-inset text-ink-text border-rule';
  return 'bg-paper-inset text-ink-muted border-rule';
}

function Badge({ value, kind }: { value: string; kind?: 'priority' | 'status' }) {
  const cls = kind === 'priority' ? priorityClass(value) : statusClass(value);
  const label = STATUS_LABEL[value] || value.replace('_', ' ');
  return <span className={`inline-flex px-1.5 py-0.5 text-[11px] font-semibold border ${cls}`}>{label}</span>;
}

function nextId(prefix: string, ids: string[]) {
  const nums = ids.map((id) => Number(id.replace(/\D/g, ''))).filter((n) => !Number.isNaN(n));
  return `${prefix}${((nums.length ? Math.max(...nums) : 0) + 1)}`;
}

export const TeamView: React.FC<TeamViewProps> = ({ features, catalog, onUpgradeInPlace }) => {
  const [section, setSection] = useState<Section>('dashboard');
  const [departments, setDepartments] = useState(catalog.departments);
  const [employees, setEmployees] = useState(catalog.employees);
  const [tasks, setTasks] = useState(catalog.tasks);
  const [members, setMembers] = useState<TeamMemberAccount[]>(catalog.members);
  const [invitations, setInvitations] = useState<TeamInvitation[]>(catalog.invitations);
  const [roles, setRoles] = useState<TeamRoleDefinition[]>(catalog.roles);
  const [notifications, setNotifications] = useState<TeamNotification[]>(catalog.notifications);
  const [teamName, setTeamName] = useState(catalog.team.name);
  const [profile, setProfile] = useState(catalog.profile);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('EMPLOYEE');
  const [inviteNote, setInviteNote] = useState('');
  const [roleDraft, setRoleDraft] = useState({ name: '', label: '', permissions: [] as string[] });
  const [showRoleForm, setShowRoleForm] = useState(false);
  const [editingRole, setEditingRole] = useState<string | null>(null);
  const [passwordForm, setPasswordForm] = useState({ current: '', next: '', confirm: '' });
  const [passwordMessage, setPasswordMessage] = useState('');
  const [profileMessage, setProfileMessage] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [createdTeam, setCreatedTeam] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [taskScope, setTaskScope] = useState<TaskScope>('all');
  const [query, setQuery] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [modal, setModal] = useState<'employee' | 'department' | 'task' | null>(null);
  const [employeeForm, setEmployeeForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    position: '',
    department_id: catalog.departments[0]?.id || '',
    status: 'ACTIVE',
    salary: '70000',
  });
  const [departmentForm, setDepartmentForm] = useState({ name: '', description: '', manager_name: catalog.viewer_name });
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    status: 'TODO',
    department_id: catalog.departments[0]?.id || '',
    assignee_id: catalog.employees[0]?.profile_id || '',
    due_date: '2026-10-15',
  });

  useEffect(() => {
    setDepartments(catalog.departments);
    setEmployees(catalog.employees);
    setTasks(catalog.tasks);
    setMembers(catalog.members || []);
    setInvitations(catalog.invitations || []);
    setRoles(catalog.roles || []);
    setNotifications(catalog.notifications || []);
    setTeamName(catalog.team?.name || 'Demo Team');
    setProfile(catalog.profile || { first_name: 'Sara', last_name: 'Miller', email: '', role: catalog.viewer_role, member_since: '' });
  }, [catalog]);

  const q = query.trim().toLowerCase();
  const completed = tasks.filter((task) => task.status === 'COMPLETED').length;
  const completionRate = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;

  const filteredEmployees = useMemo(() => employees.filter((employee) => {
    if (departmentFilter !== 'all' && employee.department_id !== departmentFilter) return false;
    if (!q) return true;
    return [employee.first_name, employee.last_name, employee.email, employee.position, employee.department_name]
      .some((value) => value.toLowerCase().includes(q));
  }), [departmentFilter, employees, q]);

  const filteredTasks = useMemo(() => tasks.filter((task) => {
    if (departmentFilter !== 'all' && task.department_id !== departmentFilter) return false;
    if (taskScope === 'mine' && task.assignee_id !== catalog.viewer_id) return false;
    if (taskScope === 'created' && task.created_by_id !== catalog.viewer_id) return false;
    if (!q) return true;
    return [task.title, task.description, task.assignee_name, task.department_name].some((value) => value.toLowerCase().includes(q));
  }), [catalog.viewer_id, departmentFilter, q, taskScope, tasks]);

  if (!features.team_enabled) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16">
        <div className="bg-ink-900 border border-ink-border p-8 text-center">
          <div className="w-12 h-12 rounded-lg border border-rule bg-paper-inset flex items-center justify-center mx-auto mb-5">
            <Lock className="w-5 h-5 text-amber" />
          </div>
          <h2 className="text-xl font-semibold text-paper tracking-tight mb-2">Team management is locked</h2>
          <p className="text-paper/70 text-sm max-w-lg mx-auto mb-6 leading-relaxed">
            The Team plan includes Dashboard, Employees, Departments, Tasks, Members, Roles & Permissions, Settings, Profile, Notifications, and Create Team.
          </p>
          <button
            onClick={() => onUpgradeInPlace('team')}
            className="px-5 py-2.5 bg-amber hover:opacity-90 text-ink-950 text-sm font-semibold"
          >
            Upgrade in-place to Team
          </button>
        </div>
      </div>
    );
  }

  const moveTask = (task: TeamTask, direction: -1 | 1) => {
    const index = TEAM_STATUSES.indexOf(task.status as typeof TEAM_STATUSES[number]);
    const next = TEAM_STATUSES[index + direction];
    if (!next) return;
    setTasks((prev) => prev.map((item) => item.id === task.id ? { ...item, status: next } : item));
  };

  const saveEmployee = (event: React.FormEvent) => {
    event.preventDefault();
    if (!employeeForm.first_name || !employeeForm.email) return;
    const department = departments.find((item) => item.id === employeeForm.department_id);
    const employee: TeamEmployee = {
      id: nextId('emp-', employees.map((item) => item.id)),
      profile_id: nextId('u-emp-', employees.map((item) => item.profile_id)),
      first_name: employeeForm.first_name,
      last_name: employeeForm.last_name,
      email: employeeForm.email,
      role: 'EMPLOYEE',
      position: employeeForm.position || 'Team Member',
      department_id: department?.id || '',
      department_name: department?.name || '',
      manager_name: department?.manager_name || '',
      status: employeeForm.status,
      salary: Number(employeeForm.salary) || 0,
      join_date: new Date().toISOString().slice(0, 10),
    };
    setEmployees((prev) => [employee, ...prev]);
    setSelectedEmployee(employee.id);
    setModal(null);
  };

  const saveDepartment = (event: React.FormEvent) => {
    event.preventDefault();
    if (!departmentForm.name) return;
    const department: TeamDepartment = {
      id: nextId('dept-', departments.map((item) => item.id)),
      name: departmentForm.name,
      description: departmentForm.description,
      manager_id: catalog.viewer_id,
      manager_name: departmentForm.manager_name || catalog.viewer_name,
    };
    setDepartments((prev) => [...prev, department]);
    setModal(null);
    setDepartmentForm({ name: '', description: '', manager_name: catalog.viewer_name });
  };

  const saveTask = (event: React.FormEvent) => {
    event.preventDefault();
    if (!taskForm.title) return;
    const department = departments.find((item) => item.id === taskForm.department_id);
    const assignee = employees.find((item) => item.profile_id === taskForm.assignee_id);
    const task: TeamTask = {
      id: nextId('task-', tasks.map((item) => item.id)),
      title: taskForm.title,
      description: taskForm.description,
      priority: taskForm.priority,
      status: taskForm.status,
      department_id: department?.id || '',
      department_name: department?.name || '',
      assignee_id: assignee?.profile_id || '',
      assignee_name: assignee ? `${assignee.first_name} ${assignee.last_name}` : 'Unassigned',
      created_by_id: catalog.viewer_id,
      created_by_name: catalog.viewer_name,
      due_date: taskForm.due_date,
    };
    setTasks((prev) => [task, ...prev]);
    setModal(null);
  };

  const removeEmployee = (id: string) => {
    setEmployees((prev) => prev.filter((item) => item.id !== id));
    if (selectedEmployee === id) setSelectedEmployee(null);
  };

  const employeeDetail = employees.find((item) => item.id === selectedEmployee);
  const recentTitles = [
    'Data backup audit',
    'Review benefits package',
    'Prepare hiring plan',
    'Add employee self-serve portal',
    'Customer story video',
  ];
  const recentTasks = recentTitles
    .map((title) => tasks.find((task) => task.title === title))
    .filter((task): task is TeamTask => Boolean(task));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
      <div className="bg-paper-raised border border-rule p-5">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-ink-muted">
              Team · Role {catalog.viewer_role}
            </div>
            <h1 className="text-xl font-semibold text-ink-text mt-1">
              {section === 'members' ? 'Team Members' : section === 'profile' ? 'My Profile' : section === 'create-team' ? 'Create Your Team' : SECTION_GROUPS.flatMap((group) => group.items).find((item) => item.id === section)?.label}
            </h1>
            <p className="text-sm text-ink-muted mt-1">
              {section === 'notifications'
                ? (notifications.some((item) => !item.read) ? `You have ${notifications.filter((item) => !item.read).length} unread notification${notifications.filter((item) => !item.read).length > 1 ? 's' : ''}` : 'All caught up')
                : SECTION_COPY[section]}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {section === 'employees' && <button onClick={() => setModal('employee')} className="px-3 py-1.5 bg-amber text-ink-950 text-sm font-semibold inline-flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> Add Employee</button>}
            {section === 'departments' && <button onClick={() => setModal('department')} className="px-3 py-1.5 bg-amber text-ink-950 text-sm font-semibold inline-flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> Add Department</button>}
            {section === 'tasks' && <button onClick={() => setModal('task')} className="px-3 py-1.5 bg-amber text-ink-950 text-sm font-semibold inline-flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> Create Task</button>}
          </div>
        </div>
        <div className="mt-4 space-y-2">
          {SECTION_GROUPS.map((group) => (
            <div key={group.label} className="flex items-center gap-2 overflow-x-auto">
              <span className="w-16 shrink-0 text-[11px] uppercase tracking-wider text-ink-muted">{group.label}</span>
              <div className="flex gap-1 border border-rule bg-paper-inset p-1">
                {group.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => { setSection(item.id); setQuery(''); setDepartmentFilter('all'); }}
                    className={`px-3 py-1.5 text-sm whitespace-nowrap ${section === item.id ? 'bg-amber text-ink-950 font-semibold' : 'text-ink-muted hover:text-ink-text'}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {section === 'dashboard' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: 'Total Employees', value: String(employees.length), hint: 'Active staff members', icon: Users },
              { label: 'Departments', value: String(departments.length), hint: 'Organization units', icon: Building2 },
              { label: 'Total Tasks', value: String(tasks.length), hint: 'Across all departments', icon: CheckSquare },
              { label: 'Completion Rate', value: `${completionRate}%`, hint: `${completed} of ${tasks.length} completed`, icon: CheckSquare },
            ].map((card) => (
              <div key={card.label} className="bg-paper-raised border border-rule p-4">
                <div className="text-[11px] uppercase tracking-wider text-ink-muted">{card.label}</div>
                <div className="text-3xl font-semibold font-mono mt-1">{card.value}</div>
                <div className="text-xs text-ink-muted mt-1">{card.hint}</div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="bg-paper-raised border border-rule p-4">
              <h3 className="text-sm font-semibold mb-3">Task Status Overview</h3>
              <div className="space-y-2">
                {TEAM_STATUSES.map((status) => {
                  const count = tasks.filter((task) => task.status === status).length;
                  return (
                    <div key={status}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{STATUS_LABEL[status]}</span>
                        <span className="font-mono">{count}</span>
                      </div>
                      <div className="h-2 bg-paper-inset border border-rule">
                        <div className="h-full bg-ink-text" style={{ width: `${tasks.length ? (count / tasks.length) * 100 : 0}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="bg-paper-raised border border-rule p-4 lg:col-span-2">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold">Recent Tasks</h3>
                <button onClick={() => setSection('tasks')} className="text-xs text-ink-muted hover:text-ink-text">View All</button>
              </div>
              <div className="space-y-3">
                {recentTasks.map((task) => (
                  <div key={task.id} className="border border-rule px-3 py-2">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold">{task.title}</div>
                        <div className="text-xs text-ink-muted mt-0.5">{task.description}</div>
                      </div>
                      <div className="text-xs text-ink-muted whitespace-nowrap">{task.assignee_name.split(' ')[0]}</div>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Badge value={task.priority} kind="priority" />
                      <Badge value={task.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="bg-paper-raised border border-rule p-4 space-y-4">
            <h3 className="text-sm font-semibold">Getting Started</h3>
            <div>
              <div className="font-semibold">1. Create Departments</div>
              <p className="text-sm text-ink-muted">Set up your organizational structure by creating departments and assigning managers.</p>
            </div>
            <div>
              <div className="font-semibold">2. Add Employees</div>
              <p className="text-sm text-ink-muted">Add team members to departments and set their roles and positions.</p>
            </div>
            <div>
              <div className="font-semibold">3. Create Tasks</div>
              <p className="text-sm text-ink-muted">Assign tasks to employees and track progress using the Kanban board.</p>
            </div>
          </div>
        </div>
      )}

      {(section === 'employees' || section === 'tasks') && (
        <div className="flex flex-col md:flex-row gap-3 bg-paper-raised p-3 border border-rule">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-ink-muted absolute left-3 top-2.5" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search..." className="w-full pl-9 pr-3 py-2 text-sm border border-rule bg-paper-raised" />
          </div>
          <select value={departmentFilter} onChange={(event) => setDepartmentFilter(event.target.value)} className="text-sm border border-rule px-2.5 py-2 bg-paper-raised">
            <option value="all">All Departments</option>
            {departments.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}
          </select>
          {section === 'tasks' && (
            <div className="inline-flex border border-rule p-1 text-sm">
              {([['all', 'All Tasks'], ['mine', 'Assigned to Me'], ['created', 'Assigned by Me']] as [TaskScope, string][]).map(([id, label]) => (
                <button key={id} onClick={() => setTaskScope(id)} className={`px-2.5 py-1 ${taskScope === id ? 'bg-amber text-ink-950 font-semibold' : 'text-ink-muted'}`}>{label}</button>
              ))}
            </div>
          )}
        </div>
      )}

      {section === 'employees' && (
        <div className="space-y-3">
          {filteredEmployees.map((employee) => (
            <div key={employee.id} className="bg-paper-raised border border-rule p-4 flex flex-col lg:flex-row lg:items-center gap-4">
              <button onClick={() => setSelectedEmployee(employee.id)} className="flex items-center gap-3 text-left flex-1 min-w-0">
                <div className="w-11 h-11 border border-rule bg-paper-inset flex items-center justify-center font-semibold">{employee.first_name[0]}</div>
                <div className="min-w-0">
                  <div className="font-semibold">{employee.first_name} {employee.last_name}</div>
                  <div className="text-sm text-ink-muted truncate">{employee.email}</div>
                </div>
              </button>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm flex-[2]">
                <div><div className="text-ink-muted text-xs">Position</div><div className="font-medium">{employee.position}</div></div>
                <div><div className="text-ink-muted text-xs">Department</div><div className="font-medium">{employee.department_name}</div></div>
                <div><div className="text-ink-muted text-xs">Status</div><Badge value={employee.status} /></div>
                <div><div className="text-ink-muted text-xs">Salary</div><div className="font-medium font-mono">{money(employee.salary)}</div></div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setSelectedEmployee(employee.id)} className="px-2 py-1 text-xs border border-rule">Edit</button>
                <button onClick={() => removeEmployee(employee.id)} className="px-2 py-1 text-xs border border-rule text-danger">Delete</button>
              </div>
            </div>
          ))}
          {employeeDetail && (
            <div className="bg-paper-raised border border-rule p-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div><div className="text-xs text-ink-muted">Role</div>{employeeDetail.role}</div>
              <div><div className="text-xs text-ink-muted">Manager</div>{employeeDetail.manager_name || '—'}</div>
              <div><div className="text-xs text-ink-muted">Join Date</div>{employeeDetail.join_date}</div>
              <div><div className="text-xs text-ink-muted">Profile</div>{employeeDetail.profile_id}</div>
            </div>
          )}
        </div>
      )}

      {section === 'departments' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {departments.map((department) => {
            const count = employees.filter((employee) => employee.department_id === department.id).length;
            return (
              <div key={department.id} className="bg-paper-raised border border-rule p-4">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-semibold">{department.name}</h3>
                  <span className="text-xs font-mono text-ink-muted">{count} employees</span>
                </div>
                <p className="text-sm text-ink-muted mt-1">{department.description}</p>
                <div className="mt-3 text-sm"><span className="text-ink-muted">Manager · </span>{department.manager_name}</div>
              </div>
            );
          })}
        </div>
      )}

      {section === 'tasks' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          {TEAM_STATUSES.map((status) => {
            const column = filteredTasks.filter((task) => task.status === status);
            return (
              <div key={status} className="bg-paper-inset border border-rule p-3">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold">{STATUS_LABEL[status]}</h3>
                  <span className="text-xs font-mono text-ink-muted">({column.length})</span>
                </div>
                <div className="space-y-3">
                  {column.map((task) => (
                    <div key={task.id} className="bg-paper-raised border border-rule p-3">
                      <div className="text-sm font-semibold">{task.title}</div>
                      <p className="text-xs text-ink-muted mt-1">{task.description}</p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        <Badge value={task.priority} kind="priority" />
                        <span className="text-[11px] px-1.5 py-0.5 border border-rule bg-paper-inset">{task.department_name}</span>
                        <span className="text-[11px] px-1.5 py-0.5 border border-rule">{task.assignee_name.split(' ')[0]}</span>
                      </div>
                      <div className="mt-2 text-[11px] text-ink-muted font-mono">Due {task.due_date} · by {task.created_by_name.split(' ')[0]}</div>
                      <div className="mt-2 flex gap-1">
                        <button onClick={() => moveTask(task, -1)} className="px-2 py-0.5 text-[11px] border border-rule">Back</button>
                        <button onClick={() => moveTask(task, 1)} className="px-2 py-0.5 text-[11px] border border-rule">Next</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {section === 'members' && (
        <div className="space-y-4">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (!inviteEmail.trim()) return;
              setInvitations((prev) => [{ id: `inv-${Date.now()}`, email: inviteEmail.trim(), role: inviteRole, created_at: new Date().toISOString().slice(0, 10) }, ...prev]);
              setInviteEmail('');
              setInviteNote('Invitation sent');
            }}
            className="bg-paper-raised border border-rule p-4 space-y-3"
          >
            <h3 className="font-semibold">Invite Member</h3>
            <p className="text-sm text-ink-muted">Send an invitation to join your team with a specific role</p>
            <div className="flex flex-col md:flex-row gap-2">
              <input required type="email" placeholder="member@example.com" value={inviteEmail} onChange={(event) => setInviteEmail(event.target.value)} className={fieldClass} />
              <select value={inviteRole} onChange={(event) => setInviteRole(event.target.value)} className="border border-rule bg-paper-raised px-3 py-2 text-sm">
                {roles.map((role) => <option key={role.name} value={role.name}>{role.label}</option>)}
              </select>
              <button type="submit" className="px-3 py-2 bg-amber text-ink-950 text-sm font-semibold whitespace-nowrap">Send Invite</button>
            </div>
            {inviteNote && <p className="text-sm text-ok">{inviteNote}</p>}
          </form>
          {invitations.length > 0 && (
            <div className="bg-paper-raised border border-rule p-4 space-y-3">
              <h3 className="font-semibold">Pending Invitations ({invitations.length})</h3>
              {invitations.map((invitation) => (
                <div key={invitation.id} className="flex items-center justify-between border border-rule px-3 py-2">
                  <div>
                    <div className="font-medium">{invitation.email}</div>
                    <div className="text-sm text-ink-muted">Role: {invitation.role} · Invited {invitation.created_at}</div>
                  </div>
                  <button onClick={() => setInvitations((prev) => prev.filter((item) => item.id !== invitation.id))} className="px-2 py-1 text-xs border border-rule text-danger">Revoke</button>
                </div>
              ))}
            </div>
          )}
          <div className="bg-paper-raised border border-rule p-4 space-y-3">
            <h3 className="font-semibold">Members ({members.length})</h3>
            <p className="text-sm text-ink-muted">Manage team members and their roles. The last admin cannot be edited or removed.</p>
            {members.map((member) => {
              const isSelf = member.id === catalog.viewer_id;
              const isLastAdmin = member.role === 'ADMIN' && members.filter((item) => item.role === 'ADMIN').length === 1;
              return (
                <div key={member.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-rule px-3 py-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 border border-rule bg-paper-inset flex items-center justify-center font-semibold">{member.first_name?.[0] || member.email[0]}</div>
                    <div>
                      <div className="font-medium">{member.first_name} {member.last_name} {isSelf && <span className="text-xs text-ink-muted">(You)</span>}</div>
                      <div className="text-sm text-ink-muted">{member.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge value={member.role} />
                    {isLastAdmin ? <span className="text-xs text-ink-muted italic">Last admin</span> : (
                      <>
                        {member.role !== 'ADMIN' && <button onClick={() => setMembers((prev) => prev.map((item) => item.id === member.id ? { ...item, role: 'ADMIN' } : item))} className="px-2 py-1 text-xs border border-rule">Make Admin</button>}
                        {member.role === 'ADMIN' && <button onClick={() => setMembers((prev) => prev.map((item) => item.id === member.id ? { ...item, role: 'MANAGER' } : item))} className="px-2 py-1 text-xs border border-rule">Remove Admin</button>}
                        <button onClick={() => setMembers((prev) => prev.filter((item) => item.id !== member.id))} className="px-2 py-1 text-xs border border-rule text-danger">Remove</button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {section === 'roles' && (
        <div className="space-y-4">
          <div className="bg-paper-raised border border-rule p-4">
            <div className="text-sm text-ink-muted">Your role</div>
            <div className="text-lg font-semibold mt-1">{profile.role}</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {(roles.find((role) => role.name === profile.role)?.permissions || []).map((key) => (
                <span key={key} className="text-xs border border-rule px-2 py-1">{TEAM_PERMISSIONS.find((item) => item.key === key)?.label || key}</span>
              ))}
            </div>
          </div>
          <div className="flex justify-end">
            <button onClick={() => { setShowRoleForm((open) => !open); setEditingRole(null); setRoleDraft({ name: '', label: '', permissions: [] }); }} className="px-3 py-1.5 bg-amber text-ink-950 text-sm font-semibold">Create Custom Role</button>
          </div>
          {showRoleForm && (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                if (editingRole) {
                  setRoles((prev) => prev.map((role) => role.id === editingRole ? { ...role, label: roleDraft.label || role.label, permissions: roleDraft.permissions } : role));
                } else if (roleDraft.name && roleDraft.label) {
                  setRoles((prev) => [...prev, { id: `role-${Date.now()}`, name: roleDraft.name.toUpperCase().replace(/\s+/g, '_'), label: roleDraft.label, builtin: false, permissions: roleDraft.permissions }]);
                }
                setShowRoleForm(false);
                setEditingRole(null);
              }}
              className="bg-paper-raised border border-rule p-4 space-y-3"
            >
              <h3 className="font-semibold">{editingRole ? 'Edit Role' : 'Create Custom Role'}</h3>
              <p className="text-sm text-ink-muted">Define a new role with specific permissions</p>
              {!editingRole && <input required placeholder="Role Name (code) e.g. TEAM_LEAD" value={roleDraft.name} onChange={(event) => setRoleDraft({ ...roleDraft, name: event.target.value })} className={fieldClass} />}
              <input required placeholder="Display Label e.g. Team Lead" value={roleDraft.label} onChange={(event) => setRoleDraft({ ...roleDraft, label: event.target.value })} className={fieldClass} />
              <div className="text-sm font-medium">Permissions</div>
              {['Dashboard', 'Employees', 'Departments', 'Tasks', 'Members', 'Roles', 'Settings', 'Team'].map((group) => (
                <div key={group}>
                  <div className="text-xs uppercase tracking-wider text-ink-muted mb-1">{group}</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                    {TEAM_PERMISSIONS.filter((item) => item.group === group).map((permission) => (
                      <label key={permission.key} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={roleDraft.permissions.includes(permission.key)}
                          onChange={() => setRoleDraft((draft) => ({
                            ...draft,
                            permissions: draft.permissions.includes(permission.key)
                              ? draft.permissions.filter((key) => key !== permission.key)
                              : [...draft.permissions, permission.key],
                          }))}
                        />
                        {permission.label}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
              <div className="flex gap-2">
                <button type="submit" className="px-3 py-1.5 bg-amber text-ink-950 text-sm font-semibold">{editingRole ? 'Save Changes' : 'Create Role'}</button>
                <button type="button" onClick={() => setShowRoleForm(false)} className="px-3 py-1.5 border border-rule text-sm">Cancel</button>
              </div>
            </form>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {roles.map((role) => (
              <div key={role.id} className="bg-paper-raised border border-rule p-4">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-semibold">{role.label}</h3>
                  <span className="text-[11px] text-ink-muted">{role.builtin ? 'Built-in' : 'Custom'}</span>
                </div>
                <p className="text-xs text-ink-muted mt-1">{role.name} · {role.permissions.length} permissions</p>
                <p className="text-xs text-ink-muted mt-2">{role.builtin ? 'Built-in role — permissions affect all teams' : 'Custom role — edit permissions'}</p>
                <button
                  onClick={() => { setEditingRole(role.id); setRoleDraft({ name: role.name, label: role.label, permissions: [...role.permissions] }); setShowRoleForm(true); }}
                  className="mt-3 px-2 py-1 text-xs border border-rule"
                >
                  Edit
                </button>
                {!role.builtin && <button onClick={() => setRoles((prev) => prev.filter((item) => item.id !== role.id))} className="mt-3 ml-2 px-2 py-1 text-xs border border-rule text-danger">Delete</button>}
              </div>
            ))}
          </div>
        </div>
      )}

      {section === 'settings' && (
        <div className="space-y-4 max-w-3xl">
          <div className="bg-paper-raised border border-rule p-4">
            <h3 className="font-semibold">Team</h3>
            <p className="text-sm text-ink-muted mb-3">Your team information</p>
            <div className="font-medium">{teamName}</div>
            <div className="text-sm text-ink-muted">Team ID: {catalog.team.id}</div>
            <button onClick={() => setConfirmDelete(true)} className="mt-4 px-3 py-1.5 border border-danger text-danger text-sm">Delete Team</button>
            {confirmDelete && (
              <div className="mt-3 border border-danger/40 bg-danger-bg p-3 space-y-2">
                <div className="font-medium text-danger">Delete Team</div>
                <p className="text-sm">This will permanently delete the team, all departments, employees, and tasks. All members will be removed from the team.</p>
                <div className="flex gap-2">
                  <button onClick={() => { setConfirmDelete(false); setTeamName(`${teamName} (delete requested)`); }} className="px-3 py-1.5 bg-danger text-white text-sm">Yes, Delete Team</button>
                  <button onClick={() => setConfirmDelete(false)} className="px-3 py-1.5 border border-rule text-sm">Cancel</button>
                </div>
              </div>
            )}
          </div>
          {members.filter((member) => member.role === 'ADMIN').length > 1 && (
            <div className="bg-paper-raised border border-rule p-4">
              <h3 className="font-semibold">Leave Team</h3>
              <p className="text-sm text-ink-muted mb-3">Remove yourself from this team. You will lose access to this team and all its data.</p>
              <button onClick={() => setMembers((prev) => prev.filter((member) => member.id !== catalog.viewer_id))} className="px-3 py-1.5 border border-danger text-danger text-sm">Leave Team</button>
            </div>
          )}
        </div>
      )}

      {section === 'profile' && (
        <div className="space-y-4 max-w-2xl">
          <div className="bg-paper-raised border border-rule p-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 border border-rule bg-paper-inset flex items-center justify-center text-xl font-semibold">{profile.first_name[0]}</div>
              <div>
                <div className="text-lg font-semibold">{profile.first_name} {profile.last_name}</div>
                <div className="text-sm text-ink-muted">{profile.role}</div>
              </div>
            </div>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                setProfileMessage('Name updated successfully');
              }}
              className="grid grid-cols-2 gap-2 max-w-md"
            >
              <label className="text-xs text-ink-muted">First Name
                <input value={profile.first_name} onChange={(event) => setProfile({ ...profile, first_name: event.target.value })} className={`${fieldClass} mt-1`} />
              </label>
              <label className="text-xs text-ink-muted">Last Name
                <input value={profile.last_name} onChange={(event) => setProfile({ ...profile, last_name: event.target.value })} className={`${fieldClass} mt-1`} />
              </label>
              <button type="submit" className="col-span-2 w-fit px-3 py-1.5 bg-amber text-ink-950 text-sm font-semibold">Save Name</button>
            </form>
            {profileMessage && <p className="text-sm text-ok">{profileMessage}</p>}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><div className="text-ink-muted text-xs">Email</div>{profile.email}</div>
              <div><div className="text-ink-muted text-xs">Role</div>{profile.role}</div>
              <div><div className="text-ink-muted text-xs">Member Since</div>{profile.member_since}</div>
            </div>
          </div>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (passwordForm.next !== passwordForm.confirm) {
                setPasswordMessage('New passwords do not match');
                return;
              }
              setPasswordMessage('Password updated successfully');
              setPasswordForm({ current: '', next: '', confirm: '' });
            }}
            className="bg-paper-raised border border-rule p-4 space-y-3 max-w-md"
          >
            <h3 className="font-semibold">Reset Password</h3>
            <p className="text-sm text-ink-muted">Change your account password</p>
            <input required type="password" placeholder="Enter current password" value={passwordForm.current} onChange={(event) => setPasswordForm({ ...passwordForm, current: event.target.value })} className={fieldClass} />
            <input required minLength={6} type="password" placeholder="Enter new password" value={passwordForm.next} onChange={(event) => setPasswordForm({ ...passwordForm, next: event.target.value })} className={fieldClass} />
            <input required minLength={6} type="password" placeholder="Confirm new password" value={passwordForm.confirm} onChange={(event) => setPasswordForm({ ...passwordForm, confirm: event.target.value })} className={fieldClass} />
            {passwordMessage && <p className={`text-sm ${passwordMessage.includes('not') ? 'text-danger' : 'text-ok'}`}>{passwordMessage}</p>}
            <button type="submit" className="px-3 py-1.5 bg-amber text-ink-950 text-sm font-semibold">Update Password</button>
          </form>
        </div>
      )}

      {section === 'notifications' && (
        <div className="space-y-3 max-w-3xl">
          {notifications.length === 0 && <div className="bg-paper-raised border border-rule p-8 text-center text-sm text-ink-muted">No notifications yet</div>}
          {notifications.map((item) => (
            <div key={item.id} className={`border border-rule p-4 ${item.read ? 'bg-paper-raised' : 'bg-paper-inset'}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold">{item.title}</div>
                  <p className="text-sm text-ink-muted mt-1">{item.message}</p>
                  <div className="text-xs text-ink-muted mt-2">{new Date(item.created_at).toLocaleString()}</div>
                </div>
                {!item.read && <span className="mt-1 h-2 w-2 rounded-full bg-ink-text" />}
              </div>
              {item.type === 'team_invitation' && (
                <div className="flex gap-2 mt-3">
                  <button onClick={() => setNotifications((prev) => prev.map((note) => note.id === item.id ? { ...note, read: true, title: 'Invitation accepted' } : note))} className="px-3 py-1.5 bg-amber text-ink-950 text-sm font-semibold">Accept</button>
                  <button onClick={() => setNotifications((prev) => prev.filter((note) => note.id !== item.id))} className="px-3 py-1.5 border border-rule text-sm">Decline</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {section === 'create-team' && (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (!newTeamName.trim()) return;
            setCreatedTeam(newTeamName.trim());
            setTeamName(newTeamName.trim());
            setNewTeamName('');
          }}
          className="bg-paper-raised border border-rule p-4 max-w-md space-y-3"
        >
          <label className="block text-sm">Team Name
            <input required value={newTeamName} onChange={(event) => setNewTeamName(event.target.value)} className={`${fieldClass} mt-1`} placeholder="Team Name" />
          </label>
          <button type="submit" className="px-3 py-1.5 bg-amber text-ink-950 text-sm font-semibold">Create Team</button>
          {createdTeam && <p className="text-sm text-ok">Created {createdTeam}. It is now the active team in Settings.</p>}
        </form>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 bg-ink-950/80 flex items-center justify-center p-4">
          <form onSubmit={modal === 'employee' ? saveEmployee : modal === 'department' ? saveDepartment : saveTask} className="bg-paper-raised max-w-lg w-full p-6 border border-rule space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{modal === 'employee' ? 'Add Employee' : modal === 'department' ? 'Add Department' : 'Create Task'}</h3>
              <button type="button" onClick={() => setModal(null)} className="text-sm text-ink-muted">Close</button>
            </div>
            {modal === 'employee' && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <input required placeholder="First name" value={employeeForm.first_name} onChange={(e) => setEmployeeForm({ ...employeeForm, first_name: e.target.value })} className={fieldClass} />
                  <input required placeholder="Last name" value={employeeForm.last_name} onChange={(e) => setEmployeeForm({ ...employeeForm, last_name: e.target.value })} className={fieldClass} />
                </div>
                <input required type="email" placeholder="Email" value={employeeForm.email} onChange={(e) => setEmployeeForm({ ...employeeForm, email: e.target.value })} className={fieldClass} />
                <input required placeholder="Position" value={employeeForm.position} onChange={(e) => setEmployeeForm({ ...employeeForm, position: e.target.value })} className={fieldClass} />
                <select value={employeeForm.department_id} onChange={(e) => setEmployeeForm({ ...employeeForm, department_id: e.target.value })} className={fieldClass}>
                  {departments.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}
                </select>
                <select value={employeeForm.status} onChange={(e) => setEmployeeForm({ ...employeeForm, status: e.target.value })} className={fieldClass}>
                  {EMPLOYEE_STATUSES.map((status) => <option key={status}>{status}</option>)}
                </select>
                <input type="number" placeholder="Salary" value={employeeForm.salary} onChange={(e) => setEmployeeForm({ ...employeeForm, salary: e.target.value })} className={fieldClass} />
              </>
            )}
            {modal === 'department' && (
              <>
                <input required placeholder="Department name" value={departmentForm.name} onChange={(e) => setDepartmentForm({ ...departmentForm, name: e.target.value })} className={fieldClass} />
                <textarea required placeholder="Description" value={departmentForm.description} onChange={(e) => setDepartmentForm({ ...departmentForm, description: e.target.value })} className={fieldClass} rows={3} />
                <input placeholder="Manager" value={departmentForm.manager_name} onChange={(e) => setDepartmentForm({ ...departmentForm, manager_name: e.target.value })} className={fieldClass} />
              </>
            )}
            {modal === 'task' && (
              <>
                <input required placeholder="Title" value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} className={fieldClass} />
                <textarea required placeholder="Description" value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} className={fieldClass} rows={3} />
                <select value={taskForm.priority} onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })} className={fieldClass}>{TEAM_PRIORITIES.map((item) => <option key={item}>{item}</option>)}</select>
                <select value={taskForm.status} onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })} className={fieldClass}>{TEAM_STATUSES.map((item) => <option key={item} value={item}>{STATUS_LABEL[item]}</option>)}</select>
                <select value={taskForm.department_id} onChange={(e) => setTaskForm({ ...taskForm, department_id: e.target.value })} className={fieldClass}>{departments.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}</select>
                <select value={taskForm.assignee_id} onChange={(e) => setTaskForm({ ...taskForm, assignee_id: e.target.value })} className={fieldClass}>{employees.map((employee) => <option key={employee.profile_id} value={employee.profile_id}>{employee.first_name} {employee.last_name}</option>)}</select>
                <input type="date" value={taskForm.due_date} onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })} className={fieldClass} />
              </>
            )}
            <button type="submit" className="px-4 py-2 bg-amber text-ink-950 text-sm font-semibold">Save</button>
          </form>
        </div>
      )}
    </div>
  );
};
