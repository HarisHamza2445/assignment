import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import EmployeeList from './pages/employees/EmployeeList';
import EmployeeCreate from './pages/employees/EmployeeCreate';
import EmployeeEdit from './pages/employees/EmployeeEdit';
import EmployeeDetails from './pages/employees/EmployeeDetails';
import TaskList from './pages/tasks/TaskList';
import TaskCreate from './pages/tasks/TaskCreate';
import TaskEdit from './pages/tasks/TaskEdit';
import TaskDetails from './pages/tasks/TaskDetails';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />

        <Route path="employees" element={<EmployeeList />} />
        <Route path="employees/new" element={<EmployeeCreate />} />
        <Route path="employees/:id" element={<EmployeeDetails />} />
        <Route path="employees/:id/edit" element={<EmployeeEdit />} />

        <Route path="tasks" element={<TaskList />} />
        <Route path="tasks/new" element={<TaskCreate />} />
        <Route path="tasks/:id" element={<TaskDetails />} />
        <Route path="tasks/:id/edit" element={<TaskEdit />} />

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;
