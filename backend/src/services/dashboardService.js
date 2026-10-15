const Employee = require('../models/Employee');
const Task = require('../models/Task');
const { EMPLOYEE_STATUS, TASK_STATUS, ACTIVE_TASK_STATUSES } = require('../constants');
const { getToday } = require('../utils/dates');
const { overdueFilter } = require('./taskService');

function countsByStatus(rows, statuses) {
  const result = {};
  statuses.forEach((status) => {
    result[status] = 0;
  });
  rows.forEach((row) => {
    result[row._id] = row.count;
  });
  return result;
}

async function getDashboardSummary() {
  const today = getToday();

  const [employeeRows, taskRows, overdueCount, workload] = await Promise.all([
    Employee.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Task.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Task.countDocuments(overdueFilter(today)),
    Task.aggregate([
      { $match: { status: { $in: ACTIVE_TASK_STATUSES } } },
      {
        $group: {
          _id: '$employee',
          employeeId: { $first: '$employeeSnapshot.employeeId' },
          fullName: { $first: '$employeeSnapshot.fullName' },
          department: { $first: '$employeeSnapshot.department' },
          activeTasks: { $sum: 1 },
          overdueTasks: { $sum: { $cond: [{ $lt: ['$dueDate', today] }, 1, 0] } },
        },
      },
      { $sort: { activeTasks: -1, fullName: 1 } },
    ]),
  ]);

  const employeeCounts = countsByStatus(employeeRows, Object.values(EMPLOYEE_STATUS));
  const taskCounts = countsByStatus(taskRows, Object.values(TASK_STATUS));

  return {
    employees: {
      total: Object.values(employeeCounts).reduce((sum, n) => sum + n, 0),
      active: employeeCounts[EMPLOYEE_STATUS.ACTIVE],
      inactive: employeeCounts[EMPLOYEE_STATUS.INACTIVE],
      onLeave: employeeCounts[EMPLOYEE_STATUS.ON_LEAVE],
    },
    tasks: {
      total: Object.values(taskCounts).reduce((sum, n) => sum + n, 0),
      todo: taskCounts[TASK_STATUS.TODO],
      inProgress: taskCounts[TASK_STATUS.IN_PROGRESS],
      completed: taskCounts[TASK_STATUS.COMPLETED],
      cancelled: taskCounts[TASK_STATUS.CANCELLED],
      overdue: overdueCount,
    },
    workload: workload.map((row) => ({
      employee: row._id,
      employeeId: row.employeeId,
      fullName: row.fullName,
      department: row.department,
      activeTasks: row.activeTasks,
      overdueTasks: row.overdueTasks,
    })),
  };
}

module.exports = { getDashboardSummary };
