import { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import AppNavbar from '../components/dashboard/AppNavbar';
import Sidebar from '../components/dashboard/Sidebar';

export default function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Simple auth guard
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="app-shell">
      <AppNavbar onToggleSidebar={toggleSidebar} />
      <div className="app-body">
        <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
