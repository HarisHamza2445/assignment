import { Spinner } from 'react-bootstrap';

function Loader({ text = 'Loading...' }) {
  return (
    <div className="loader">
      <Spinner animation="border" size="sm" role="status" />
      <span>{text}</span>
    </div>
  );
}

export default Loader;
