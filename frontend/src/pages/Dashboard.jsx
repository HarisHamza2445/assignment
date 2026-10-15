import { Col, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader';
import Loader from '../components/common/Loader';
import ErrorState from '../components/common/ErrorState';
import StatCard from '../components/dashboard/StatCard';
import WorkloadTable from '../components/dashboard/WorkloadTable';
import useFetch from '../hooks/useFetch';
import { getDashboard } from '../api/dashboardApi';

function Dashboard() {
  const { data, loading, error, reload } = useFetch(getDashboard, []);

  if (loading) return <Loader text="Loading dashboard..." />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  const { employees, tasks, workload } = data;

  const employeeStats = [
    { label: 'Total Employees', value: employees.total, to: '/employees' },
    { label: 'Active', value: employees.active, tone: 'green', to: '/employees?status=Active' },
    { label: 'Inactive', value: employees.inactive, tone: 'grey', to: '/employees?status=Inactive' },
    { label: 'On Leave', value: employees.onLeave, tone: 'orange', to: '/employees?status=On%20Leave' },
  ];

  const taskStats = [
    { label: 'Total Tasks', value: tasks.total, to: '/tasks' },
    { label: 'Todo', value: tasks.todo, tone: 'grey', to: '/tasks?status=Todo' },
    { label: 'In Progress', value: tasks.inProgress, tone: 'blue', to: '/tasks?status=In%20Progress' },
    { label: 'Completed', value: tasks.completed, tone: 'green', to: '/tasks?status=Completed' },
    { label: 'Cancelled', value: tasks.cancelled, tone: 'brown', to: '/tasks?status=Cancelled' },
    { label: 'Overdue', value: tasks.overdue, tone: 'red', to: '/tasks?overdue=true' },
  ];

  return (
    <>
      <PageHeader title="Dashboard" />

      <Row className="g-3 mb-3">
        {employeeStats.map((stat) => (
          <Col key={stat.label} xs={6} md={3}>
            <Link to={stat.to} className="stat-link">
              <StatCard label={stat.label} value={stat.value} tone={stat.tone} />
            </Link>
          </Col>
        ))}
      </Row>

      <Row className="g-3 mb-4">
        {taskStats.map((stat) => (
          <Col key={stat.label} xs={6} md={4} xl={2}>
            <Link to={stat.to} className="stat-link">
              <StatCard label={stat.label} value={stat.value} tone={stat.tone} />
            </Link>
          </Col>
        ))}
      </Row>

      <div className="page-card workload-card">
        <h2 className="section-title">Employee Workload</h2>
        <WorkloadTable rows={workload} />
      </div>
    </>
  );
}

export default Dashboard;
