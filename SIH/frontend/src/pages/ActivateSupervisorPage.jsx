import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';
import { api } from '../api/client.js';
import { Card, Button, Field, Input, ErrorBanner } from '../components/ui.jsx';

export default function ActivateSupervisorPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [inviteToken, setInviteToken] = useState(searchParams.get('token') || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await api.activateSupervisor(inviteToken, password);
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 rounded-xl bg-primary text-primary-text flex items-center justify-center mb-3">
            <ShieldCheck size={26} />
          </div>
          <h1 className="text-xl font-semibold text-text-primary">Activate your account</h1>
          <p className="text-sm text-text-muted mt-1 text-center">
            Set a password to complete your supervisor account setup
          </p>
        </div>

        <Card className="p-6">
          {done ? (
            <div className="text-center py-4">
              <CheckCircle2 className="mx-auto text-status-compliant-text" size={40} />
              <p className="font-medium mt-3">Account activated</p>
              <p className="text-sm text-text-muted mt-1">
                You can now sign in with your email and new password.
              </p>
              <Button className="w-full mt-5" onClick={() => navigate('/login')}>
                Go to sign in
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Field label="Invite token">
                <Input
                  required
                  value={inviteToken}
                  onChange={(e) => setInviteToken(e.target.value)}
                  placeholder="Paste the token from your invite"
                />
              </Field>
              <Field label="New password" hint="At least 8 characters">
                <Input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Field>
              <Field label="Confirm password">
                <Input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </Field>
              <ErrorBanner message={error} />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Activating…' : 'Activate account'}
              </Button>
            </form>
          )}
        </Card>

        <p className="text-center text-sm text-text-muted mt-5">
          <Link to="/login" className="text-primary font-medium hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
