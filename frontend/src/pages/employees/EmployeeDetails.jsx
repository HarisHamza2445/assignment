import { useState } from 'react';
import { Button, Col, ProgressBar, Row } from 'react-bootstrap';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import BackLink from '../../components/common/BackLink';
import Loader from '../../components/common/Loader';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';
import DetailItem from '../../components/common/DetailItem';
import StatusBadge from '../../components/common/StatusBadge';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import TaskTable from '../../components/tasks/TaskTable';
import useFetch from '../../hooks/useFetch';
import { deleteEmployee, getEmployee } from '../../api/employeeApi';
import { deleteTask, getTasks, updateTaskStatus } from '../../api/taskApi';
import { getErrorMessage } from '../../utils/apiError';
import { formatDate } from '../../utils/date';
import { MAX_ACTIVE_TASKS } from '../../constants';

const RECENT_TASKS_LIMIT = 5;

function EmployeeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const employeeState = useFetch(() => getEmployee(id), [id]);
  const tasksState = useFetch(() => getTasks({ employee: id, limit: RECENT_TASKS_LIMIT }), [id]);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);

  const refreshAll = () => {
    employeeState.reload();
    tasksState.reload();
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const result = await deleteEmployee(id);
      toast.success(result.message);
      navigate('/employees');
    } catch (err) {
      toast.error(getErrorMessage(err));
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  const handleStatusChange = async (task, status) => {
    setUpdatingId(task._id);
    try {
      const result = await updateTaskStatus(task._id, status);
      toast.success(result.message);
      refreshAll();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUpdatingId(null);
    }
  };

  const handleTaskDelete = async () => {
    try {
      const result = await deleteTask(taskToDelete._id);
      toast.success(result.message);
      refreshAll();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setTaskToDelete(null);
    }
  };

  if (employeeState.loading) return <Loader text="Loading employee..." />;
  if (employeeState.error) return <ErrorState message={employeeState.error} onRetry={employeeState.reload} />;

  const employee = employeeState.data;
  const tasks = tasksState.data?.data || [];
  const totalTasks = tasksState.data?.pagination?.total || 0;
  const workloadPercent = Math.round((employee.activeTaskCount / MAX_ACTIVE_TASKS) * 100);

  return (
    <>
      <BackLink to="/employees">Back to employees</BackLink>

      <div className="details-header">
        <div className="d-flex align-items-center gap-3">
          <div className="avatar" aria-hidden="true">
            {employee.fullName
              .split(' ')
              .map((part) => part[0])
              .slice(0, 2)
              .join('')}
          </div>
          <div>
            <span className="details-header__code">{employee.employeeId}</span>
            <h1 className="details-header__title">{employee.fullName}</h1>
            <div className="details-header__meta">
              <span className="text-muted">
                {employee.role} · {employee.department}
              </span>
              <StatusBadge status={employee.status} />
            </div>
          </div>
        </div>
        <div className="details-header__actions">
          <Button as={Link} to={`/employees/${id}/edit`} variant="outline-secondary">
            Edit
          </Button>
          <Button variant="outline-danger" onClick={() => setConfirmDelete(true)}>
            Delete
          </Button>
        </div>
      </div>

      <Row className="g-3">
        <Col lg={4}>
          <div className="page-card mb-3">
            <h2 className="section-title">Contact &amp; Info</h2>
            <dl className="detail-list">
              <DetailItem label="Email">
                <a href={`mailto:${employee.email}`}>{employee.email}</a>
              </DetailItem>
              <DetailItem label="Phone">{employee.phone}</DetailItem>
              <DetailItem label="Joining Date">{formatDate(employee.joiningDate)}</DetailItem>
              {employee.status === 'On Leave' && (
                <DetailItem label="Leave Period">
                  {formatDate(employee.leaveStart)} - {formatDate(employee.leaveEnd)}
                </DetailItem>
              )}
            </dl>
          </div>
          <div className="page-card mb-3">
            <h2 className="section-title">Skills</h2>
            {employee.skills.length ? (
              <div className="skill-list">
                {employee.skills.map((skill) => (
                  <span key={skill} className="skill-tag">
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-muted mb-0">No skills added.</p>
            )}
          </div>
          <div className="page-card">
            <h2 className="section-title">Workload</h2>
            <p className="mb-2">
              {employee.activeTaskCount} of {MAX_ACTIVE_TASKS} active task slots used
            </p>
            <ProgressBar
              now={workloadPercent}
              variant={employee.activeTaskCount >= MAX_ACTIVE_TASKS ? 'danger' : 'success'}
              aria-label="Active task slots used"
            />
          </div>
        </Col>
        <Col lg={8}>
          <div className="page-card">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
              <h2 className="section-title mb-0">Recent Tasks</h2>
              <div className="d-flex gap-2">
                {totalTasks > RECENT_TASKS_LIMIT && (
                  <Button as={Link} to={`/tasks?employee=${id}`} size="sm" variant="outline-secondary">
                    View all {totalTasks}
                  </Button>
                )}
              </div>
            </div>
            {tasksState.loading && <Loader text="Loading tasks..." />}
            {!tasksState.loading && tasksState.error && (
              <ErrorState message={tasksState.error} onRetry={tasksState.reload} />
            )}
            {!tasksState.loading && !tasksState.error && tasks.length === 0 && (
              <EmptyState title="No tasks assigned yet" />
            )}
            {!tasksState.loading && tasks.length > 0 && (
              <TaskTable
                tasks={tasks}
                hideEmployee
                updatingId={updatingId}
                onStatusChange={handleStatusChange}
                onDelete={setTaskToDelete}
              />
            )}
          </div>
        </Col>
      </Row>

      <ConfirmDialog
        show={confirmDelete}
        title="Delete employee"
        message={`Delete ${employee.fullName}? Their past tasks will still be kept with their details.`}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
      <ConfirmDialog
        show={!!taskToDelete}
        title="Delete task"
        message={taskToDelete && `Delete ${taskToDelete.taskId} "${taskToDelete.title}"?`}
        onConfirm={handleTaskDelete}
        onCancel={() => setTaskToDelete(null)}
      />
    </>
  );
}

export default EmployeeDetails;
