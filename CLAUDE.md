# Project Conventions (Build, Rules, No-go)

Энэ файл нь төслийн build/run командууд болон кодын конвенц, хориглох зүйлсийг нэг дор баримтжуулна.

## Quick commands (draft)
> Фолдер/скрипт нэр нь scaffolding хийгдсэний дараа шинэчлэгдэж болно.

### Backend (NestJS)
```bash
cd backend
npm install
npm run start:dev
```

### Frontend (React / Vite)
```bash
cd frontend
npm install
npm run dev
```

### Tests
```bash
cd backend && npm test
cd frontend && npm test
```

---

## Code conventions

### Language & style
- **TypeScript-first** (backend + frontend)
- **Consistent formatting**: Prettier/ESLint (setup хийсний дараа format/lint-ийг always pass болгоно)
- **Naming**
  - **camelCase**: variables/functions
  - **PascalCase**: classes/components
  - **kebab-case**: file names (ж: `url-service.ts`) эсвэл NestJS default-оо дагана (сонгосноо нэг мөр баримтална)

### Architecture
- **Layering**: Controller → Service → Repository/DB
- **Pure responsibilities**
  - Controller: request/response, validation boundary
  - Service: бизнес логик (code үүсгэх, expiration шалгах, clicks нэмэх)
  - Repository: DB access only

### Project constraints
- **Нэг файл ≤ 200 мөр**
  - Хэт урт бол: жижиг модулиуд, helper utilities, файл салгалт хийнэ
- **Нэг функц ≤ 50–80 мөр** (боломжтой бол)
- **Нэг PR/өөрчлөлт жижиг байх** (олон зүйл нэг дор хийхгүй)

---

## Data & API rules (MVP-д баримтлах)
- **Random short code**: DB дээр `UNIQUE(code)` + collision бол retry
- **Click counter**: DB дээр atomic increment (`clicks = clicks + 1`)
- **Expiration**: `expiresAt`-ийг redirect үед шалгаж expired бол **410 (Gone)** (эсвэл 404 — нэг мөр сонгоод баримтална)

---

## No-go zones (хийж болохгүй)
- **Secrets commit хийхгүй**: `.env`, API keys, passwords, tokens
- **Direct DB access** controller-оос хийхгүй (repository/service layer-аар дамжина)
- **Business logic** controller дотор бөөгнөрүүлэхгүй
- **“Magic” short code length/charset**: нэг газар config/const болгон тодорхойл
- **Breaking changes** хийхдээ README/PROJECT docs-оо шинэчлэхгүй орхихгүй

---

## Documentation expectations
- `partA/PROJECT.md`: topic + brief + scope (MVP + nice-to-have)
- `partA/STACK-COMPARISON.md`: 3 stack + сонголтын шалтгаан
- `partA/ARCHITECTURE.md`: Mermaid diagram (module/layer + data flow)
- `partA/README.md`: build/run/tests + env vars + endpoints (draft байж болно)
