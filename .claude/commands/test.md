---
name: test
description: "Testing pyramid дагуу edge case-тай тестийн төлөвлөгөө + тестийн код бичүүлэх"
---

Та одоо **/test** командыг ажиллууллаа.

## Зорилго
Өгөгдсөн өөрчлөлт/feature/endpoint-д **testing pyramid** (unit → integration → e2e) зарчмаар тестийн багц санал болгож, **edge case** болон **алдааны тохиолдлууд**-ыг хамруулан хэрэгжүүл.

## Эхлээд тодруулах (хариултыг кодоос хайж ол; хэрэггүй бол асуухгүй)
- Аль модуль/функц/endpoint тестлэх вэ? (ж: `POST /api/urls`, `GET /:code`, expiration logic, click counter)
- Ашиглаж буй test framework: Jest/Vitest/Supertest/Playwright/Cypress (байгаагаар нь дага)
- DB ашиглах эсэх: in-memory/mock/real test DB (байгаагаар нь дага)

## Гаралт (энэ форматаар)
1) **Test plan (pyramid)**
   - Unit tests (fast): 5–10 ш
   - Integration tests (service+db): 3–6 ш
   - E2E tests (API/UI): 1–3 ш

2) **Edge cases checklist**
   - Input validation
   - Collision scenarios
   - Expiration boundary (exact now, timezone)
   - Redirect статус (302/301), not found (404), expired (410/404)
   - Click counter race/concurrency (atomic increment)
   - Security-ish: open redirect зөвшөөрөх domain policy байгаа эсэх (байхгүй бол “accept any valid URL” гэж тэмдэглэ)

3) **Implementation**
   - Шаардлагатай бол тестийн helper/fixtures нэм
   - Тестүүдийг бодитой, уншихад амар нэршилтэй бич
   - Аль болох “arrange/act/assert” бүтэцтэй байлга

## URL Shortener-д зориулсан заавал хамруулах edge case-ууд (MVP)
- `longUrl` хоосон/invalid URL → 400
- `expiresAt` буруу формат/өнгөрсөн хугацаа → 400 (эсвэл rule-ээ дага)
- Short code collision → retry, эцэст нь unique code үүссэн эсэх
- `GET /:code`:
  - олдохгүй → 404
  - expired → 410 (эсвэл 404; төслийн шийдвэрийг дага)
  - active → 302 redirect + clicks +1
- Click counter: олон зэрэгцээ request дээр clicks зөв нэмэгдэж буй эсэх (integration test)
