import { useMemo, useState } from 'react';
import { Alert, Col, Form, Row } from 'react-bootstrap';
import { toast } from 'react-toastify';
import FormField from '../common/FormField';
import SubmitButton from '../common/SubmitButton';
import { DEPARTMENTS, MAX_ACTIVE_TASKS, PRIORITIES } from '../../constants';
import { validateTaskForm } from '../../utils/validators';
import { getErrorMessage, getFieldErrors } from '../../utils/apiError';
import { formatDate } from '../../utils/date';

const EMPTY_TASK = {
  title: '',
  employee: '',
  priority: '',
  department: '',
  startDate: '',
  dueDate: '',
  description: '',
};

function employeeOptionLabel(employee, isCurrent) {
  let label = `${employee.fullName} (${employee.employeeId}) - ${employee.department}`;
  if (employee.status === 'Inactive') label += ' - Inactive';
  else if (employee.status === 'On Leave') label += ' - On Leave';
  else if (!isCurrent && employee.activeTaskCount >= MAX_ACTIVE_TASKS) label += ' - Full';
  return label;
}

function TaskForm({ initialValues = EMPTY_TASK, employees, onSubmit, submitLabel = 'Submit' }) {
  const [values, setValues] = useState({ ...EMPTY_TASK, ...initialValues });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const selectedEmployee = useMemo(
    () => employees.find((emp) => emp._id === values.employee),
    [employees, values.employee]
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((prev) => {
      const next = { ...prev, [name]: value };
      // pre-fill department from the employee if the user hasn't picked one
      if (name === 'employee' && !prev.department) {
        const employee = employees.find((emp) => emp._id === value);
        if (employee) next.department = employee.department;
      }
      return next;
    });
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setServerError('');

    const validationErrors = validateTaskForm(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length) return;

    setSubmitting(true);
    try {
      await onSubmit({
        ...values,
        title: values.title.trim(),
        description: values.description.trim(),
      });
    } catch (err) {
      const message = getErrorMessage(err);
      setServerError(message);
      setErrors(getFieldErrors(err));
      toast.error(message);
      setSubmitting(false);
    }
  };

  return (
    <Form noValidate onSubmit={handleSubmit}>
      <Row className="g-3">
        <Col md={6}>
          <FormField label="Title" name="title" error={errors.title} required>
            <Form.Control
              name="title"
              value={values.title}
              onChange={handleChange}
              placeholder="Enter title"
              maxLength={100}
              isInvalid={!!errors.title}
            />
          </FormField>
        </Col>
        <Col md={6}>
          <FormField
            label="Assigned Employee"
            name="employee"
            error={errors.employee}
            required
            hint={
              selectedEmployee?.status === 'On Leave'
                ? `On leave ${formatDate(selectedEmployee.leaveStart)} - ${formatDate(selectedEmployee.leaveEnd)}`
                : selectedEmployee && `${selectedEmployee.activeTaskCount}/${MAX_ACTIVE_TASKS} active tasks`
            }
          >
            <Form.Select name="employee" value={values.employee} onChange={handleChange} isInvalid={!!errors.employee}>
              <option value="">Select...</option>
              {employees.map((emp) => {
                const isCurrent = emp._id === initialValues.employee;
                return (
                  <option key={emp._id} value={emp._id} disabled={emp.status === 'Inactive' && !isCurrent}>
                    {employeeOptionLabel(emp, isCurrent)}
                  </option>
                );
              })}
            </Form.Select>
          </FormField>
        </Col>
        <Col md={6}>
          <FormField label="Priority" name="priority" error={errors.priority} required>
            <Form.Select name="priority" value={values.priority} onChange={handleChange} isInvalid={!!errors.priority}>
              <option value="">Select...</option>
              {PRIORITIES.map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </Form.Select>
          </FormField>
        </Col>
        <Col md={6}>
          <FormField label="Department" name="department" error={errors.department} required>
            <Form.Select
              name="department"
              value={values.department}
              onChange={handleChange}
              isInvalid={!!errors.department}
            >
              <option value="">Select...</option>
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </Form.Select>
          </FormField>
        </Col>
        <Col md={6}>
          <FormField label="Start Date" name="startDate" error={errors.startDate} required>
            <Form.Control
              type="date"
              name="startDate"
              value={values.startDate}
              onChange={handleChange}
              isInvalid={!!errors.startDate}
            />
          </FormField>
        </Col>
        <Col md={6}>
          <FormField label="Due Date" name="dueDate" error={errors.dueDate} required>
            <Form.Control
              type="date"
              name="dueDate"
              value={values.dueDate}
              min={values.startDate || undefined}
              onChange={handleChange}
              isInvalid={!!errors.dueDate}
            />
          </FormField>
        </Col>
        <Col xs={12}>
          <FormField
            label="Description"
            name="description"
            error={errors.description}
            hint={`${values.description.length}/1000`}
          >
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={values.description}
              onChange={handleChange}
              placeholder="Enter description"
              maxLength={1000}
              isInvalid={!!errors.description}
            />
          </FormField>
        </Col>
        {serverError && (
          <Col xs={12}>
            <Alert variant="danger" className="mb-0 py-2">
              {serverError}
            </Alert>
          </Col>
        )}
        <Col xs={12}>
          <SubmitButton loading={submitting}>{submitLabel}</SubmitButton>
        </Col>
      </Row>
    </Form>
  );
}

export default TaskForm;
