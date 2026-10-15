const Employee = require('../models/Employee');
const Task = require('../models/Task');
const ApiError = require('../utils/ApiError');
const { DEPARTMENTS, EMPLOYEE_STATUS, ACTIVE_TASK_STATUSES } = require('../constants');
const { getPagination, buildPaginationMeta, escapeRegex, toList } = require('../utils/query');
const { isValidObjectId } = require('../validators/helpers');

const SORT_FIELDS = {
  createdAt: 'createdAt',
  name: 'fullName',
  employeeId: 'employeeId',
  joiningDate: 'joiningDate',
  department: 'department',
};

function buildEmployeeFilter(query) {
  const filter = {};

  if (query.search) {
    const regex = new RegExp(escapeRegex(query.search.trim()), 'i');
    filter.$or = [{ fullName: regex }, { email: regex }, { employeeId: regex }];
  }

  const departments = toList(query.department);
  if (departments.length) {
    const invalid = departments.find((dept) => !DEPARTMENTS.includes(dept));
    if (invalid) throw ApiError.badRequest(`Unknown department: ${invalid}`);
    filter.department = { $in: departments };
  }

  const statuses = toList(query.status);
  if (statuses.length) {
    const invalid = statuses.find((status) => !Object.values(EMPLOYEE_STATUS).includes(status));
    if (invalid) throw ApiError.badRequest(`Unknown employee status: ${invalid}`);
    filter.status = { $in: statuses };
  }

  return filter;
}

function buildEmployeeSort(query) {
  const field = SORT_FIELDS[query.sortBy] || 'createdAt';
  const direction = query.order === 'asc' ? 1 : -1;
  return { [field]: direction, _id: direction };
}

function toSnapshot(employee) {
  return {
    employeeId: employee.employeeId,
    fullName: employee.fullName,
    email: employee.email,
    department: employee.department,
    role: employee.role,
    removed: false,
  };
}

async function listEmployees(query) {
  const filter = buildEmployeeFilter(query);
  const { page, limit, skip } = getPagination(query);

  const [employees, total] = await Promise.all([
    Employee.find(filter)
      .sort(buildEmployeeSort(query))
      .collation({ locale: 'en', strength: 2 })
      .skip(skip)
      .limit(limit),
    Employee.countDocuments(filter),
  ]);

  return { data: employees, pagination: buildPaginationMeta(page, limit, total) };
}

// Small payload for the "Assigned Employee" dropdown
async function listEmployeeOptions() {
  return Employee.find({}, 'employeeId fullName department status leaveStart leaveEnd activeTaskCount')
    .sort({ fullName: 1 })
    .collation({ locale: 'en', strength: 2 });
}

async function getEmployeeById(id) {
  if (!isValidObjectId(id)) throw ApiError.notFound('Employee not found');
  const employee = await Employee.findById(id);
  if (!employee) throw ApiError.notFound('Employee not found');
  return employee;
}

async function createEmployee(data) {
  return Employee.create(data);
}

async function updateEmployee(id, data) {
  const employee = await getEmployeeById(id);
  employee.set(data);
  await employee.save();

  // keep the denormalized details on tasks in sync (name/email/role changes)
  await Task.updateMany({ employee: employee._id }, { $set: { employeeSnapshot: toSnapshot(employee) } });

  return employee;
}

async function deleteEmployee(id) {
  const employee = await getEmployeeById(id);

  const openTasks = await Task.countDocuments({
    employee: employee._id,
    status: { $in: ACTIVE_TASK_STATUSES },
  });
  if (openTasks > 0) {
    throw ApiError.badRequest(
      `${employee.fullName} still has ${openTasks} open task(s) (Todo / In Progress). Complete, cancel or reassign them before deleting.`
    );
  }

  // activeTaskCount check makes this atomic with task assignment: if a task got
  // assigned in between, the delete simply won't match.
  const deleted = await Employee.findOneAndDelete({ _id: employee._id, activeTaskCount: { $lte: 0 } });
  if (!deleted) {
    throw ApiError.badRequest(`${employee.fullName} was just assigned a task and cannot be deleted.`);
  }

  // old tasks keep their snapshot, we only flag that the employee no longer exists
  await Task.updateMany({ employee: employee._id }, { $set: { 'employeeSnapshot.removed': true } });

  return deleted;
}

module.exports = {
  listEmployees,
  listEmployeeOptions,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  toSnapshot,
};
