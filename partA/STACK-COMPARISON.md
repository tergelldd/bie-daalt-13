**Project:** URL shortener — REST API + minimal frontend  
**Core requirements:** random short code, click counter, expiration

## Сонголт 1 (Option A): Node.js (NestJS/Express) + PostgreSQL + (optional Redis) + React (Vite)
### Товч
REST API + minimal UI-г хурдан босгох боломжтой нийтлэг production stack. NestJS нь бүтэцжүүлэлт сайтай тул томрох үед эмх цэгцтэй хадгална.

### Давуу тал
- **MVP хурдан**: REST API, validation, testing, docs (OpenAPI) богино хугацаанд
- **Экосистем хүчтэй**: ORM/migrations, auth/rate limit/caching шийдлүүд элбэг
- **Scaling ойлгомжтой**: Postgres дээр найдвартай хадгалалт, Redis нэмээд гүйцэтгэл сайжруулах боломжтой

### Сул тал
- **Өндөр траффикт click counter**: зөв/найдвартай тоололд atomic update, зарим тохиолдолд queue/counter buffering шаардана
- **Expiration job**: “clean-up” хийх бол cron/queue нэмэхэд complexity өснө (гэхдээ MVP-д expiresAt шалгаад 404/410 буцаахад хангалттай)

### Шаардлагуудыг яаж хангах вэ (MVP)
- **Random code**: DB unique constraint + collision үед retry
- **Click counter**: Postgres atomic increment (`clicks = clicks + 1`)
- **Expiration**: `expiresAt` хадгалаад redirect үед шалгаж expired бол 410/404

---

## Сонголт 2 (Option B): Python (FastAPI) + PostgreSQL + Celery/RQ + React (Vite)
### Товч
API барихад маш “цэвэр” (validation, docs сайн). Expiration зэрэг background ажлуудыг Celery/RQ-оор системтэй шийдэхэд тохиромжтой.

### Давуу тал
- **API хөгжүүлэлт цэвэр**: Pydantic validation, OpenAPI docs автоматаар
- **Background job стандарт**: expiration clean-up, scheduled tasks хийхэд тохиромжтой

### Сул тал
- **Deploy/ops нэмэгдэнэ**: broker + worker (Redis/RabbitMQ + Celery) гэх мэт бүрэлдэхүүн шаардаж магадгүй
- **Redirect өндөр траффик**: caching/pooling/ASGI тохиргоог сайн тааруулах шаардлага гарч болно

---

## Сонголт 3 (Option C): Go (Gin/Fiber) + SQLite/PostgreSQL + HTMX (эсвэл Svelte)
### Товч
Redirect endpoint өндөр ачаалалтай үед хамгийн сайн гүйцэтгэл гаргах боломжтой, deploy энгийн (single binary).

### Давуу тал
- **Performance өндөр**: redirect latency бага, concurrency сайн
- **Deploy энгийн**: runtime dependency бага, нэг binary-гаар ажиллуулахад амар

### Сул тал
- **Хөгжүүлэлтийн хурд**: баг Go-д дасаагүй бол MVP хугацаа уртрах магадлалтай
- **Expiration/queue**: background job-уудыг илүү “өөрөө” зохион байгуулах хэрэг гарч болно

---

## Тодорхой харьцуулалт (энэ төслийн шаардлагын хувьд)
- **MVP хийх хурд**: **Option A ≈ Option B > Option C**
- **Redirect өндөр траффик**: **Option C > Option A > Option B**
- **Expiration/background job шийдэх “бэлэн байдал”**: **Option B > Option A > Option C**
- **Deploy хялбар**: **Option C > Option A > Option B**

## Эцсийн сонголт ба шалтгаан
**Сонгосон: Option A (NestJS + PostgreSQL + React (Vite))**

### Сонгосон шалтгаан
- **Java туршлага**: NestJS нь controller/service/module, dependency injection зэрэг нь Spring маягийн архитектуртай төстэй → хурдан дасна
- **Төслийн хэмжээ (MVP)**: REST API + minimal UI-г хамгийн хурдан, ойлгомжтой бүтэцтэйгээр гаргах боломжтой
- **Өргөтгөх боломж**: хэрэгцээ гарвал Redis нэмээд cache/rate limit/counter buffering хийхэд амар