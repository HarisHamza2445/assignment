import { useEffect, useState } from 'react';
import { Badge, Button, CloseButton } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import PageHeader from '../../components/common/PageHeader';
import Loader from '../../components/common/Loader';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';
import AppPagination from '../../components/common/AppPagination';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import TaskFilters from '../../components/tasks/TaskFilters';
import TaskTable from '../../components/tasks/TaskTable';
import useUrlFilters from '../../hooks/useUrlFilters';
import useFetch from '../../hooks/useFetch';
import { deleteTask, exportTasks, getTasks, updateTaskStatus } from '../../api/taskApi';
import { getBlobErrorMessage, getErrorMessage } from '../../utils/apiError';
import { downloadBlob } from '../../utils/download';
import { todayInputDate } from '../../utils/date';
import { PAGE_SIZE } from '../../constants';

const FILTER_KEYS = ['search', 'department', 'priority', 'status', 'dueFrom', 'dueTo', 'overdue', 'sortBy', 'order', 'employee'];

function TaskList() {
  const { filters, apiParams, updateFilters, setPage, clearFilters } = useUrlFilters(FILTER_KEYS);
  const paramsKey = JSON.stringify(apiParams);

  const { data, loading, error, reload } = useFetch(() => getTasks({ ...apiParams, limit: PAGE_SIZE }), [paramsKey]);

  const [updatingId, setUpdatingId] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);

  const tasks = data?.data || [];
  const pagination = data?.pagination;

  // e.g. deleting the last row on the last page
  useEffect(() => {
    if (pagination && pagination.total > 0 && pagination.page > pagination.totalPages) {
      setPage(pagination.totalPages);
    }
  }, [pagination, setPage]);

  const handleStatusChange = async (task, status) => {
    setUpdatingId(task._id);
    try {
      const result = await updateTaskStatus(task._id, status);
      toast.success(result.message);
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const result = await deleteTask(taskToDelete._id);
      toast.success(result.message);
      setTaskToDelete(null);
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      // export ignores pagination on the server, so drop page from params
      const { page, ...exportParams } = apiParams;
      const blob = await exportTasks(exportParams);
      downloadBlob(blob, `tasks-${todayInputDate()}.csv`);
      toast.success('CSV exported');
    } catch (err) {
      toast.error(await getBlobErrorMessage(err));
    } finally {
      setExporting(false);
    }
  };

  const employeeFilterName = filters.employee && tasks[0]?.employeeSnapshot?.fullName;

  return (
    <>
      <PageHeader title="Tasks">
        <Button as={Link} to="/tasks/new" className="btn-brand">
          + Add Task
        </Button>
        <Button className="btn-brand" onClick={handleExport} disabled={exporting}>
          {exporting ? 'Exporting...' : 'Export To CSV'}
        </Button>
      </PageHeader>

      <div className="page-card">
        <TaskFilters filters={filters} onChange={updateFilters} onClear={clearFilters} />

        {filters.employee && (
          <Badge bg="light" text="dark" className="filter-chip">
            Employee: {employeeFilterName || 'selected employee'}
            <CloseButton aria-label="Remove employee filter" onClick={() => updateFilters({ employee: '' })} />
          </Badge>
        )}

        {loading && <Loader text="Loading tasks..." />}
        {!loading && error && <ErrorState message={error} onRetry={reload} />}
        {!loading && !error && tasks.length === 0 && (
          <EmptyState title="No tasks found">Try changing the filters or add a new task.</EmptyState>
        )}
        {!loading && !error && tasks.length > 0 && (
          <>
            <TaskTable
              tasks={tasks}
              updatingId={updatingId}
              onStatusChange={handleStatusChange}
              onDelete={setTaskToDelete}
            />
            <AppPagination pagination={pagination} itemLabel="tasks" onPageChange={setPage} />
          </>
        )}
      </div>

      <ConfirmDialog
        show={!!taskToDelete}
        title="Delete task"
        message={taskToDelete && `Delete ${taskToDelete.taskId} "${taskToDelete.title}"? This cannot be undone.`}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setTaskToDelete(null)}
      />
    </>
  );
}

export default TaskList;
