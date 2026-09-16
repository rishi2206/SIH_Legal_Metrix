import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Card, ErrorBanner, Badge, EmptyState } from '../components/ui.jsx';
import {
  formatDate,
  inspectionStatusTone,
  complianceResultTone,
  humanizeEnum,
} from '../utils/format.js';

export default function HistoryPage() {
  const { user } = useAuth();
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    const load = user?.role === 'ADMIN' ? api.getAdminHistory : api.getSupervisorHistory;
    load()
      .then((data) => active && setInspections(data))
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [user]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Inspection history</h1>
        <p className="text-text-muted text-sm mt-0.5">
          {user?.role === 'ADMIN'
            ? 'All inspections across every supervisor.'
            : 'All of your past inspections.'}
        </p>
      </div>

      <ErrorBanner message={error} />

      <Card className="p-0 overflow-hidden">
        {loading ? (
          <p className="text-sm text-text-muted px-5 py-8 text-center">Loading…</p>
        ) : inspections.length === 0 ? (
          <EmptyState title="No inspection history yet" />
        ) : (
          <ul className="divide-y divide-border">
            {inspections.map((insp) => {
              const row = (
                <div className="flex items-center justify-between px-5 py-3.5">
                  <div>
                    <p className="font-medium text-sm">{insp.location || 'Untitled location'}</p>
                    <p className="text-xs text-text-muted mt-0.5">
                      {formatDate(insp.inspectionDate)}
                      {user?.role === 'ADMIN' && insp.supervisorId && (
                        <span> · Supervisor {insp.supervisorId.slice(0, 8)}</span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone={inspectionStatusTone(insp.status)}>{humanizeEnum(insp.status)}</Badge>
                    {insp.overallResult && (
                      <Badge tone={complianceResultTone(insp.overallResult)}>
                        {humanizeEnum(insp.overallResult)}
                      </Badge>
                    )}
                  </div>
                </div>
              );
              return (
                <li key={insp.id}>
                  {user?.role === 'ADMIN' ? (
                    row
                  ) : (
                    <Link to={`/inspections/${insp.id}`} className="block hover:bg-surface-secondary transition-colors">
                      {row}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
