# F-11 · Карта темы «Дом и расположение»

Обновление: [мост Card Save и SRS реализован в F-12.1](HOME-CARDS-F12-1.md), [полный взрослый флоу — в F-12.2](HOME-FLOW-F12-2.md). Ниже сохранена исходная карта базы `1a18c86`; четыре новых цели и одиннадцать review definitions зарегистрированы, четыре основных примера исправлены. F-12.2 сохраняет владельцев результатов и поддерживает старые адреса.

2026-11-14. База публичного checkout: `1a18c869c25a622ece37b99d7391ff08d977a94d`, `main`. Статус: карта; приложение, карточки, источники, ответы и пользовательские данные не менялись. Образец — [карта F-09](BODY-FLOW-F09.md), [единый флоу F-10.2](BODY-FLOW-F10-2.md). Сначала взрослая подача, без отдельного детского банка.

## Предлагаемый основной объём

Can-Do: назвать знакомую комнату и предмет, спросить и сказать, где находится предмет. Три раздела: **комнаты 6 → знакомые предметы 7 → расположение 5**. В будущем в каждом — объяснение → слова → задания/сцена → повторение. Это 18 целей по небольшим пачкам, а не заучивание всего домашнего словаря за один урок.

Большая схема дома, мебель, кухня/ванная, сад, направления движения и дополнительные предлоги остаются доступными расширениями. TER/HÁ — связанное объяснение присутствия и обладания, FICAR — связанный урок положения места; их результаты не объединяются с ESTAR и основной проверкой расположения.

Будущие `/learning/home/cards?topic=rooms|objects|location` и `/learning/home?topic=…&phase=…` **не реализованы**. Их нельзя сейчас подставлять в зарегистрированные источники или считать работающими маршрутами.

## Готовые материалы и фактические входы

| Материал / вход | Владелец | Готово и ограничение |
|---|---|---|
| Все темы → Дом, `topic:vocabulary-house` | [каталог](../features/content/learning-catalog-view.ts), [VocabularyStudy](../features/practice/VocabularyStudy.tsx) | Просмотр, письмо, пары, поиск, категории по комнатам и схема. Topic ID — внутренний ключ каталога, не отдельный URL |
| Дом: 24 подписи на схеме | [house.ts](../features/content/house.ts) | Артикль, singular/plural, перевод, пример и координаты; `image-house`, изображение `/house-illustration-v3.webp` |
| Дом: 51 слово | [house-practice.ts](../features/content/house-practice.ts) | 4 исходных набора: home-rooms 19, home-furniture 14, kitchen-bath 9, garden-transport 9. Исходные practice words в основном содержат label/translation; нельзя считать все 51 готовыми личными noun-карточками с парадигмой |
| Предметы по комнатам | Там же, houseRoomGroup | 6 перекрывающихся наборов 4/6/6/5/4/5: сад, спальня, кухня, гостиная, гараж, ванная. Совпадение предмета в двух комнатах — допустимое повторное появление, не новая карточка |
| Дом и вещи, `collection:vocabulary-lesson:home` | [vocabulary-lessons](../features/content/vocabulary-lessons.ts) | 6 reviewed слов: apartamento, sala, espelho, chave, teto, objeto. Встраиваются в общую тему дома; это дополнительный источник, не ещё шесть обязательных целей |
| Все темы → Пространство и направления, `topic:vocabulary-space` | [space-vocabulary](../features/content/space-vocabulary.ts) | 8 положений и 6 направлений, иллюстрации, примеры и прежние упражнения |
| `#/learning/lessons/lesson%3Aa1-1%3Aname-familiar-objects` | [route-extension](../features/content/first-vertical-slice/route-extension.ts), [RelatedLearning](../github-pages/RelatedLearning.tsx) | Правило артикля/plural, 7 noun labels, один вопрос о нескольких окнах. На Pages — короткий урок с activity; не полный LessonEngine |
| `#/learning/lessons/lesson%3Aa1-1%3Alocate-object` | Те же owners | Onde está, 4 отношения, no/na; пример, один выбор under. На Pages нет интерактивного перемещения кота |
| `#/learning/lessons/lesson%3Aa1-1%3Apossession-and-presence` | Те же owners | Готовое TER/HÁ, один выбор ha. Дополнительные слова этого урока не объявляются выученными основными пачками |
| `#/learning/practice?lesson=ser-estar` и `?verb=estar&tense=present` | BeingLesson / AdultLessons / being-navigation | Работающие PT/RU-объяснения и формы ESTAR. Связать возвратом в исходный шаг, не копировать банк ответов |
| `#/learning/lessons/lesson%3Aa1-1%3Aask-place-location` | route-extension / RelatedLearning | FICAR для расположения места; существующий ответ fica и самостоятельный результат |
| Пространство → Фразы | [learningCatalog](../features/content/learning-catalog.ts), UsagePractice | `usage:space-location`: 4 примера, 1 cloze внутри коробки. Проверяет только выбранное отношение, не все 8 предлогов |

Домашнего самостоятельного объяснения PT/RU на все пачки сейчас нет. HouseWords даёт примеры; каталог — словарные механики. Короткие route cues на Pages написаны по-русски с PT/RU-примерами; переключателя полного языка там нет. Для будущего флоу потребуются краткие португальские вступления с русским режимом на основе готовых правил. Наличие внутренней канонической спецификации `FIRST-VERTICAL-SLICE-LESSON-MAP.md` не означает, что вся описанная там учебная последовательность доступна на Pages.

## Основная карта слов и целей

Обозначения: **SRS** — существующий target уже зарегистрирован в review catalog; **канонический** — target в manifest есть, но review card пока нет; **новый** — предлагаемая цель отсутствует в manifest. Существующие IDs не заменять одинаково написанными карточками GA1 или house aliases.

| Пачка | Слово | Прежний word / appearance ID | StudyItem и статус |
|---|---|---|---|
| Комнаты 6 | o quarto — os quartos | `house-quarto` | `study:noun:quarto` · канонический |
| Комнаты 6 | a sala — as salas | `house-sala` | `study:noun:sala` · канонический |
| Комнаты 6 | a cozinha — as cozinhas | `house-cozinha` | `study:home:noun:cozinha:entry` · новый |
| Комнаты 6 | a casa de banho — as casas de banho | `house-casa-de-banho` | `study:home:noun:casa-de-banho:room` · новый |
| Комнаты 6 | o escritório — os escritórios | `house-escritorio` | `study:home:noun:escritorio:home-office` · новый |
| Комнаты 6 | a garagem — as garagens | `house-garagem` | `study:home:noun:garagem:entry` · новый |
| Предметы 7 | a mesa — as mesas | `study:noun:mesa`; aliases `house-mesa`, `scene-word:a-mesa` | `study:noun:mesa` · SRS |
| Предметы 7 | a caixa — as caixas | `study:noun:caixa` | тот же ID · канонический |
| Предметы 7 | a porta — as portas | `study:noun:porta` | тот же ID · канонический |
| Предметы 7 | a janela — as janelas | `study:noun:janela`; alias `house-janela` | `study:noun:janela` · канонический |
| Предметы 7 | o gato — os gatos | `study:noun:gato` | тот же ID · канонический; знакомый участник сцены |
| Предметы 7 | a chave — as chaves | `study:noun:chave` | тот же ID · SRS |
| Предметы 7 | o livro — os livros | `study:noun:livro` | тот же ID · SRS |
| Расположение 5 | Onde está…? | `study:chunk:onde-esta` | тот же ID · канонический |
| Расположение 5 | dentro de | `study:chunk:dentro-de` | тот же ID · SRS |
| Расположение 5 | em cima de | `study:chunk:em-cima-de` | тот же ID · SRS |
| Расположение 5 | debaixo de | `study:chunk:debaixo-de` | тот же ID · SRS |
| Расположение 5 | ao lado de | `study:chunk:ao-lado-de` | тот же ID · SRS |

**Итого: 18 целей = 4 новых StudyItems + 14 существующих.** Из 14 существующих **7 уже в SRS**, **7 ещё требуют регистрации review cards**. Нужны 11 недостающих review entries, а не 11 новых языковых целей. Ожидаемые счётчики после ограниченного моста: 665 StudyItems / 648 review cards; это план, не текущее состояние.

Текущие units семи SRS-карточек сохраняются целиком, в том числе дополнительные appearances: mesa `[36,1,14]`, chave `[44]`, livro `[14,36,43,13,19,23,24,28]`, четыре отношения `[46]`. Существующие front/back/examples/reviews этих семи не заменяются локальными house-переводами.

### Смысловые границы и исходные aliases

- House quarto/sala/cozinha и другие комнаты имеют отдельные legacy meanings `meaning:house-*`, часть со статусом needs-review. Мост к двум каноническим комнатам должен быть явным и проверенным; не объединять весь граф значений по совпавшей лемме. Sala «гостиная» совместима с текущей канонической «комната / гостиная», но её старый перевод не переписывается.
- Mesa уже объединяет три legacy word IDs в `meaning:study:noun:mesa`; другие aliases нельзя присоединять по аналогии без проверки. ID `house-janela` остаётся для схемы даже при сохранении общей `study:noun:janela`.
- Quarto — существительное «спальня», а не порядковое «четвёртый». Escritório здесь домашний кабинет; не смешивать автоматически с рабочим словарём офиса.
- В housePracticeWords есть plural labels `as cadeiras`, а в схеме — `as escadas` при singular lemma escada. Сохранить старые labels, принятые ответы и номера/координаты. Для новых noun-карточек брать morphology из явного владельца, не угадывать plural по label.
- Rés do chão и primeiro andar учитывают португальскую нумерацию этажей; не менять русский смысл на «первый/второй» без уточнения уровня земли. Гардероб guarda-fatos, составные plurals и остальные 51 слово не входят в первый мост.

## Унаследованные пробелы, мешающие мосту

1. **Сохранённая карточка без review row.** [local-learning-api](../github-pages/local-learning-api.ts) создаёт review только при POST Save для зарегистрированной цели; GET не достраивает отсутствующие rows. У ранее сохранённых семи канонических targets записи может не быть. После регистрации Save из нового источника должен создать version 0 только при отсутствии row и сохранить savedAt, sources и любой имеющийся отзыв. Простое добавление review catalog не означает автоматическое включение всех прежних сохранений в очередь. Автоматический backfill без явного Save — отдельное решение, не обещание этой карты.
2. **Неподходящие default examples.** В текущем manifest `study:noun:quarto` указывает на `example:ha-mesa-sala` (нет quarto), caixa — на gato под столом (нет caixa), porta — на открытую janela. У Onde está…? default — утверждение, не пример вопроса. Перед подключением к повторению нужны подходящие примеры: для caixa уже есть контекст внутри коробки, для quarto — house owner, для вопроса — пример route; porta требует выбора/редактуры подходящего примера. Сохранять IDs/targets и прогресс, не копировать ошибочный default в новую review card. Если меняется defaultExampleId, явно перечислить разрешённые поля и ревизии; не переписывать весь pack.
3. **Существующие review overrides важнее ошибочного default.** У chave/livro manifest default также не демонстрирует слово, но текущие словарные review cards имеют свои примеры. Не «исправлять» их заменой на старый manifest default.
4. **ESTAR/TER не включать автоматически в основную очередь.** `study:verb:estar:state` ссылается на `example:rui-ser-calmo` (SER), `study:verb:ter:possession` — на пример HÁ. Отдельные глагольные targets/примеры требуют редакторской сверки; они не входят в 18 целей. У `study:chunk:ha-presence` уже есть SRS с прежними U30/U23 и расширенным front — не заменять его новой карточкой «há».
5. **Старые адреса не подтверждают рабочий вход.** Метаданные house содержат `/learning/house` и `/cards/house`; в текущем app нет таких страниц, а Pages RelatedLearning не обрабатывает их. В ImageMatchingExercise cardsHref выводится обычным `<a>`, что также не обеспечивает hash-навигацию Pages. `house-a-casa` — сохранённый deck metadata ID, а не доказательство действующей колоды в нынешнем Flashcards. Не удалять ID/провенанс; в следующей реализации отдельно исправить/адаптировать реальные ссылки и проверить aliases.
6. **Sources маршрута без metadata.** LessonEngine сохраняет исходный sourceId lesson ID, но три соответствующие записи отсутствуют в ReadingSource registry. Saved library показывает число sources, однако не даёт обратную ссылку для незарегистрированного ID. Нужно добавлять metadata под теми же IDs, не менять сохранённые строки пользователя.

Все эти выводы основаны на загрузке реестров и чтении владельцев, а не на новой браузерной проверке.

## Сцены: что действительно реализовано

| Слой | Наблюдаемая возможность по коду | Чего он не подтверждает |
|---|---|---|
| `image-house` | 24 подписи и 24 hotspots, выбор слова → кнопка точки, zoom, проверка; completion `image:image-house` | Не проверяет языковые отношения «под/внутри». Это подписи на схеме, не semantic placement кота |
| Смежные бытовые картинки | [picture-scenes](../features/content/picture-scenes.ts): `image-garden`, `image-breakfast`; [table-scene](../features/content/table-scene.ts): `image-table`, 6 подписей | Готовые словарные сцены сада/завтрака/сервировки, не новые обязательные слова основной очереди. Их `image:<id>`, scene-word aliases и карточки еды не заменяются домашними targets |
| Пространственные карточки | 8 положений и 6 направлений с иллюстрациями `/images/vocabulary/space-drawn-v1.webp` | Иллюстрация и перелистывание не являются независимой проверкой |
| Route activity `exercise:space:independent` | В Pages — обычный выбор under из трёх вариантов. В серверном LessonView есть CSS-композиция кот/стол/коробка и те же варианты кнопками | Kind scene не доказывает drag-and-drop или отдельную сцену в Pages |
| `features/scenes/domain.ts` / validation.ts | Чистая модель actor/relation/reference и semantic validation; два domain tests | Нет вызовов этого validator из текущего пользовательского scene UI. Тест равенства visual/structured payload не является браузерной приёмкой двух UI-путей |
| `checkpoint:a1-1:new-room` | В опыте сейчас один вопрос с ответом under; перечислены шесть критериев | Нельзя объявлять все шесть Can-Do доказанными единственным вопросом. Спецификация более полного checkpoint остаётся целевым состоянием |

Первый флоу может переиспользовать готовый выбор и существующую схему как самостоятельные механики. Новый scene engine и полную checkpoint-оценку не включать неявно в задачу карточек.

## Владельцы результатов: сохранить раздельно

- `image:image-house`: исходные 24 слова и hotspots. Подмножество на шесть комнат нельзя записывать под этим ID как полный результат 24/24.
- WordPairs: `pairs:<точный block.id>`. В каталоге blocks получают collection IDs, поэтому возможны `pairs:collection:home-rooms`, `pairs:collection:house-room-set-quarto`; не заменять фактический переданный ID исходным коротким home-rooms.
- Письмо/поиск: `wordActivityId("writing"|"search", точные word IDs)`; поиск зависит от слов конкретной доски. У новых пачек 6/7/5 нет прежнего planStep. Не засчитывать ими старое письмо 19 слов или весь домашний набор.
- Категории: `wordActivityId("odd"|"common", eligible set IDs)`, исходные явно проверенные distractors; перекрытие комнат не означает ошибку.
- `usage:space-location`: один отдельный activity; `cloze:space-inside` → option `inside` (`dentro da`). Не приравнивать к прохождению всех отношений.
- На Pages короткие уроки пишут ActivityCompletion под **lesson ID**: familiar objects, locate-object, possession-and-presence; отдельный checkpoint — под своим ID. Ответы соответственно `as` / `under` / `ha` / `under`; exercise IDs `exercise:nouns:independent`, `exercise:space:independent`, `exercise:ter-ha:independent`, `exercise:checkpoint:new-room`.
- Серверный LessonEngine ведёт phase/snapshot/completion через общий progress API; это иной владелец, чем короткий activity Pages. Нельзя молча переносить один результат в другой или объявлять статический короткий урок полным выполнением Route Lesson.
- Card Save/SRS и просмотр слов не засчитывают упражнения. Общая оценка «Дом освоен» в первом объединении не вводится.

## Sources и повторение: предложение

Новые источники пачек: `lesson:home:rooms`, `lesson:home:objects`, `lesson:home:location`. Регистрировать только вместе с работающим экраном карточек. Дополнительно дать metadata трём **существующим source IDs** `lesson:a1-1:name-familiar-objects`, `lesson:a1-1:locate-object`, `lesson:a1-1:possession-and-presence`, с проверенными адресами их работающих коротких уроков. Сохранённые sourceType/sourceId/sourceContextId не мигрируют; будущий полный флоу меняет только href при сохранении идентичности.

Семь готовых SRS targets переиспользуются со всеми units/reviews. Семь старых канонических targets получают review definitions и подходящие примеры, четыре новых комнаты — typed noun StudyItems. Для новой общей очереди нужен явный список 18 ID; в неё попадают только сохранённые и наступившие по сроку карточки. Не добавлять автоматически остальные комнаты, все 14 предлогов, ESTAR/TER и дополнительный словарь home.

Новые адаптеры личных карточек исключаются из legacy exercise words, как в F-10.1; иначе добавление pack может изменить банки и хеши прогресса. API/storage/SRS-алгоритм и deck 1000 не требуют смены для явного Save. Перед любой иной политикой backfill проверить все readers и старые JSON backups.

## Первая задача следующей сессии

**F-12.1 — мост карточек 6/7/5.** Наблюдаемый результат: взрослый открывает три пачки, сохраняет выбранное и повторяет через общий SRS. Сначала редакторски разрешить четыре неподходящих default examples и явные room senses, затем подключить 18 targets: 4 новых StudyItems, 7 существующих без review definition, 7 готовых SRS без перезаписи. Это разблокирует повторение будущего флоу.

Границы: экран слов и явный Save, review registry, корректные примеры и sources/backlinks; не новый scene engine, не 51 новая карточка, не перенос Route progress, не Cloudflare. Исправления примеров должны сохранять старые StudyItem/card IDs и иметь отдельный список разрешённых content-полей; не обнулять существующие оценки.

Готовность: все 18 targets разрешаются; ни одного нового дубля canonical noun/chunk; отзыв семи SRS и их units неизменен после нового source; старый saved item без review row получает только недостающий version 0 при явном Save, уже существующий row не перезаписывается. Старые house word IDs, accepted answers sala/quarto и plural labels, image-house 24/24, hashed activities и metadata ID house-a-casa сохранены. Library → source ведёт к рабочему входу. Проверки: data/contract/component, JSON round-trip с legacy saved/no-review и rated cases, profile isolation, Save/retry/grade/reload, 390×844 и desktop.

**F-12.2 — полный взрослый флоу** после моста: короткие PT/RU-вступления, существующие словарные механики и пространственные задания, отдельные state owners, честный summary без новой общей mastery. Отдельно закрыть hash-links/legacy aliases и проверить сцены/клавиатуру в браузере. Более полный checkpoint остаётся отдельным предложением, не автоматически выполненным этапом. Сроки и приоритет относительно других направлений не назначаются.

## Проверка F-11

Текущие реестры загружены на Node 22.23.2. Инвентаризированы 24 house labels, 51 practice word, 13 collections дома/пространства/дополнительного home, 14 пространственных слов, canonical/SRS соответствия основной очереди, источники и route activities. Локальная выгрузка: `/private/tmp/tempo-f11-inventory.json`. Текущее состояние: 661 StudyItems / 637 review cards / 63 ReadingSources; в F-11 они не изменены.

```sh
node --experimental-strip-types --test tests/space-vocabulary.test.ts tests/scene-domain.test.ts tests/vocabulary-activities.test.ts tests/vocabulary-lessons.test.ts tests/learning-catalog-view.test.ts tests/lesson-session.test.ts
npx --no-install vitest run tests/components/related-learning.test.tsx tests/components/vocabulary-activities.test.tsx tests/components/local-learning.test.tsx
```

Прошли **14 domain и 18 component tests**. Это проверка действующих реестров/механик/контрактов, а не приёмка будущего флоу или визуальный аудит всех 24 hotspots. Относительные ссылки и code fences изменённых документов проверены; consistency script сообщает 9 прежних структурных предупреждений в других документах. В F-11 не выполнялись build, browser QA, deployment или изменение storage. Португальские формы и смысловые различия просмотрены по текущим владельцам; новая редактура примеров оставлена следующей задаче.
