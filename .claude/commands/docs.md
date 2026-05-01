---
name: docs
description: "JSDoc нэмэх + README-ийн шаардлагатай хэсгийг үүсгэх/шинэчлэх"
---

Та одоо **/docs** командыг ажиллууллаа.

## Зорилго
Өгөгдсөн код/модуль/файл дээр:
- **JSDoc/TSdoc**-ийг шаардлагатай public API хэсгүүдэд нэмэх
- `README.md` (эсвэл `partA/README.md`) дээр **шаардлагатай хэсгийг** (зорилго, run, env, endpoints, tests) үүсгэх/шинэчлэх

## Ямар хэсэгт doc бичих вэ (codebase-оос тогтооно)
- Controllers: endpoint-ийн зорилго, статус кодууд, error case
- Services: business rules (expiration, click increment, collision retry)
- Shared utils: short code generator, URL validation

## JSDoc/TSdoc дүрэм
- Давхар “код юу хийдгийг” тайлбарласан илүүдэл өгүүлбэр бичихгүй
- Non-obvious intent, constraints, edge cases-ийг л тайлбарлана
- Param/return/type-уудыг тодорхой бич (TypeScript байвал type-оо давхардуулж бүү нурш)

## README-д нэмэх/шинэчлэх хэсгүүд (outline)
- Project goal + features (MVP)
- Stack
- Requirements
- Env vars (draft бол draft гэж тэмдэглэ)
- Build/Run
- Tests
- API endpoints (draft; final shape implementation-оор баталгаажна гэж тэмдэглэ)

## Гаралт
- Аль файлуудад ямар doc нэмснийг bullet-оор жагсаа
- README өөрчлөлтүүдийг “Added/Updated” гэж товч жагсаа
