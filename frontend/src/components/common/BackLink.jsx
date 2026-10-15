import { Link } from 'react-router-dom';

function BackLink({ to, children }) {
  return (
    <Link to={to} className="back-link">
      &larr; {children}
    </Link>
  );
}

export default BackLink;
