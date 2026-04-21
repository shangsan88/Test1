import { type ReactNode, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navLinks = [
  { to: '/dashboard', icon: '🏠', label: 'Dashboard' },
  { to: '/timetable', icon: '📅', label: 'Timetable' },
  { to: '/schedule', icon: '📝', label: 'My Schedule' },
  { to: '/news', icon: '📰', label: 'News Feed' },
  { to: '/interests', icon: '⭐', label: 'My Interests' },
  { to: '/settings', icon: '⚙️', label: 'Settings' },
];

export default function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-xl transform transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 lg:flex lg:flex-col`}>
        <div className="flex items-center gap-3 p-6 border-b">
          <span className="text-3xl">📅</span>
          <div>
            <h1 className="font-bold text-gray-800 text-lg leading-tight">School Timetable</h1>
            <p className="text-xs text-gray-500 capitalize">{user?.role} Portal</p>
          </div>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1">
          {navLinks.map(link => (
            <NavLink
              key={link.to} to={link.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 font-semibold'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                }`
              }
            >
              <span className="text-lg">{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-lg">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-gray-800 text-sm truncate">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.grade || user?.subject || user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-sm text-red-600 hover:text-red-700 hover:bg-red-50 py-2 px-3 rounded-lg transition text-left"
          >
            🚪 Sign Out
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b px-4 py-3 flex items-center gap-3 lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-gray-100">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-semibold text-gray-700">School Timetable</span>
        </header>
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
