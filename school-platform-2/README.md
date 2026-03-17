# Microservice Base Template (Express + Prisma)

Production-minded baseline you can reuse across services:

- Express (MVC)
- Prisma + MySQL
- DTO validation (Zod)
- JWT auth middleware + RBAC authorization middleware
- Global error handler (`AppError`)
- Logging: `morgan` + JSON custom logger
- Swagger: `/docs` + `/docs.json`

## Quick start

1) Create your `.env`:

```bash
copy .env.example .env
```

2) Install deps:

```bash
npm i
```

3) Run migrations + generate Prisma client:

```bash
npx prisma migrate dev --name init
```

4) Start:

```bash
npm run dev
```

## Endpoints

- `GET /health`
- Swagger UI: `GET /docs`

Sample entity:
- `GET /students`
- `POST /students`
- `GET /students/:id`
- `PATCH /students/:id`
- `DELETE /students/:id`

## JWT / RBAC expectations

The template expects JWT claims:

- `sub`: user id
- `roles`: string[]
- `permissions`: string[]

Example (dev) token payload:

```json
{
  "sub": "11111111-1111-1111-1111-111111111111",
  "roles": ["ADMIN"],
  "permissions": [
    "student:read:any",
    "student:create",
    "student:update:any",
    "student:delete:any"
  ],
  "iss": "school-platform",
  "aud": "school-platform-api"
}
```

