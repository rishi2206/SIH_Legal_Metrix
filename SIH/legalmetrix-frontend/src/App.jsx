import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

import LoginPage from './pages/LoginPage.jsx';
import ActivateSupervisorPage from './pages/ActivateSupervisorPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import HistoryPage from './pages/HistoryPage.jsx';

import SupervisorDashboard from './pages/supervisor/Dashboard.jsx';
import InspectionsPage from './pages/supervisor/Inspections.jsx';
import InspectionDetail from './pages/supervisor/InspectionDetail.jsx';

import AdminDashboard from './pages/admin/Dashboard.jsx';
import SupervisorsPage from './pages/admin/Supervisors.jsx';
import SupervisorDetail from './pages/admin/SupervisorDetail.jsx';

function RoleHome() {
  const { user } = useAuth();
  if (user?.role === 'ADMIN') return <AdminDashboard />;
  return <SupervisorDashboard />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/activate" element={<ActivateSupervisorPage />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <RoleHome />
          </ProtectedRoute>
        }
      />
      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <HistoryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      {/* Supervisor-only */}
      <Route
        path="/inspections"
        element={
          <ProtectedRoute role="SUPERVISOR">
            <InspectionsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/inspections/:id"
        element={
          <ProtectedRoute role="SUPERVISOR">
            <InspectionDetail />
          </ProtectedRoute>
        }
      />

      {/* Admin-only */}
      <Route
        path="/supervisors"
        element={
          <ProtectedRoute role="ADMIN">
            <SupervisorsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/supervisors/:id"
        element={
          <ProtectedRoute role="ADMIN">
            <SupervisorDetail />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
