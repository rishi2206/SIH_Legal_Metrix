import { useAuth } from '../context/AuthContext.jsx';
import { Card } from '../components/ui.jsx';
import { initials, humanizeEnum } from '../utils/format.js';

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h1 className="text-xl font-semibold">Profile</h1>
        <p className="text-text-muted text-sm mt-0.5">Your account details.</p>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-14 w-14 rounded-full bg-primary text-primary-text flex items-center justify-center text-lg font-semibold">
            {initials(user?.name)}
          </div>
          <div>
            <p className="font-medium">{user?.name}</p>
            <p className="text-sm text-text-muted">{user?.email}</p>
          </div>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-border-subtle">
            <span className="text-text-muted">Role</span>
            <span className="font-medium">{humanizeEnum(user?.role)}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-text-muted">Account ID</span>
            <span className="font-medium text-xs">{user?.id}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
