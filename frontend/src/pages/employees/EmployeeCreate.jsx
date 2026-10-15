import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import FormPage from '../../components/common/FormPage';
import EmployeeForm from '../../components/employees/EmployeeForm';
import { createEmployee } from '../../api/employeeApi';

function EmployeeCreate() {
  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    const result = await createEmployee(values);
    toast.success(result.message);
    navigate(`/employees/${result.data._id}`);
  };

  return (
    <FormPage title="Add Employee" backTo="/employees" backLabel="Back to employees">
      <EmployeeForm onSubmit={handleSubmit} />
    </FormPage>
  );
}

export default EmployeeCreate;
