# School Platform — Нэгдсэн README

Энэ файл нь frontend + backend-ийг **нэг дор асаах** болон хөгжүүлэлтийн үндсэн зааврыг нэгтгэсэн болно.

## 1) Шаардлагатай зүйлс
- Node.js 18+  
- npm  
- **Docker (заавал биш, санал болгож байна)**

## 2) Хамгийн амархан асаах (Docker Compose)
Docker ашиглавал backend-ийн бүх сервис (auth, students, courses, notifications, gateway) автоматаар асна.

```bash
cd backend
docker compose up --build
```

Асах хаягууд:
- API Gateway: `http://localhost:8080`
- Frontend (docker): `http://localhost:3000`

> Анхаарах: Docker Compose нь `frontend` контейнерийг бас асаадаг.

## 3) Local (Docker ашиглахгүй) асаах
Энэ горимд **MySQL, Redis, RabbitMQ** өөр дээрээ ажиллаж байх шаардлагатай.

### 3.1 Backend
```bash
cd backend
copy .env.example .env
npm install
npx prisma migrate dev --name init
npm run dev
```

### 3.2 API Gateway
```bash
cd backend
npm run gateway
```

### 3.3 Notification service (заавал биш, зөвхөн мэдэгдэл хэрэгтэй бол)
```bash
cd backend
set PORT=3004
node src/notifications/server.js
```

### 3.4 Frontend
```bash
cd frontend
copy .env.example .env
npm install
npm run dev
```

Frontend нээгдэх хаяг:
- `http://localhost:5173`

## 4) Тохиргоо
Frontend `.env` дотор API Gateway-ийг заана:
```
VITE_API_URL=http://localhost:8080
```

Backend `.env` дотор үйлчилгээний портууд:
- Auth: `3001`
- Students: `3002`
- Courses: `3003`
- Notifications: `3004`
- Gateway: `8080`

## 5) Гол API endpoint-ууд
Gateway-ээр дамжиж дуудагдана:
- `POST /auth/register`
- `POST /auth/login`
- `GET /courses`
- `GET /courses/:id`
- `POST /courses/:courseId/enroll`
- `GET /students`
- `GET /students/:id`
- `GET /notifications`

## 6) Хөгжүүлэлтийн товч зөвлөмж
- Frontend API дуудлага: `frontend/src/services/api.js`
- Auth state: `frontend/src/hooks/useAuth.jsx`
- Data hooks: `frontend/src/hooks/useData.js`

Хэрэв хүсвэл дараагийн алхамд **lessons / live sessions / analytics** API нэмэх боломжтой.
