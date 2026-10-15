import { Container, Nav, Navbar } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';

const LINKS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/employees', label: 'Employees' },
  { to: '/tasks', label: 'Tasks' },
];

function AppNavbar() {
  return (
    <Navbar expand="md" variant="dark" className="app-navbar" collapseOnSelect>
      <Container fluid="xl">
        <Navbar.Brand as={NavLink} to="/dashboard" className="app-navbar__brand">
          EMS
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="main-nav" />
        <Navbar.Collapse id="main-nav">
          <Nav className="me-auto">
            {LINKS.map((link) => (
              <Nav.Link key={link.to} as={NavLink} to={link.to} eventKey={link.to}>
                {link.label}
              </Nav.Link>
            ))}
          </Nav>
          <Navbar.Text className="app-navbar__title d-none d-lg-block">Employee &amp; Task Management</Navbar.Text>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default AppNavbar;
