import { Button, Spinner } from 'react-bootstrap';

function SubmitButton({ loading, children, loadingText = 'Saving...' }) {
  return (
    <Button type="submit" className="btn-brand w-100" disabled={loading}>
      {loading ? (
        <>
          <Spinner animation="border" size="sm" className="me-2" />
          {loadingText}
        </>
      ) : (
        children
      )}
    </Button>
  );
}

export default SubmitButton;
