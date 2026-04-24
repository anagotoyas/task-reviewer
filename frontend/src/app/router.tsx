import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/shared/AppLayout';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';
import { LoginPage } from '@/features/auth/pages/LoginPage';

// Admin
import { UsersPage } from '@/features/users/pages/UsersPage';
import { CoursesPage } from '@/features/courses/pages/CoursesPage';
import { AnalyticsPage } from '@/features/analytics/pages/AnalyticsPage';

// Teacher
import { RubricsPage } from '@/features/rubrics/pages/RubricsPage';
import { HomeworksPage } from '@/features/homeworks/pages/HomeworksPage';
import { SubmissionsPage } from '@/features/submissions/pages/SubmissionsPage';

// Student
import { StudentCoursesPage } from '@/features/courses/pages/StudentCoursesPage';
import { StudentHomeworksPage } from '@/features/homeworks/pages/StudentHomeworksPage';
import { StudentSubmissionsPage } from '@/features/submissions/pages/StudentSubmissionsPage';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="users" replace /> },
      { path: 'users', element: <UsersPage /> },
      { path: 'courses', element: <CoursesPage /> },
      { path: 'analytics', element: <AnalyticsPage /> },
    ],
  },
  {
    path: '/teacher',
    element: (
      <ProtectedRoute allowedRoles={['teacher']}>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="courses" replace /> },
      { path: 'courses', element: <CoursesPage /> },
      { path: 'rubrics', element: <RubricsPage /> },
      { path: 'homeworks', element: <HomeworksPage /> },
    ],
  },
  {
    path: '/student',
    element: (
      <ProtectedRoute allowedRoles={['student']}>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="courses" replace /> },
      { path: 'courses', element: <StudentCoursesPage /> },
      { path: 'homeworks', element: <StudentHomeworksPage /> },
      { path: 'submissions', element: <StudentSubmissionsPage /> },
    ],
  },
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
