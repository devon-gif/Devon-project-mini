import { useLocation, useNavigate } from 'react-router';
import {
  Rocket, Building2, Inbox, CheckSquare,
  ChevronLeft, ChevronRight, LogOut, Video, Settings,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../AuthContext';
import twillLogo from 'figma:asset/cfb522460dc27b08bb7705cf0b5b5ed312f6b215.png';

const navItems = [
  { icon: Rocket, label: 'Mission Control', path: '/' },
  { icon: Building2, label: 'Accounts', path: '/accounts' },
  { icon: Video, label: 'Videos', path: '/videos' },
  { icon: Inbox, label: 'Inbox', path: '/inbox' },
  { icon: CheckSquare, label: 'Tasks', path: '/tasks' },
];

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className={`
      relative flex flex-col h-full border-r border-gray-200
      bg-white transition-all duration-300
      ${collapsed ? 'w-[68px]' : 'w-[220px]'}
    `}>
      {/* Logo */}
      <div className="flex items-center px-4 py-5 border-b border-gray-200">
        <img
          src={twillLogo}
          alt="Twill"
          className={`h-8 w-auto object-contain transition-all duration-300 ${collapsed ? 'h-6' : ''}`}
        />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`
                flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-150
                ${isActive
                  ? 'bg-[#FFD600] text-gray-900 shadow-[0_2px_8px_rgba(255,214,0,0.3)]'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700 border border-transparent'
                }
              `}
            >
              <item.icon className={`h-[18px] w-[18px] shrink-0 ${isActive ? 'text-gray-900' : ''}`} />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-1/2 z-20 flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-400 hover:text-gray-700 transition-colors shadow-sm"
      >
        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </button>

      {/* Bottom section */}
      <div className="border-t border-gray-200 px-3 py-3 space-y-2">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FFD600] text-xs text-gray-900" style={{ fontWeight: 600 }}>
            AK
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-gray-800">Alex Kim</p>
              <p className="truncate text-xs text-gray-400">alex@withtwill.com</p>
            </div>
          )}
        </div>
        <button
          onClick={() => navigate('/settings')}
          className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-all ${
            location.pathname === '/settings'
              ? 'bg-[#FFD600] text-gray-900'
              : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
          } ${collapsed ? 'justify-center' : ''}`}
        >
          <Settings className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Settings</span>}
        </button>
        <button
          onClick={handleLogout}
          className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-gray-400 hover:bg-red-50 hover:text-red-600 transition-all ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </aside>
  );
}