import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { api } from '../../api/client.js';
import { Card, Button, ErrorBanner, Badge } from '../../components/ui.jsx';
import { userStatusTone, humanizeEnum, initials } from '../../utils/format.js';

export default function ManufacturerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [manufacturer, setManufacturer] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let active = true;
    api
      .getManufacturer(id)
      .then((data) => active && setManufacturer(data))
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id]);

  const handleDelete = async () => {
    if (!manufacturer) return;
    if (!window.confirm(`Remove ${manufacturer.name}'s access? They will no longer be able to log in.`)) {
      return;
    }
    setError(null);
    setDeleting(true);
    try {
      await api.deleteManufacturer(manufacturer.id);
      navigate('/manufacturers', { replace: true });
    } catch (err) {
      setError(err.message);
      setDeleting(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-text-muted py-10 text-center">Loading…</p>;
  }

  return (
    <div className="space-y-6 max-w-lg">
      <Link
        to="/manufacturers"
        className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary"
      >
        <ArrowLeft size={15} />
        Back to manufacturers
      </Link>

      <ErrorBanner message={error} />

      {manufacturer && (
        <Card className="p-6">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-primary text-primary-text flex items-center justify-center text-lg font-semibold">
                {initials(manufacturer.name)}
              </div>
              <div>
                <p className="font-medium">{manufacturer.name}</p>
                <p className="text-sm text-text-muted">{manufacturer.email}</p>
              </div>
            </div>
            <Button
              variant="secondary"
              onClick={handleDelete}
              disabled={deleting || manufacturer.status === 'DISABLED'}
            >
              <Trash2 size={16} />
              {manufacturer.status === 'DISABLED' ? 'Removed' : deleting ? 'Removing…' : 'Remove access'}
            </Button>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-border-subtle">
              <span className="text-text-muted">Status</span>
              <Badge tone={userStatusTone(manufacturer.status)}>{humanizeEnum(manufacturer.status)}</Badge>
            </div>
            <div className="flex justify-between py-2 border-b border-border-subtle">
              <span className="text-text-muted">Phone</span>
              <span className="font-medium">{manufacturer.phone || '—'}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-text-muted">Account ID</span>
              <span className="font-medium text-xs">{manufacturer.id}</span>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
