import { Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import RowActions from '../common/RowActions';
import StatusBadge from '../common/StatusBadge';
import { MAX_ACTIVE_TASKS } from '../../constants';

function EmployeeTable({ employees, onDelete }) {
  return (
    <div className="table-responsive">
      <Table hover className="data-table align-middle mb-0">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th className="d-none d-lg-table-cell">Email</th>
            <th className="d-none d-md-table-cell">Department</th>
            <th className="d-none d-lg-table-cell">Role</th>
            <th>Status</th>
            <th className="d-none d-sm-table-cell">Active Tasks</th>
            <th className="text-end">Action</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((employee) => (
            <tr key={employee._id}>
              <td className="text-nowrap">{employee.employeeId}</td>
              <td>
                <Link to={`/employees/${employee._id}`} className="table-link">
                  {employee.fullName}
                </Link>
              </td>
              <td className="d-none d-lg-table-cell">{employee.email}</td>
              <td className="d-none d-md-table-cell">{employee.department}</td>
              <td className="d-none d-lg-table-cell">{employee.role}</td>
              <td>
                <StatusBadge status={employee.status} />
              </td>
              <td className="d-none d-sm-table-cell">
                {employee.activeTaskCount}/{MAX_ACTIVE_TASKS}
              </td>
              <td className="text-end">
                <RowActions
                  viewTo={`/employees/${employee._id}`}
                  editTo={`/employees/${employee._id}/edit`}
                  onDelete={() => onDelete(employee)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

export default EmployeeTable;
