---
name: security
description: "OWASP Top 10-оор хурдан security review/checklist хийх"
---

Та одоо **/security** командыг ажиллууллаа.

## Зорилго
Код/архитектур/endpoint-ууд дээр **OWASP Top 10** өнцгөөс хурдан шалгалт хийж:
- Аль эрсдэл хамаатайг тодорхойлох
- Ямар хамгаалалт байгаа/байхгүйг тэмдэглэх
- MVP-д хийх **actionable** зөвлөмж өгөх

## Хамрах хүрээ (URL Shortener)
- `POST /api/urls` (input validation, rate limiting)
- `GET /:code` redirect (open redirect, logging, click counter)
- `GET /api/urls/:code` stats (info exposure)

## OWASP Top 10 checklist (товч)
1. **Broken Access Control**
   - Stats endpoint public уу? (MVP-д public байж болно, гэхдээ мэдээллийн хэмжээг хязгаарла)
2. **Cryptographic Failures**
   - Secrets/env vars хамгаалалт, HTTPS (deploy дээр)
3. **Injection**
   - ORM parameterization, raw SQL хэрэглэхгүй байх
4. **Insecure Design**
   - Rate limit байхгүйгээс abuse/spam боломж (nice-to-have боловч тэмдэглэ)
5. **Security Misconfiguration**
   - CORS, security headers, error details leak хийхгүй
6. **Vulnerable and Outdated Components**
   - Dependency audit (npm audit гэх мэт)
7. **Identification and Authentication Failures**
   - MVP-д auth байхгүй бол “not applicable” гэж тэмдэглэ (future: user-owned links)
8. **Software and Data Integrity Failures**
   - CI дээр lockfile ашиглах, trusted registry
9. **Security Logging and Monitoring Failures**
   - Redirect/creation events логдох эсэх, PII байхгүй
10. **SSRF (2021: Server-Side Request Forgery) / request-based risks**
   - Long URL нь серверээс fetch хийдэггүй (зөвхөн redirect) тул SSRF эрсдэл бага; гэхдээ URL parsing/validation зөв байх

## URL Shortener-д онцгой анхаарах (MVP)
- **Open redirect**: ямар ч URL руу redirect хийх нь feature боловч phishing risk гэдгийг docs дээр тэмдэглэ; шаардвал allowlist/denylist (nice-to-have)
- **Rate limiting**: `POST /api/urls` дээр spam хамгаалалт (optional)
- **Input validation**: зөв URL схем (`http/https`) шалгах
- **Header injection**: Location header-д unsafe string оруулахгүй (URL normalize)

## Гаралт (энэ форматаар)
- **Findings**: (High/Med/Low) түвшнээр 3–10 bullet
- **Recommendations**: MVP-д хийх 3–5 actionable алхам
- **Not applicable / Deferred**: MVP-д зориуд оруулахгүй зүйлс
