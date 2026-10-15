const Task = require('../models/Task');
const Employee = require('../models/Employee');
const Counter = require('../models/Counter');
const ApiError = require('../utils/ApiError');
const {
  DEPARTMENTS,
  PRIORITIES,
  TASK_STATUS,
  EMPLOYEE_STATUS,
  STATUS_TRANSITIONS,
  ACTIVE_TASK_STATUSES,
  CLOSED_TASK_STATUSES,
  MAX_ACTIVE_TASKS,
} = require('../constants');
const { getPagination, buildPaginationMeta, escapeRegex, toList } = require('../utils/query');
const { parseDateOnly, getToday, formatDateOnly, isWithinRange } = require('../utils/dates');
const { isValidObjectId } = require('../validators/helpers');
const { toSnapshot } = require('./employeeService');

const SORT_FIELDS = {
  createdAt: 'createdAt',
  dueDate: 'dueDate',
  priority: 'priorityRank',
  title: 'title',
};

function overdueFilter(today = getToday()) {
  return { status: { $in: ACTIVE_TASK_STATUSES }, dueDate: { $lt: today } };
}

function pickEnumValues(value, allowed, label) {
  const values = toList(value);
  const invalid = values.find((item) => !allowed.includes(item));
  if (invalid) throw ApiError.badRequest(`Unknown ${label}: ${invalid}`);
  return values;
}

function buildTaskFilter(query) {
  const conditions = [];

  if (query.search) {
    const regex = new RegExp(escapeRegex(query.search.trim()), 'i');
    conditions.push({
      $or: [{ title: regex }, { 'employeeSnapshot.fullName': regex }, { taskId: regex }],
    });
  }

  const departments = pickEnumValues(query.department, DEPARTMENTS, 'department');
  if (departments.length) conditions.push({ department: { $in: departments } });

  const priorities = pickEnumValues(query.priority, PRIORITIES, 'priority');
  if (priorities.length) conditions.push({ priority: { $in: priorities } });

  const statuses = pickEnumValues(query.status, Object.values(TASK_STATUS), 'status');
  if (statuses.length) conditions.push({ status: { $in: statuses } });

  if (query.employee) {
    if (!isValidObjectId(query.employee)) throw ApiError.badRequest('Invalid employee filter');
    conditions.push({ employee: query.employee });
  }

  if (query.dueFrom || query.dueTo) {
    const dueFrom = query.dueFrom ? parseDateOnly(query.dueFrom) : null;
    const dueTo = query.dueTo ? parseDateOnly(query.dueTo) : null;
    if ((query.dueFrom && !dueFrom) || (query.dueTo && !dueTo)) {
      throw ApiError.badRequest('Due date filter must be in YYYY-MM-DD format');
    }
    if (dueFrom && dueTo && dueTo < dueFrom) {
      throw ApiError.badRequest('"Due to" date cannot be earlier than "Due from" date');
    }
    const range = {};
    if (dueFrom) range.$gte = dueFrom;
    if (dueTo) range.$lte = dueTo;
    conditions.push({ dueDate: range });
  }

  if (query.overdue === 'true') conditions.push(overdueFilter());

  return conditions.length ? { $and: conditions } : {};
}

function buildTaskSort(query) {
  const field = SORT_FIELDS[query.sortBy] || 'createdAt';
  const direction = query.order === 'asc' ? 1 : -1;
  return { [field]: direction, _id: direction };
}

async function generateTaskId() {
  const seq = await Counter.next('task');
  return `TSK-${String(seq).padStart(3, '0')}`;
}

async function findTaskOrFail(id) {
  if (!isValidObjectId(id)) throw ApiError.notFound('Task not found');
  const task = await Task.findById(id);
  if (!task) throw ApiError.notFound('Task not found');
  return task;
}

function assertEmployeeAvailable(employee, startDate) {
  if (employee.status === EMPLOYEE_STATUS.INACTIVE) {
    throw ApiError.badRequest(`${employee.fullName} is inactive and cannot be assigned tasks.`, {
      employee: 'Employee is inactive',
    });
  }

  if (
    employee.status === EMPLOYEE_STATUS.ON_LEAVE &&
    isWithinRange(startDate, employee.leaveStart, employee.leaveEnd)
  ) {
    throw ApiError.badRequest(
      `${employee.fullName} is on leave from ${formatDateOnly(employee.leaveStart)} to ${formatDateOnly(
        employee.leaveEnd
      )}. Choose a start date outside the leave period or another employee.`,
      { startDate: 'Start date falls inside the employee leave period' }
    );
  }
}

async function getAssignableEmployee(employeeId, startDate) {
  const employee = await Employee.findById(employeeId);
  if (!employee) {
    throw ApiError.badRequest('Selected employee does not exist', { employee: 'Employee not found' });
  }
  assertEmployeeAvailable(employee, startDate);
  return employee;
}

// Atomic "check and increment". Two parallel requests can't both pass when the
// employee already has 2 active tasks, because only one update matches $lt.
async function reserveTaskSlot(employee) {
  const updated = await Employee.findOneAndUpdate(
    { _id: employee._id, activeTaskCount: { $lt: MAX_ACTIVE_TASKS } },
    { $inc: { activeTaskCount: 1 } },
    { new: true }
  );
  if (!updated) {
    throw ApiError.badRequest(
      `${employee.fullName} already has ${MAX_ACTIVE_TASKS} active tasks. Please choose another employee.`,
      { employee: `Employee already has ${MAX_ACTIVE_TASKS} active tasks` }
    );
  }
}

async function releaseTaskSlot(employeeId) {
  await Employee.updateOne({ _id: employeeId, activeTaskCount: { $gt: 0 } }, { $inc: { activeTaskCount: -1 } });
}

async function listTasks(query) {
  const filter = buildTaskFilter(query);
  const { page, limit, skip } = getPagination(query);

  const [tasks, total] = await Promise.all([
    Task.find(filter)
      .sort(buildTaskSort(query))
      .collation({ locale: 'en', strength: 2 })
      .skip(skip)
      .limit(limit),
    Task.countDocuments(filter),
  ]);

  return { data: tasks, pagination: buildPaginationMeta(page, limit, total) };
}

async function listTasksForExport(query) {
  return Task.find(buildTaskFilter(query))
    .sort(buildTaskSort(query))
    .collation({ locale: 'en', strength: 2 })
    .lean();
}

async function getTaskById(id) {
  return findTaskOrFail(id);
}

async function createTask(data) {
  const employee = await getAssignableEmployee(data.employee, data.startDate);
  await reserveTaskSlot(employee);

  try {
    return await Task.create({
      ...data,
      taskId: await generateTaskId(),
      employeeSnapshot: toSnapshot(employee),
      status: TASK_STATUS.TODO,
      completedDate: null,
    });
  } catch (err) {
    await releaseTaskSlot(employee._id);
    throw err;
  }
}

async function updateTask(id, data) {
  const task = await findTaskOrFail(id);

  if (CLOSED_TASK_STATUSES.includes(task.status)) {
    throw ApiError.badRequest(`${task.status} tasks cannot be edited.`);
  }

  const previousEmployeeId = task.employee;
  const employeeChanged = String(previousEmployeeId) !== String(data.employee);
  const startDateChanged = task.startDate.getTime() !== data.startDate.getTime();

  let employee = null;
  if (employeeChanged || startDateChanged) {
    employee = await getAssignableEmployee(data.employee, data.startDate);
  }

  if (employeeChanged) {
    await reserveTaskSlot(employee);
  }

  try {
    task.set(data);
    if (employee) task.employeeSnapshot = toSnapshot(employee);
    await task.save();
  } catch (err) {
    if (employeeChanged) await releaseTaskSlot(employee._id);
    throw err;
  }

  if (employeeChanged) await releaseTaskSlot(previousEmployeeId);

  return task;
}

async function updateTaskStatus(id, nextStatus) {
  const task = await findTaskOrFail(id);
  const allowed = STATUS_TRANSITIONS[task.status] || [];

  if (task.status === nextStatus) {
    throw ApiError.badRequest(`Task is already ${nextStatus}.`);
  }
  if (!allowed.includes(nextStatus)) {
    throw ApiError.badRequest(`Status cannot change from ${task.status} to ${nextStatus}.`);
  }

  const update = { status: nextStatus };
  if (nextStatus === TASK_STATUS.COMPLETED) {
    update.completedDate = new Date();
  }

  // only update if nobody changed the status in the meantime
  const updated = await Task.findOneAndUpdate({ _id: task._id, status: task.status }, { $set: update }, { new: true });
  if (!updated) {
    throw ApiError.badRequest('Task status was changed by someone else. Refresh and try again.');
  }

  if (CLOSED_TASK_STATUSES.includes(nextStatus)) {
    await releaseTaskSlot(updated.employee);
  }

  return updated;
}

async function deleteTask(id) {
  const task = await findTaskOrFail(id);
  await task.deleteOne();

  if (ACTIVE_TASK_STATUSES.includes(task.status)) {
    await releaseTaskSlot(task.employee);
  }
  return task;
}

module.exports = {
  listTasks,
  listTasksForExport,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  overdueFilter,
};
