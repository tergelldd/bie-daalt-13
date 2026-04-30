# URL Shortener (NestJS + PostgreSQL + React)

## Зорилго
Long URL-ийг богиносгож `/{code}` хэлбэрийн **short link** үүсгэнэ. Short link дээр дарахад **redirect** хийгээд **click counter** нэмэгдүүлнэ. Link бүр **expiration (expiresAt)**-тай байж болно.

## Онцлог (MVP)
- **Random short code** үүсгэх (collision хамгаалалттай)
- **Redirect** (`GET /:code`) + **click counter**
- **Expiration**: хугацаа дууссан линк redirect хийхгүй (410/404)
- **Stats**: линкний мэдээлэл харах (clicks гэх мэт)
- **Minimal frontend**: үүсгэх form + short link copy + stats харах

## Tech Stack
- **Backend**: Node.js, NestJS (TypeScript), REST API
- **DB**: PostgreSQL
- **Frontend**: React (Vite)
- **Optional**: Redis (cache/rate limit/counter buffering)

---

## Build & Run (draft)
> Командууд нь төслийн scaffolding хийгдсэний дараа ажиллана.

### 1) Database ажиллуулах
- Local Postgres эсвэл Docker ашиглана.
- Schema/migrations: (to be added)

### 2) Backend ажиллуулах (NestJS)
```bash
cd backend
npm install
npm run start:dev
```

Backend default: `http://localhost:4000`

### 3) Frontend ажиллуулах (React/Vite)
```bash
cd frontend
npm install
npm run dev
```

Frontend default: `http://localhost:5173`

---

## Tests (draft)
### Backend tests
```bash
cd backend
npm test
```

### Frontend tests
```bash
cd frontend
npm test
```

---

## API Endpoints (draft)
> Эцсийн endpoint/response shape нь хэрэгжүүлэлтээр баталгаажна.

### Create short link
- `POST /api/urls`
- Body: `{ longUrl: string, expiresAt?: string }`
- Response: `{ code, shortUrl, longUrl, createdAt, expiresAt }`

### Redirect
- `GET /:code`
- Behavior:
  - Active → **302** redirect + click increment
  - Not found → **404**
  - Expired → **410** (эсвэл 404)

### Stats
- `GET /api/urls/:code`
- Response: `{ longUrl, clicks, createdAt, expiresAt, status }`