import { Alert, Button } from 'react-bootstrap';

function ErrorState({ message, onRetry }) {
  return (
    <Alert variant="danger" className="d-flex flex-wrap align-items-center justify-content-between gap-2">
      <span>{message}</span>
      {onRetry && (
        <Button size="sm" variant="outline-danger" onClick={onRetry}>
          Try again
        </Button>
      )}
    </Alert>
  );
}

export default ErrorState;
