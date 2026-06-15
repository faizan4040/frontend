import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FiHome, FiUsers, FiPhoneCall, FiClock, FiLogOut,
  FiMenu, FiX, FiBarChart2, FiChevronRight
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: FiHome, roles: ['admin', 'supervisor', 'employee'] },
  { path: '/attendance', label: 'Attendance', icon: FiClock, roles: ['admin', 'supervisor', 'employee'] },
  { path: '/leads', label: 'Leads', icon: FiPhoneCall, roles: ['admin', 'supervisor', 'employee'] },
  { path: '/users', label: 'Manage Users', icon: FiUsers, roles: ['admin'] },
  { path: '/attendance/history', label: 'Attendance History', icon: FiBarChart2, roles: ['admin', 'supervisor', 'employee'] },
];

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const filteredNav = navItems.filter(item => item.roles.includes(user?.role));

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 lg:relative lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <FiBarChart2 className="text-white text-sm" />
              </div>
              <span className="font-bold text-gray-900 text-lg">CRM Pro</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-500">
              <FiX size={20} />
            </button>
          </div>

          {/* User Info */}
          <div className="px-4 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 text-sm truncate">{user?.name}</p>
                <span className={`badge text-xs ${user?.role === 'admin' ? 'bg-purple-100 text-purple-700' : user?.role === 'supervisor' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                  {user?.role}
                </span>
              </div>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {filteredNav.map(({ path, label, icon: Icon }) => {
              const active = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
                >
                  <Icon size={18} />
                  {label}
                  {active && <FiChevronRight size={14} className="ml-auto" />}
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-3 border-t border-gray-100">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              <FiLogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-4 lg:px-6">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-500">
            <FiMenu size={22} />
          </button>
          <div>
            <h1 className="font-semibold text-gray-900">
              {filteredNav.find(n => n.path === location.pathname)?.label || 'CRM Pro'}
            </h1>
            <p className="text-xs text-gray-500">{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
