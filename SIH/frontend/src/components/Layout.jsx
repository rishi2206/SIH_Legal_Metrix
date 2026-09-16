import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  Factory,
  History,
  UserCircle,
  Sun,
  Moon,
  LogOut,
  ShieldCheck,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { initials } from '../utils/format.js';

const supervisorLinks = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/inspections', label: 'Inspections', icon: ClipboardList },
  { to: '/history', label: 'History', icon: History },
  { to: '/profile', label: 'Profile', icon: UserCircle },
];

const adminLinks = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/supervisors', label: 'Supervisors', icon: Users },
  { to: '/manufacturers', label: 'Manufacturers', icon: Factory },
  { to: '/history', label: 'History', icon: History },
  { to: '/profile', label: 'Profile', icon: UserCircle },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = user?.role === 'ADMIN' ? adminLinks : supervisorLinks;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const NavItems = () => (
    <nav className="flex-1 px-3 space-y-1">
      {links.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={() => setMobileOpen(false)}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive
                ? 'bg-primary text-primary-text'
                : 'text-text-secondary hover:bg-surface-secondary hover:text-text-primary'
            }`
          }
        >
          <Icon size={18} />
          {label}
        </NavLink>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-background text-text-primary flex">
      {/* Sidebar - desktop */}
      <aside className="hidden md:flex md:flex-col w-64 border-r border-border bg-surface shrink-0">
        <div className="flex items-center gap-2 px-5 py-5 border-b border-border">
          <ShieldCheck className="text-primary" size={22} />
          <div>
            <p className="font-semibold leading-tight">LegalMetriX</p>
            <p className="text-xs text-text-muted leading-tight">Compliance Inspection</p>
          </div>
        </div>
        <div className="pt-4">
          <NavItems />
        </div>
        <div className="p-3 border-t border-border">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-text-secondary hover:bg-surface-secondary hover:text-text-primary transition-colors"
          >
            <LogOut size={18} />
            Log out
          </button>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-surface border-r border-border flex flex-col">
            <div className="flex items-center justify-between px-5 py-5 border-b border-border">
              <div className="flex items-center gap-2">
                <ShieldCheck className="text-primary" size={22} />
                <p className="font-semibold">LegalMetriX</p>
              </div>
              <button onClick={() => setMobileOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="pt-4">
              <NavItems />
            </div>
            <div className="p-3 border-t border-border">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-text-secondary hover:bg-surface-secondary"
              >
                <LogOut size={18} />
                Log out
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center justify-between gap-3 px-4 md:px-8 py-4 border-b border-border bg-surface">
          <button className="md:hidden" onClick={() => setMobileOpen(true)}>
            <Menu size={22} />
          </button>
          <div className="hidden md:block">
            <p className="text-sm text-text-muted">
              {user?.role === 'ADMIN' ? 'Administrator' : 'Supervisor'} workspace
            </p>
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-lg text-text-secondary hover:bg-surface-secondary transition-colors"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <div className="flex items-center gap-2.5 pl-3 border-l border-border">
              <div className="h-8 w-8 rounded-full bg-primary text-primary-text flex items-center justify-center text-xs font-semibold">
                {initials(user?.name)}
              </div>
              <div className="hidden sm:block leading-tight">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-text-muted">{user?.email}</p>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 px-4 md:px-8 py-6 max-w-6xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
