# A02.1 · Определения SRS, примеры и источники

Последующий интерфейс доступа и явного подключения реализован в [A02.2](LEGACY-CARDS-A02-2-IMPLEMENTED.md). Ниже сохранён отчёт о границе этапа A02.1.

2026-11-14. База: `b784d1274522aaefe7f8cbc1625c42244b972e8e`. Реализован этап данных по [карте A02–A05](LEGACY-SRS-A02-A05.md); [JSON карты](LEGACY-SRS-A02-A05.json) остаётся исходной проверяемой картой, не импортируется в production runtime.

## Что подключено

- **17 review definitions** под прежними StudyItem IDs. Все 665 cardEligible целей теперь имеют definition; 665 StudyItems остаются теми же, общий каталог SRS 648 → 665.
- Четыре глагола Route сохраняют отдельные identity/state/possession/location senses. Их back/examples берутся из прежнего смыслового владельца, units остаются `[]`. Frequency/basic metadata переиспользуется через прежний helper, lowerPriority=true у четырёх глаголов; GA1 и v0001–v1000 не заменены и не объединены.
- **Все 11 default repairs**, включая Onde fica…?: 2 глагола, 8 существительных, 1 вопрос. В исходном Route owner меняются только defaultExampleId/contentRevision 1 → 2 у выбранных 11 StudyItems. Добавлены 11 собственных Example entities и RU strings; прежние общие Examples/Chunks сохранены.
- **Три metadata источников** под прежними IDs: introduce-yourself, ser-estar-description-state, ask-place-location. Всего 69 → 72. Существующие источники не переписываются; ссылка сохранённой карточки ведёт в исходный короткий урок на Pages или LessonEngine в серверном приложении.

Owners: [legacy-srs.ts](../features/content/legacy-srs.ts), [legacy-example-repairs.ts](../features/content/legacy-example-repairs.ts), [review catalog](../features/cards/study-review/catalog.ts), [Route owner](../features/content/first-vertical-slice/route-extension.ts), [manifest](../features/content/manifest.ts), [source metadata](../features/content/reading-sources.ts).

Source-only модули не импортируют manifest или review catalog обратно. Пять greetings читаются из l1, остальные цели — из Route extension. Список 17 фиксирован явно; добавление новой cardEligible цели не создаёт definition автоматически по эвристике.

## Примеры

Состояние ESTAR: O Rui está calmo.; владение TER: A Rita tem uma chave. Chave/livro/cadeira получают canonical defaults с теми же текстами, что уже используются в их правильных review examples; эти три существующие review definitions не перезаписаны.

Остальные исправления: A cama está no quarto.; O armário está no quarto.; O copo está na mesa.; O hotel fica no centro.; A farmácia fica ao lado do hotel.; Onde fica a farmácia? Точные IDs, PT/RU и владельцы приведены в карте. Редакторская сверка pt-PT выполнена; независимая экспертиза и повторная сверка PDF не заявляются.

## Сохранения и граница A02.2

API, scheduler, schema, JSON format, flow revisions, упражнения, источники пользователя и hashes результатов не менялись. Прежние GET и import не создают missing review rows. При явном POST Save для зарегистрированной цели существующий алгоритм создаёт version 0 только если row отсутствует, даже при том же source; savedAt, другие источники и любой существующий отзыв сохраняются. Импортированный ранее review теперь распознаётся по definition без подмены его срока/версии.

**A02.1 не добавляет интерфейс активации.** Старые saved-кнопки могут оставаться disabled при том же source и отсутствии review; явная action «Подключить повторение» и доступ ко всем 17 через небольшие группы — A02.2. Нельзя объявлять регистрацию definitions автоматическим включением всех старых карточек в due queue. Три дополнительных greetings не добавлены в старые saveItemIds; provenance и lesson completion не расширены.

## Доказательства

Структурное сравнение с точным статическим снимком F-12.2 подтвердило: все pack-данные совпадают, кроме 11 default/revision edits, 11 новых Examples/RU и соответствующих manifest revisions. LearningCatalog, 648 прежних review definitions, 69 metadata источников и 1000 verbCards структурно неизменны.

Четыре domain tests проверяют точные 17 IDs/покрытие, все 11 scoped defaults и прежние общие Examples/flow revisions, четыре независимых verb senses/frequency flags, metadata/backlinks и прежние saveItemIds знакомства.

Четыре component tests проверяют: 17 legacy items без reviews → GET/JSON без backfill → явный повторный Save с тем же source без дублей; отдельные оценённые Route/GA1/v-card histories и receipts/Route progress после повторного Save/JSON; все исправленные примеры и три backlinks в библиотеке; state-specific ESTAR в общей очереди с одной оценкой и восстановлением расписания.

Финальные check/build, exact-tree Pages build, desktop/mobile browser на синтетическом старом JSON и публикация фиксируются в приватном актуальном roadmap по точному SHA. Следующий этап — A02.2, без скрытой миграции прогресса.
