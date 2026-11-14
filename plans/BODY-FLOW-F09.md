# F-09 · Карта темы «Тело и самочувствие»

Обновление: [мост Card Save и SRS реализован в F-10.1](BODY-CARDS-F10-1.md). Ниже сохранена исходная карта базы `93e8047`: её 17 недостающих целей теперь зарегистрированы, три GA1 переиспользуются. Полный флоу остаётся F-10.2.

Дата: 2026-11-14. База: `93e80478b51adc23af05983514393abf255548ac`, `main`. Статус: карта, без изменений приложения, личных карточек, источников, ответов и прогресса. Образец композиции — [еда F-08.2](FOOD-FLOW-F08-2.md). Первая подача взрослая; отдельный детский курс не создаётся.

## Границы и Can-Do

Предлагаемый основной объём: **лицо и руки → тело и движение → как я себя чувствую**, четыре шага в каждом: объяснение → слова → задания → повторение. Пачки **8 + 6 + 6**, а не двадцать новых слов за один урок.

Can-Do: назвать основные части тела, связать знакомые части тела с простыми действиями и описать состояние короткой фразой с ESTAR. Последняя часть опирается на существующий FeelingsLesson; весь этот Can-Do сейчас не оценивается одной проверкой. Просмотр слов, прохождение заданий и SRS остаются разными результатами.

«Самочувствие» здесь — базовое состояние: радость, грусть, усталость, волнение, спокойствие, готовность. Кости/органы, профилактика и шесть глаголов здоровья сохраняются как связанные дополнительные материалы. Это не готовый урок общения у врача: нет готовой проверки описания боли, симптомов и просьбы о помощи. Название темы не должно обещать такие навыки.

Предлагаемый будущий адрес `/learning/body?topic=face|movement|feelings&phase=explanation|words|practice|review` **ещё не реализован**. В этой задаче нельзя менять sources на этот адрес.

## Что уже готово и где проверить

Все URL ниже — hash-маршруты публичного приложения. Каталожные topic IDs — ключи выбора внутри «Все темы», а не отдельные реализованные URL.

| Материал / вход | Владелец реализации | Готово / остаток |
|---|---|---|
| «Все темы» → «Тело», `topic:vocabulary-body` | [VocabularyStudy](../features/practice/VocabularyStudy.tsx), [каталог](../features/content/learning-catalog-view.ts) | Четыре набора: face 8, movement 6, outside 8, inside 6. По умолчанию inside исключён из «Основных слов»; outside повторяет 8 из первых 14, не добавляет новые слова |
| `#/learning/everyday/body` | [EverydayLesson](../features/practice/EverydayLesson.tsx), [данные](../features/content/everyday-lessons.ts), [PT/RU](../features/content/grammar-reading.ts) | Готовы цель, COM, различие ouvido/orelha, 6 переключаемых фраз и 6 проверок. PT с подсветкой и полный русский режим уже есть; полного флоу тела и явного noun Card Save ещё нет |
| `#/learning/plan/step/practice%3Awords%3Aexpansion-body-face` и `…/practice%3Awords%3Aexpansion-body-movement` | [модель плана](../features/practice/plan/model.ts), [исполнитель](../features/practice/plan/ChildPracticePlan.tsx) | Старые словарные пачки и письмо 8/6. Слово Child в имени компонента не означает отдельный банк ответов |
| `#/learning/plan/step/practice%3Aeveryday%3Abody` | Те же owners + EverydayLesson | Те же 6 проверок тела, не новый результат |
| «Тело» → фразы, `usage:body-actions` | [learningCatalog](../features/content/learning-catalog.ts), [UsagePractice](../features/practice/UsagePractice.tsx) | 4 готовых примера и 2 cloze. Отдельный результат, не замена 6 проверок EverydayLesson |
| «Тело» → картинки | [body-scenes](../features/content/body-scenes.ts), [ImageMatchingExercise](../features/practice/ImageMatchingExercise.tsx) | `image-body-outside`: 8 точек; `image-body-inside`: 6. Внутренняя схема доступна при выборе inside и из урока organs |
| «Все темы» → «Как я себя чувствую», `topic:people` | [FeelingsLesson](../features/practice/FeelingsLesson.tsx), [feelingWords](../features/content/feelings-lesson.ts) | 6 слов, 6 примеров, готовые фразы `Como estás? — Estou bem.`, родовые формы, 3 задания ESTAR и повтор без примеров. Это отдельная рабочая модель прогресса, не SRS |
| `#/learning/practice?lesson=ser-estar`, `#/learning/practice?verb=estar&tense=present` | BeingLesson, being-navigation | Готовые связанные объяснения/формы; возвращать ученика в исходную тему без сброса ответа |
| «Все темы» → «Здоровье и самочувствие», `topic:health` | [vocabulary-lessons](../features/content/vocabulary-lessons.ts), VocabularyStudy | Reviewed-набор 6 глаголов, примеры, карточки просмотра/письмо/пары. Не самостоятельное PT/RU-объяснение и не контекстная проверка самочувствия |
| «Тело» → постоянные уроки bones/organs; «Для школы» → «Здоровье и привычки» | [постоянные дома](../features/content/permanent-preparation-lessons.ts), [TestPreparation](../features/practice/TestPreparation.tsx) | 4 PT/RU-темы, по 2 вопроса, keywords и игры; прежние `lesson:preparation:*` и `prep:*`. Подробности ниже |

## Точная карта основной лексики и Card Save

Сейчас основные слова доступны в библиотечных карточках просмотра. Наличие VocabularyCards не означает наличие личной карточки в общем SRS. В manifest/review registry отсутствуют все 14 noun targets и три новые adjective-цели ниже. Три других adjective-цели уже зарегистрированы и должны переиспользоваться.

Для всех строк основного набора `meaningId = meaning:` + точный старый word ID; эти связи проверены загрузкой learningCatalog. Новые IDs — **предложение**, не результат регистрации.

| Пачка | Слово — plural / перевод | Прежний word ID | Личная цель: новая, если не отмечено иначе |
|---|---|---|---|
| Лицо 8 | a cabeça — as cabeças / голова | `vocabulary:noun:cabeca` | `study:body:noun:cabeca:entry` |
| Лицо 8 | o olho — os olhos / глаз | `vocabulary:noun:olho` | `study:body:noun:olho:entry` |
| Лицо 8 | a orelha — as orelhas / ушная раковина | `vocabulary:noun:orelha` | `study:body:noun:orelha:outer-ear` |
| Лицо 8 | o ouvido — os ouvidos / орган слуха | `vocabulary:noun:ouvido` | `study:body:noun:ouvido:hearing` |
| Лицо 8 | o nariz — os narizes / нос | `vocabulary:noun:nariz` | `study:body:noun:nariz:entry` |
| Лицо 8 | a boca — as bocas / рот | `vocabulary:noun:boca` | `study:body:noun:boca:entry` |
| Лицо 8 | a língua — as línguas / язык, часть тела | `vocabulary:noun:lingua` | `study:body:noun:lingua:body` |
| Лицо 8 | a mão — as mãos / кисть | `vocabulary:noun:mao` | `study:body:noun:mao:hand` |
| Движение 6 | o braço — os braços / рука от плеча до кисти | `vocabulary:noun:braco` | `study:body:noun:braco:arm` |
| Движение 6 | a perna — as pernas / нога | `vocabulary:noun:perna` | `study:body:noun:perna:entry` |
| Движение 6 | o pé — os pés / ступня | `vocabulary:noun:pe` | `study:body:noun:pe:foot` |
| Движение 6 | o dedo — os dedos / палец | `vocabulary:noun:dedo` | `study:body:noun:dedo:entry` |
| Движение 6 | o joelho — os joelhos / колено | `vocabulary:noun:joelho` | `study:body:noun:joelho:entry` |
| Движение 6 | a barriga — as barrigas / живот | `vocabulary:noun:barriga` | `study:body:noun:barriga:entry` |
| Состояния 6 | feliz / радостный(-ая) | `general-vocabulary:adjective:feliz` | `study:body:adjective:feliz:state` |
| Состояния 6 | triste / грустный(-ая) | `vocabulary:adjective:triste` | **Существующая** `study:ga1:adjective:triste:entry`, U02 |
| Состояния 6 | cansado / cansada / уставший(-ая) | `vocabulary:adjective:cansado` | **Существующая** `study:ga1:adjective:cansado:entry`, U03 |
| Состояния 6 | nervoso / nervosa / взволнованный(-ая) | `general-vocabulary:adjective:nervoso` | `study:body:adjective:nervoso:state` |
| Состояния 6 | calmo / calma / спокойный(-ая) | `vocabulary:adjective:calmo` | `study:body:adjective:calmo:state` |
| Состояния 6 | pronto / pronta / готовый(-ая) | `general-vocabulary:adjective:pronto` | **Существующая** `study:ga1:adjective:pronto:entry`, U02 |

Предлагаемая очередь основного флоу: **20 целей = 17 недостающих + 3 существующие**, только выбранные пользователем. Нет дополнительных шести карточек из bodyFunctions, восьми из outside или новых целей для feminina/plural. Старые три карточки GA1, их front, переводы, книжные units, sources и reviews не переписывать под текст feelingWords. Показывать локальные родовые формы рядом с исходными примерами.

### Значения, которые нельзя объединять автоматически

- `orelha` и `ouvido`, `mão` и `braço`, `língua` как орган и язык общения — отдельные значения. Нельзя объединять по русскому «ухо/рука/язык».
- В `bodyFunctions` действия идут как узнаваемые готовые фразы: `vejo`, `ouço`, `cheiro`, `sinto`, `toco`, `abro`. Новые формы не становятся самостоятельными глагольными карточками. `action: saborear` и фраза `Sinto os sabores…` — не один и тот же инфинитив.
- При отдельном добровольном сохранении действия можно переиспользовать `study:ga1:verb:ver:entry` (U07/14/43) и **`study:ga1:verb:ouvir:hear`** (U09). `ouvir:listen` — другое значение. Эти две цели не включены автоматически в основные 20.
- `study:ga1:verb:tocar:entry` (U19) = «звонить», пример `O telefone tocou.`; он **не подходит** к `Toco na mesa com as mãos.`. Legacy `v0143` также не доказывает совпадение значения. Для touch пока оставить перевод без Card Save, а не менять существующую карточку.
- Готовая `study:ga1:adjective:doente:entry` (U03, `Estou doente.`) — допустимое отдельное расширение. Не включать её в шесть feelingWords или существующие задания без отдельного контентного решения.
- `Estou bem` не следует сохранять через имеющуюся `study:ga1:adverb:bem:manner`: её текущий смысл связан с действием/сравнением (`Hoje canto melhor.`, U51), а не самочувствием. Общий resolver слов не исправлять в рамках переноса темы; в будущем экрану нужен ограниченный контекстный resolver.

## Дополнительные материалы: сохранить доступность

### Тело изнутри

[insideBodyNouns и body-vocabulary](../features/content/body-vocabulary.ts) задают шесть дополнительных слов; [body-scenes](../features/content/body-scenes.ts) — схему. Это не обязательная третья пачка основного взрослого урока.

| Слово / plural | Прежний word ID | Статус |
|---|---|---|
| o coração / corações | `general-vocabulary:noun:coracao` | Сохранить существующий перевод «сердце» и ID |
| o pulmão / pulmões | `vocabulary:noun:pulmao` | В показываемом каталоге **os pulmões**; accepted PT `o pulmão`, `os pulmões`, RU «лёгкое», «лёгкие» |
| o estômago / estômagos | `vocabulary:noun:estomago` | Готовые морфология и пример |
| o rim / rins | `vocabulary:noun:rim` | Готовые морфология и пример |
| o osso / ossos | `vocabulary:noun:osso` | То же слово используется в bones |
| o músculo / músculos | `vocabulary:noun:musculo` | То же слово используется в bones |

У этих шести нет личных noun targets. В первом мосте F-10.1 их не добавлять: иначе объём станет 26 целей. Будущий отдельный мост сохраняет особый показ лёгких и текущие accepted answers; не возвращать всему каталогу единственное число.

### Четыре школьные темы

| unit / постоянный ключ | Основная проверка | Словарь / дополнительные задания |
|---|---|---|
| bones / `lesson:preparation:bones` | `prep:bones`, 2 вопроса | osso, músculo и `prep-keyword:bones:2` esqueleto, `prep-keyword:bones:3` tendão; пары `pairs:prep-keywords:bones` |
| organs / `lesson:preparation:organs` | `prep:organs`, 2 вопроса | coração, pulmão, estômago, rim; пары `pairs:prep-keywords:organs`; схема `image:image-body-inside`, 6 точек |
| prevention / `lesson:preparation:prevention` | `prep:prevention`, 2 вопроса | `prep-keyword:prevention:0…3`: vacina, medicamento, bactéria, vírus; пары `pairs:prep-keywords:prevention` |
| wellbeing / `lesson:preparation:wellbeing` | `prep:wellbeing`, 2 вопроса | `prep-keyword:wellbeing:0…3`: higiene, descanso, alimentação, exercício; пары `pairs:prep-keywords:wellbeing`; связанная готовая коллекция `collection:my-day-actions` |

Итого 16 keyword-привязок: 6 разрешаются в прежние body words, **10 сохраняют fallback IDs**. [preparationWords](../features/content/preparation-words.ts) сопоставляет label **и перевод**; замена fallback на похожий словарный ID изменит игры/прогресс. WordSearch хранит `wordActivityId("search", board.words.map(word => word.id))`; конкретный ID зависит от набора выбранных слов, а не нового названия темы.

Правила, worked examples, 8 ответов и предупреждение об ошибке в бумажном листе находятся в [test-preparation](../features/content/test-preparation.ts), [preparation-guides](../features/content/test-preparation-guides.ts), [preparation-support](../features/content/preparation-support.ts). Публичные иллюстрации оригинальные; сканы листов выводятся только development-веткой UI. Не публиковать сканы и не превращать школьное «попроси взрослого проверить» в обязательный шаг взрослого урока. Медицинские утверждения здесь только инвентаризированы как текущий контент; независимая медицинская проверка в F-09 не выполнялась.

### Дыхание и восстановление

`collection:vocabulary-lesson:health`, `topic:health`: шесть reviewed слов и PT/RU-примеров, но без contextual usage-модуля.

| Инфинитив | Прежний sourceEntryId | Старый глагольный deck ID |
|---|---|---|
| respirar | `general-vocabulary:verb:respirar` | `v0535` |
| relaxar | `general-vocabulary:verb:relaxar` | отсутствует |
| tossir | `general-vocabulary:verb:tossir` | отсутствует |
| espirrar | `general-vocabulary:verb:espirrar` | отсутствует |
| curar | `general-vocabulary:verb:curar` | `v0901` |
| sarar | `general-vocabulary:verb:sarar` | отсутствует |

У всех шести нет StudyItem в общем manifest/SRS. Есть отдельные item IDs `vocabulary-lesson:health:<инфинитив>`; это не IDs личных карточек. Два старых глагола и их отзывы остаются в deck 1000; нельзя переносить их прогресс в будущие StudyItems. Глаголы этого набора отсутствуют в `allVerbKeys`; ссылка `?verb=respirar` не создаёт готового тренажёра и сейчас приведёт к fallback. Сохранить доступ через словарную тему, без неподдерживаемых ссылок и нового спряжения.

## Задания и владельцы результатов

| Готовый набор | Стабильный владелец | Ограничение |
|---|---|---|
| Письмо лица, 8 | `practice:words:expansion-body-face` | И activity, и completion плана revision 1; точный прежний состав 8 |
| Письмо движения, 6 | `practice:words:expansion-body-movement` | И activity, и completion плана revision 1; точный состав 6 |
| Части тела → действия, 6 | `practice:everyday:body` | EverydayLesson, activity и completion плана revision 1 |
| Две фразы COM | `usage:body-actions` | Только отдельный activity, не completion EverydayLesson |
| Состояния, 3 | `usage:feelings` — ID модуля, **не записываемый activity** | UsagePractice имеет `record=false` для этого ID. FeelingsLesson хранит `learning.feelings.viewed/practised/repeated/phase`, `lastTopicId: topic:people`; finish требует 3/3 для отметки практики/повтора |
| Схемы тела | `image:image-body-outside` / `image:image-body-inside` | Отдельные результаты 8/6; схема внутри organs — тот же activity |
| Письмо outside/inside, health или feelings вне плана | `wordActivityId("writing", точные IDs)` | Не вводить новые плановые ключи; вне совпадения с двумя наборами плана получается хешированный activity |
| Короткие школьные проверки | `prep:bones`, `prep:organs`, `prep:prevention`, `prep:wellbeing` | Четыре самостоятельных результата по 2; не засчитывают письмо/схему |

Шесть точных exercise IDs EverydayLesson: `body-olho`, `body-ouvido`, `body-nariz`, `body-lingua`, `body-mao`, `body-boca`; правильные ответы соответственно `os olhos`, `os ouvidos`, `o nariz`, `a língua`, `as mãos`, `a boca`. В usage: `cloze:body:olho` → `body-option:olho`, `cloze:body:ouvido` → `body-option:ouvido`. Состояния: `cloze:feelings-eu` → `feelings-estou`, `cloze:feelings-gender` → `feelings-cansada`, `cloze:feelings-transfer` → `feelings-miguel-estar`.

В будущем summary показывает четыре прежних числовых результата **8/6/6/2** и отдельно существующие отметки FeelingsLesson. Не выдумывать сохранённый счёт 3/3 для feelings после reload: числового результата в текущей модели нет. Старое completion плана без ActivityResult показывается как пройденное без сохранённого счёта. Общую оценку освоения темы не вводить.

## Источники и повторение: будущий мост

- Сохранить `lesson:everyday:body`, title «Тело и действия», текущий href `/learning/everyday/body` до появления полного флоу. Затем менять только href; ID и сохранённые ссылки пользователей остаются.
- Предлагаются три новых ReadingSource: `lesson:body:face`, `lesson:body:movement`, `lesson:body:feelings`. Они пока не зарегистрированы. На этапе моста должны вести к работающему экрану слов, а не отсутствующему будущему `/learning/body`.
- Шесть noun appearances из bodyFunctions дополняют те же карточки source `lesson:everyday:body`. Outside не создаёт ещё восемь targets. FeelingsSource дополняет три GA1-карточки, сохраняя их U02/U03 и расписание.
- `StudyItemCardSave` и `StudyReview` готовы. Нужны pack/manifest, review registry и явный список 20 StudyItem IDs. В SRS входят только сохранённые карточки с наступившим сроком; просмотр/отметка знакомства не создают review.
- Новые pack-модули не должны импортировать vocabulary-catalog/manifest через обратную зависимость. Как в F-08.1, адаптеры личных карточек исключаются из legacy lessonWords; исходный learningCatalog и игровые банки должны остаться прежними.
- Схемы localStorage/IndexedDB, API-контракты, JSON backup и SRS-domain не меняются; Cloudflare не подключается. Удаление старых источников/тем и миграция отзывов не нужны.

## Следующая рабочая сессия

1. **F-10.1 — Card Save основного набора: 17 новых + 3 существующие цели.** Результат: взрослый видит пачки 8/6/6 и сохраняет выбранное в личную колоду. Зависимость: эта карта; мост нужен до встраивания SRS в полный экран. Границы: три новых sources и прежний body, noun/article/plural и adjective/женские формы без смены прежних GA1 display. Дополнительные органы, health-глаголы, медицинские объяснения и новые задания не входят. Готовность: 20 targets разрешаются, save повторно не дублирует, три оценённые GA1-карточки получают новый source с неизменным review/units; legacy word/meaning IDs, банки 8/6 и 1000 глаголов неизменны. Проверки: domain/component, JSON/profile isolation, save/grade/reload/source return в браузере.
2. **F-10.2 — единый взрослый экран.** После моста собрать face/movement/feelings. Для лица/движения написать только недостающие краткие PT/RU-вступления из готовых примеров, EverydayLesson body переиспользовать; состояния — готовые объяснения/примеры FeelingsLesson в общей PT/RU-подаче. Сохранить один controller body и один feelings controller с их разными владельцами данных. Готовность: шаги/темы/related back не сбрасывают незавершённый ответ; результаты 8/6/6/2 и отметки feelings раздельны; reload восстанавливает подтверждённое, не обещает черновик. Все старые входы остаются; внутренние схемы и школьные дома доступны как дополнение.
3. **Проверка выпуска.** `npm run check`, `npm run build:pages`, 390×844/1440×1000, клавиатура, источник → урок → возврат, глобальный/тематический SRS, второй source оценённой карточки, JSON round-trip, смена профиля, legacy completion. Только после реализации и разрешённой публикации — точный SHA и terminal Pages/Quality. Дополнительный мост 6 органов/6 health-глаголов — отдельное предложение, без автоматического старта.

Первой взять **F-10.1**: это ограниченный мост из готовых данных, который разблокирует личные карточки и повторение полного флоу. Новые календарные сроки и приоритет относительно остальных крупных направлений не назначаются.

## Доказательства F-09

Текущие реестры загружены на Node 22.23.2: проверены 20 main word/meaning IDs, morphology, 17 отсутствующих предложенных targets и три существующие GA1-цели, 6 optional inside words, 16 preparation keywords, 6 health items, смыслы ver/ouvir/tocar/bem, sources и отсутствие health-глаголов в тренажёре. Базовый manifest содержит 644 StudyItems, review registry — 620; карта их не изменяет. Локальная выгрузка: `/private/tmp/tempo-f09-inventory.json`.

Проверки существующей реализации:

```sh
node --experimental-strip-types --test tests/learning-catalog-view.test.ts tests/unified-vocabulary-catalog.test.ts tests/practice-plan.test.ts tests/everyday-illustrations.test.ts
npx --no-install vitest run tests/components/everyday-lesson.test.tsx tests/components/permanent-preparation.test.tsx tests/components/preparation-migration.test.tsx
npx --no-install vitest run tests/components/feelings-lesson.test.tsx
```

Прошли **12 domain и 36 component tests**. Это проверка текущего каталога/доступности/прежних результатов, не приёмка будущего флоу. Consistency script: 9 прежних структурных предупреждений в других документах; относительные ссылки изменённых документов и diff проверены отдельно. Новый UI, build, browser QA, медицинская редактура и публикация в F-09 не выполнялись. PT/RU и различия значений просмотрены по существующим данным; готовность нового учебного текста не заявляется.
