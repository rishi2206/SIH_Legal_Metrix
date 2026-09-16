import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Factory } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { Card, Button, Field, Input, ErrorBanner } from '../components/ui.jsx';

export default function RegisterManufacturerPage() {
  const { registerManufacturer, loading } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);

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

    try {
      await registerManufacturer({ name, email, phone, password });
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 rounded-xl bg-primary text-primary-text flex items-center justify-center mb-3">
            <Factory size={26} />
          </div>
          <h1 className="text-xl font-semibold text-text-primary">Register your company</h1>
          <p className="text-sm text-text-muted mt-1 text-center">
            Run pre-dispatch label checks on your products before they ship — catch
            compliance defects early and cut down on customer complaints.
          </p>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Company / contact name">
              <Input
                required
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Acme Foods Pvt. Ltd."
              />
            </Field>
            <Field label="Work email">
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="quality@acmefoods.com"
              />
            </Field>
            <Field label="Phone" hint="Optional">
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" />
            </Field>
            <Field label="Password" hint="At least 8 characters">
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
              {loading ? 'Creating account…' : 'Create account'}
            </Button>
          </form>
        </Card>

        <p className="text-center text-sm text-text-muted mt-5">
          Already have an account?{' '}
          <Link to="/login?role=MANUFACTURER" className="text-primary font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
