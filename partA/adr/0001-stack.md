# ADR-0001: Stack сонголт — NestJS + PostgreSQL + React (Vite)

**Date:** 2026-04-30  
**Status:** Accepted

---

## Context (Нөхцөл байдал)

URL Shortener системийг 2 долоо хоногийн хугацаанд MVP түвшинд хүргэх шаардлагатай.
Үндсэн feature-ууд: random short code, redirect + click counter, expiration.
Гурван stack-ийг харьцуулан шинжлэв.

---

## Options Considered (Авч үзсэн сонголтууд)

| | Option A: NestJS + PostgreSQL + React | Option B: FastAPI + PostgreSQL + Celery | Option C: Go + PostgreSQL + HTMX |
|---|---|---|---|
| MVP хурд | ✅ Өндөр | ✅ Өндөр | ⚠️ Дунд |
| Redirect performance | ⚠️ Дунд | ⚠️ Дунд | ✅ Өндөр |
| Background job | ⚠️ Нэмэлт хэрэгтэй | ✅ Celery бэлэн | ⚠️ Өөрөө зохион байгуулна |
| Deploy хялбар | ✅ | ⚠️ Broker шаардана | ✅ Single binary |
| Суралцах зардал | ✅ Java → NestJS ойролцоо | ⚠️ Python шилжилт | ❌ Go шинэ |

---

## Decision (Шийдвэр)

**Option A — NestJS + PostgreSQL + React (Vite)** сонгов.

---

## Rationale (Үндэслэл)

1. **Туршлагатай архитектуртай төстэй**: NestJS-ийн controller/service/module, dependency injection нь Java/Spring-тэй ижил загвартай тул суралцах зардал бага.
2. **MVP хугацаанд хангалттай**: REST API, validation, testing, Swagger docs — бүгд NestJS экосистемд бэлэн байдаг.
3. **Өргөтгөх боломж**: Redis нэмснээр cache/rate limit/counter buffering-ийг шийдэх боломжтой.
4. **TypeScript-first**: frontend (React) болон backend хоёул TypeScript ашиглах тул type sharing боломжтой.

---

## Consequences (Үр дагавар)

**Эерэг:**
- Structured, maintainable codebase эхнээс байна
- NestJS built-in testing (Jest), Swagger, Pipes — ашиглахад бэлэн

**Сөрөг / Ирээдүйд анхаарах:**
- Өндөр траффикт click counter bottleneck болж болно → Redis counter buffering дараа нэмнэ
- Frontend (React) MVP-д minimal байх тул хэрэгжүүлэгдсэнгүй