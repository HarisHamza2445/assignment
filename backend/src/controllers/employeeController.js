const asyncHandler = require('../utils/asyncHandler');
const employeeService = require('../services/employeeService');
const { validateEmployee } = require('../validators/employeeValidator');

const getEmployees = asyncHandler(async (req, res) => {
  const result = await employeeService.listEmployees(req.query);
  res.json(result);
});

const getEmployeeOptions = asyncHandler(async (req, res) => {
  const employees = await employeeService.listEmployeeOptions();
  res.json({ data: employees });
});

const getEmployee = asyncHandler(async (req, res) => {
  const employee = await employeeService.getEmployeeById(req.params.id);
  res.json({ data: employee });
});

const createEmployee = asyncHandler(async (req, res) => {
  const payload = validateEmployee(req.body);
  const employee = await employeeService.createEmployee(payload);
  res.status(201).json({ data: employee, message: 'Employee created successfully' });
});

const updateEmployee = asyncHandler(async (req, res) => {
  const payload = validateEmployee(req.body);
  const employee = await employeeService.updateEmployee(req.params.id, payload);
  res.json({ data: employee, message: 'Employee updated successfully' });
});

const deleteEmployee = asyncHandler(async (req, res) => {
  await employeeService.deleteEmployee(req.params.id);
  res.json({ message: 'Employee deleted successfully' });
});

module.exports = {
  getEmployees,
  getEmployeeOptions,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
};
