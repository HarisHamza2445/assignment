import { Form } from 'react-bootstrap';

function FilterSelect({ label, value, options, onChange }) {
  return (
    <Form.Select size="sm" value={value} onChange={(e) => onChange(e.target.value)} aria-label={label}>
      <option value="">{label}</option>
      {options.map((option) => {
        const optionValue = typeof option === 'string' ? option : option.value;
        const optionLabel = typeof option === 'string' ? option : option.label;
        return (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        );
      })}
    </Form.Select>
  );
}

export default FilterSelect;
