## Docker (production-style) setup

This compose file starts:
- MySQL 8.4
- Redis 7
- RabbitMQ 3 (management UI)
- API Gateway
- Auth Service
- Student Service
- Course Service
- Notification worker

### Start

From the repo root:

```bash
docker compose up -d --build
```

### Endpoints
- Gateway: `http://localhost:8080/health`
- RabbitMQ UI: `http://localhost:15672` (user/pass: `guest` / `guest`)
- Auth: `http://localhost:3001/health`
- Student: `http://localhost:3002/health`
- Course: `http://localhost:3003/health`

### Environment variables
See `.env.example`. For production, set at least:
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`

### Databases
The MySQL container initializes:
- `auth_db`
- `student_db`
- `course_db`

via `docker/mysql/init.sql`.

### Migrations
This repo currently does not include Prisma migration files. Generate them locally first:

```bash
npx prisma migrate dev --name init
```

Then you can add a production deploy step (e.g. `npx prisma migrate deploy`) to each service container start command.

