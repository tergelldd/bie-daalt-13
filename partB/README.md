# partB — URL Shortener (NestJS + PostgreSQL + Prisma)

## Stack
- **Runtime**: Node.js 20+
- **Framework**: NestJS (TypeScript)
- **Database**: PostgreSQL + Prisma ORM
- **API Docs**: Swagger UI

---

## Requirements
- Node.js 20+
- PostgreSQL (local эсвэл Docker)

---

## Setup

### 1. Environment
```bash
cp .env.example .env
# .env дотор DATABASE_URL-ийг өөрийн PostgreSQL-д тааруулж өөрч
```

### 2. Dependencies суулгах
```bash
cd partB
npm install
```

### 3. Database migrate
```bash
npx prisma migrate dev --name init
```

### 4. Ажиллуулах
```bash
npm run start:dev
```

API: `http://localhost:3000`  
Swagger UI: `http://localhost:3000/api`

---

## Tests

```bash
npm run test          # unit tests
npm run test:cov      # coverage
npm run test:e2e      # e2e tests
```

---

## API Endpoints

| Method | Path | Тайлбар |
|---|---|---|
| POST | `/api/urls` | Short link үүсгэх |
| GET | `/:code` | Redirect → original URL |
| GET | `/stats/:code` | Click статистик харах |

### POST /api/urls
```json
// Request body
{ "longUrl": "https://example.com", "expiresAt": "2026-12-31T00:00:00Z" }

// Response 201
{ "id": 1, "code": "a1b2c3d", "longUrl": "https://example.com", "clicks": 0, "createdAt": "...", "expiresAt": "..." }
```

### GET /:code
- `302` → redirect
- `404` → код олдохгүй  
- `410` → хугацаа дууссан

### GET /stats/:code
```json
{ "id": 1, "code": "a1b2c3d", "longUrl": "https://example.com", "clicks": 42, "createdAt": "...", "expiresAt": null }
```

---

## Project structure

```
partB/
├── src/
│   ├── app.controller.ts     # HTTP endpoints
│   ├── app.service.ts        # Business logic
│   ├── app.module.ts         # NestJS module
│   ├── url-validation.ts     # URL/code validation helpers
│   ├── main.ts               # Bootstrap + Swagger
│   └── prisma/
│       ├── prisma.module.ts
│       └── prisma.service.ts
├── prisma/
│   └── schema.prisma
├── test/                     # e2e tests
└── .env.example
```