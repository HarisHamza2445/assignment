import { Form } from 'react-bootstrap';

function FormField({ label, name, error, required, hint, children }) {
  return (
    <Form.Group controlId={name} className="form-field">
      <Form.Label>
        {label}
        {required && <span className="text-danger"> *</span>}
      </Form.Label>
      {children}
      {hint && !error && <Form.Text muted>{hint}</Form.Text>}
      {error && <div className="invalid-feedback d-block">{error}</div>}
    </Form.Group>
  );
}

export default FormField;
