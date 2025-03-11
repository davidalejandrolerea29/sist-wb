import { Navigate } from 'react-router-dom';
import { useAuth, useUserRole } from '../lib/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'editor' | 'admin';
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const role = useUserRole();

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && role !== requiredRole && role !== 'admin') {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
}