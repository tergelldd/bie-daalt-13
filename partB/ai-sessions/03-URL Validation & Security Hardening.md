# Session Log 03 — URL Validation & Security Hardening

**Date:** 2026-05-05  
**Topic:** Input validation, security headers, code validation

## Prompt:
> "app.service.ts болон app.controller.ts-д input validation огт байхгүй байна.
> url-validation.ts файл үүсгэж URL болон short code-г шалгах helper функцуудыг бич.
> Мөн main.ts-д Helmet ашиглаж security headers нэм."

## AI Response Summary

### 1) url-validation.ts үүсгэсэн
- `assertValidLongUrlForCreate(raw)` — http/https protocol шалгах, control char хориглох, `new URL()` parse
- `normalizeShortCodeParam(code)` — `/^[a-zA-Z0-9]+$/` regex, урт хязгаар (32)
- `safeRedirectHref(longUrl)` — redirect хийхийн өмнө DB-ийн утгыг дахин шалгах

### 2) Helmet нэмсэн (main.ts)
- `npm install helmet`
- `app.use(helmet({ contentSecurityPolicy: false }))` — Swagger UI-д CSP зөрчихгүйгээр header security нэмсэн

## Hallucination жишээ (засвар хийсэн)
AI анх `helmet()`-г controller decorator болгон ашиглах санал болгосон — NestJS-д буруу хэрэглээ. `main.ts`-д middleware болгон нэмэх нь зөв гэдгийг гараар засав.

## Files Created / Updated
- **Created**: `partB/src/url-validation.ts`
- **Updated**: `partB/src/main.ts` (helmet нэмсэн), `partB/src/app.service.ts` (validation нэмсэн)

## Commands Used
- `npm install helmet`