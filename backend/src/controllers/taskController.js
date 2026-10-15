const asyncHandler = require('../utils/asyncHandler');
const taskService = require('../services/taskService');
const { validateTask, validateStatus } = require('../validators/taskValidator');
const { isTaskOverdue } = require('../models/Task');
const { toCsv } = require('../utils/csv');
const { formatDateOnly, getToday } = require('../utils/dates');

const getTasks = asyncHandler(async (req, res) => {
  const result = await taskService.listTasks(req.query);
  res.json(result);
});

const getTask = asyncHandler(async (req, res) => {
  const task = await taskService.getTaskById(req.params.id);
  res.json({ data: task });
});

const createTask = asyncHandler(async (req, res) => {
  const payload = validateTask(req.body);
  const task = await taskService.createTask(payload);
  res.status(201).json({ data: task, message: `Task ${task.taskId} created successfully` });
});

const updateTask = asyncHandler(async (req, res) => {
  const payload = validateTask(req.body);
  const task = await taskService.updateTask(req.params.id, payload);
  res.json({ data: task, message: `Task ${task.taskId} updated successfully` });
});

const updateTaskStatus = asyncHandler(async (req, res) => {
  const status = validateStatus(req.body);
  const task = await taskService.updateTaskStatus(req.params.id, status);
  res.json({ data: task, message: `${task.taskId} moved to ${task.status}` });
});

const deleteTask = asyncHandler(async (req, res) => {
  const task = await taskService.deleteTask(req.params.id);
  res.json({ message: `Task ${task.taskId} deleted successfully` });
});

const CSV_COLUMNS = [
  { label: 'Task ID', value: (t) => t.taskId },
  { label: 'Title', value: (t) => t.title },
  { label: 'Description', value: (t) => t.description },
  { label: 'Employee ID', value: (t) => t.employeeSnapshot?.employeeId },
  {
    label: 'Employee Name',
    value: (t) => `${t.employeeSnapshot?.fullName || ''}${t.employeeSnapshot?.removed ? ' (removed)' : ''}`,
  },
  { label: 'Department', value: (t) => t.department },
  { label: 'Priority', value: (t) => t.priority },
  { label: 'Status', value: (t) => t.status },
  { label: 'Start Date', value: (t) => formatDateOnly(t.startDate) },
  { label: 'Due Date', value: (t) => formatDateOnly(t.dueDate) },
  { label: 'Overdue', value: (t) => (t.isOverdue ? 'Yes' : 'No') },
  { label: 'Created Date', value: (t) => formatDateOnly(t.createdAt) },
  { label: 'Completed Date', value: (t) => formatDateOnly(t.completedDate) },
];

const exportTasks = asyncHandler(async (req, res) => {
  const tasks = await taskService.listTasksForExport(req.query);
  const today = getToday();
  const rows = tasks.map((task) => ({ ...task, isOverdue: isTaskOverdue(task, today) }));

  const filename = `tasks-${formatDateOnly(today)}.csv`;
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  // BOM so Excel opens UTF-8 correctly
  res.send(`﻿${toCsv(CSV_COLUMNS, rows)}`);
});

module.exports = {
  getTasks,
  getTask,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  exportTasks,
};
