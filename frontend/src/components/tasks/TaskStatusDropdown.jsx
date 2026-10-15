import { Dropdown, Spinner } from 'react-bootstrap';
import StatusBadge from '../common/StatusBadge';

const TOGGLE_CLASS = {
  Todo: 'status--todo',
  'In Progress': 'status--progress',
  Completed: 'status--completed',
  Cancelled: 'status--cancelled',
};

// Only the transitions the backend says are allowed are shown here
function TaskStatusDropdown({ task, loading, onChange }) {
  const nextStatuses = task.nextStatuses || [];

  if (!nextStatuses.length) {
    return <StatusBadge status={task.status} />;
  }

  return (
    <Dropdown>
      <Dropdown.Toggle
        size="sm"
        className={`status-badge status-toggle ${TOGGLE_CLASS[task.status]}`}
        disabled={loading}
        aria-label={`Change status, current ${task.status}`}
      >
        {loading && <Spinner animation="border" size="sm" className="me-1" />}
        {task.status}
      </Dropdown.Toggle>
      <Dropdown.Menu popperConfig={{ strategy: 'fixed' }} renderOnMount>
        {nextStatuses.map((status) => (
          <Dropdown.Item key={status} onClick={() => onChange(task, status)}>
            {status}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
}

export default TaskStatusDropdown;
