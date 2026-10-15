import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import FormPage from '../../components/common/FormPage';
import Loader from '../../components/common/Loader';
import ErrorState from '../../components/common/ErrorState';
import EmployeeForm from '../../components/employees/EmployeeForm';
import useFetch from '../../hooks/useFetch';
import { getEmployee, updateEmployee } from '../../api/employeeApi';
import { toInputDate } from '../../utils/date';

function toFormValues(employee) {
  return {
    employeeId: employee.employeeId,
    fullName: employee.fullName,
    email: employee.email,
    phone: employee.phone,
    department: employee.department,
    role: employee.role,
    joiningDate: toInputDate(employee.joiningDate),
    status: employee.status,
    skills: (employee.skills || []).join(', '),
    leaveStart: toInputDate(employee.leaveStart),
    leaveEnd: toInputDate(employee.leaveEnd),
  };
}

function EmployeeEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: employee, loading, error, reload } = useFetch(() => getEmployee(id), [id]);

  const handleSubmit = async (values) => {
    const result = await updateEmployee(id, values);
    toast.success(result.message);
    navigate(`/employees/${id}`);
  };

  return (
    <FormPage title="Edit Employee" backTo={`/employees/${id}`} backLabel="Back to employee">
      {loading && <Loader />}
      {!loading && error && <ErrorState message={error} onRetry={reload} />}
      {!loading && employee && (
        <EmployeeForm initialValues={toFormValues(employee)} onSubmit={handleSubmit} submitLabel="Update Employee" />
      )}
    </FormPage>
  );
}

export default EmployeeEdit;
