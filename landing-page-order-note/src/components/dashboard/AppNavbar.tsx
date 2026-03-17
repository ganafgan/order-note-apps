import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AppNavbar() {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const rawUser = localStorage.getItem('user');
  const user = rawUser ? JSON.parse(rawUser) : { fullname: 'User', email: '' };
  const initials = user.fullname
    ? user.fullname.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <header className="app-navbar">
      <div className="app-navbar-left">
        <span className="app-navbar-logo">NoteOrder.</span>
        <div className="app-navbar-welcome">
          <span className="welcome-text">Welcome back,</span>
          <span className="welcome-name">{user.fullname}</span>
        </div>
      </div>

      <div className="app-navbar-right" ref={dropdownRef}>
        <button
          className="user-avatar-btn"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          aria-label="User menu"
          id="user-menu-btn"
        >
          <div className="user-avatar">{initials}</div>
          <div className="user-info">
            <span className="user-info-name">{user.fullname}</span>
            <span className="user-info-email">{user.email}</span>
          </div>
          <svg className={`chevron ${dropdownOpen ? 'open' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {dropdownOpen && (
          <div className="user-dropdown" id="user-dropdown">
            <div className="dropdown-header">
              <div className="user-avatar dropdown-avatar">{initials}</div>
              <div>
                <p className="dropdown-name">{user.fullname}</p>
                <p className="dropdown-email">{user.email}</p>
              </div>
            </div>
            <div className="dropdown-divider" />
            <button className="dropdown-item" onClick={() => { setDropdownOpen(false); navigate('/dashboard/profile'); }} id="menu-profile">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              Profile
            </button>
            <div className="dropdown-divider" />
            <button className="dropdown-item danger" onClick={handleLogout} id="menu-logout">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
