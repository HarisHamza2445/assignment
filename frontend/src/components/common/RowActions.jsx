import { Dropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function RowActions({ viewTo, editTo, canEdit = true, onDelete }) {
  return (
    <Dropdown align="end">
      <Dropdown.Toggle variant="link" className="kebab-toggle" aria-label="Actions">
        &#8942;
      </Dropdown.Toggle>
      <Dropdown.Menu popperConfig={{ strategy: 'fixed' }} renderOnMount>
        <Dropdown.Item as={Link} to={viewTo}>
          View
        </Dropdown.Item>
        {canEdit && (
          <Dropdown.Item as={Link} to={editTo}>
            Edit
          </Dropdown.Item>
        )}
        <Dropdown.Item className="text-danger" onClick={onDelete}>
          Delete
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
}

export default RowActions;
