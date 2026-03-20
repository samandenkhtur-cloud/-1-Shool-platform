# 🎓 EduSpace — Fullstack Learning Platform

**React + Node.js + Express + MySQL + Docker**

---

## 📁 Project Structure

```
eduspace-fullstack/
├── backend/                  ← Node.js + Express API
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js   ← Sequelize + MySQL connection
│   │   │   ├── seed.js       ← Sample data seeder
│   │   │   └── init.sql      ← Docker MySQL init
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── courseController.js
│   │   │   ├── lessonController.js
│   │   │   └── otherControllers.js  ← users, notifications, analytics, live
│   │   ├── middleware/
│   │   │   ├── auth.js       ← JWT authenticate + authorize
│   │   │   └── upload.js     ← Multer file upload
│   │   ├── models/
│   │   │   └── index.js      ← All Sequelize models + associations
│   │   ├── routes/
│   │   │   └── index.js      ← All API routes
│   │   ├── services/
│   │   │   └── emailService.js  ← Gmail (Nodemailer) emails
│   │   └── index.js          ← Express app entry point
│   ├── uploads/              ← File uploads (created at runtime)
│   ├── Dockerfile
│   ├── package.json
│   └── .env.example
│
├── frontend/                 ← React + Vite
│   ├── src/
│   │   ├── services/api.js   ← All API calls (real backend)
│   │   ├── hooks/useAuth.jsx ← Auth context
│   │   └── ...               ← All pages, components, hooks
│   ├── Dockerfile
│   ├── nginx.conf
│   └── .env.example
│
├── docker-compose.yml        ← Full stack orchestration
└── .env.example              ← Root env for Docker
```

---

## 🚀 Quick Start

### Option 1: Docker (Recommended — easiest)

```bash
# 1. Clone / unzip
cd eduspace-fullstack

# 2. Copy env and fill in your values
cp .env.example .env
# Edit .env — at minimum set GMAIL_USER and GMAIL_APP_PASSWORD

# 3. Start everything
docker-compose up --build

# 4. Seed sample data (first run only)
docker exec eduspace_backend node src/config/seed.js

# Done! Open:
# Frontend → http://localhost:5173
# Backend  → http://localhost:4000
# API docs → http://localhost:4000/health
```

### Option 2: Local Development

#### Backend
```bash
cd backend

# Install
npm install

# Setup env
cp .env.example .env
# Edit .env with your MySQL + Gmail credentials

# Start MySQL (local or Docker)
docker run -d --name mysql \
  -e MYSQL_ROOT_PASSWORD=password \
  -e MYSQL_DATABASE=eduspace_db \
  -p 3306:3306 mysql:8.0

# Start dev server (auto-restarts)
npm run dev

# Seed sample data (once)
npm run seed
```

#### Frontend
```bash
cd frontend

# Install
npm install

# Setup env
cp .env.example .env
# VITE_API_URL=http://localhost:4000/api

# Start dev server
npm run dev
# → http://localhost:5173
```

---

## 🔑 Demo Accounts

All use password: `password`

| Role    | Email                 |
|---------|-----------------------|
| Student | alex@student.edu      |
| Teacher | sarah@teacher.edu     |
| Admin   | james@admin.edu       |
| Teacher | Helen@admin.edu       |
| Teacher | Goo@admin.edu         |
| Teacher | Sanex@admin.edu       |

---

## 📧 Gmail Setup

1. Go to → [Google App Passwords](https://myaccount.google.com/apppasswords)
2. Select **Mail** → **Other** → name it "EduSpace"
3. Copy the 16-character password
4. Add to `.env`:
```
GMAIL_USER=yourgmail@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
```

> **Note:** 2-Step Verification must be enabled on your Google account.

---

## 🔌 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | — | Register new user |
| POST | `/api/auth/login` | — | Login → JWT |
| GET  | `/api/auth/me` | ✅ | Get profile |
| GET  | `/api/auth/verify/:token` | — | Verify email |
| POST | `/api/auth/forgot-password` | — | Send reset email |
| POST | `/api/auth/reset-password` | — | Set new password |
| GET  | `/api/courses` | — | List published courses |
| POST | `/api/courses` | Teacher | Create course |
| POST | `/api/courses/:id/enroll` | Student | Enroll |
| GET  | `/api/courses/:id/progress` | ✅ | Course progress % |
| GET  | `/api/courses/:courseId/lessons` | ✅ | Lessons list |
| POST | `/api/lessons/:id/complete` | ✅ | Mark lesson done |
| POST | `/api/lessons/:id/materials` | Teacher | Upload PDF/doc |
| GET  | `/api/users` | Admin | All users |
| GET  | `/api/notifications` | ✅ | My notifications |
| GET  | `/api/analytics/platform` | Admin | Platform stats |
| GET  | `/api/live` | ✅ | Live sessions |
| POST | `/api/live` | Teacher | Schedule session |

---

## 🗄️ Database Models

| Model | Description |
|-------|-------------|
| User | Students, teachers, admins |
| Course | Course with category, level, tags |
| Section | Course sections (chapters) |
| Lesson | Lesson with YouTube or uploaded video |
| Material | PDF/doc files attached to lessons |
| Enrollment | User ↔ Course many-to-many |
| Progress | Per-lesson completion tracking |
| LiveSession | Scheduled live streams |
| Notification | In-app notifications |

---

## 📦 Tech Stack

### Backend
- **Node.js 20** + **Express 4**
- **Sequelize ORM** → MySQL 8
- **JWT** (access + refresh tokens, auto-refresh)
- **Multer** → video, image, PDF upload
- **Nodemailer** → Gmail SMTP
- **express-rate-limit**, **helmet**, **cors**

### Frontend
- **React 18** + **Vite**
- **TanStack Query** (data fetching + caching)
- **TailwindCSS** + CSS variables (dark/light)
- **React Router v6**
- **Axios** with JWT interceptor + auto-refresh

### Infrastructure
- **Docker** + **docker-compose**
- **nginx** (frontend SPA serving)
- **MySQL 8** with health checks

---

## 🔧 Environment Variables

See `.env.example` for all variables. Critical ones:

| Variable | Description |
|----------|-------------|
| `DB_PASSWORD` | MySQL password |
| `JWT_SECRET` | Min 32 random chars |
| `JWT_REFRESH_SECRET` | Min 32 random chars |
| `GMAIL_USER` | Your Gmail address |
| `GMAIL_APP_PASSWORD` | 16-char App Password |
| `FRONTEND_URL` | For CORS + email links |

---

## 📝 Production Checklist

- [ ] Change all secrets in `.env`
- [ ] Set `NODE_ENV=production`
- [ ] Use HTTPS (nginx reverse proxy + SSL)
- [ ] Set strong `DB_PASSWORD`
- [ ] Configure `FRONTEND_URL` to your domain
- [ ] Set up regular DB backups
- [ ] Configure `MAX_FILE_SIZE_MB` for your storage

---

## 🐳 Docker Commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop everything
docker-compose down

# Remove volumes (WARNING: deletes DB data)
docker-compose down -v

# Rebuild after code changes
docker-compose up --build

# Run seed inside container
docker exec eduspace_backend node src/config/seed.js

# Access MySQL CLI
docker exec -it eduspace_db mysql -u eduspace -p eduspace_db
```
