import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { api } from '../../api/client.js';
import { Card, ErrorBanner, Badge } from '../../components/ui.jsx';
import { userStatusTone, humanizeEnum, initials } from '../../utils/format.js';

export default function SupervisorDetail() {
  const { id } = useParams();
  const [supervisor, setSupervisor] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api
      .getSupervisor(id)
      .then((data) => active && setSupervisor(data))
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return <p className="text-sm text-text-muted py-10 text-center">Loading…</p>;
  }

  return (
    <div className="space-y-6 max-w-lg">
      <Link
        to="/supervisors"
        className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary"
      >
        <ArrowLeft size={15} />
        Back to supervisors
      </Link>

      <ErrorBanner message={error} />

      {supervisor && (
        <Card className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-14 w-14 rounded-full bg-primary text-primary-text flex items-center justify-center text-lg font-semibold">
              {initials(supervisor.name)}
            </div>
            <div>
              <p className="font-medium">{supervisor.name}</p>
              <p className="text-sm text-text-muted">{supervisor.email}</p>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-border-subtle">
              <span className="text-text-muted">Status</span>
              <Badge tone={userStatusTone(supervisor.status)}>{humanizeEnum(supervisor.status)}</Badge>
            </div>
            <div className="flex justify-between py-2 border-b border-border-subtle">
              <span className="text-text-muted">Phone</span>
              <span className="font-medium">{supervisor.phone || '—'}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-text-muted">Account ID</span>
              <span className="font-medium text-xs">{supervisor.id}</span>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
