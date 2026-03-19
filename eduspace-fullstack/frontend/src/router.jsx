import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { AuthLayout }        from './layouts/AuthLayout';
import { AppLayout }         from './layouts/AppLayout';
import { ProtectedRoute }    from './components/common/ProtectedRoute';
import { LoginPage }         from './pages/LoginPage';
import { RegisterPage }      from './pages/RegisterPage';
import { DashboardPage }     from './pages/DashboardPage';
import { CoursesPage }       from './pages/CoursesPage';
import { CourseDetailPage }  from './pages/CourseDetailPage';
import { LessonPage }        from './pages/LessonPage';
import { LessonsPage }       from './pages/LessonsPage';
import { LiveLessonsPage }   from './pages/LiveLessonsPage';
import { AnalyticsPage }     from './pages/AnalyticsPage';
import { StudentsPage }      from './pages/StudentsPage';
import { AdminPage }         from './pages/AdminPage';
import { CreateCoursePage }  from './pages/CreateCoursePage';
import { LibraryPage, SettingsPage } from './pages/OtherPages';

const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/dashboard" replace /> },
  {
    element: <AuthLayout />,
    children: [
      { path: '/login',    element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [{
      element: <AppLayout />,
      children: [
        { path: '/dashboard',      element: <DashboardPage /> },
        { path: '/courses',        element: <CoursesPage /> },
        { path: '/courses/new',    element: <CreateCoursePage /> },
        { path: '/courses/:id',    element: <CourseDetailPage /> },
        { path: '/lessons',        element: <LessonsPage /> },
        { path: '/lessons/live',   element: <LiveLessonsPage /> },
        { path: '/lessons/:id',    element: <LessonPage /> },
        { path: '/library',        element: <LibraryPage /> },
        { path: '/analytics',      element: <AnalyticsPage /> },
        { path: '/students',       element: <StudentsPage /> },
        { path: '/admin',          element: <AdminPage /> },
        { path: '/settings',       element: <SettingsPage /> },
      ],
    }],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
