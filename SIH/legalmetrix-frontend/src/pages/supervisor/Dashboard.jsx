import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, CheckCircle2, XCircle, Loader2, Plus } from 'lucide-react';
import { api } from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { Card, Button, ErrorBanner, Badge } from '../../components/ui.jsx';
import { inspectionStatusTone, complianceResultTone, formatDate, humanizeEnum } from '../../utils/format.js';

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

export default function SupervisorDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [inspections, setInspections] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([api.getSupervisorDashboard(), api.getMyInspections()])
      .then(([dashboard, myInspections]) => {
        if (!active) return;
        setStats(dashboard);
        setInspections(myInspections.slice(0, 6));
      })
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold">Welcome back, {user?.name?.split(' ')[0]}</h1>
          <p className="text-text-muted text-sm mt-0.5">Here's your inspection activity.</p>
        </div>
        <Link to="/inspections">
          <Button>
            <Plus size={16} />
            New inspection
          </Button>
        </Link>
      </div>

      <ErrorBanner message={error} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h2 className="font-medium">Recent inspections</h2>
          <Link to="/inspections" className="text-sm text-primary hover:underline">
            View all
          </Link>
        </div>
        {loading ? (
          <p className="text-sm text-text-muted px-5 py-8 text-center">Loading…</p>
        ) : inspections.length === 0 ? (
          <p className="text-sm text-text-muted px-5 py-8 text-center">
            No inspections yet. Create your first one to get started.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {inspections.map((insp) => (
              <li key={insp.id}>
                <Link
                  to={`/inspections/${insp.id}`}
                  className="flex items-center justify-between px-5 py-3.5 hover:bg-surface-secondary transition-colors"
                >
                  <div>
                    <p className="font-medium text-sm">{insp.location || 'Untitled location'}</p>
                    <p className="text-xs text-text-muted mt-0.5">{formatDate(insp.inspectionDate)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone={inspectionStatusTone(insp.status)}>{humanizeEnum(insp.status)}</Badge>
                    {insp.overallResult && (
                      <Badge tone={complianceResultTone(insp.overallResult)}>
                        {humanizeEnum(insp.overallResult)}
                      </Badge>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
