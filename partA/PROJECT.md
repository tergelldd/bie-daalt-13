# Project: AI-Assisted Software Construction

## Сонгосон сэдэв
**URL Shortener — REST API + minimal frontend**  
Үндсэн боломжууд: **random short code**, **click counter**, **expiration (дуусах хугацаа)**.

## Сонгосон stack (санал болгосон)
- **Backend**: Node.js + **NestJS** (TypeScript), REST API
- **Database**: **PostgreSQL**
- **Frontend**: **React (Vite)** minimal UI
- **Optional**: Redis (дараа нь cache / rate limit / counter buffering хэрэгтэй үед)

## Brief
Энэ систем нь хэрэглэгчээс **long URL** авч **санамсаргүй short code** үүсгэн, `/{code}` хэлбэрийн **богино холбоос** буцаана. Хэрэглэгч short link дээр дарахад систем нь анхны URL руу **redirect** хийж, тухайн линк дээрх **дарсан тоо (click counter)**‑г нэмэгдүүлнэ. Линк бүр **expiresAt** (сонголттой) хугацаатай байж болох ба хугацаа дууссан линк дээр redirect хийхгүй (expired гэж үзнэ).

## Scope

### MVP (заавал хийх)
#### 1) Short link үүсгэх
- Long URL хүлээн авах
- **Random short code** үүсгэх
- **Collision хамгаалалт**: short code давхцвал дахин үүсгэж хадгалах
- `expiresAt` (сонголттой) хадгалах
- Буцаах өгөгдөл: `code`, `shortUrl`, `longUrl`, `createdAt`, `expiresAt`

#### 2) Redirect + Click counter
- `GET /{code}` дуудлагад:
  - code олдож, хугацаа дуусаагүй бол **301/302 redirect**
  - **clicks** утгыг atomic байдлаар нэмэх (`clicks = clicks + 1`)
  - code олдохгүй бол **404**
  - хугацаа дууссан бол **410 (Gone)** (эсвэл 404 — шийдлийг нэг мөр баримтална)

#### 3) Stats / мэдээлэл харах (minimal)
- Code-оор нь линкний мэдээлэл авах:
  - `longUrl`, `clicks`, `createdAt`, `expiresAt`, `status (active/expired)`

#### 4) Minimal frontend
- Long URL (+ optional expiresAt) оруулах form
- Үүссэн short link‑ийг харуулах, copy хийх
- Stats харах (code оруулах эсвэл үүсгээд шууд харах)

### Nice-to-have (дараагийн шат)
- **Custom alias** (хэрэглэгч code сонгох)
- **Rate limiting** (spam хамгаалалт)
- **Expiration clean-up job** (cron/queue ашиглан expired линкүүдийг цэвэрлэх)
- **Click analytics** (өдөр/эх сурвалж гэх мэт нарийвчилсан статистик)
- **Auth + user-owned links** (хэрэглэгч өөрийн линкүүдийг удирдах)
- **QR code** үүсгэх

## Out of scope (MVP-д оруулахгүй)
- Олон хэрэглэгчийн эрхийн систем (Auth/roles) — Nice-to-have руу
- Нарийвчилсан analytics dashboard — Nice-to-have руу
- Өндөр траффик optimization (queue-based counter flush гэх мэт) — шаардлага гарвал дараагийн шат

## Definition of Done (MVP)
- Long URL-ээс short link амжилттай үүсдэг
- `/{code}` redirect зөв ажиллаж clicks зөв нэмэгддэг
- Expired линк redirect хийхгүй, тохирсон status code буцаадаг
- Minimal UI дээрээс үүсгэх + short link copy + stats харах боломжтой
