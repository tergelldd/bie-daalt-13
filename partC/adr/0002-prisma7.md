# ADR-0002: Prisma 7 — `prisma.config.ts` ашиглах шийдвэр
---

## Context

Бие даалтын build үе шатанд `npx prisma migrate dev` ажиллуулахад дараах алдаа гарсан:

```
Error code: P1012
error: The datasource property `url` is no longer supported in schema files.
Move connection URLs for Migrate to `prisma.config.ts`
```

Prisma 7 (2025 оны 11-р сард гарсан) нь `schema.prisma`-д connection URL бичих аргыг устгасан. Үүний оронд `prisma.config.ts` файл шаардлагатай болсон. Хэрхэн тохируулах талаар AI-тай хэд хэдэн удаа ярилцаж, баримт бичгийг шалгасан.

---

## AI-тай ярилцлагын тэмдэглэл

**AI-ийн 1-р санал:** `earlyAccess: true` + `migrate: { adapter() { ... } }` → TypeScript error  
**AI-ийн 2-р санал:** `migrate: { async adapter() { ... } }` → `'migrate' does not exist`  
**AI-ийн 3-р санал:** `datasourceUrl: process.env.DATABASE_URL` → `'datasourceUrl' does not exist`  
**Баримт бичгээс олсон:** `datasource: { url: env('DATABASE_URL') }` → Зөв

AI-ийн санал бүр Prisma 6 эсвэл pre-release API дээр тулгуурласан байсан.

---

## Options Considered

| | Option A: `prisma.config.ts` + `datasource.url` | Option B: Prisma-г downgrade хийх (v6) | Option C: Raw SQL / `pg` driver шууд |
|---|---|---|---|
| Prisma 7 дэмжлэг | ✅ | ❌ | ✅ |
| ORM давуу тал (type safety, migration) | ✅ | ✅ | ❌ |
| Суулгах хялбар | ✅ | ⚠️ | ❌ |
| Ирээдүйн дэмжлэг | ✅ | ❌ deprecated | ✅ |

---

## Decision

**Option A** — `prisma.config.ts` файл үүсгэж Prisma 7-ийн шинэ API-г ашиглах.

```ts
import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  datasource: { url: env('DATABASE_URL') },
});
```

---

## Rationale

1. **Prisma 7 нь stable release** — downgrade хийх нь техникийн өр (technical debt) үүсгэнэ
2. **Official migration guide** нь `prisma.config.ts` аргыг тодорхой заасан
3. **`dotenv/config` import** — Prisma CLI автоматаар `.env` уншихаа больсон тул explicit import шаардлагатай
4. **`env()` helper** — type-safe environment variable, тодорхойгүй тохиолдолд compile time алдаа гаргана

---

## Consequences

**Эерэг:**
- Prisma 7-ийн бүх шинэ онцлог (mapped enums, adapter-based client) ашиглах боломжтой
- Connection config нэг газарт төвлөрсөн

**Сөрөг / Анхааруулга:**
- `prisma.service.ts`-д `PrismaPg` adapter шаардлагатай болсон — `new PrismaClient()` дангаараа ажиллахаа больсон
- `@prisma/adapter-pg`, `pg` нэмэлт dependency болсон
- Migrate команд `-—config prisma/prisma.config.ts` флаг шаардаж байна