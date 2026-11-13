# F-05 · Карта единой темы «Моя семья и близкие»

Карта реализована в [F-06.1](FAMILY-CARDS-F06-1.md) и [F-06.2](FAMILY-FLOW-F06-2.md). Ниже сохранён исходный анализ базы и разделение готового материала/остатка; актуальные входы и проверки — в отчёте F-06.2.

Дата: 2026-11-13. База публичного checkout: `51e701b6cf16534133d18741ebf41c3a8259a512`, ветка `main`. Статус: карта составлена, флоу не реализован. Это следующий взрослый флоу по образцу [F-04](TIME-DAY-F04.md), без смены хранения, ответов, существующих ID или расписания карточек.

Обновление F-06.1: [семейные Card Save и SRS подключены](FAMILY-CARDS-F06-1.md). Формулировки «новый/отсутствует/не зарегистрирован» ниже описывают исходную базу карты; перечисленные 11 targets и 2 источника теперь зарегистрированы. Полный четырёхшаговый флоу остаётся следующим этапом. Рабочие адреса карточек и источников приведены в F-06.1.

## Почему эта тема

| Кандидат | Что уже есть в коде | Решение для этой очереди |
|---|---|---|
| Моя семья и близкие | Семейный урок, meu/minha/teu/tua, шесть примеров, два набора по 6 существительных, 10 заданий с единым `usage:family`, письмо обоих наборов | Выбран: материал ограничен и есть разные существующие владельцы результатов, на которых можно проверить повторное применение F-04 |
| Еда и предпочтения | EverydayLesson `likes`, `usage:food-likes`, многочисленные продуктовые коллекции и сцены | Остаётся кандидатом: сначала потребуется выбрать небольшой объём из более широкой темы. Не объединять весь каталог еды в один урок |
| Состояния и здоровье | 6 состояний, 3 задания `usage:feelings`, отдельные школьные prevention/wellbeing и тело | Остаётся кандидатом: в UsagePractice для `usage:feelings` явно выключена запись ActivityCompletion. Нельзя считать этот результат уже сохраняемым или объединять эмоциональные состояния со школьной проверкой здоровья |

Основание выбора — чтение текущих `family-lesson.ts`, `feelings-lesson.ts`, `everyday-lessons.ts`, `learning-catalog.ts` и исполнителей, а не свежая браузерная приёмка.

## Результат и границы

Пользователь сможет назвать близких, различить avó/avô и рассказать о своей или вымышленной семье через meu/minha/teu/tua и SER. Два основных раздела: «Близкие» и «Родственники». В каждом: объяснение → слова → задания → личное повторение. Профессии — необязательная опора к семейным фразам; содержание о своей семье вводить не требуется.

Основные слова: 6 + 6. Дополнительная пачка пяти ролей — estudante, professor, médico, cozinheiro, engenheiro: все встречаются в готовых примерах/заданиях. Artista остаётся в полном наборе «Кто я», в очередь этого флоу не входит. Meu/minha/teu/tua — опора правила, не новая обязательная колода. Уже существующие `study:ga1:determiner:meu:entry` и `study:ga1:determiner:teu:entry` сохраняются.

Не добавлять новые задания на родственные связи, множественные притяжательные, отдельную детскую программу, книжное completion или общую оценку освоения. Родственники пока проверяются письмом: самостоятельного банка фраз о дядях/двоюродных родственниках нет.

## Входы и переходы

| Вход | Текущее состояние | Целевое поведение следующей реализации |
|---|---|---|
| `/learning/topics` → Família e amigos, `topic:vocabulary-family` | Открывает FamilyLesson; есть коллекции близких и родственников | Основная карточка ведёт в единый флоу. Старый topic ID и наборы сохраняются, библиотечные механики остаются доступны |
| Общий план → «Моя семья» | `/learning/plan/step/practice%3Awords%3Aexpansion-family-close` — карточки и письмо | Сохраняет старое назначение и результат; рядом доступен переход в соответствующий раздел флоу |
| Общий план → «Родственники» | `/learning/plan/step/practice%3Awords%3Aexpansion-family-relatives` — карточки и письмо | То же, без подмены результатов этих шагов завершением фраз |
| FirstSteps → семейный шаг | Компонентный вход `step=3` переиспользует FamilyLesson; это не отдельный публичный URL | Сохранить переиспользование и выход обратно. Не выдавать компонентный вход за новый маршрут |
| Связанная грамматика | SER/ESTAR, SER-тренажёр и TER/HÁ уже имеют адреса ниже | Открываются с контекстом возврата к исходному разделу/шагу; выбранный ответ не теряется |
| Личная карточка → источник | Источников семьи в `reading-sources.ts` ещё нет | Добавить зарегистрированные источники, возвращающие к нужной пачке слов |

**Предложенный адрес, пока не работает:** `/learning/family?topic=close&phase=explanation`; для Pages — тот же адрес после `#`. `topic`: `close|relatives`, `phase`: `explanation|words|practice|review`. Не создавать новый topic ID вместо `topic:vocabulary-family`. Источники **планируемые, пока не зарегистрированы**: `lesson:family:close` → `topic=close&phase=words`, `lesson:family:relatives` → `topic=relatives&phase=words`. Дополнительные профессии сохраняются с источником `lesson:family:close`.

## Владельцы четырёх шагов

| Раздел / шаг | Существующий владелец | Что переиспользовать / чего ещё нет |
|---|---|---|
| Близкие · объяснение | [FamilyLesson](../features/practice/FamilyLesson.tsx), [FamilyPossessives](../features/practice/FamilyPossessives.tsx), [family-lesson.ts](../features/content/family-lesson.ts) | Четыре формы, согласование с существительным, артикль, 6 PT/RU-примеров. Объясняющая проза сейчас по-русски; полного PT-режима с RU-переключением и подсветкой пока нет |
| Близкие · слова | `topicExpansion.byKey`, `closeFamilyKeys`, `collection:expansion-family-close` | Те же 6 word IDs, артикли, множественное число и примеры. Добавить Card Save; обычный VocabularyCards не означает сохранение в личную колоду |
| Профессии · опора | [identity.ts](../features/content/identity.ts), `professionForm`, `IdentityVocabulary`, набор `identity:roles` | Использовать общие формы/примеры. Набор identity:roles содержит 6 ролей, а не отдельную `collection:identity:roles`. Семейная пачка — явная выборка 5 без изменения исходного набора |
| Близкие · задания | `buildFamilyUsage` → `learningCatalog.usageModules` → UsagePractice; VocabularyWriting | Существующие 10 cloze; дополнительное письмо прежних 6 слов. Не запускать две независимые копии UsagePractice в новом флоу |
| Родственники · объяснение | [topic-expansion.ts](../features/content/topic-expansion.ts), правило FamilyPossessives | Есть 6 двуязычных примеров на словах и общее правило. Отдельного готового объясняющего экрана о родственниках нет; нужна короткая композиция существующих примеров, без новой генеалогической проверки |
| Родственники · слова и задания | `collection:expansion-family-relatives`, VocabularyCards / VocabularyWriting / WordPairs | Те же 6 слов; основной проверяемый результат — существующее письмо. Пары доступны как необязательная библиотечная механика, не новая обязательная оценка |
| Оба · повторение | [StudyReview](../features/cards/study-review/StudyReview.tsx), `useStudyReview(studyItemIds)` | Механизм фильтра уже есть в F-04. Для семейных целей ещё нужны регистрация недостающих StudyItem, review catalog и источники. Сейчас готового семейного SRS-входа нет |

Целевой взрослый режим объяснения — PT с подсветкой и переводом выбранного слова, плюс «Показать по-русски», через существующий механизм LessonText. Для семейной объясняющей прозы потребуется PT/RU-адаптация; в F-05 она не написана. Готовые португальские примеры, формы, accepted answers и feedback сохраняются. Перевод объяснения не является новым набором правильных ответов.

## Точная карта слов и личных карточек

`meaningId` каждой строки равен `meaning:` + её **существующий word ID**; это проверено по learningCatalog. Эти IDs нельзя менять на новые ID флоу. Пометка «новый» ниже означает **предлагаемый target, ещё отсутствующий в manifest и SRS**, а не переименование старого слова.

| Пачка | Слово / перевод | Существующий word ID | StudyItem для Card Save |
|---|---|---|---|
| Близкие | a mãe — мама | `vocabulary:noun:mae` | новый `study:family:noun:mae:entry` |
| Близкие | o pai — папа | `vocabulary:noun:pai` | новый `study:family:noun:pai:entry` |
| Близкие | o irmão — брат | `study:ga1:noun:irmao:entry` | тот же ID; U11, U36 |
| Близкие | a irmã — сестра | `study:ga1:noun:irma:entry` | тот же ID; U11, U36 |
| Близкие | a avó — бабушка | `vocabulary:noun:avo-f` | новый `study:family:noun:avo-f:entry` |
| Близкие | o avô — дедушка | `vocabulary:noun:avo-m` | новый `study:family:noun:avo-m:entry` |
| Родственники | o tio — дядя | `vocabulary:noun:tio` | новый `study:family:noun:tio:entry` |
| Родственники | a tia — тётя | `vocabulary:noun:tia` | новый `study:family:noun:tia:entry` |
| Родственники | o primo — двоюродный брат | `vocabulary:noun:primo` | новый `study:family:noun:primo:entry` |
| Родственники | a prima — двоюродная сестра | `vocabulary:noun:prima` | новый `study:family:noun:prima:entry` |
| Родственники | o filho — сын | `study:ga1:noun:filho:entry` | тот же ID; U11 |
| Родственники | a filha — дочь | `study:ga1:noun:filha:entry` | тот же ID; U11 |
| Опора | estudante — учащийся/учащаяся | `vocabulary:noun:estudante` | новый `study:family:chunk:estudante-forms` |
| Опора | professor/professora — учитель/учительница | `vocabulary:noun:professor` | `study:ga1:noun:professor:entry`; U01 |
| Опора | médico/médica — врач | `vocabulary:noun:médico` | `study:ga1:noun:medico:entry`; U01 |
| Опора | cozinheiro/cozinheira — повар | `vocabulary:noun:cozinheiro` | новый `study:family:chunk:cozinheiro-forms` |
| Опора | engenheiro/engenheira — инженер | `vocabulary:noun:engenheiro` | новый `study:family:chunk:engenheiro-forms` |

Итого: 12 основных целей = 4 существующих + 8 недостающих; с дополнительной пачкой — 17 целей = 6 существующих + 11 недостающих. Наличие semantic meaning само по себе не означает наличие личного StudyItem/SRS. Связь profession word ID → существующий StudyItem professor/médico задаётся явно по значению, не по совпадению ID.

Для 8 новых семейных существительных морфология уже есть в topicExpansion: переносить точные article/lemma/plural/pluralArticle и исходный пример. Для 3 новых пар ролей — quoted chunk точного `professionWords.label` (например, `o cozinheiro / a cozinheira`), без приписывания мужскому существительному женского lemma. Для professor/médico кнопка показывает каноническую существующую карточку мужской формы; парные формы остаются опорой общего набора. Не заменять display старой карточки парой и не выдавать эту карточку за отдельную карточку professora/médica.

Avó/avô и их множественные числа avós/avôs различаются: не объединять при удалении диакритики. Сын/дочь и irmão/irmã не сливаются с общим «ребёнок». Источники всех 54 книжных тем сохраняются; строки выше перечисляют связи только выбранных повторно используемых целей.

## Задания и неизменные результаты

Основной activity owner — `usage:family` (10 заданий), а `activity:usage:family` в каталоге является описанием входа, не ключом сохранённого результата. Exercise IDs и correctOptionIds:

| Exercise ID | Correct option ID |
|---|---|
| `cloze:family-mae` | `family-mae` |
| `cloze:family-avo` | `family-avo-m` |
| `cloze:family-ser` | `family-e` |
| `cloze:family-transfer` | `family-transfer-ser` |
| `cloze:family-meu-speaker` | `poss-meu` |
| `cloze:family-tua` | `poss-tua` |
| `cloze:family-teu` | `poss-teu` |
| `cloze:family-minha` | `poss-minha` |
| `cloze:family-cook` | `role-cook` |
| `cloze:family-your-engineer` | `family-your-engineer` |

Письмо использует исходные шесть word IDs каждого набора. `wordActivityId("writing", ids)` в [learning-rewards.ts](../features/practice/learning-rewards.ts) возвращает старый `practice:words:expansion-family-close` или `practice:words:expansion-family-relatives`; VocabularyWriting также вызывает `completeWords`. Сохранить оба владельца: запись activities и completion шага практического плана. Не менять размер набора на 12/17: иначе вычислится другой ключ. `usage:family` не завершает письмо автоматически, а письмо не засчитывает фразы.

Связанные входы сохраняются:

- `/learning/practice?lesson=ser-estar` — общее объяснение.
- `/learning/practice?verb=ser&tense=present` — формы SER.
- `/learning/lessons/lesson%3Aa1-1%3Apossession-and-presence` — TER/HÁ; готовый связанный урок, не проверка семьи.

Новая навигация должна держать один контроллер семейной практики смонтированным при смене шагов и связанном объяснении, как F-04. Текущий FamilyLesson уже сохраняет практику при смене своих внутренних вкладок, но между отдельными маршрутами такой гарантии ещё нет. После reload обещать только URL раздела/шага и подтверждённые данные, не незаписанный ответ.

## Сохранение и повторение

Переиспользовать StudyItemCardSave: повторное добавление дополняет источник той же карточки, не сбрасывает review version, срок, интервал и старые источники. В очередь передавать явный список 17 целей, но показывать только сохранённые и наступившие к повторению; не добавлять всю пачку автоматически. Общий query cache остаётся полным. В результаты включать три отдельных владельца выше, без синтетического completion семьи.

Pages сохраняет существующие профили/activities/план в localStorage и личные StudyItems/SRS в IndexedDB; JSON backup использует прежние правила merge. Не мигрировать старую колоду 1000 глаголов, просмотренные vocabulary cards и библиотечные результаты в новые StudyItem IDs. Новые адаптеры не должны попадать в исходный `pairVocabulary` и менять fallback IDs других упражнений (ограничение уже соблюдается в F-04). Обратная зависимость `manifest → новый pack → learningCatalog → manifest` запрещена: словарную связь с meaning каталогом строить вне pack или только проверять тестом.

## Что делать в следующей реализации

1. **Связать данные и Card Save.** Добавить небольшой семейный pack и явную таблицу старый word → target из карты, зарегистрировать недостающие 11 целей и 2 источника в manifest/review catalog/reading-sources. Зависимость: это разблокирует работающий шаг слов и SRS. Граница: не менять существующие ID, источники, морфологию/ответы и storage. Готовность: все 17 целей разрешаются; повторный save к уже оценённым irmão/professor добавляет источник без изменения review; avó/avô различаются; старые книжные связи и F-01 snapshot не меняются.
2. **Собрать взрослый экран.** Переиспользовать FamilyLesson/FamilyPossessives, семейные примеры, UsagePractice и письмо наборами 6/6, добавить PT/RU-подачу объяснения. Зависимость: данные шага 1. Граница: два раздела, дополнительная опора профессий; без нового общего движка и банка заданий. Готовность: все четыре шага и возвраты достижимы, SER/TER-ссылка и браузерный back сохраняют текущий ответ; подпись завершения ведёт к повторению, а не к старому «Как я себя чувствую». Все скрытые панели действительно скрыты, как в финальном F-04.
3. **Подключить входы и проверить совместимость.** Каталог и общий план дают основной вход; старые два planStep, topic ID и библиотечные механики остаются доступны. Зависимость: рабочий экран. Готовность: старые completion и отзывы видны после reload и JSON round-trip; смена профиля изолирует данные; SRS семьи не вытесняет чужие строки общего cache. `npm run check`, `npm run build:pages`, browser 390×844/1440×1000, клавиатура, Save/retry/source, история и reload. Публикация — отдельная проверка точного SHA с Pages/Quality, когда реализован экран.

Первая задача — пункт 1: явный data bridge даёт карточки и повторение без зависимости от ещё не написанной навигации. Он проверяет риск дублей до изменения точек входа.

## Проверка карты в этой сессии

Чтение и загрузка реестров: 12 family words, 5 выбранных profession words, semantic meanings, 6 существующих личных целей, отсутствие ещё 11 целей в полном manifest, книжные units и 10 exercise IDs сверены на указанной базе. Новый код приложения не добавлялся, сохранения не читались и не изменялись.

В публичном checkout с Node 22.23.2:

```sh
node --experimental-strip-types --test tests/practice-plan.test.ts tests/general-plan.test.ts tests/learning-catalog-view.test.ts tests/time-day.test.ts
npx --no-install vitest run tests/components/family-lesson.test.tsx tests/components/practice-plan.test.tsx
```

Результат: 11 domain и 13 component tests прошли. Это подтверждение текущего материала и модели плана, не приёмка будущего флоу. Новый браузерный сценарий, full build и deployment в документационной задаче не выполнялись. Прямой Node-import `learning-rewards.ts` ограничен его старым extensionless import `./plan/model`; формула совпадения writing IDs проверена чтением функции, существующая плановая модель — тестами. Runtime ради аудита не менялся.

Дополнительная сверка Node по таблице прошла: 17 word/meaning связей, 6 зарегистрированных review targets, отсутствие 11 предлагаемых targets и 2 предлагаемых источников, 10 exercise/correct-option IDs. Все 11 относительных ссылок в изменённых публичных планах разрешаются; `git diff --check` прошёл. Скрипт consistency сообщил 0 structural warnings, но часть его поисков ограничена отсутствующим локальным `skills/`; самостоятельная проверка ссылок и реестров выше выполнена отдельно.
