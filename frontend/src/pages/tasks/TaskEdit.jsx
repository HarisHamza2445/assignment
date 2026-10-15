import { Alert } from 'react-bootstrap';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import FormPage from '../../components/common/FormPage';
import Loader from '../../components/common/Loader';
import ErrorState from '../../components/common/ErrorState';
import TaskForm from '../../components/tasks/TaskForm';
import useFetch from '../../hooks/useFetch';
import { getTask, updateTask } from '../../api/taskApi';
import { getEmployeeOptions } from '../../api/employeeApi';
import { toInputDate } from '../../utils/date';

function toFormValues(task) {
  return {
    title: task.title,
    employee: task.employee,
    priority: task.priority,
    department: task.department,
    startDate: toInputDate(task.startDate),
    dueDate: toInputDate(task.dueDate),
    description: task.description || '',
  };
}

function TaskEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, loading, error, reload } = useFetch(
    () => Promise.all([getTask(id), getEmployeeOptions()]).then(([task, employees]) => ({ task, employees })),
    [id]
  );

  const handleSubmit = async (values) => {
    const result = await updateTask(id, values);
    toast.success(result.message);
    navigate(`/tasks/${id}`);
  };

  const task = data?.task;
  const isLocked = task && !task.nextStatuses?.length;

  return (
    <FormPage title={task ? `Edit Task ${task.taskId}` : 'Edit Task'} backTo={`/tasks/${id}`} backLabel="Back to task">
      {loading && <Loader />}
      {!loading && error && <ErrorState message={error} onRetry={reload} />}
      {!loading && isLocked && (
        <Alert variant="warning" className="mb-0">
          {task.status} tasks cannot be edited. <Link to={`/tasks/${id}`}>View task</Link>
        </Alert>
      )}
      {!loading && task && !isLocked && (
        <TaskForm
          initialValues={toFormValues(task)}
          employees={data.employees}
          onSubmit={handleSubmit}
          submitLabel="Update Task"
        />
      )}
    </FormPage>
  );
}

export default TaskEdit;
