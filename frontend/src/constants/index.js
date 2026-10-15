export const DEPARTMENTS = ['Development', 'Design', 'QA', 'HR', 'Sales'];

export const EMPLOYEE_STATUSES = ['Active', 'Inactive', 'On Leave'];

export const TASK_STATUSES = ['Todo', 'In Progress', 'Completed', 'Cancelled'];

export const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

export const TASK_SORT_OPTIONS = [
  { value: 'createdAt:desc', label: 'Newest first' },
  { value: 'createdAt:asc', label: 'Oldest first' },
  { value: 'dueDate:asc', label: 'Due date (soonest)' },
  { value: 'dueDate:desc', label: 'Due date (latest)' },
  { value: 'priority:desc', label: 'Priority (high to low)' },
  { value: 'priority:asc', label: 'Priority (low to high)' },
  { value: 'title:asc', label: 'Title (A-Z)' },
  { value: 'title:desc', label: 'Title (Z-A)' },
];

export const EMPLOYEE_SORT_OPTIONS = [
  { value: 'createdAt:desc', label: 'Newest first' },
  { value: 'createdAt:asc', label: 'Oldest first' },
  { value: 'name:asc', label: 'Name (A-Z)' },
  { value: 'name:desc', label: 'Name (Z-A)' },
  { value: 'employeeId:asc', label: 'Employee ID' },
  { value: 'joiningDate:desc', label: 'Recently joined' },
];

export const MAX_ACTIVE_TASKS = 3;

export const PAGE_SIZE = 10;
