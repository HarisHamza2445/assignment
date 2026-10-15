const STATUS_CLASS = {
  Todo: 'status--todo',
  'In Progress': 'status--progress',
  Completed: 'status--completed',
  Cancelled: 'status--cancelled',
  Active: 'status--active',
  Inactive: 'status--inactive',
  'On Leave': 'status--leave',
};

function StatusBadge({ status }) {
  return <span className={`status-badge ${STATUS_CLASS[status] || ''}`}>{status}</span>;
}

export default StatusBadge;
