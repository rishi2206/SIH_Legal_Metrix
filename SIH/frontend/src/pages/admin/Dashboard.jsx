import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, CheckCircle2, XCircle, Loader2, Users, Factory } from 'lucide-react';
import { api } from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { Card, ErrorBanner, Badge } from '../../components/ui.jsx';
import { userStatusTone, humanizeEnum } from '../../utils/format.js';

function StatCard({ icon: Icon, label, value, tone = 'text-primary' }) {
  return (
    <Card className="p-5 flex items-center gap-4">
      <div className={`h-11 w-11 rounded-lg bg-surface-secondary flex items-center justify-center ${tone}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-2xl font-semibold text-text-primary leading-tight">{value ?? '—'}</p>
        <p className="text-sm text-text-muted">{label}</p>
      </div>
    </Card>
  );
}

function UserListCard({ title, viewAllTo, loading, users, detailBasePath }) {
  return (
    <Card className="p-0 overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <h2 className="font-medium">{title}</h2>
        <Link to={viewAllTo} className="text-sm text-primary hover:underline">
          View all
        </Link>
      </div>
      {loading ? (
        <p className="text-sm text-text-muted px-5 py-8 text-center">Loading…</p>
      ) : users.length === 0 ? (
        <p className="text-sm text-text-muted px-5 py-8 text-center">None yet.</p>
      ) : (
        <ul className="divide-y divide-border">
          {users.map((u) => (
            <li key={u.id}>
              <Link
                to={`${detailBasePath}/${u.id}`}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-surface-secondary transition-colors"
              >
                <div>
                  <p className="font-medium text-sm">{u.name}</p>
                  <p className="text-xs text-text-muted mt-0.5">{u.email}</p>
                </div>
                <Badge tone={userStatusTone(u.status)}>{humanizeEnum(u.status)}</Badge>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [supervisors, setSupervisors] = useState([]);
  const [manufacturers, setManufacturers] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([api.getAdminDashboard(), api.getSupervisors(), api.getManufacturers()])
      .then(([dashboard, sup, man]) => {
        if (!active) return;
        setStats(dashboard);
        setSupervisors(sup.slice(0, 6));
        setManufacturers(man.slice(0, 6));
      })
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Welcome back, {user?.name?.split(' ')[0]}</h1>
        <p className="text-text-muted text-sm mt-0.5">Overview across supervisors and manufacturers.</p>
      </div>

      <ErrorBanner message={error} />

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <StatCard icon={ClipboardList} label="Total inspections" value={stats?.totalInspections} />
        <StatCard
          icon={CheckCircle2}
          label="Compliant"
          value={stats?.compliantInspections}
          tone="text-status-compliant-text"
        />
        <StatCard
          icon={XCircle}
          label="Non-compliant"
          value={stats?.nonCompliantInspections}
          tone="text-status-noncompliant-text"
        />
        <StatCard
          icon={Loader2}
          label="Processing"
          value={stats?.processingInspections}
          tone="text-status-review-text"
        />
        <StatCard icon={Users} label="Supervisors" value={stats?.totalSupervisors} />
        <StatCard icon={Factory} label="Manufacturers" value={stats?.totalManufacturers} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <UserListCard
          title="Supervisors"
          viewAllTo="/supervisors"
          loading={loading}
          users={supervisors}
          detailBasePath="/supervisors"
        />
        <UserListCard
          title="Manufacturers"
          viewAllTo="/manufacturers"
          loading={loading}
          users={manufacturers}
          detailBasePath="/manufacturers"
        />
      </div>
    </div>
  );
}

