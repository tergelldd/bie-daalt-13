# Feature Implementation Session Log

**Date:** 2026-05-01  
**Topic:** URL Shortener (NestJS + PostgreSQL + Prisma) — Prisma setup + Feature 1 (random short code)

## Prompt 1:
> “Би NestJS + PostgreSQL + Prisma ашиглаж байна. Prisma суулгах заавар өг. PROJECT.md-д байгаа [URL Shortener — REST API + minimal frontend]-д зориулсан Prisma schema үүсгэж өг. NestJS-ийн AppService дотор эхний feature болох [Random short code үүсгэх: long URL өгөөд давхцахгүй unique code үүсгэн short link болгох]-ийн логикийг бич. Ингэхдээ partB/src/ хавтас үүсгэж бичээрэй”

## AI Response Summary (хийсэн ажлууд)
### 1) Prisma суулгалт
- `prisma`, `@prisma/client` dependency суулгасан.
- Prisma 7 дээр `schema.prisma` дотор `datasource db { url = ... }` ашиглах боломжгүй болсон тул шинэ config хэлбэр (`prisma.config.ts`) руу шилжүүлсэн.

### 2) Prisma schema (URL shortener-д тааруулж)
`ShortUrl` model үүсгэж дараах шаардлагыг хангуулсан.
- **Unique code**: `code @unique` (collision хамгаалалтын үндэс)
- **Click counter**: `clicks Int @default(0)`
- **Expiration**: `expiresAt DateTime?`
- **Timestamps**: `createdAt`, `updatedAt`

### 3) Feature 1 — Random short code үүсгэх (AppService)
- `createShortLink({ longUrl, expiresAt? })` method:
  - Random code үүсгээд DB дээр insert хийх оролдлого хийнэ
  - Unique constraint давхцвал Prisma error code **P2002**-г барьж **retry** хийдэг
  - `MAX_CODE_GENERATION_ATTEMPTS` хэтэрвэл error шиддэг

## Key Decisions / Notes
- Prisma 7-ийн өөрчлөлтөөс болж:
  - `schema.prisma`-д **connection URL бичихгүй**
  - Connection URL-ийг `partB/prisma/prisma.config.ts` дотор `datasource.url` хэлбэрээр зааж өгсөн
- Secrets commit хийхгүй тул `.env` файл үүсгэхийн оронд `partB/.env.example` нэмсэн.

## Files Created / Updated
- **Created**
  - `partB/prisma/schema.prisma`
  - `partB/prisma/prisma.config.ts`
  - `partB/.env.example`
  - `partB/src/app.service.ts`
  - `partB/src/app.module.ts`
  - `partB/src/prisma/prisma.module.ts`
  - `partB/src/prisma/prisma.service.ts`
- **Updated**
  - `package.json` (Prisma dependencies нэмэгдсэн)
  - `package-lock.json` (npm install-оос шинэчлэгдсэн)

## Commands Used (high-level)
- `npm install prisma @prisma/client`
- `npx prisma generate --config partB/prisma/prisma.config.ts`
- (Дараагийн алхам) `npx prisma migrate dev --name init --config partB/prisma/prisma.config.ts`

## Output / Deliverables
- Prisma schema бэлэн (`ShortUrl` model)
- Prisma module/service (NestJS) бэлэн
- `AppService.createShortLink()` collision-safe random short code генерацийн логик бэлэн
