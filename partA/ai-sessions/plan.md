# Planning Session Log

**Date:** 2026-04-30  
**Topic:** URL shortener — REST API + minimal frontend

## Prompt 1:
> “Надад URL shortener сэдвийн дагуу төслөө хийхэд ашиглаж болох 3 stack санал болгож, давуу/сул талаар нь тодорхой харьцуулж өгөөч.”

## AI Response Summary (3 сонголт)
### Option A — Node.js (NestJS/Express) + PostgreSQL + (optional Redis) + React (Vite)
- **Pros**
  - MVP хурдан, JS/TS экосистем хүчтэй
  - Scaling ойлгомжтой (Postgres + optional Redis)
- **Cons**
  - Өндөр ачаалалд click counter/redirect дээр atomic update, queue/caching шийдэл шаардаж магадгүй
  - Expiration (clean-up) хийхэд cron/queue нэмэгдэж complexity өснө

### Option B — Python (FastAPI) + PostgreSQL + Celery/RQ + React (Vite)
- **Pros**
  - API цэвэр, validation сайн, OpenAPI docs автоматаар
  - Background job (expiration) хийхэд стандарт шийдлүүдтэй
- **Cons**
  - Broker/worker зэрэг нэмэлт бүрэлдэхүүнээс болж deploy/ops төвөг нэмэгдэж болзошгүй

### Option C — Go (Gin/Fiber) + SQLite/PostgreSQL + HTMX (эсвэл Svelte)
- **Pros**
  - Redirect performance өндөр, concurrency сайн
  - Deploy энгийн (single binary), dependency бага
- **Cons**
  - Expiration/queue-г илүү “өөрөө” зохион байгуулах шаардлага гарч магадгүй
  - Баг Go-д дасаагүй бол эхний хөгжүүлэлтийн хурд удааширч болно

## Discussion / Decision
- Миний өмнөх туршлага **Java** тул Option A илүү ойр санагдсан.
- AI зөвлөмжөөр Option A-г сонгоход **Express биш — NestJS + PostgreSQL + React (Vite)** хувилбарыг санал болгосон.
  - **Шалтгаан**: NestJS нь controller/service/module бүтэц, dependency injection зэргээрээ Spring маягийн архитектуртай төстэй → сурах, цэгцтэй хөгжүүлэхэд дөхөм.
- **Redis**-ийг MVP-д заавал оруулахгүй; дараа нь шаардлага гарвал
  - redirect lookup cache
  - rate limiting
  - click counter buffering
  зэрэгт нэмэх боломжтой.

## Agreed Brief (төслийн товч)
Long URL өгөгдөхөд систем нь **random short code** үүсгээд short link буцаана. `/{code}` дээр орж ирэхэд **redirect** хийж **click counter**-ийг нэмэгдүүлнэ. Link бүр **expiresAt**-тай байж болох ба хугацаа дууссан үед redirect хийхгүй (expired).

## MVP Scope (товч)
- **Create short link**
  - longUrl (+ optional expiresAt) хүлээн авах
  - random code үүсгэх, collision бол retry хийх
  - shortUrl/code буцаах
- **Redirect + click counter**
  - `/{code}` → 301/302 redirect
  - clicks-ийг atomic increment хийх
  - not found/expired үед 404 эсвэл 410
- **Stats endpoint**
  - longUrl, clicks, createdAt, expiresAt, status(active/expired)
- **Minimal frontend**
  - create form + generated link copy
  - stats харах жижиг UI
