const { DEPARTMENTS, EMPLOYEE_STATUS } = require('../constants');
const { parseDateOnly, getToday } = require('../utils/dates');
const { cleanString, throwIfErrors } = require('./helpers');

const EMPLOYEE_ID_REGEX = /^[A-Z0-9-]{3,20}$/;
const NAME_REGEX = /^[A-Za-z][A-Za-z .'-]*$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_REGEX = /^\+?[0-9]{10,15}$/;

function parseSkills(skills) {
  if (skills === undefined || skills === null || skills === '') return [];
  const list = Array.isArray(skills) ? skills : String(skills).split(',');
  const cleaned = list.map((skill) => String(skill).trim()).filter(Boolean);

  // case insensitive dedupe, keep the first spelling
  const seen = new Set();
  return cleaned.filter((skill) => {
    const key = skill.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function validateEmployee(body = {}) {
  const errors = {};

  const employeeId = cleanString(body.employeeId).toUpperCase();
  const fullName = cleanString(body.fullName).replace(/\s+/g, ' ');
  const email = cleanString(body.email).toLowerCase();
  const phone = cleanString(body.phone).replace(/[\s()-]/g, '');
  const department = cleanString(body.department);
  const role = cleanString(body.role);
  const status = cleanString(body.status) || EMPLOYEE_STATUS.ACTIVE;
  const skills = parseSkills(body.skills);
  const joiningDate = parseDateOnly(body.joiningDate);

  if (!employeeId) errors.employeeId = 'Employee ID is required';
  else if (!EMPLOYEE_ID_REGEX.test(employeeId)) {
    errors.employeeId = 'Employee ID must be 3-20 characters (letters, numbers or -)';
  }

  if (!fullName) errors.fullName = 'Full name is required';
  else if (fullName.length < 2 || fullName.length > 60) errors.fullName = 'Full name must be 2-60 characters';
  else if (!NAME_REGEX.test(fullName)) errors.fullName = 'Full name can only contain letters, spaces, . \' and -';

  if (!email) errors.email = 'Email is required';
  else if (!EMAIL_REGEX.test(email) || email.length > 100) errors.email = 'Enter a valid email address';

  if (!phone) errors.phone = 'Phone is required';
  else if (!PHONE_REGEX.test(phone)) errors.phone = 'Phone must be 10-15 digits, optionally starting with +';

  if (!department) errors.department = 'Department is required';
  else if (!DEPARTMENTS.includes(department)) errors.department = `Department must be one of: ${DEPARTMENTS.join(', ')}`;

  if (!role) errors.role = 'Role is required';
  else if (role.length < 2 || role.length > 50) errors.role = 'Role must be 2-50 characters';

  if (!body.joiningDate) errors.joiningDate = 'Joining date is required';
  else if (!joiningDate) errors.joiningDate = 'Joining date is not a valid date';
  else if (joiningDate > getToday()) errors.joiningDate = 'Joining date cannot be in the future';

  if (!Object.values(EMPLOYEE_STATUS).includes(status)) {
    errors.status = `Status must be one of: ${Object.values(EMPLOYEE_STATUS).join(', ')}`;
  }

  if (skills.length > 20) errors.skills = 'You can add up to 20 skills';
  else if (skills.some((skill) => skill.length > 30)) errors.skills = 'Each skill must be 30 characters or less';

  let leaveStart = null;
  let leaveEnd = null;
  if (status === EMPLOYEE_STATUS.ON_LEAVE) {
    leaveStart = parseDateOnly(body.leaveStart);
    leaveEnd = parseDateOnly(body.leaveEnd);

    if (!leaveStart) errors.leaveStart = 'Leave start date is required when status is On Leave';
    if (!leaveEnd) errors.leaveEnd = 'Leave end date is required when status is On Leave';
    if (leaveStart && leaveEnd && leaveEnd < leaveStart) {
      errors.leaveEnd = 'Leave end date cannot be earlier than leave start date';
    }
  }

  throwIfErrors(errors);

  return {
    employeeId,
    fullName,
    email,
    phone,
    department,
    role,
    joiningDate,
    status,
    skills,
    // leave dates only make sense while the employee is on leave
    leaveStart,
    leaveEnd,
  };
}

module.exports = { validateEmployee };
