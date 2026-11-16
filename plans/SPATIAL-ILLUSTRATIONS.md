# Прозрачные изображения расстановки · 2026-11-16

Созданы встроенным инструментом imagegen в режиме `background-extraction`, `transparent_background: true`. CLI/API fallback не использовался. Сохранены как отдельные версии; исходные атласы и иллюстрации остальных упражнений не заменялись.

## Результаты

- `public/images/spatial/cat-transparent-v1.webp` — кот, 391 × 512.
- `public/images/spatial/book-transparent-v1.webp` — книга, 512 × 432.
- `public/images/spatial/bag-transparent-v1.webp` — рюкзак, 484 × 512.
- `public/images/spatial/box-transparent-v1.webp` — коробка, 512 × 345.

Сгенерированные RGBA PNG упакованы в WebP с сохранением alpha, ограничением 512 пикселей и удалением пустых прозрачных полей. Проверено наличие полностью прозрачных пикселей: 24–36% площади в зависимости от предмета. В игре используются обычные прозрачные img, без белых подложек VocabularyIllustration.

## Набор промптов

Общий префикс: “Use case: background-extraction. Production sprite for an educational web game.” Общие ограничения: “Output a genuine RGBA image with fully transparent background, not a painted checkerboard. Keep the original illustration rather than redesigning it. No text.”

1. **Cat**, reference `public/images/vocabulary/space-drawn-v1.webp`: Isolate ONLY the orange sitting kitten (the kitten above the closed blue box in the top row, second cell). Keep the same appealing face, orange fur and white chest, watercolor children's learning illustration. Reconstruct its full seated body and paws, curved tail. REMOVE the box and every other element, remove the white background completely. One full-body kitten centered, facing the viewer, no floor, no cast shadow. Fill about 86% of a square canvas with modest even transparent margins.
2. **Box**, same reference: Isolate ONLY the empty open BLUE cardboard box at the top right of the reference, WITHOUT the kitten. Keep the blue watercolor texture, front-facing three-quarter view, open flaps, clearly visible dark blue interior. Remove absolutely everything else, including the white background, kitten and floor shadow. Single blue open box, centered tightly, all flaps intact, 90% canvas width. The opening must be broad enough to place a kitten sprite inside; the front wall has a distinct straight horizontal top rim, front wall fills the lower half, flaps splay to the sides. No base, no frame, no ground.
3. **Book**, reference `public/images/vocabulary/everyday-drawn-v1.webp`: Isolate ONLY the blue hardcover book in the upper right corner, whose cover shows a green landscape with trees, path, blue sky. Preserve its original illustration, proportions and closed-book three-quarter angle. REMOVE every other object and the white background entirely. One book centered and tightly framed with 8% transparent margins; no drop shadow, no rectangular tile or badge. Keep the watercolor/painted children's learning illustration style.
4. **Bag**, same reference: Isolate ONLY the cobalt blue school backpack in the top left corner. Preserve its original blue fabric, straps, curved handle, zippers, front pockets and painted illustration style. Remove EVERY other object and remove the white background entirely. One upright backpack centered, tight framing with 8% transparent margins. No white rectangle, no badge, no floor or shadow. Keep all backpack straps/handle intact.

## Подключение

`features/content/spatial-art.ts` — реестр файлов. Внутри коробки предмет отрисовывается между задней частью и передней стенкой коробки; передняя стенка использует clip-path того же изображения. Слова, ответы и ID прогресса не менялись.

Обложки сборников переиспользуют существующие рисунки через `features/content/word-collection-art.ts`: часы из существующего SVG, яблоко из продуктового атласа, схема дома, рука, одежда, животное, готовые обложки общения и действий, а также новые прозрачные книга и рюкзак. Для них отдельная генерация не требовалась.
