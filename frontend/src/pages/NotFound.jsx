import { Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import EmptyState from '../components/common/EmptyState';

function NotFound() {
  return (
    <EmptyState title="Page not found">
      <p>The page you are looking for doesn&apos;t exist.</p>
      <Button as={Link} to="/dashboard" className="btn-brand">
        Go to dashboard
      </Button>
    </EmptyState>
  );
}

export default NotFound;
