import { useState } from 'react';
import { Badge, Button, Col, Row } from 'react-bootstrap';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import BackLink from '../../components/common/BackLink';
import Loader from '../../components/common/Loader';
import ErrorState from '../../components/common/ErrorState';
import DetailItem from '../../components/common/DetailItem';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import PriorityBadge from '../../components/common/PriorityBadge';
import TaskStatusDropdown from '../../components/tasks/TaskStatusDropdown';
import TaskTimeline from '../../components/tasks/TaskTimeline';
import DueDateCell from '../../components/tasks/DueDateCell';
import EmployeeName from '../../components/tasks/EmployeeName';
import useFetch from '../../hooks/useFetch';
import { deleteTask, getTask, updateTaskStatus } from '../../api/taskApi';
import { getErrorMessage } from '../../utils/apiError';

function TaskDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: task, loading, error, reload, setData } = useFetch(() => getTask(id), [id]);

  const [statusLoading, setStatusLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleStatusChange = async (current, status) => {
    setStatusLoading(true);
    try {
      const result = await updateTaskStatus(current._id, status);
      setData(result.data);
      toast.success(result.message);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setStatusLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const result = await deleteTask(id);
      toast.success(result.message);
      navigate('/tasks');
    } catch (err) {
      toast.error(getErrorMessage(err));
      setDeleting(false);
    }
  };

  if (loading) return <Loader text="Loading task..." />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  const canEdit = task.nextStatuses?.length > 0;
  const snapshot = task.employeeSnapshot;

  return (
    <>
      <BackLink to="/tasks">Back to tasks</BackLink>

      <div className="details-header">
        <div>
          <span className="details-header__code">{task.taskId}</span>
          <h1 className="details-header__title">{task.title}</h1>
          <div className="details-header__meta">
            <TaskStatusDropdown task={task} loading={statusLoading} onChange={handleStatusChange} />
            <PriorityBadge priority={task.priority} />
            {task.isOverdue && <Badge bg="danger">Overdue</Badge>}
          </div>
        </div>
        <div className="details-header__actions">
          {canEdit && (
            <Button as={Link} to={`/tasks/${id}/edit`} variant="outline-secondary">
              Edit
            </Button>
          )}
          <Button variant="outline-danger" onClick={() => setConfirmDelete(true)}>
            Delete
          </Button>
        </div>
      </div>

      <Row className="g-3">
        <Col lg={8}>
          <div className="page-card h-100">
            <h2 className="section-title">Details</h2>
            <dl className="detail-grid">
              <DetailItem label="Department">{task.department}</DetailItem>
              <DetailItem label="Priority">{task.priority}</DetailItem>
              <DetailItem label="Status">{task.status}</DetailItem>
              <DetailItem label="Due Date">
                <DueDateCell task={task} longFormat />
              </DetailItem>
            </dl>
            <h2 className="section-title mt-4">Description</h2>
            <p className="description-text">{task.description || 'No description added.'}</p>
            {!canEdit && (
              <p className="text-muted small mb-0">This task is {task.status.toLowerCase()} and can no longer be edited.</p>
            )}
          </div>
        </Col>
        <Col lg={4}>
          <div className="page-card mb-3">
            <h2 className="section-title">Assigned To</h2>
            <p className="assignee__name">
              <EmployeeName task={task} />
            </p>
            <dl className="detail-list">
              <DetailItem label="Employee ID">{snapshot.employeeId}</DetailItem>
              <DetailItem label="Email">{snapshot.email}</DetailItem>
              <DetailItem label="Role">{snapshot.role}</DetailItem>
              <DetailItem label="Department">{snapshot.department}</DetailItem>
            </dl>
            {snapshot.removed && (
              <p className="text-muted small mb-0">This employee has been removed. Details are kept from the time of assignment.</p>
            )}
          </div>
          <div className="page-card">
            <h2 className="section-title">Timeline</h2>
            <TaskTimeline task={task} />
          </div>
        </Col>
      </Row>

      <ConfirmDialog
        show={confirmDelete}
        title="Delete task"
        message={`Delete ${task.taskId} "${task.title}"? This cannot be undone.`}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </>
  );
}

export default TaskDetails;
