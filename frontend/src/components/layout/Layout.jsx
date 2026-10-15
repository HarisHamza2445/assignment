import { Container } from 'react-bootstrap';
import { Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import AppNavbar from './AppNavbar';

function Layout() {
  return (
    <>
      <AppNavbar />
      <Container fluid="xl" as="main" className="app-main">
        <Outlet />
      </Container>
      <ToastContainer position="top-right" autoClose={3500} newestOnTop pauseOnFocusLoss={false} />
    </>
  );
}

export default Layout;
