/* Fills the database with some sample employees and tasks for local testing.
   Usage: npm run seed  (this clears existing employees and tasks!) */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../src/config/db');
const Employee = require('../src/models/Employee');
const Task = require('../src/models/Task');
const Counter = require('../src/models/Counter');
const taskService = require('../src/services/taskService');
const { getToday, formatDateOnly } = require('../src/utils/dates');

const DAY = 24 * 60 * 60 * 1000;
const daysFromToday = (n) => formatDateOnly(new Date(getToday().getTime() + n * DAY));

const employees = [
  { employeeId: 'EMP-001', fullName: 'Rahul Sharma', email: 'rahul.sharma@example.com', phone: '9876543210', department: 'Development', role: 'Backend Developer', joiningDate: '2023-04-10', status: 'Active', skills: ['Node.js', 'MongoDB', 'Express'] },
  { employeeId: 'EMP-002', fullName: 'Priya Patil', email: 'priya.patil@example.com', phone: '9876543211', department: 'Design', role: 'UI/UX Designer', joiningDate: '2022-11-01', status: 'Active', skills: ['Figma', 'Illustrator'] },
  { employeeId: 'EMP-003', fullName: 'Amit Joshi', email: 'amit.joshi@example.com', phone: '9876543212', department: 'QA', role: 'QA Engineer', joiningDate: '2024-01-15', status: 'Active', skills: ['Selenium', 'Jest'] },
  { employeeId: 'EMP-004', fullName: 'Sneha Kulkarni', email: 'sneha.k@example.com', phone: '9876543213', department: 'HR', role: 'HR Executive', joiningDate: '2021-07-19', status: 'Active', skills: ['Recruitment'] },
  { employeeId: 'EMP-005', fullName: 'Vikram Singh', email: 'vikram.singh@example.com', phone: '9876543214', department: 'Sales', role: 'Sales Manager', joiningDate: '2020-03-02', status: 'Active', skills: ['Negotiation', 'CRM'] },
  { employeeId: 'EMP-006', fullName: 'Neha Verma', email: 'neha.verma@example.com', phone: '9876543215', department: 'Development', role: 'Frontend Developer', joiningDate: '2023-09-25', status: 'Active', skills: ['React', 'CSS'] },
  { employeeId: 'EMP-007', fullName: 'Karan Mehta', email: 'karan.mehta@example.com', phone: '9876543216', department: 'Development', role: 'DevOps Engineer', joiningDate: '2022-05-30', status: 'On Leave', skills: ['Docker', 'AWS'], leaveStart: daysFromToday(-2), leaveEnd: daysFromToday(5) },
  { employeeId: 'EMP-008', fullName: 'Anjali Deshmukh', email: 'anjali.d@example.com', phone: '9876543217', department: 'Design', role: 'Graphic Designer', joiningDate: '2019-12-12', status: 'Inactive', skills: ['Photoshop'] },
];

const tasks = [
  { title: 'Fix payment API bug', emp: 'EMP-001', department: 'Development', priority: 'High', start: -10, due: -3, moveTo: ['In Progress'] },
  { title: 'Design login screen', emp: 'EMP-002', department: 'Design', priority: 'Medium', start: -5, due: 6 },
  { title: 'Write test cases for checkout', emp: 'EMP-003', department: 'QA', priority: 'Low', start: -12, due: -6, moveTo: ['In Progress', 'Completed'] },
  { title: 'Update landing page', emp: 'EMP-002', department: 'Design', priority: 'Critical', start: -8, due: -1, moveTo: ['Cancelled'] },
  { title: 'Setup CI pipeline', emp: 'EMP-001', department: 'Development', priority: 'High', start: -1, due: 10 },
  { title: 'Plan Q3 hiring drive', emp: 'EMP-004', department: 'HR', priority: 'Medium', start: -3, due: 12, moveTo: ['In Progress'] },
  { title: 'Prepare client proposal', emp: 'EMP-005', department: 'Sales', priority: 'Critical', start: -6, due: -2 },
  { title: 'Build dashboard widgets', emp: 'EMP-006', department: 'Development', priority: 'Medium', start: 0, due: 8, moveTo: ['In Progress'] },
  { title: 'Regression testing for v2.1', emp: 'EMP-003', department: 'QA', priority: 'High', start: 1, due: 4 },
  { title: 'Onboarding docs refresh', emp: 'EMP-004', department: 'HR', priority: 'Low', start: -20, due: -10, moveTo: ['In Progress', 'Completed'] },
  { title: 'Optimize product search query', emp: 'EMP-001', department: 'Development', priority: 'Critical', start: 2, due: 9 },
  { title: 'Migrate servers to new region', emp: 'EMP-007', department: 'Development', priority: 'High', start: 7, due: 15 },
  { title: 'Monthly sales report', emp: 'EMP-005', department: 'Sales', priority: 'Medium', start: -15, due: -9, moveTo: ['In Progress', 'Completed'] },
  { title: 'Icon set for mobile app', emp: 'EMP-002', department: 'Design', priority: 'Low', start: 0, due: 14 },
];

async function seed() {
  await connectDB(process.env.MONGODB_URI);

  await Promise.all([Employee.deleteMany({}), Task.deleteMany({}), Counter.deleteMany({})]);

  const created = await Employee.insertMany(
    employees.map((emp) => ({
      ...emp,
      leaveStart: emp.leaveStart ? new Date(emp.leaveStart) : null,
      leaveEnd: emp.leaveEnd ? new Date(emp.leaveEnd) : null,
    }))
  );
  const byCode = Object.fromEntries(created.map((emp) => [emp.employeeId, emp]));

  for (const item of tasks) {
    const task = await taskService.createTask({
      title: item.title,
      description: `${item.title} - sample task created by the seed script.`,
      employee: String(byCode[item.emp]._id),
      department: item.department,
      priority: item.priority,
      startDate: new Date(daysFromToday(item.start)),
      dueDate: new Date(daysFromToday(item.due)),
    });
    for (const status of item.moveTo || []) {
      await taskService.updateTaskStatus(task._id, status);
    }
  }

  console.log(`Seeded ${created.length} employees and ${tasks.length} tasks`);
}

seed()
  .catch((err) => {
    console.error('Seeding failed:', err.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
