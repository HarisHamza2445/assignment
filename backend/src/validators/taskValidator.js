const { DEPARTMENTS, PRIORITIES, TASK_STATUS } = require('../constants');
const { parseDateOnly } = require('../utils/dates');
const { cleanString, isValidObjectId, throwIfErrors } = require('./helpers');
const ApiError = require('../utils/ApiError');

function validateTask(body = {}) {
  const errors = {};

  // status and completedDate have their own flow, they can't come through create/edit
  if (body.status !== undefined || body.completedDate !== undefined) {
    throw ApiError.badRequest('Status cannot be set here. Use PUT /api/tasks/:id/status to change it.');
  }

  const title = cleanString(body.title).replace(/\s+/g, ' ');
  const description = cleanString(body.description);
  const employee = cleanString(body.employee);
  const department = cleanString(body.department);
  const priority = cleanString(body.priority);
  const startDate = parseDateOnly(body.startDate);
  const dueDate = parseDateOnly(body.dueDate);

  if (!title) errors.title = 'Title is required';
  else if (title.length < 3 || title.length > 100) errors.title = 'Title must be 3-100 characters';

  if (description.length > 1000) errors.description = 'Description must be 1000 characters or less';

  if (!employee) errors.employee = 'Assigned employee is required';
  else if (!isValidObjectId(employee)) errors.employee = 'Assigned employee is not valid';

  if (!department) errors.department = 'Department is required';
  else if (!DEPARTMENTS.includes(department)) errors.department = `Department must be one of: ${DEPARTMENTS.join(', ')}`;

  if (!priority) errors.priority = 'Priority is required';
  else if (!PRIORITIES.includes(priority)) errors.priority = `Priority must be one of: ${PRIORITIES.join(', ')}`;

  if (!body.startDate) errors.startDate = 'Start date is required';
  else if (!startDate) errors.startDate = 'Start date is not a valid date';

  if (!body.dueDate) errors.dueDate = 'Due date is required';
  else if (!dueDate) errors.dueDate = 'Due date is not a valid date';
  else if (startDate && dueDate < startDate) errors.dueDate = 'Due date cannot be earlier than start date';

  throwIfErrors(errors);

  return { title, description, employee, department, priority, startDate, dueDate };
}

function validateStatus(body = {}) {
  const status = cleanString(body.status);
  if (!status) throw ApiError.badRequest('Status is required', { status: 'Status is required' });
  if (!Object.values(TASK_STATUS).includes(status)) {
    throw ApiError.badRequest(`Status must be one of: ${Object.values(TASK_STATUS).join(', ')}`);
  }
  return status;
}

module.exports = { validateTask, validateStatus };
