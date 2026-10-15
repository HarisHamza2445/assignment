import { Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import RowActions from '../common/RowActions';
import PriorityBadge from '../common/PriorityBadge';
import TaskStatusDropdown from './TaskStatusDropdown';
import DueDateCell from './DueDateCell';
import EmployeeName from './EmployeeName';

function TaskTable({ tasks, updatingId, onStatusChange, onDelete, hideEmployee = false }) {
  return (
    <div className="table-responsive">
      <Table hover className="data-table align-middle mb-0">
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            {!hideEmployee && <th className="d-none d-md-table-cell">Employee</th>}
            <th className="d-none d-sm-table-cell">Priority</th>
            <th>Status</th>
            <th>Due Date</th>
            <th className="text-end">Action</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task._id}>
              <td className="text-nowrap">{task.taskId}</td>
              <td>
                <Link to={`/tasks/${task._id}`} className="table-link">
                  {task.title}
                </Link>
              </td>
              {!hideEmployee && (
                <td className="d-none d-md-table-cell">
                  <EmployeeName task={task} />
                </td>
              )}
              <td className="d-none d-sm-table-cell">
                <PriorityBadge priority={task.priority} />
              </td>
              <td>
                <TaskStatusDropdown task={task} loading={updatingId === task._id} onChange={onStatusChange} />
              </td>
              <td className="text-nowrap">
                <DueDateCell task={task} />
              </td>
              <td className="text-end">
                <RowActions
                  viewTo={`/tasks/${task._id}`}
                  editTo={`/tasks/${task._id}/edit`}
                  canEdit={task.nextStatuses?.length > 0}
                  onDelete={() => onDelete(task)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

export default TaskTable;
