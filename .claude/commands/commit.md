---
name: commit
description: "Conventional Commits-аар тохирох commit message санал болгох"
---

Та одоо **/commit** командыг ажиллууллаа.

## Зорилго
Өөрчлөлтүүдийг (diff/файлууд/зорилго) хараад **Conventional Commits** стандартын дагуу 1 ширхэг хамгийн тохирох commit message санал болго.

## Conventional Commits формат
`type(scope): summary`

Optional:
- Body: яагаад өөрчилсөн, trade-off, compatibility
- Footer: `BREAKING CHANGE: ...` (шаардлагатай үед)

## Type сонголт (голлон ашиглах)
- `feat`: шинэ боломж
- `fix`: bug засвар
- `docs`: зөвхөн баримт бичиг
- `test`: тест нэмэх/сайжруулах
- `refactor`: behavior өөрчлөхгүй бүтэц өөрчлөх
- `chore`: build/CI/tooling

## Scope жишээ
- `backend`, `frontend`, `api`, `redirect`, `stats`, `docs`

## Гаралт (энэ форматаар)
- **Proposed commit message**: `...`
- **Rationale**: 1–2 өгүүлбэрээр “яагаад энэ type/scope вэ?”
- (Optional) **Alternative**: 1 өөр хувилбар

## Анхаарах зүйл
- Summary нь **товч** (≈ 50–72 тэмдэгт) бөгөөд “why”-г илүү онцол
- Нэг commit-д олон өөр төрлийн зүйл холилдсон бол хамгийн гол зорилгыг сонго, эсвэл split хийхийг зөвлөмжил
