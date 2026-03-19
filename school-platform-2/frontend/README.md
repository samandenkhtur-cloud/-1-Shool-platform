# EduSpace — Mini School Platform

A production-ready frontend for a modern e-learning platform built with React, TailwindCSS, React Query, and Axios.

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev

# 3. Open in browser
# http://localhost:2828
```

---

## 🔑 Demo Accounts

All accounts use the password: `password`

| Role    | Email                 | Access |
|---------|-----------------------|--------|
| Student | alex@student.edu      | Courses, Lessons, Progress |
| Teacher | sarah@teacher.edu     | Courses, Analytics, Students |
| Admin   | james@admin.edu       | Full platform access |

You can also use the **role switcher** in the top header to switch roles without logging out.

---

## 📁 Folder Structure

```
src/
├── components/
│   ├── common/          # Header, Sidebar, RightPanel, ProtectedRoute
│   ├── courses/         # CourseCard
│   ├── dashboard/       # WelcomeBanner, StatCard, LessonsTable
│   └── ui/              # Avatar, Badge, Skeleton, ProgressBar, MiniCalendar, EmptyState
├── data/
│   └── mockData.js      # All mock data — replace with API calls
├── hooks/
│   ├── useAuth.jsx      # Auth context + hook
│   └── useData.js       # React Query hooks for all data fetching
├── layouts/
│   ├── AppLayout.jsx    # Main app shell (sidebar + header + right panel)
│   └── AuthLayout.jsx   # Auth pages shell
├── lib/
│   └── utils.js         # Utility helpers (cn, formatDate, etc.)
├── pages/
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   ├── DashboardPage.jsx
│   ├── CoursesPage.jsx
│   ├── CourseDetailPage.jsx
│   ├── LessonPage.jsx
│   ├── LessonsPage.jsx
│   └── OtherPages.jsx   # Library, Analytics, Students, Settings, LiveLessons
├── services/
│   └── api.js           # Axios instance + all service functions
└── router.jsx           # React Router config
```

---

## 🔌 Connecting to a Real Backend

### 1. Update the base URL
In `src/services/api.js`:
```js
export const apiClient = axios.create({
  baseURL: 'https://your-api.com/api', // ← update this
});
```
Or set it via environment variable:
```
# .env
VITE_API_URL=https://your-api.com/api
```

### 2. Replace mock service functions
Each service in `src/services/api.js` has a mock implementation. Replace `await delay()` + mock data with real `apiClient` calls:

```js
// Before (mock):
async getCourses() {
  await delay(700);
  return { courses: MOCK_COURSES };
}

// After (real):
async getCourses(filters) {
  const { data } = await apiClient.get('/courses', { params: filters });
  return data;
}
```

### 3. API Endpoints expected

| Method | Endpoint              | Description |
|--------|-----------------------|-------------|
| POST   | /auth/login           | Login with email + password |
| POST   | /auth/register        | Register new user |
| GET    | /courses              | List courses (supports ?search, ?category, ?level) |
| GET    | /courses/:id          | Get single course |
| POST   | /enrollments          | Enroll in a course |
| DELETE | /enrollments/:id      | Unenroll from a course |
| GET    | /lessons?courseId=    | Get lessons for a course |
| GET    | /lessons/:id          | Get single lesson |
| PATCH  | /lessons/:id/complete | Mark lesson complete |
| GET    | /progress/:courseId   | Get progress for a course |
| GET    | /stats                | Get user stats |
| GET    | /notifications        | Get notifications |
| PATCH  | /notifications/read   | Mark notifications as read |

---

## 🎨 Tech Stack

- **React 18** + **Vite** — fast builds, HMR
- **React Router v6** — file-based routing
- **TanStack Query v5** — data fetching, caching, loading/error states
- **Axios** — HTTP client with interceptors for JWT auth
- **TailwindCSS** — utility-first styling
- **lucide-react** — icon library
- **react-hot-toast** — toast notifications
- **date-fns** — date formatting

---

## 👤 Role System

The app supports three roles with different UI:
- **Student** — see enrolled courses, track progress, watch lessons
- **Teacher** — see all courses they teach, manage students
- **Admin** — full platform overview

Role is stored in JWT payload (mocked via localStorage). The `ProtectedRoute` component handles role-based access control.

---

## 📱 Responsive

- **Mobile** — collapsible sidebar, stacked layouts
- **Tablet** — two-column grids
- **Desktop** — full three-column layout with right panel

---

## 🏗️ Build for Production

```bash
npm run build
# Output in /dist
```
