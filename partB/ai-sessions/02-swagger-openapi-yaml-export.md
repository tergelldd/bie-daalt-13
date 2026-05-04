# Swagger OpenAPI YAML Export Session Log

**Date:** 2026-05-04  
**Topic:** NestJS асах үед Swagger спецификацийг `partB/openapi.yaml` файлд YAML форматаар автоматаар хадгалах (`main.ts` + `yaml` сан)

## Prompt 1:
> `@partB/src/main.ts NestJS асах үед Swagger-ийн спецификацыг partB/openapi.yaml нэртэй файл болгож автоматаар хадгалдаг код main.ts дээр нэмж өг. Ингэхдээ yaml санг ашиглаж YAML форматаар хадгалаарай.`

## AI Response Summary (хийсэн ажлууд)
### 1) `yaml` сан
- OpenAPI объектийг YAML текст болгохын тулд `yaml` (~2.x) package-ийг `dependencies`-д суулгасан (`npm install yaml`).

### 2) `partB/src/main.ts` өөрчлөлт
- `SwaggerModule.createDocument()`-ийн дараа баримтыг диск руу бичнэ.
- `fs/promises`-ийн `writeFile`, `path`-ийн `join`, `yaml`-ийн `stringify` (alias: `stringifyYaml`) ашигласан.
- Файлын зам: репо үндсэн хавтас дахь **`partB/openapi.yaml`**. Build гаралт `dist/src/main.js` тул `join(__dirname, '..', '..', 'partB', 'openapi.yaml')` гэж тооцсон.
- `app.listen()`-ийн өмнө бичих тул порт сонсохоос өмнө файл шинэчлэгдэнэ.
- JSDoc-д Swagger UI (`/api`) болон `openapi.yaml` автоматаар бичигдэх талаар товч тэмдэглэл нэмсэн.

## Key Decisions / Notes
- **YAML сан**: хэрэглэгчийн шаардлагаар `yaml` npm package (`stringify`) ашигласан; JSON биш YAML формат.
- **Зам (`__dirname`)**: `process.cwd()`-аас хамаарахгүйгээр build-ийн бодит `main.js` байрлалаас `partB/openapi.yaml` руу заасан.
- Апп бүрэн bootstrap хийхэд Prisma `onModuleInit` (`$connect`) ажиллах тул орчны `DATABASE_URL` буруу бол асахгүй бол `openapi.yaml` ч үүсэхгүй (энэ дараалал хэвээр).

## Files Created / Updated
- **Created**
  - (Энэ session log) `partB/ai-sessions/02-swagger-openapi-yaml-export.md`
- **Updated**
  - `partB/src/main.ts` (OpenAPI YAML export)
  - `package.json` / `package-lock.json` (`yaml` dependency)

## Commands Used (high-level)
- `npm install yaml`
- `npm run build` (compile шалгалт)

## Output / Deliverables
- NestJS асах бүрт `partB/openapi.yaml` дээр Swagger/OpenAPI спецификац YAML хэлбэрээр хадгалагдана.

