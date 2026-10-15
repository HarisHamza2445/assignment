import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import FormPage from '../../components/common/FormPage';
import Loader from '../../components/common/Loader';
import ErrorState from '../../components/common/ErrorState';
import TaskForm from '../../components/tasks/TaskForm';
import useFetch from '../../hooks/useFetch';
import { createTask } from '../../api/taskApi';
import { getEmployeeOptions } from '../../api/employeeApi';

function TaskCreate() {
  const navigate = useNavigate();
  const { data: employees, loading, error, reload } = useFetch(getEmployeeOptions, []);

  const handleSubmit = async (values) => {
    const result = await createTask(values);
    toast.success(result.message);
    navigate(`/tasks/${result.data._id}`);
  };

  return (
    <FormPage title="Add Task" backTo="/tasks" backLabel="Back to tasks">
      {loading && <Loader />}
      {!loading && error && <ErrorState message={error} onRetry={reload} />}
      {!loading && !error && <TaskForm employees={employees} onSubmit={handleSubmit} />}
    </FormPage>
  );
}

export default TaskCreate;
