import { TeamCatalog } from './types';

export const teamCatalog: TeamCatalog = {
  "viewer_id": "u-admin",
  "viewer_name": "Sara Miller",
  "viewer_role": "ADMIN",
  "departments": [
    {
      "id": "dept-hr",
      "name": "People Ops",
      "description": "Supports hiring and culture.",
      "manager_id": "u-admin",
      "manager_name": "Sara Miller"
    },
    {
      "id": "dept-mkt",
      "name": "Marketing",
      "description": "Grows awareness and demand.",
      "manager_id": "u-mgr-mkt",
      "manager_name": "Nadia Ali"
    },
    {
      "id": "dept-design",
      "name": "Design",
      "description": "Owns UX, UI and brand.",
      "manager_id": "u-mgr-design",
      "manager_name": "Lina Hassan"
    },
    {
      "id": "dept-eng",
      "name": "Engineering",
      "description": "Builds and maintains the product.",
      "manager_id": "u-mgr-eng",
      "manager_name": "Omar Khan"
    }
  ],
  "employees": [
    {
      "id": "emp-h1",
      "profile_id": "u-emp-h1",
      "first_name": "Sophia",
      "last_name": "Davis",
      "email": "sophia.davis@demo.com",
      "role": "EMPLOYEE",
      "position": "HR Coordinator",
      "department_id": "dept-hr",
      "department_name": "People Ops",
      "manager_name": "Sara Miller",
      "status": "ACTIVE",
      "salary": 60000,
      "join_date": "2026-06-14"
    },
    {
      "id": "emp-m2",
      "profile_id": "u-emp-m2",
      "first_name": "Ethan",
      "last_name": "Taylor",
      "email": "ethan.taylor@demo.com",
      "role": "EMPLOYEE",
      "position": "Content Writer",
      "department_id": "dept-mkt",
      "department_name": "Marketing",
      "manager_name": "Nadia Ali",
      "status": "INACTIVE",
      "salary": 62000,
      "join_date": "2026-05-25"
    },
    {
      "id": "emp-m1",
      "profile_id": "u-emp-m1",
      "first_name": "Ava",
      "last_name": "Martinez",
      "email": "ava.martinez@demo.com",
      "role": "EMPLOYEE",
      "position": "Marketing Specialist",
      "department_id": "dept-mkt",
      "department_name": "Marketing",
      "manager_name": "Nadia Ali",
      "status": "ACTIVE",
      "salary": 65000,
      "join_date": "2026-05-05"
    },
    {
      "id": "emp-d2",
      "profile_id": "u-emp-d2",
      "first_name": "Noah",
      "last_name": "Wilson",
      "email": "noah.wilson@demo.com",
      "role": "EMPLOYEE",
      "position": "UX Researcher",
      "department_id": "dept-design",
      "department_name": "Design",
      "manager_name": "Lina Hassan",
      "status": "ACTIVE",
      "salary": 72000,
      "join_date": "2026-04-15"
    },
    {
      "id": "emp-d1",
      "profile_id": "u-emp-d1",
      "first_name": "Mia",
      "last_name": "Garcia",
      "email": "mia.garcia@demo.com",
      "role": "EMPLOYEE",
      "position": "UI Designer",
      "department_id": "dept-design",
      "department_name": "Design",
      "manager_name": "Lina Hassan",
      "status": "ACTIVE",
      "salary": 70000,
      "join_date": "2026-03-26"
    },
    {
      "id": "emp-e3",
      "profile_id": "u-emp-e3",
      "first_name": "Liam",
      "last_name": "Brown",
      "email": "liam.brown@demo.com",
      "role": "EMPLOYEE",
      "position": "DevOps Engineer",
      "department_id": "dept-eng",
      "department_name": "Engineering",
      "manager_name": "Omar Khan",
      "status": "ON_LEAVE",
      "salary": 95000,
      "join_date": "2026-03-06"
    },
    {
      "id": "emp-e2",
      "profile_id": "u-emp-e2",
      "first_name": "Emma",
      "last_name": "Jones",
      "email": "emma.jones@demo.com",
      "role": "EMPLOYEE",
      "position": "Backend Engineer",
      "department_id": "dept-eng",
      "department_name": "Engineering",
      "manager_name": "Omar Khan",
      "status": "ACTIVE",
      "salary": 90000,
      "join_date": "2026-01-15"
    },
    {
      "id": "emp-e1",
      "profile_id": "u-emp-e1",
      "first_name": "Adam",
      "last_name": "Smith",
      "email": "adam.smith@demo.com",
      "role": "EMPLOYEE",
      "position": "Frontend Engineer",
      "department_id": "dept-eng",
      "department_name": "Engineering",
      "manager_name": "Omar Khan",
      "status": "ACTIVE",
      "salary": 85000,
      "join_date": "2025-11-26"
    },
    {
      "id": "emp-admin",
      "profile_id": "u-admin",
      "first_name": "Sara",
      "last_name": "Miller",
      "email": "freelancing589@gmail.com",
      "role": "ADMIN",
      "position": "Operations Manager",
      "department_id": "dept-hr",
      "department_name": "People Ops",
      "manager_name": "",
      "status": "ACTIVE",
      "salary": 120000,
      "join_date": "2025-09-22"
    }
  ],
  "tasks": [
    {
      "id": "task-2",
      "title": "Fix auth token refresh bug",
      "description": "Users get logged out randomly; reproduce and fix.",
      "status": "TODO",
      "priority": "URGENT",
      "department_id": "dept-eng",
      "department_name": "Engineering",
      "assignee_id": "u-emp-e2",
      "assignee_name": "Emma Jones",
      "created_by_id": "u-mgr-eng",
      "created_by_name": "Omar Khan",
      "due_date": "2026-09-24"
    },
    {
      "id": "task-1",
      "title": "Ship onboarding revamp",
      "description": "Redesign the new-hire onboarding flow end to end.",
      "status": "IN_PROGRESS",
      "priority": "HIGH",
      "department_id": "dept-design",
      "department_name": "Design",
      "assignee_id": "u-emp-d1",
      "assignee_name": "Mia Garcia",
      "created_by_id": "u-admin",
      "created_by_name": "Sara Miller",
      "due_date": "2026-09-27"
    },
    {
      "id": "task-6",
      "title": "Refresh design system",
      "description": "Update color tokens and component variants.",
      "status": "TODO",
      "priority": "HIGH",
      "department_id": "dept-design",
      "department_name": "Design",
      "assignee_id": "u-emp-d2",
      "assignee_name": "Noah Wilson",
      "created_by_id": "u-mgr-design",
      "created_by_name": "Lina Hassan",
      "due_date": "2026-09-29"
    },
    {
      "id": "task-4",
      "title": "Migrate CI to new runner",
      "description": "Move builds from the legacy runner to the new stack.",
      "status": "REVIEW",
      "priority": "MEDIUM",
      "department_id": "dept-eng",
      "department_name": "Engineering",
      "assignee_id": "u-emp-e3",
      "assignee_name": "Liam Brown",
      "created_by_id": "u-mgr-eng",
      "created_by_name": "Omar Khan",
      "due_date": "2026-09-25"
    },
    {
      "id": "task-11",
      "title": "Landing page A/B test",
      "description": "Run an A/B test on the hero section copy.",
      "status": "TODO",
      "priority": "LOW",
      "department_id": "dept-design",
      "department_name": "Design",
      "assignee_id": "u-emp-d1",
      "assignee_name": "Mia Garcia",
      "created_by_id": "u-mgr-design",
      "created_by_name": "Lina Hassan",
      "due_date": "2026-10-01"
    },
    {
      "id": "task-3",
      "title": "Q3 marketing campaign",
      "description": "Plan and launch the Q3 demand generation campaign.",
      "status": "IN_PROGRESS",
      "priority": "MEDIUM",
      "department_id": "dept-mkt",
      "department_name": "Marketing",
      "assignee_id": "u-emp-m1",
      "assignee_name": "Ava Martinez",
      "created_by_id": "u-mgr-mkt",
      "created_by_name": "Nadia Ali",
      "due_date": "2026-10-02"
    },
    {
      "id": "task-7",
      "title": "API rate limiting",
      "description": "Add rate limiting to public endpoints.",
      "status": "IN_PROGRESS",
      "priority": "HIGH",
      "department_id": "dept-eng",
      "department_name": "Engineering",
      "assignee_id": "u-emp-e2",
      "assignee_name": "Emma Jones",
      "created_by_id": "u-admin",
      "created_by_name": "Sara Miller",
      "due_date": "2026-09-28"
    },
    {
      "id": "task-8",
      "title": "Customer story video",
      "description": "Produce a testimonial video with the design team.",
      "status": "TODO",
      "priority": "MEDIUM",
      "department_id": "dept-mkt",
      "department_name": "Marketing",
      "assignee_id": "u-emp-m1",
      "assignee_name": "Ava Martinez",
      "created_by_id": "u-admin",
      "created_by_name": "Sara Miller",
      "due_date": "2026-10-04"
    },
    {
      "id": "task-9",
      "title": "Add employee self-serve portal",
      "description": "Let employees update their own profile details.",
      "status": "REVIEW",
      "priority": "MEDIUM",
      "department_id": "dept-eng",
      "department_name": "Engineering",
      "assignee_id": "u-emp-e1",
      "assignee_name": "Adam Smith",
      "created_by_id": "u-admin",
      "created_by_name": "Sara Miller",
      "due_date": "2026-09-26"
    },
    {
      "id": "task-5",
      "title": "Prepare hiring plan",
      "description": "Draft headcount plan for the next two quarters.",
      "status": "COMPLETED",
      "priority": "LOW",
      "department_id": "dept-hr",
      "department_name": "People Ops",
      "assignee_id": "u-emp-h1",
      "assignee_name": "Sophia Davis",
      "created_by_id": "u-admin",
      "created_by_name": "Sara Miller",
      "due_date": "2026-09-21"
    },
    {
      "id": "task-10",
      "title": "Review benefits package",
      "description": "Benchmark benefits against market rates.",
      "status": "COMPLETED",
      "priority": "LOW",
      "department_id": "dept-hr",
      "department_name": "People Ops",
      "assignee_id": "u-admin",
      "assignee_name": "Sara Miller",
      "created_by_id": "u-admin",
      "created_by_name": "Sara Miller",
      "due_date": "2026-09-19"
    },
    {
      "id": "task-12",
      "title": "Data backup audit",
      "description": "Verify backup schedules and restore drills.",
      "status": "COMPLETED",
      "priority": "MEDIUM",
      "department_id": "dept-eng",
      "department_name": "Engineering",
      "assignee_id": "u-emp-e3",
      "assignee_name": "Liam Brown",
      "created_by_id": "u-mgr-eng",
      "created_by_name": "Omar Khan",
      "due_date": "2026-09-20"
    }
  ],
  "team": {
    "id": "team-demo",
    "name": "Demo Team"
  },
  "profile": {
    "first_name": "Sara",
    "last_name": "Miller",
    "email": "freelancing589@gmail.com",
    "role": "ADMIN",
    "member_since": "2026-05-25"
  },
  "members": [
    { "id": "u-admin", "first_name": "Sara", "last_name": "Miller", "email": "freelancing589@gmail.com", "role": "ADMIN" },
    { "id": "u-mgr-eng", "first_name": "Omar", "last_name": "Khan", "email": "omar.khan@demo.com", "role": "MANAGER" },
    { "id": "u-mgr-design", "first_name": "Lina", "last_name": "Hassan", "email": "lina.hassan@demo.com", "role": "MANAGER" },
    { "id": "u-mgr-mkt", "first_name": "Nadia", "last_name": "Ali", "email": "nadia.ali@demo.com", "role": "MANAGER" },
    { "id": "u-emp-h1", "first_name": "Sophia", "last_name": "Davis", "email": "sophia.davis@demo.com", "role": "EMPLOYEE" },
    { "id": "u-emp-m2", "first_name": "Ethan", "last_name": "Taylor", "email": "ethan.taylor@demo.com", "role": "EMPLOYEE" },
    { "id": "u-emp-m1", "first_name": "Ava", "last_name": "Martinez", "email": "ava.martinez@demo.com", "role": "EMPLOYEE" },
    { "id": "u-emp-d2", "first_name": "Noah", "last_name": "Wilson", "email": "noah.wilson@demo.com", "role": "EMPLOYEE" },
    { "id": "u-emp-d1", "first_name": "Mia", "last_name": "Garcia", "email": "mia.garcia@demo.com", "role": "EMPLOYEE" },
    { "id": "u-emp-e3", "first_name": "Liam", "last_name": "Brown", "email": "liam.brown@demo.com", "role": "EMPLOYEE" },
    { "id": "u-emp-e2", "first_name": "Emma", "last_name": "Jones", "email": "emma.jones@demo.com", "role": "EMPLOYEE" },
    { "id": "u-emp-e1", "first_name": "Adam", "last_name": "Smith", "email": "adam.smith@demo.com", "role": "EMPLOYEE" }
  ],
  "invitations": [
    { "id": "inv-1", "email": "jordan.lee@demo.com", "role": "EMPLOYEE", "created_at": "2026-09-21" }
  ],
  "roles": [
    {
      "id": "role-admin",
      "name": "ADMIN",
      "label": "Admin",
      "builtin": true,
      "permissions": ["dashboard.view", "employees.view", "employees.create", "employees.edit", "employees.delete", "departments.view", "departments.create", "departments.edit", "departments.delete", "tasks.view", "tasks.create", "tasks.edit", "tasks.delete", "tasks.assign", "members.view", "members.invite", "members.remove", "members.assign_role", "roles.manage", "settings.manage", "team.delete"]
    },
    {
      "id": "role-manager",
      "name": "MANAGER",
      "label": "Manager",
      "builtin": true,
      "permissions": ["dashboard.view", "employees.view", "employees.create", "employees.edit", "departments.view", "departments.edit", "tasks.view", "tasks.create", "tasks.edit", "tasks.assign", "members.view", "members.invite"]
    },
    {
      "id": "role-employee",
      "name": "EMPLOYEE",
      "label": "Employee",
      "builtin": true,
      "permissions": ["dashboard.view", "employees.view", "departments.view", "tasks.view"]
    }
  ],
  "notifications": [
    {
      "id": "ntf-1",
      "title": "Team invitation",
      "message": "Lina Hassan invited you to collaborate with the Design department.",
      "created_at": "2026-09-21T15:00:00.000Z",
      "read": false,
      "type": "team_invitation"
    },
    {
      "id": "ntf-2",
      "title": "Task completed",
      "message": "Liam Brown completed Data backup audit.",
      "created_at": "2026-09-20T11:30:00.000Z",
      "read": true,
      "type": "task"
    }
  ]
};

export const TEAM_STATUSES = ['TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED'] as const;
export const TEAM_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const;
export const EMPLOYEE_STATUSES = ['ACTIVE', 'INACTIVE', 'ON_LEAVE'] as const;
export const STATUS_LABEL: Record<string, string> = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  REVIEW: 'Review',
  COMPLETED: 'Completed',
};

export const TEAM_PERMISSIONS: { key: string; label: string; group: string }[] = [
  { key: 'dashboard.view', label: 'View Dashboard', group: 'Dashboard' },
  { key: 'employees.view', label: 'View Employees', group: 'Employees' },
  { key: 'employees.create', label: 'Create Employees', group: 'Employees' },
  { key: 'employees.edit', label: 'Edit Employees', group: 'Employees' },
  { key: 'employees.delete', label: 'Delete Employees', group: 'Employees' },
  { key: 'departments.view', label: 'View Departments', group: 'Departments' },
  { key: 'departments.create', label: 'Create Departments', group: 'Departments' },
  { key: 'departments.edit', label: 'Edit Departments', group: 'Departments' },
  { key: 'departments.delete', label: 'Delete Departments', group: 'Departments' },
  { key: 'tasks.view', label: 'View Tasks', group: 'Tasks' },
  { key: 'tasks.create', label: 'Create Tasks', group: 'Tasks' },
  { key: 'tasks.edit', label: 'Edit Tasks', group: 'Tasks' },
  { key: 'tasks.delete', label: 'Delete Tasks', group: 'Tasks' },
  { key: 'tasks.assign', label: 'Assign Tasks', group: 'Tasks' },
  { key: 'members.view', label: 'View Members', group: 'Members' },
  { key: 'members.invite', label: 'Invite Members', group: 'Members' },
  { key: 'members.remove', label: 'Remove Members', group: 'Members' },
  { key: 'members.assign_role', label: 'Assign Roles to Members', group: 'Members' },
  { key: 'roles.manage', label: 'Manage Roles', group: 'Roles' },
  { key: 'settings.manage', label: 'Manage Settings', group: 'Settings' },
  { key: 'team.delete', label: 'Delete Team', group: 'Team' },
];
