import { todayInputDate } from './date';

const EMPLOYEE_ID_REGEX = /^[A-Za-z0-9-]{3,20}$/;
const NAME_REGEX = /^[A-Za-z][A-Za-z .'-]*$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_REGEX = /^\+?[0-9]{10,15}$/;

// Same rules as the backend validators. The backend is still the source of truth,
// this just gives quicker feedback.
export function validateEmployeeForm(values) {
  const errors = {};
  const name = values.fullName.trim();
  const phone = values.phone.replace(/[\s()-]/g, '');
  const skills = values.skills
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  if (!values.employeeId.trim()) errors.employeeId = 'Employee ID is required';
  else if (!EMPLOYEE_ID_REGEX.test(values.employeeId.trim())) {
    errors.employeeId = 'Use 3-20 letters, numbers or -';
  }

  if (!name) errors.fullName = 'Full name is required';
  else if (name.length < 2 || name.length > 60) errors.fullName = 'Full name must be 2-60 characters';
  else if (!NAME_REGEX.test(name)) errors.fullName = "Only letters, spaces, . ' and - are allowed";

  if (!values.email.trim()) errors.email = 'Email is required';
  else if (!EMAIL_REGEX.test(values.email.trim())) errors.email = 'Enter a valid email address';

  if (!phone) errors.phone = 'Phone is required';
  else if (!PHONE_REGEX.test(phone)) errors.phone = 'Phone must be 10-15 digits, optionally starting with +';

  if (!values.department) errors.department = 'Department is required';

  if (!values.role.trim()) errors.role = 'Role is required';
  else if (values.role.trim().length < 2 || values.role.trim().length > 50) errors.role = 'Role must be 2-50 characters';

  if (!values.joiningDate) errors.joiningDate = 'Joining date is required';
  else if (values.joiningDate > todayInputDate()) errors.joiningDate = 'Joining date cannot be in the future';

  if (skills.length > 20) errors.skills = 'You can add up to 20 skills';
  else if (skills.some((s) => s.length > 30)) errors.skills = 'Each skill must be 30 characters or less';

  if (values.status === 'On Leave') {
    if (!values.leaveStart) errors.leaveStart = 'Leave start date is required';
    if (!values.leaveEnd) errors.leaveEnd = 'Leave end date is required';
    if (values.leaveStart && values.leaveEnd && values.leaveEnd < values.leaveStart) {
      errors.leaveEnd = 'Leave end cannot be before leave start';
    }
  }

  return errors;
}

export function validateTaskForm(values) {
  const errors = {};
  const title = values.title.trim();

  if (!title) errors.title = 'Title is required';
  else if (title.length < 3 || title.length > 100) errors.title = 'Title must be 3-100 characters';

  if (values.description.length > 1000) errors.description = 'Description must be 1000 characters or less';
  if (!values.employee) errors.employee = 'Please select an employee';
  if (!values.priority) errors.priority = 'Please select a priority';
  if (!values.department) errors.department = 'Please select a department';
  if (!values.startDate) errors.startDate = 'Start date is required';
  if (!values.dueDate) errors.dueDate = 'Due date is required';
  else if (values.startDate && values.dueDate < values.startDate) {
    errors.dueDate = 'Due date cannot be earlier than start date';
  }

  return errors;
}
