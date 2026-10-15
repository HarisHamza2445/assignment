import { Link } from 'react-router-dom';

// Uses the snapshot saved on the task, so it still works if the employee was deleted
function EmployeeName({ task, showCode = false }) {
  const snapshot = task.employeeSnapshot || {};
  const label = showCode ? `${snapshot.fullName} (${snapshot.employeeId})` : snapshot.fullName;

  if (snapshot.removed) {
    return (
      <span className="text-muted">
        {label} <small>(removed)</small>
      </span>
    );
  }
  return <Link to={`/employees/${task.employee}`}>{label}</Link>;
}

export default EmployeeName;
