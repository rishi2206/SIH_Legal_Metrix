import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ChevronRight, Copy, Check, KeySquare, Trash2 } from 'lucide-react';
import { api } from '../../api/client.js';
import { Card, Button, Field, Input, ErrorBanner, Badge, EmptyState } from '../../components/ui.jsx';
import { userStatusTone, humanizeEnum } from '../../utils/format.js';

export default function ManufacturersPage() {
  const [manufacturers, setManufacturers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [creating, setCreating] = useState(false);
  const [newInvite, setNewInvite] = useState(null);
  const [copiedField, setCopiedField] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const load = () => {
    setLoading(true);
    api
      .getManufacturers()
      .then(setManufacturers)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError(null);
    setCreating(true);
    try {
      const created = await api.createManufacturer(form);
      setManufacturers((prev) => [created, ...prev]);
      setForm({ name: '', email: '', phone: '' });
      setNewInvite(created);
      setShowForm(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const activationLink = newInvite
    ? `${window.location.origin}/activate?token=${encodeURIComponent(newInvite.inviteToken)}`
    : null;

  const copyToClipboard = (text, field) => {
    navigator.clipboard?.writeText(text).then(() => {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 1500);
    });
  };

  const handleDelete = async (manufacturer) => {
    if (!window.confirm(`Remove ${manufacturer.name}'s access? They will no longer be able to log in.`)) {
      return;
    }
    setError(null);
    setDeletingId(manufacturer.id);
    try {
      await api.deleteManufacturer(manufacturer.id);
      setManufacturers((prev) =>
        prev.map((m) => (m.id === manufacturer.id ? { ...m, status: 'DISABLED' } : m))
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold">Manufacturers</h1>
          <p className="text-text-muted text-sm mt-0.5">
            Companies onboarded to run pre-dispatch label checks. Manufacturers can also self-register from
            the login page — this list only shows accounts invited by you.
          </p>
        </div>
        <Button onClick={() => setShowForm((s) => !s)}>
          <Plus size={16} />
          Invite manufacturer
        </Button>
      </div>

      {newInvite && (
        <Card className="p-5 border-status-compliant-border">
          <p className="font-medium text-sm mb-1">Invite created for {newInvite.name}</p>
          <p className="text-sm text-text-muted mb-3">
            Open the activation link to set their password now, or share the link/token with them.
          </p>

          <div className="flex flex-col sm:flex-row gap-2 mb-2">
            <Link to={`/activate?token=${encodeURIComponent(newInvite.inviteToken)}`} className="flex-1">
              <Button className="w-full">
                <KeySquare size={16} />
                Open activation link
              </Button>
            </Link>
            <Button variant="secondary" onClick={() => copyToClipboard(activationLink, 'link')}>
              {copiedField === 'link' ? <Check size={16} /> : <Copy size={16} />}
              Copy link
            </Button>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <code className="flex-1 text-xs bg-surface-secondary rounded-lg px-3 py-2 break-all">
              {newInvite.inviteToken}
            </code>
            <Button variant="ghost" className="!px-2 !py-2" onClick={() => copyToClipboard(newInvite.inviteToken, 'token')}>
              {copiedField === 'token' ? <Check size={16} /> : <Copy size={16} />}
            </Button>
          </div>
        </Card>
      )}

      {showForm && (
        <Card className="p-5">
          <form onSubmit={handleCreate} className="grid sm:grid-cols-3 gap-3 sm:items-end">
            <Field label="Company / contact name">
              <Input
                required
                autoFocus
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </Field>
            <Field label="Email">
              <Input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </Field>
            <Field label="Phone (optional)">
              <Input
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              />
            </Field>
            <div className="sm:col-span-3 flex justify-end">
              <Button type="submit" disabled={creating}>
                {creating ? 'Sending invite…' : 'Send invite'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <ErrorBanner message={error} />

      <Card className="p-0 overflow-hidden">
        {loading ? (
          <p className="text-sm text-text-muted px-5 py-8 text-center">Loading…</p>
        ) : manufacturers.length === 0 ? (
          <EmptyState
            title="No manufacturers yet"
            description="Invite a manufacturing company to get started, or wait for them to self-register."
            action={<Button onClick={() => setShowForm(true)}>Invite manufacturer</Button>}
          />
        ) : (
          <ul className="divide-y divide-border">
            {manufacturers.map((m) => (
              <li key={m.id}>
                <Link
                  to={`/manufacturers/${m.id}`}
                  className="flex items-center justify-between px-5 py-4 hover:bg-surface-secondary transition-colors"
                >
                  <div>
                    <p className="font-medium text-sm">{m.name}</p>
                    <p className="text-xs text-text-muted mt-0.5">{m.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone={userStatusTone(m.status)}>{humanizeEnum(m.status)}</Badge>
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
