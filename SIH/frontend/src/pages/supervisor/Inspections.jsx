import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ChevronRight } from 'lucide-react';
import { api } from '../../api/client.js';
import { Card, Button, Field, Input, ErrorBanner, Badge, EmptyState } from '../../components/ui.jsx';
import {
  inspectionStatusTone,
  complianceResultTone,
  formatDate,
  humanizeEnum,
} from '../../utils/format.js';

export default function InspectionsPage() {
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [location, setLocation] = useState('');
  const [creating, setCreating] = useState(false);

  const load = () => {
    setLoading(true);
    api
      .getMyInspections()
      .then(setInspections)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError(null);
    setCreating(true);
    try {
      const created = await api.createInspection(location);
      setLocation('');
      setShowForm(false);
      setInspections((prev) => [created, ...prev]);
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold">Inspections</h1>
          <p className="text-text-muted text-sm mt-0.5">Create and manage your inspections.</p>
        </div>
        <Button onClick={() => setShowForm((s) => !s)}>
          <Plus size={16} />
          New inspection
        </Button>
      </div>

      {showForm && (
        <Card className="p-5">
          <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-3 sm:items-end">
            <div className="flex-1">
              <Field label="Location" hint="Store or site being inspected">
                <Input
                  autoFocus
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Big Bazaar, MG Road, Bengaluru"
                />
              </Field>
            </div>
            <Button type="submit" disabled={creating}>
              {creating ? 'Creating…' : 'Create'}
            </Button>
          </form>
        </Card>
      )}

      <ErrorBanner message={error} />

      <Card className="p-0 overflow-hidden">
        {loading ? (
          <p className="text-sm text-text-muted px-5 py-8 text-center">Loading…</p>
        ) : inspections.length === 0 ? (
          <EmptyState
            title="No inspections yet"
            description="Start by creating your first inspection."
            action={<Button onClick={() => setShowForm(true)}>New inspection</Button>}
          />
        ) : (
          <ul className="divide-y divide-border">
            {inspections.map((insp) => (
              <li key={insp.id}>
                <Link
                  to={`/inspections/${insp.id}`}
                  className="flex items-center justify-between px-5 py-4 hover:bg-surface-secondary transition-colors"
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
                    <ChevronRight size={16} className="text-text-muted" />
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
