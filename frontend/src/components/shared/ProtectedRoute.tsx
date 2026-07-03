import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/auth.store';

interface Props {
  readonly children: React.ReactNode;
  readonly allowedRoles?: Array<'admin' | 'teacher' | 'student'>;
}

export function ProtectedRoute({ children, allowedRoles }: Props) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (allowedRoles && user && !allowedRoles.includes(user.role.name)) {
    if (user.role.name === 'admin') return <Navigate to="/admin/users" replace />;
    if (user.role.name === 'teacher') return <Navigate to="/teacher/courses" replace />;
    return <Navigate to="/student/courses" replace />;
  }

  return <>{children}</>;
}
