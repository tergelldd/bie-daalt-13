# AI Usage Report — URL Shortener (Бие даалт 13)
**Төсөл:** URL Shortener — NestJS + PostgreSQL + Prisma  
**AI хэрэгсэл:** Claude (Anthropic)

---

## 1. Юуг AI хийсэн, юуг өөрөө хийсэн?

### Part A — Plan

**AI хийсэн:**
- Stack харьцуулалтын хүснэгт үүсгэхэд тусалсан. NestJS, FastAPI, Go гурвын давуу болон сул талуудыг жагсааж, харьцуулалтын матриц бэлтгэхэд ашигласан.
- CLAUDE.md-ийн анхны бүтцийг санал болгосон — build commands, conventions, no-go zones хэсгүүдийн загварыг AI гаргаж өгсөн.
- Mermaid диаграмын синтаксийг туслалцаатайгаар бичсэн. Flowchart болон Sequence diagram хоёуланг AI-аар draft хийж, өөрөө module нэрүүдийг засварласан.
- ADR-001-ийн форматыг AI санал болгосон — Context, Options, Decision, Rationale, Consequences хэсгүүдийг загварчилсан.

**Өөрөө хийсэн:**
- Ямар сэдэв сонгохоо шийдсэн — URL shortener нь MVP-д тохиромжтой гэж өөрөө дүгнэсэн.
- Stack-ийн эцсийн сонголт.
- ARCHITECTURE.md дахь module нэрүүдийг бодит кодтой тааруулж засах — AI анх `UrlController`, `RedirectController` гэж санал болгосон боловч NestJS default нь `AppController` байсан тул өөрөө засварласан.

---

### Part B — Build

**AI хийсэн:**
- `app.service.ts`-ийн анхны scaffold: `createShortUrl`, `getOriginalUrl` функцүүдийн бүтцийг AI үүсгэсэн.
- `url-validation.ts` файлын логик: `assertValidLongUrlForCreate`, `normalizeShortCodeParam`, `safeRedirectHref` функцүүдийг AI бичсэн. Регекс болон `new URL()` parse logic зөв байсан.
- `app.service.spec.ts`-ийн тест бүтэц: Jest mock, `beforeEach` setup, тестийн нэршлийг AI санал болгосон.
- `openapi.yaml`-ийн анхны draft: endpoint бүрийн schema, response code-уудыг AI бэлтгэсэн.
- Slash command-уудын (`/review`, `/test`, `/docs`, `/commit`, `/security`) агуулга.
- Frontend `index.html`: tab бүтэц, fetch API дуудалт, error handling-ийг AI бичсэн.

**Өөрөө хийсэн:**
- Controller болон Service-ийн функц нэрийн зөрөөг олж засах: `createShortLink` vs `createShortUrl` — AI-ийн анхны код нэрийн зөрөөтэй байсан тул өөрөө шалган засварлав.
- Prisma 7-ийн `prisma.config.ts` тохируулах: AI гурван удаа буруу syntax санал болгосон тул баримт бичгээс өөрөө олж засав (дэлгэрэнгүйг Hallucination хэсэгт үзнэ).
- Git commit message-уудыг Conventional Commits форматаар өөрөө бичсэн, AI зөвхөн загвар санал болгосон.
- `prisma.service.ts`-д `PrismaPg` adapter нэмэх шийдвэр: Prisma 7-д adapter заавал шаардлагатайг өөрөө баримт бичгээс олж мэдэж хэрэгжүүлсэн.

---

## 2. Hallucination-ы жишээнүүд

### Жишээ 1 — Prisma 7-ийн `defineConfig` API (3 удаагийн алдаа)

Энэ бол бие даалтын хамгийн тод hallucination жишээ юм. `schema.prisma`-д `url = env("DATABASE_URL")` байж болохгүй гэсэн алдаа гарахад AI-д тусламж хүссэн. AI дараах ерөнхий гурван санал болгосон — бүгд буруу байсан:

**1-р оролдлого — `earlyAccess` property:**
```ts
export default defineConfig({
  earlyAccess: true,  // ← Property байхгүй
  schema: path.join(__dirname, 'schema.prisma'),
  migrate: { ... }
});
```
Алдаа: `Object literal may only specify known properties, and 'earlyAccess' does not exist in type 'PrismaConfig'`

**2-р оролдлого — `migrate` property:**
```ts
export default defineConfig({
  schema: '...',
  migrate: {           // ← 'migrate' биш 'migrations' байна
    async adapter() { ... }
  }
});
```
Алдаа: `'migrate' does not exist in type 'PrismaConfig'`

**3-р оролдлого — `datasourceUrl` property:**
```ts
export default defineConfig({
  datasourceUrl: process.env.DATABASE_URL,  // ← 'datasource' байна
});
```
Алдаа: `'datasourceUrl' does not exist in type 'PrismaConfig'. Did you mean to write 'datasource'?`

**Яаж олж засав:**
TypeScript compiler-ийн алдааны мессеж дэх "Did you mean to write 'datasource'?" гэсэн hint-ийг анзаарч, Prisma 7-ийн official migration guide-г шууд уншив. Зөв syntax нь:
```ts
import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  datasource: { url: env('DATABASE_URL') },
});
```

**Сургамж:** AI-ийн мэдлэг training data-ийн cutoff дээр тулгуурлах тул шинэ major version (Prisma 7 — 2025 оны 11-р сард гарсан)-ийн breaking change-уудыг мэдэхгүй байна. Official документ нь AI-ийн саналаас илүү найдвартай.

---

### Жишээ 2 — Controller болон Service функцийн нэрийн зөрөө

AI анхны `app.service.ts`-г үүсгэхдээ функцийг `createShortUrl` гэж нэрлэсэн. Гэвч `app.controller.ts`-г тусад нь үүсгэхдээ `this.appService.createShortLink(...)` гэж дуудсан — нэр өөр байсан.

```ts
// service.ts — AI үүсгэсэн
async createShortUrl(params: {...}) { ... }

// controller.ts — AI үүсгэсэн (өөр session)
this.appService.createShortLink(...)  // ← createShortUrl биш
this.appService.getStatsByCode(...)   // ← service-д огт байхгүй
this.appService.getHello()            // ← байхгүй
```

Мөн `getStatsByCode` функц controller-д дуудагдаж байгаа боловч service-д огт хэрэгжүүлэгдээгүй байсан. Хэрэв TypeScript strict mode байсан бол compile-д барьж авах байсан ч runtime-д л илэрсэн.

**Яаж олж засав:**
`npm run build` ажиллуулахад TypeScript compiler `Property 'createShortLink' does not exist on type 'AppService'` алдаа гаргасан. Controller болон Service-г хажуулан тавьж гараар харьцуулан нэрийг тааруулж засав.

**Сургамж:** AI өөр өөр session-д нэг системийн хэсгүүдийг үүсгэхэд нэршлийн consistency алдагдаж болно. Функцийн нэрүүдийг нэг газар (жишээ нь interface эсвэл contract файл) тогтоож, AI-д тэр нэрүүдийг explicit-ээр дамжуулах хэрэгтэй.

---

## 3. Security болон License-ийн анхаарал

### Security жишээ — `.env` файл Git-д орох аюул

AI `app.service.ts` болон `prisma.service.ts`-г үүсгэхдээ `DATABASE_URL`-г `process.env.DATABASE_URL`-ээр уншихыг зөв санал болгосон. Гэвч `.gitignore`-д `.env` байсан ч `.env` файл ZIP archive-д орж ирсэн байсан нь өмнө нь `git add .` хийсэнтэй холбоотой.

`.env` дотор байсан:
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/url_shortener?schema=public"
```

Энэ development credentials боловч GitHub-д публик байдлаар гарвал:
- Хэн ч тухайн хаягаар холбогдох оролдлого хийж болно
- CI/CD pipeline-д production credentials ижил pattern-аар ашиглагдвал нухацтай аюул

**Яаж олж засав:**
`git ls-files partB/.env` командаар шалгахад файл tracked биш байсан тул `.gitignore` зөв ажилласан. Гэхдээ энэ шалгалтыг эхнээс хийх байсан.

**AI-аас гарсан нэмэлт анхаарал:**
AI анх `res.redirect(longUrl)` дотор `longUrl`-г шууд дамжуулахыг санал болгосон — тэр утга нь `ShortUrl` объект байсан (string биш). Хэрэв энэ алдаа production-д орсон бол `[object Object]` руу redirect хийх байсан бөгөөд хэрэглэгч хохирно. `safeRedirectHref` функцийг `url-validation.ts`-д нэмж, redirect хийхийн өмнө утгыг дахин шалгах болгосон.

---

## 4. Юуг AI-аар хурдан хийсэн?

**Boilerplate код:** NestJS module, controller, service-ийн анхны структурыг үүсгэхэд AI маш хурдан байсан. Энэ хэсгийг өөрөө бичвэл 1-2 цаг зарцуулах байсан бол AI-тай 10-15 минутад scaffold бэлэн болсон.

**Тест бичих:** Jest mock setup, `beforeEach`, `describe` блокуудын бүтцийг AI хурдан үүсгэсэн. Тестийн edge case-уудыг (`GoneException`, `NotFoundException`, race condition) санал болгоход ч тустай байсан.

**Диаграм:** Mermaid синтаксийг цээжлэхгүйгээр AI-д "sequence diagram хий" гэхэд бэлэн draft гарч ирсэн нь цаг хэмнэсэн.

---

## 5. Юуг AI-аар удаан хийсэн?

**Prisma 7-ийн тохиргоо:** Дээр дурдсанчлан AI гурван удаа буруу syntax санал болгосон. Хэрэв эхнээс баримт бичгийг шууд уншсан бол 10 минутад шийдэх байсан зүйл 40 гаруй минут зарцуулсан. AI-д найдаж нэг дор олон оролдлого хийсэн нь цаг алдуулсан.

**Нэршлийн тохирол:** Controller болон Service хоёр өөр session-д үүсгэгдсэн тул функцийн нэрүүд зөрсөн. Энэ алдааг олох, засах, тест ажиллуулж шалгах үе шат нэмэлт цаг авсан.

**Хэт ерөнхий код:** AI заримдаа хэт ерөнхий, бүх тохиолдолд ажиллана гэж бодсон код санал болгодог. Жишээ нь `url-validation.ts`-г AI бичсэн боловч service болон controller-д import хийхгүй орхисон — ашиглагдахгүй код үүссэн нь хожим засварлах шаардлага гарсан.

---

## 6. Skill Atrophy-ийн эрсдэл ба зохицуулалт

Бие даалтын явцад "AI байхгүй бол би энийг хийж чадах уу?" гэсэн асуултыг өөрөөсөө асууж байсан.

**Хийсэн зүйлс:**
- Prisma 7-ийн тохиргооны алдааг AI-гүйгээр шийдэх оролдлого хийсэн: TypeScript compiler-ийн алдааны мессежийг уншиж, official Prisma docs-г шалгаж, `defineConfig`-ийн type definition-г шууд харсан.
- Тест бичихдээ AI-ийн санал болгосон mock-уудыг гараар ажиллуулж, яагаад ажиллаж байгааг ойлгохыг хичээсэн.
- Git workflow-г AI-гүйгээр хийсэн: branch үүсгэх, `git log` шалгах зэргийг өөрөө хийсэн.