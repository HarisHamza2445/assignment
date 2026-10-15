import { Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import EmptyState from '../common/EmptyState';
import { MAX_ACTIVE_TASKS } from '../../constants';

function WorkloadTable({ rows }) {
  if (!rows.length) {
    return <EmptyState title="No active tasks right now" />;
  }

  return (
    <div className="table-responsive">
      <Table className="data-table align-middle mb-0">
        <thead>
          <tr>
            <th>Employee</th>
            <th className="d-none d-sm-table-cell">Department</th>
            <th>Active Tasks</th>
            <th>Overdue</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.employee}>
              <td>
                <Link to={`/tasks?employee=${row.employee}`} className="table-link">
                  {row.fullName}
                </Link>
              </td>
              <td className="d-none d-sm-table-cell">{row.department}</td>
              <td>
                <span className={row.activeTasks >= MAX_ACTIVE_TASKS ? 'fw-semibold text-danger' : ''}>
                  {row.activeTasks}
                </span>
              </td>
              <td className={row.overdueTasks ? 'overdue-text' : ''}>{row.overdueTasks}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

export default WorkloadTable;
