import { useState } from 'react';
import { useNavigate, useLocation, useSearchParams, Link } from 'react-router-dom';
import { ShieldCheck, Sun, Moon, UserCog, HardHat, Factory, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { Card, Button, Field, Input, ErrorBanner } from '../components/ui.jsx';

const ROLE_META = {
  ADMIN: { label: 'Admin', icon: UserCog, description: 'Manage supervisors and view all activity' },
  SUPERVISOR: { label: 'Supervisor', icon: HardHat, description: 'Run inspections in the field' },
  MANUFACTURER: {
    label: 'Manufacturer',
    icon: Factory,
    description: 'Check labels for defects before dispatch',
  },
};

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="absolute top-4 right-4 p-2 rounded-lg text-text-secondary hover:bg-surface-secondary transition-colors"
    >
      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}

function Brand() {
  return (
    <div className="flex flex-col items-center mb-8">
      <div className="h-12 w-12 rounded-xl bg-primary text-primary-text flex items-center justify-center mb-3">
        <ShieldCheck size={26} />
      </div>
      <h1 className="text-xl font-semibold text-text-primary">LegalMetriX</h1>
      <p className="text-sm text-text-muted mt-1 text-center">
        Packaged Commodities Compliance Inspection
      </p>
    </div>
  );
}

function RoleChoice({ onChoose }) {
  return (
    <div className="w-full max-w-sm">
      <Brand />
      <div className="space-y-3">
        {Object.entries(ROLE_META).map(([role, meta]) => {
          const Icon = meta.icon;
          return (
            <Card key={role} className="p-0 overflow-hidden hover:border-primary transition-colors">
              <button
                type="button"
                onClick={() => onChoose(role)}
                className="w-full flex items-center gap-4 text-left px-5 py-5"
              >
                <div className="h-11 w-11 rounded-lg bg-surface-secondary flex items-center justify-center text-primary shrink-0">
                  <Icon size={22} />
                </div>
                <div>
                  <p className="font-medium">Login as {meta.label}</p>
                  <p className="text-sm text-text-muted mt-0.5">{meta.description}</p>
                </div>
              </button>
            </Card>
          );
        })}
      </div>
      <p className="text-sm text-text-muted text-center mt-5">
        Manufacturing company? {' '}
        <Link to="/register" className="text-primary font-medium hover:underline">
          Register your company
        </Link>
      </p>
    </div>
  );
}

function LoginForm({ role, onBack }) {
  const { login, loading, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const meta = ROLE_META[role];
  const Icon = meta.icon;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const loggedInUser = await login(email, password);
      if (loggedInUser.role !== role) {
        logout();
        const actualLabel = ROLE_META[loggedInUser.role]?.label || loggedInUser.role;
        setError(`This account is a ${actualLabel} account — go back and choose "Login as ${actualLabel}" instead.`);
        return;
      }
      const redirectTo = location.state?.from || '/';
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="w-full max-w-sm">
      <Brand />
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary mb-4"
      >
        <ArrowLeft size={15} />
        Back
      </button>

      <Card className="p-6">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="h-9 w-9 rounded-lg bg-surface-secondary flex items-center justify-center text-primary">
            <Icon size={18} />
          </div>
          <p className="font-medium">{meta.label} sign in</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Email">
            <Input
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </Field>
          <Field label="Password">
            <Input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </Field>
          <ErrorBanner message={error} />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role');
  const [role, setRole] = useState(
    initialRole === 'ADMIN' || initialRole === 'SUPERVISOR' || initialRole === 'MANUFACTURER'
      ? initialRole
      : null
  );

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <ThemeToggle />
      {role ? (
        <LoginForm role={role} onBack={() => setRole(null)} />
      ) : (
        <RoleChoice onChoose={setRole} />
      )}
    </div>
  );
}
