import { useState } from 'react';
import { Alert, Col, Form, Row } from 'react-bootstrap';
import { toast } from 'react-toastify';
import FormField from '../common/FormField';
import SubmitButton from '../common/SubmitButton';
import { DEPARTMENTS, EMPLOYEE_STATUSES } from '../../constants';
import { validateEmployeeForm } from '../../utils/validators';
import { getErrorMessage, getFieldErrors } from '../../utils/apiError';
import { todayInputDate } from '../../utils/date';

const EMPTY_EMPLOYEE = {
  employeeId: '',
  fullName: '',
  email: '',
  phone: '',
  department: '',
  role: '',
  joiningDate: '',
  status: 'Active',
  skills: '',
  leaveStart: '',
  leaveEnd: '',
};

function EmployeeForm({ initialValues = EMPTY_EMPLOYEE, onSubmit, submitLabel = 'Submit' }) {
  const [values, setValues] = useState({ ...EMPTY_EMPLOYEE, ...initialValues });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isOnLeave = values.status === 'On Leave';

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setServerError('');

    const validationErrors = validateEmployeeForm(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length) return;

    const payload = {
      ...values,
      employeeId: values.employeeId.trim().toUpperCase(),
      fullName: values.fullName.trim(),
      email: values.email.trim().toLowerCase(),
      phone: values.phone.trim(),
      role: values.role.trim(),
      skills: values.skills
        .split(',')
        .map((skill) => skill.trim())
        .filter(Boolean),
      leaveStart: isOnLeave ? values.leaveStart : null,
      leaveEnd: isOnLeave ? values.leaveEnd : null,
    };

    setSubmitting(true);
    try {
      await onSubmit(payload);
    } catch (err) {
      const message = getErrorMessage(err);
      setServerError(message);
      setErrors(getFieldErrors(err));
      toast.error(message);
      setSubmitting(false);
    }
  };

  const textField = (name, label, props = {}) => (
    <FormField label={label} name={name} error={errors[name]} required={props.required}>
      <Form.Control
        name={name}
        value={values[name]}
        onChange={handleChange}
        isInvalid={!!errors[name]}
        {...props}
      />
    </FormField>
  );

  return (
    <Form noValidate onSubmit={handleSubmit}>
      <Row className="g-3">
        <Col md={6}>{textField('employeeId', 'Employee ID', { placeholder: 'e.g. EMP-010', required: true, maxLength: 20 })}</Col>
        <Col md={6}>{textField('fullName', 'Full Name', { placeholder: 'Enter full name', required: true, maxLength: 60 })}</Col>
        <Col md={6}>{textField('email', 'Email', { type: 'email', placeholder: 'name@company.com', required: true })}</Col>
        <Col md={6}>{textField('phone', 'Phone', { type: 'tel', placeholder: '10-15 digits', required: true })}</Col>
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
        <Col md={6}>{textField('role', 'Role', { placeholder: 'e.g. Frontend Developer', required: true, maxLength: 50 })}</Col>
        <Col md={6}>
          {textField('joiningDate', 'Joining Date', { type: 'date', max: todayInputDate(), required: true })}
        </Col>
        <Col md={6}>
          <FormField label="Status" name="status" error={errors.status} required>
            <Form.Select name="status" value={values.status} onChange={handleChange} isInvalid={!!errors.status}>
              {EMPLOYEE_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </Form.Select>
          </FormField>
        </Col>
        {isOnLeave && (
          <>
            <Col md={6}>{textField('leaveStart', 'Leave Start', { type: 'date', required: true })}</Col>
            <Col md={6}>
              {textField('leaveEnd', 'Leave End', { type: 'date', min: values.leaveStart || undefined, required: true })}
            </Col>
          </>
        )}
        <Col xs={12}>
          <FormField label="Skills" name="skills" error={errors.skills} hint="Separate skills with commas">
            <Form.Control
              name="skills"
              value={values.skills}
              onChange={handleChange}
              placeholder="React, Node.js, MongoDB"
              isInvalid={!!errors.skills}
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

export default EmployeeForm;
