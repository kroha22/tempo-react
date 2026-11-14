# A02–A05 · Карта наследуемых целей, примеров и источников

Обновление: [данные A02.1 реализованы](LEGACY-SRS-A02-1-IMPLEMENTED.md), включая все 11 примеров и три metadata. Ниже сохранена исходная карта базы F-12.2; UI явного подключения старых сохранений остаётся A02.2.

2026-11-14. База `b784d1274522aaefe7f8cbc1625c42244b972e8e` (F-12.2), `main`. Статус: **карта, без реализации и публикации**. Сначала взрослый вариант, без второго детского банка. [Машиночитаемая карта](LEGACY-SRS-A02-A05.json) хранит точные исходные IDs/targets/display, примеры, кандидатов GA1/legacy и предлагаемые изменения. Это документация, не runtime-источник.

## 1. Решение и ожидаемый объём

- Все **17 существующих StudyItem IDs сохраняются**. Новых StudyItems не требуется.
- Зарегистрировать **17 недостающих review definitions под этими же IDs**. Ожидаемо: StudyItems 665 → 665; review definitions 648 → 665. Существующие 648 definitions не перезаписывать.
- Предлагаются **11 исправлений defaultExampleId**: 2 глагола + 8 существительных + вопрос Onde fica…?. Первые 10 исправляют неверный/не демонстрирующий цель пример; вопрос — отдельное рекомендованное улучшение контекста. Добавить 11 scoped Example entities, не редактировать прежние общие Examples. Если вопрос отложен: первая реализация 10, остаток явно зафиксировать.
- Добавить metadata **трёх прежних lesson sources**. Новые source IDs не нужны; ожидаемо 69 → 72 metadata entries. Существующие сохранённые source rows не переписываются.
- Явное подключение повторения — отдельное действие пользователя, включая случай «карточка уже есть из того же источника, но review row отсутствует». GET/JSON import не выполняют backfill.
- Не объединять Route, GA1 и v0001–v1000 по написанию. Разделить повторное использование контента и владение прогрессом. `reviewItemId = saved:<неизменный StudyItem ID>` остаётся прежним контрактом.

## 2. Карта всех 17 целей

Группы ниже — предлагаемая навигационная подача, не новые lessons и не общая оценка освоения. Units новых Route definitions — `[]`: нельзя приписывать им книжные уроки только потому, что существует похожая GA1-карточка. Front строится из прежнего display, back — из прежнего RU translationKey. Для существительных сохранить артикль и plural.

| Группа | Прежний StudyItem ID | Front / смысл | Пример для SRS | Решение |
|---|---|---|---|---|
| Знакомство 5 | `study:chunk:ola` | Olá! | Olá! Chamo-me Rita. Muito prazer. | Новая definition, прежние цель/пример |
| Знакомство 5 | `study:chunk:como-te-chamas` | Como te chamas? | Como te chamas? — Chamo-me Rita. | Новая definition, прежние цель/пример |
| Знакомство 5 | `study:chunk:chamo-me` | Chamo-me ... | Olá! Chamo-me Rita. Muito prazer. | Новая definition, прежние цель/пример |
| Знакомство 5 | `study:chunk:sou-name` | Sou ... — представиться по имени | Eu sou a Rita. | Готовая формула имени, не замена инфинитива SER |
| Знакомство 5 | `study:chunk:muito-prazer` | Muito prazer. | Olá! Chamo-me Rita. Muito prazer. | Новая definition, прежние цель/пример |
| Кто / состояние 2 | `study:verb:ser:identity` | ser — идентичность/характеристика | O Rui é calmo. | Сохранить текущий корректный default; definition под старым ID |
| Кто / состояние 2 | `study:verb:estar:state` | estar — состояние сейчас | O Rui está calmo. | Исправить default; взять существующий beingContent.estar.example |
| Наличие / вещи 4 | `study:verb:ter:possession` | ter — иметь | A Rita tem uma chave. | Исправить default; готовый пример TER/HÁ |
| Наличие / вещи 4 | `study:noun:cama` | a cama — as camas | A cama está no quarto. | Исправить default; переиспользовать текст house-quarto |
| Наличие / вещи 4 | `study:noun:armario` | o armário — os armários | O armário está no quarto. | Короткий новый пример, прежняя морфология |
| Наличие / вещи 4 | `study:noun:copo` | o copo — os copos | O copo está na mesa. | Короткий новый пример, прежняя морфология |
| Места 6 | `study:verb:ficar:location` | ficar — находиться, быть расположенным | A estação fica no centro. | Сохранить location sense и текущий пример |
| Места 6 | `study:chunk:onde-fica` | Onde fica...? | Onde fica a farmácia? | Сохранить вопрос целиком; предлагается вопрос вместо утверждения |
| Места 6 | `study:noun:estacao` | a estação — as estações | A estação fica no centro. | Сохранить «станция», не другое значение estação |
| Места 6 | `study:noun:hotel` | o hotel — os hotéis | O hotel fica no centro. | Исправить default; короткий новый пример |
| Места 6 | `study:noun:farmacia` | a farmácia — as farmácias | A farmácia fica ao lado do hotel. | Исправить default; короткий новый пример |
| Места 6 | `study:noun:centro` | o centro — os centros | A estação fica no centro. | Сохранить «центр» в контексте расположения |

Русские примеры и исходные target/sense IDs перечислены в JSON. Существительные cama/armário/copo не заменяются одноимёнными `house-*` appearance IDs; estação не объединяется по лемме со «временем года».

### Четыре глагола: что переиспользовать

| Прежняя цель | Связанные готовые записи | Почему не подмена |
|---|---|---|
| `study:verb:ser:identity` | `study:ga1:verb:ser:entry`, `v0001` | У GA1 общий смысл и пример A viagem foi boa.; у Route характеристика/идентичность. Сохранить обе истории отзывов |
| `study:verb:estar:state` | `study:ga1:verb:estar:entry`, `v0003` | Текущий GA1 back «будет, вероятно находится», пример Ela estará em casa amanhã.; это не back состояния сейчас |
| `study:verb:ter:possession` | `study:ga1:verb:ter:entry`, `v0002` | Общая лемма не основание переносить источники/отзывы; Route пример — владение ключом, GA1 — Tive muito trabalho ontem. |
| `study:verb:ficar:location` | `study:ga1:verb:ficar:entry`, `v0013` | GA1 «оставаться», legacy «оставаться; становиться»; location sense не эквивалентен им автоматически |

Для четырёх новых definitions можно переиспользовать frequency metadata существующих verbCards через `hasLowerPresentationPriority`; сейчас у всех четырёх результат true (rank ≤ 40). Алгоритм, ранги и basic flags не менять. Не копировать GA1 units/back/examples в узкие Route senses. У остальных 13 новых definitions lowerPriority=false без выдуманного rank.

Предпочтительное решение сохраняет 17 review identities. Вопрос «показывать ли связанные глаголы одной визуальной группой» — будущий UX, не автоматический merge. Если в JSON уже есть отзывы и Route, и GA1, сохранить оба с их versions/receipts/due; не выбирать один и не выдавать один за другой.

## 3. A03–A04: точные исправления примеров

Все 11 затронутых StudyItems сейчас contentRevision=1. Разрешённый diff: `defaultExampleId` и `contentRevision` 1 → 2; плюс новые Example entities/RU strings/manifest revisions. IDs, target, display, переводы самих StudyItems, flow revisions, exercise banks и accepted answers не меняются. Старые Example entities и связанные Chunk.exampleIds не переписывать целиком.

| StudyItem | Неподходящий текущий default | Новый scoped example ID / текст |
|---|---|---|
| `study:verb:estar:state` | `example:rui-ser-calmo` — O Rui é calmo. | `example:legacy-srs:verb-estar-state` — O Rui está calmo. |
| `study:verb:ter:possession` | `example:ha-mesa-sala` — Há uma mesa na sala. | `example:legacy-srs:verb-ter-possession` — A Rita tem uma chave. |
| `study:noun:chave` | `example:ha-mesa-sala` | `example:legacy-srs:noun-chave` — A chave está aqui. |
| `study:noun:livro` | `example:janela-aberta` | `example:legacy-srs:noun-livro` — Estou a ler um livro. |
| `study:noun:cadeira` | `example:ha-mesa-sala` | `example:legacy-srs:noun-cadeira` — A cadeira está ao lado da mesa. |
| `study:noun:cama` | `example:ha-mesa-sala` | `example:legacy-srs:noun-cama` — A cama está no quarto. |
| `study:noun:armario` | `example:ha-mesa-sala` | `example:legacy-srs:noun-armario` — O armário está no quarto. |
| `study:noun:copo` | `example:ha-mesa-sala` | `example:legacy-srs:noun-copo` — O copo está na mesa. |
| `study:noun:hotel` | `example:estacao-centro` | `example:legacy-srs:noun-hotel` — O hotel fica no centro. |
| `study:noun:farmacia` | `example:estacao-centro` | `example:legacy-srs:noun-farmacia` — A farmácia fica ao lado do hotel. |
| `study:chunk:onde-fica` | `example:estacao-centro` — утверждение, не вопрос | `example:legacy-srs:chunk-onde-fica` — Onde fica a farmácia? (рекомендованное улучшение) |

Chave/livro/cadeira уже имеют правильные SRS examples: взять их текст/RU как редакторскую опору для canonical defaults. Их текущие review front/back/examples/units/lowerPriority/отзывы не изменять. Остальные пять nouns и ESTAR/TER — из основного набора 17 без review. Для каждого нового Example targetIds должны указывать на соответствующую существующую цель; одинаковый текст допустим без изменения чужого shared Example.

## 4. A05: источники и действительные входы

| Существующий sourceId | Добавить title | Добавить href | Исходные saveItemIds |
|---|---|---|---|
| `lesson:a1-1:introduce-yourself` | Представиться | `/learning/lessons/lesson%3Aa1-1%3Aintroduce-yourself` | chamo-me, como-te-chamas (2) |
| `lesson:a1-1:ser-estar-description-state` | SER или ESTAR | `/learning/lessons/lesson%3Aa1-1%3Aser-estar-description-state` | ser:identity, estar:state (2) |
| `lesson:a1-1:ask-place-location` | Где расположено место | `/learning/lessons/lesson%3Aa1-1%3Aask-place-location` | ficar:location, onde-fica, estação, hotel, farmácia, centro (6) |

Реестр: `features/content/reading-sources.ts`. Все эти IDs уже существуют как lessons и сохраняются LessonEngine. `github-pages/RelatedLearning.tsx` декодирует их и открывает короткий renderer; серверный `app/learning/lessons/[lessonId]` — отдельный engine. Metadata позволяет библиотеке показать backlink; не менять сохранённые sourceType/sourceId/sourceContextId и не добавлять фиктивный U-контекст.

Для presence-четвёрки используется **уже зарегистрированный** `lesson:a1-1:possession-and-presence`; добавлять его повторно не нужно. Весь набор 17 можно подать как четыре небольших группы 5/2/4/6 в адаптере «Слова из прежних уроков» (например, proposed `/learning/legacy-cards?group=intro|being|presence|places`). Это не новый учебный курс.

**Граница provenance:** 14 целей входят в исходные saveItemIds соответствующих lessons. Olá!, Sou… и Muito prazer. туда не входят, но явно есть в vocabulary исходного introduce-yourself. Все пять фраз также уже собраны в `vocabulary-catalog.ts → lessonBlocks[pairs-introductions]` с sourceHref этого урока: переиспользовать эту связь, не создавать новую учебную принадлежность. В первом runtime не расширять исходный `saveItemIds`/flow revision. Если эти три цели выводятся в новом явном списке «Другие фразы этого объяснения», связать с исходным уроком только по проверенному vocabulary appearance и только после пользовательского Save. Не называть такой список прежним набором saveItemIds. JSON маркирует три записи как `explicit-vocabulary-appearance-only`; новый source ID при такой подаче не требуется. Не сохранять фразы автоматически только за чтение примера.

Source из query string должен выбираться из фиксированного реестра, а не приниматься произвольно. Новые backlink metadata и исходные Route owners не равны новому Page-wide lesson completion.

## 5. Явная активация старой карточки без review

Существующий POST `/api/study-items` уже добавляет missing review для зарегистрированного target, даже если item и тот же source существуют. GET не делает backfill. Но `ReadingCardSave.SaveChoice` и `LessonView` блокируют кнопку по сохранённому item/source, не проверяя review row. Поэтому просто добавить definitions недостаточно для понятного подключения старых сохранений.

| Состояние | Предлагаемое действие | Неизменные данные |
|---|---|---|
| Item отсутствует | «В карточки» → существующий Save | Один item, один реальный source, новый review version 0 |
| Item есть, нового реального source ещё нет | «Добавить источник и повторение» → Save | savedAt/старые sources, существующий отзыв/receipts неизменны |
| Item и тот же source есть, review отсутствует | «Подключить повторение» → повторный Save с тем же source | Не добавлять fake source, не менять savedAt; создать только missing row |
| Item и review уже есть | «Уже в карточках» / перейти к повторению | Не сбрасывать due, interval, ease, repetitions, lapses, version, lastGrade |
| Review импортирован раньше регистрации definition | После регистрации показывать его существующее расписание | Не превращать его в новый version 0 |
| Reviews ещё грузятся, ошибка или сменился профиль | Не считать неизвестное состояние отсутствием; повторить чтение | Не создавать неявный review и не показывать успех до подтверждения |

UI-граница первой реализации может быть новой небольшой страницей адаптера и библиотечной action для этих 17 IDs, без переделки всех LessonEngine кнопок. Если activation недоступна в старом engine, дать понятный переход в адаптер; не объявлять старую disabled кнопку исправленной. Существующие короткие Pages-уроки показывают правило/вопрос, не полноценный серверный Card Save summary: доступность 17/17 требует явного входа к адаптеру.

POST использует прежний валидируемый payload и новый event intent для нового действия; retry повторяет тот же intent. После подтверждения перечитать scoped study reviews. При существующем row конкурентное подключение не должно переписывать его; оценка SRS сохраняет прежние CAS/version и receipt-контракты. JSON export/import не меняет формат, не мержит разные target IDs и не создаёт missing reviews молча.

## 6. Порядок реализации и owners

### A02.1 · Данные, примеры и metadata — первая рекомендуемая задача

Результат команды: ни одна из 665 cardEligible целей не остаётся без явной review definition; defaults соответствуют цели; старые три sources разрешаются в библиотеке.

- Source-only модуль нового моста: владельцы пяти greetings — `first-vertical-slice/l1.ts`, остальных 12 целей — `first-vertical-slice/route-extension.ts`. Примеры брать из `first-steps.ts`, `house.ts`, route examples и `gramatica-vocabulary.ts`; для трёх уже правильных review examples не импортировать сам review catalog в модуль, который он будет импортировать. Не импортировать manifest/vocabulary-catalog из модуля, который затем включается в manifest (без цикла). JSON этой карты не подключать как production data автоматически.
- `features/cards/study-review/catalog.ts`: добавить только 17 missing IDs, сохранить все существующие 648 definitions; применять исходный frequency helper к четырём глаголам.
- `features/content/first-vertical-slice/route-extension.ts` и `manifest.ts`: bounded default repairs, новые scoped Examples/RU и ревизии затронутых StudyItems. Для пяти приветствий сохранить первоначальный canonical owner, а не создавать копии.
- `features/content/reading-sources.ts`: три metadata entries под прежними IDs. Никакой D1 migration/новой схемы/нового scheduler.
- Готовность: 665 StudyItems / 665 review definitions / 72 source metadata, 17 старых IDs разрешаются без замены; ровно согласованные 10 или 11 default repairs; прежние entities за пределами whitelist и 648 definitions структурно равны базе. Это ещё не завершение всего A02, если activation UI отсутствует.

### A02.2 · Доступ и активация 17/17

Зависит от A02.1: UI должен отличать зарегистрированную цель без row от ошибки загрузки. Результат пользователя: открыть четыре маленькие группы, явно сохранить/подключить нужное, перейти в общую очередь и обратно к реальному источнику. Переиспользовать Card Save/SRS API и локальные хранилища. Нового общего mastery, автоматического сохранения и копии детского банка нет.

Готовность: доступны все 17, включая три дополнительные фразы vocabulary; одно и то же source/item без review можно подключить явной кнопкой, legacy source IDs не меняются, старые рейтинги и JSON сохраняются. Mobile 390×844, desktop, keyboard, scoped profile switch, lost-response retry и reload обязательны перед выпуском. Исходный словарь introduction в engine остаётся на прежних двух saveItemIds; расширение vocabulary-подачи подписано честно.

## 7. Проверяемые критерии

1. Current baseline: missing set ровно равен 17 IDs JSON; proposed example IDs не заняты, у затронутых StudyItems текущая revision=1; все route sources/appearances разрешаются.
2. После реализации: прежние 648 definitions и все существующие источники совпадают с baseline; новые 17 не наследуют GA1 units/ошибочный back, четыре frequency flags вычислены прежним helper.
3. Старый item со savedAt=123 и одним source без review: GET/export/import оставляют его как есть; явный POST с тем же source даёт одну row version 0. Повтор не добавляет item/source/review. UI отличает unknown от missing.
4. Ранее оценённые Route/GA1/v-card, включая оба отзыва одной леммы: source additions не меняют ни один schedule/receipt/ID. CAS conflict, lost Save response и lost grade response проверяются отдельно.
5. Сохранённые snapshots/flow revisions/answer IDs и activity hashes не мигрируют. Изменение default example не обнуляет законченные уроки.
6. Backlink каждого из трёх старых source IDs ведёт к корректному объяснению на Pages и серверном пути; отсутствие записи metadata в старом JSON не требует переписывать сам JSON.
7. Правильные canonical defaults и review examples проверяются в обоих местах: отсутствие видимой ошибки благодаря dictionary override не означает исправленный manifest.
8. На телефоне подсказка/Save/activation читаемы, клавиатурой доступны, статус успеха подтверждён. После reload остаются item/source/review и сроки; полный QA и exact SHA Quality/Pages — только в задаче реализации/публикации.

## 8. Что проверено в этой карте

Свежая загрузка runtime-реестров: missing set 17, base 665/648/69; четыре пары Route/GA1/legacy сверены по back/sense/examples, три источника отсутствуют именно в metadata. Проверены существующие nouns morphology и 11 current defaults; новые португальские примеры редакторски предложены, не объявлены результатом независимой лингвистической экспертизы.

Существующие focused tests: **8 domain + 16 component passed** (`study-review`, `home-cards`, `local-learning`, `reading-card-save`). Отдельный синтетический memory-store опыт с уже зарегистрированным quarto подтвердил: GET не создаёт review; POST с тем же source сохраняет savedAt=123, один item/source и создаёт ровно одну version 0 row. Это проверка существующего API-контракта, не реализация 17 новых definitions.

Проверка карты прошла: 17/17 IDs точно равны текущему missing set; target/display/переводы/review identity не подменены; все 11 исходных revisions=1 и proposed Example IDs свободны; три metadata отсутствуют, их закодированные href разрешаются в существующие lesson IDs. Различаются 14 исходных save targets и 3 vocabulary appearances; frequency flag выбран только для четырёх глаголов. 35 относительных ссылок карты/roadmap разрешаются; whitespace/fences/diff проверены. Consistency script сообщает 9 прежних структурных предупреждений в старых спецификациях, не в этой карте.

Логи: `/private/tmp/tempo-a02-a05-domain.log`, `/private/tmp/tempo-a02-a05-components.log`, `/private/tmp/tempo-a02-a05-consistency.log`. Production build, browser, remote CI, commit и deployment в этом анализе не выполнялись. Runtime, источники пользователя, 1000-глагольная колода и прогресс остаются неизменны.
