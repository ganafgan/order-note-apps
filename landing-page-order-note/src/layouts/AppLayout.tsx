import { Outlet, Navigate } from 'react-router-dom';
import AppNavbar from '../components/dashboard/AppNavbar';
import Sidebar from '../components/dashboard/Sidebar';

export default function AppLayout() {
  // Simple auth guard
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-shell">
      <AppNavbar />
      <div className="app-body">
        <Sidebar />
        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
