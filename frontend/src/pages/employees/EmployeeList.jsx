import { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import PageHeader from '../../components/common/PageHeader';
import Loader from '../../components/common/Loader';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';
import AppPagination from '../../components/common/AppPagination';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import EmployeeFilters from '../../components/employees/EmployeeFilters';
import EmployeeTable from '../../components/employees/EmployeeTable';
import useUrlFilters from '../../hooks/useUrlFilters';
import useFetch from '../../hooks/useFetch';
import { deleteEmployee, getEmployees } from '../../api/employeeApi';
import { getErrorMessage } from '../../utils/apiError';
import { PAGE_SIZE } from '../../constants';

const FILTER_KEYS = ['search', 'department', 'status', 'sortBy', 'order'];

function EmployeeList() {
  const { filters, apiParams, updateFilters, setPage, clearFilters } = useUrlFilters(FILTER_KEYS);
  const paramsKey = JSON.stringify(apiParams);

  const { data, loading, error, reload } = useFetch(
    () => getEmployees({ ...apiParams, limit: PAGE_SIZE }),
    [paramsKey]
  );

  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const employees = data?.data || [];
  const pagination = data?.pagination;

  useEffect(() => {
    if (pagination && pagination.total > 0 && pagination.page > pagination.totalPages) {
      setPage(pagination.totalPages);
    }
  }, [pagination, setPage]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const result = await deleteEmployee(employeeToDelete._id);
      toast.success(result.message);
      setEmployeeToDelete(null);
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
      setEmployeeToDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <PageHeader title="Employees">
        <Button as={Link} to="/employees/new" className="btn-brand">
          + Add Employee
        </Button>
      </PageHeader>

      <div className="page-card">
        <EmployeeFilters filters={filters} onChange={updateFilters} onClear={clearFilters} />

        {loading && <Loader text="Loading employees..." />}
        {!loading && error && <ErrorState message={error} onRetry={reload} />}
        {!loading && !error && employees.length === 0 && (
          <EmptyState title="No employees found">Try changing the filters or add a new employee.</EmptyState>
        )}
        {!loading && !error && employees.length > 0 && (
          <>
            <EmployeeTable employees={employees} onDelete={setEmployeeToDelete} />
            <AppPagination pagination={pagination} itemLabel="employees" onPageChange={setPage} />
          </>
        )}
      </div>

      <ConfirmDialog
        show={!!employeeToDelete}
        title="Delete employee"
        message={
          employeeToDelete &&
          `Delete ${employeeToDelete.fullName} (${employeeToDelete.employeeId})? Their past tasks will still be kept.`
        }
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setEmployeeToDelete(null)}
      />
    </>
  );
}

export default EmployeeList;
