# F-07 · Карта темы «Еда и предпочтения»

Обновление: [карточки и SRS подключены в F-08.1](FOOD-CARDS-F08-1.md). Ниже сохранена исходная карта базы `0469c55`; её 14 недостающих targets и два новых sources теперь зарегистрированы. Полный флоу остаётся F-08.2; рабочие адреса карточек — в отчёте F-08.1.

Дата: 2026-11-13. База публичного checkout: `0469c552d93d5a9849cd28a936b09bfa124c580a`, `main`. Статус: карта составлена; новый флоу и новые карточки не реализованы. Образец композиции — [семья F-06.2](FAMILY-FLOW-F06-2.md). Первой остаётся взрослая подача, без изменения существующих ID, ответов, карточек, источников и прогресса.

## Ограниченный объём

Выбраны два существующих набора: **6 фруктов** (`expansion-food-fruit`) и **8 продуктов/напитков** (`expansion-food-meals`). Все шесть продуктов действующего GOSTAR DE входят в эти 14 слов. Предлагаемый порядок разделов: `fruit` → `meals` → `preferences`. В каждом — объяснение → слова → задания → повторение. В предпочтениях повторяются только знакомые maçã, morango, pera, queijo, leite, arroz; дополнительно можно сохранить готовую карточку `gostar de`. Новая лексика ограничена пачками 6/8, а не всем каталогом еды.

Пользовательский результат: назвать продукты, выразить предпочтение/отрицание о себе, собеседнике и Инеш через готовые формы, пройти прежние проверки и повторить выбранные карточки. Конструктор фраз не собирает реальные пищевые предпочтения пользователя и не является проверкой.

В первый флоу не включаются сервировка (`expansion-food-table`, `image-table`), остальные фруктовые/овощные/молочные/мясные наборы, сцены market/breakfast, cooking, comer/beber и упражнения категорий. Они сохраняют старые входы и результаты. Еда/покупки — более широкая тема, чем этот флоу; он не означает завершение всего `topic:food`.

## Карта владельцев четырёх шагов

| Раздел / шаг | Текущий владелец | Готовность / остаток |
|---|---|---|
| Фрукты · объяснение | [topic-expansion.ts](../features/content/topic-expansion.ts), `topicExpansion.byKey` | Есть 6 PT/RU-примеров, артикли, plural, картинки. Отдельного объясняющего PT/RU-экрана нет; нужна короткая композиция этих материалов |
| Еда и напитки · объяснение | Те же seeds и `byKey` | Есть 8 PT/RU-примеров и морфология. Нужна композиция и опора на обычное единственное число веществ, без изменения старых слов |
| Предпочтения · объяснение | [everydayReading.likes](../features/content/grammar-reading.ts), [EverydayLesson](../features/practice/EverydayLesson.tsx), [DescriptionReading](../features/practice/DescriptionReading.tsx) | Уже есть PT-цель/правило, полный RU-режим, подсветка/озвучка поддержанных слов. Правило DE, отрицание NÃO, контраст de/do не нужно писать заново |
| Предпочтения · примеры | [everyday-lessons.ts](../features/content/everyday-lessons.ts): `preferenceFoods`, `preferencePeople`, `preferenceSentence` | Готовый конструктор: Eu/Tu/A Inês, 6 продуктов, утверждение/отрицание. Состояние person/food/negative хранится в EverydayLesson |
| Слова | `collection:expansion-food-fruit`, `collection:expansion-food-meals`, VocabularyCards | Исходные word/meaning IDs готовы. Это библиотечные слова, а не личные StudyItems. Для 14 слов ещё нет Card Save/SRS targets |
| Фрукты / продукты · задания | VocabularyWriting, практический план | Готовое письмо строго наборами 6 и 8, с прежними activity/plan IDs. Пары и другие механики доступны отдельно, не обязательная новая оценка |
| Предпочтения · задания | EverydayLesson `likes` и UsagePractice `usage:food-likes` | Готовы 5 проверок и 2 cloze. Разные исполнители/результаты; не объединять их в одно completion |
| Повторение | StudyItemCardSave, StudyReview и его явный `studyItemIds`-фильтр из F-04/F-06 | Механизм готов. Для темы ещё нужны 14 новых targets, два источника и вход. Готовый `gostar de` переиспользуется с прежней U49 |

Словарные карточки показывают артикль: `o queijo`. В обобщённом предпочтении остаётся существующее `gosto de queijo` без артикля перед продуктом. Это разные учебные контексты, не повод менять label или accepted answers. Конкретный сыр из магазина объясняется существующим `gosto do queijo desta loja`.

## Точная карта слов и личных целей

Для всех 14 строк `meaningId = meaning:` + **точный старый word ID**; это сверено с learningCatalog. Все новые target IDs ниже — предложение для следующей реализации, сейчас отсутствуют в manifest/review catalog. Акценты не удалять при поиске совпадения значения.

| Пачка | Слово / перевод | Существующий word ID | Предлагаемый новый StudyItem |
|---|---|---|---|
| Фрукты | a maçã — яблоко | `scene-word:a-maca` | `study:food:noun:maca:entry` |
| Фрукты | a banana — банан | `scene-word:a-banana` | `study:food:noun:banana:entry` |
| Фрукты | a laranja — апельсин | `scene-word:a-laranja` | `study:food:noun:laranja:fruit` |
| Фрукты | a pera — груша | `vocabulary:noun:pera` | `study:food:noun:pera:entry` |
| Фрукты | o morango — клубника | `vocabulary:noun:morango` | `study:food:noun:morango:entry` |
| Фрукты | a melancia — арбуз | `vocabulary:noun:melancia` | `study:food:noun:melancia:entry` |
| Продукты | o pão — хлеб | `scene-word:o-pao` | `study:food:noun:pao:entry` |
| Продукты | o leite — молоко | `scene-word:o-leite` | `study:food:noun:leite:entry` |
| Продукты | a água — вода | `vocabulary:noun:agua` | `study:food:noun:agua:entry` |
| Продукты | o queijo — сыр | `vocabulary:noun:queijo` | `study:food:noun:queijo:entry` |
| Продукты | o arroz — рис | `general-vocabulary:noun:arroz` | `study:food:noun:arroz:entry` |
| Продукты | o peixe — рыба (еда) | `vocabulary:noun:peixe` | `study:food:noun:peixe:food` |
| Продукты | a carne — мясо | `vocabulary:noun:carne` | `study:food:noun:carne:entry` |
| Продукты | o frango — курица (мясо) | `vocabulary:noun:frango` | `study:food:noun:frango:meat` |

Дополнительная **существующая** цель: `study:ga1:chunk:gostar-de:entry`, «любить что-либо», пример `Gosto de ler.`, книжная привязка U49, зарегистрирована в manifest и общем SRS. Её нельзя переименовывать или заменять новым infinitive target. Итого очередь темы: **15 целей = 14 недостающих + 1 существующая**, только сохранённые пользователем. Шесть слов предпочтений — подмножество таблицы, не ещё шесть новых карточек.

### Смысловые ограничения

- `gostar de` — предпочтение. `study:chunk:ga1:gostava-de` с U20/U25 — вежливое «хотел(а) бы»; его не объединять с предпочтением. Старое `v0057` (`gostar`) в колоде 1000 глаголов — самостоятельная система прогресса, не переносить её отзывы в StudyItem.
- Проверка реестра тренажёра показала: отдельного `gostar` в `allVerbKeys` сейчас нет. Не добавлять неработающую ссылку `?verb=gostar` и не выдавать 1000-verb card за готовый тренажёр форм.
- `readingCardChoices("gostar de")` уже находит правильную цель, но `gosto`/`gostas` её сейчас не разрешают. В новом контексте предпочтений нужен явный локальный мост форм к этому chunk; не создавать карточки спряжённых форм и не расширять глобальное разрешение неоднозначных выражений автоматически.
- Laranja выбрана как фрукт, не цвет; peixe — еда из `Hoje como peixe com arroz`; frango — мясо из `Ao almoço, como frango`. Не сливать эти будущие sense targets с цветом или животными. Старые semantic meaning IDs при этом не переименовываются.
- Морфология всех 14 слов уже есть в source seeds. У leites, águas, arrozes, carnes и подобных plural возможен контекст разновидностей/порций; он не означает обычный счёт вещества. При добавлении новых карточек проверить подачу plural и дать помету об обычном единственном числе, сохранив исходную морфологию и ответы упражнений. Не учить «два молока/риса» как безусловную модель.

## Задания и неизменные владельцы результатов

| Результат | Проверка | Ключ сохранения |
|---|---|---|
| Фрукты | Письмо исходных 6 word IDs, revision 1 | `practice:words:expansion-food-fruit` |
| Еда и напитки | Письмо исходных 8 word IDs, revision 1 | `practice:words:expansion-food-meals` |
| Мне нравится | 5 проверок EverydayLesson | `practice:everyday:likes` в activities и плане |
| Слова во фразах | 2 cloze UsagePractice | `usage:food-likes` в activities |

Письмо использует прежний `wordActivityId("writing", ids)` и `completeWords`: при точном наборе совпадают activity ID и плановый шаг. Не объединять 6+8 в одно письмо и не заменять его шестью продуктами предпочтений — получится другой вычисляемый ключ. UsagePractice не завершает EverydayLesson или письмо. Конструктор и просмотр объяснения ничего не засчитывают. Catalog binding `activity:usage:food-likes` и grammar ID `grammar:likes` не являются ключами сохранённой оценки.

| Исполнитель | Exercise ID | Правильный ответ / option ID |
|---|---|---|
| EverydayLesson | `likes-de` | `de` |
| EverydayLesson | `likes-negative` | `não gosto` |
| EverydayLesson | `likes-tu` | `gostas` |
| EverydayLesson | `likes-ines` | `gosta` |
| EverydayLesson | `likes-cheese` | `Não gosto de queijo.` |
| UsagePractice | `cloze:likes-fruit` | `likes-morango` → `morangos` |
| UsagePractice | `cloze:likes-cheese` | `likes-queijo` → `queijo` |

Usage-модуль ссылается сразу на обе коллекции и использует все шесть продуктов предпочтений. Его нельзя незаметно обрезать по выбранной фруктовой коллекции: определения и ответы должны остаться целыми. Семь проверок выше — не семь независимых completion, а два существующих результата 5 и 2.

## Текущие входы и целевая навигация

| Текущий вход | Что открывает | Требование к будущему флоу |
|---|---|---|
| `/learning/everyday/likes` | PT/RU-правило, конструктор и 5 проверок | Сохранить URL и одиночный исполнитель; дать переход в предпочтения единой темы |
| `/learning/plan/step/practice%3Aeveryday%3Alikes` | Тот же EverydayLesson через общий план | Сохранить result/revision и старое продолжение |
| `/learning/plan/step/practice%3Awords%3Aexpansion-food-fruit` | Карточки и письмо 6 слов | Сохранить, рядом дать вход целой темы |
| `/learning/plan/step/practice%3Awords%3Aexpansion-food-meals` | Карточки и письмо 8 слов | То же |
| `/learning/topics` → `topic:food` | Широкая библиотека еды/покупок, коллекции, фразы и другие механики | Основной вход нового флоу отделить от библиотеки, не удалять остальные коллекции/сцены |
| Collection IDs выше | Также связаны с `topic:vocabulary-food-more` в source catalog | Сохранить membership и aliases; не объявлять скрытый source topic отдельным новым курсом |

**Предложенный, пока отсутствующий адрес:** `/learning/food?topic=fruit&phase=explanation`, topic `fruit|meals|preferences`, phase `explanation|words|practice|review`; Pages — после `#`.

Источники:

- новые, **пока не зарегистрированы** `lesson:food:fruit` и `lesson:food:meals` → соответствующий `phase=words`;
- существующий `lesson:everyday:likes` → сейчас `/learning/everyday/likes`. Сохранять ID и старые sources; при сборке полного флоу можно обновить его href на `topic=preferences&phase=explanation`, оставив старый маршрут рабочим;
- продукты, сохранённые из предпочтений, получают этот существующий источник дополнительно к источнику своей пачки; это та же карточка, не дубль.

Связанный урок из `usage:food-likes` сейчас ведёт в `/learning/everyday/likes`; внутри нового флоу это должен быть переход к его готовому объяснению с тем же контроллером. Выходы в другую грамматику/библиотеку — с явным возвратом. Старые маршруты не удалять и не превращать в автоматическое завершение новой темы.

## Сохранение и повторение

Использовать существующие StudyItemCardSave и общий StudyReview со списком 15 targets. Добавление нового источника не меняет review version, due/interval, прежние sources и U49. В очередь попадают только сохранённые карточки с наступившим сроком; query cache остаётся полным. Старые библиотечные word IDs, просмотр/письмо и отзывы legacy-колод не мигрируют в новые StudyItem IDs.

Новый pack не импортирует manifest/learningCatalog/vocabulary-catalog; явный мост строится из исходных seeds и сверяется с реестром. Новые targets должны быть исключены из exercise word bank по образцу F-06.1, чтобы не изменить scene-word IDs, semantic meanings и F-01 snapshot. Storage/schema/JSON format/SRS-планировщик не меняются; Pages остаётся localStorage + IndexedDB, Cloudflare не подключается.

Незавершённые ответы/конструктор сохраняются между шагами в текущем флоу; после reload обещаются URL и подтверждённые данные, не черновик. Старое completion без числовой оценки показывается без выдуманного счёта, как в семье.

## Следующая рабочая сессия

1. **F-08.1 — данные и карточки.** Подключить точный мост 14 новых + 1 существующая цель, два новых источника и существующий likes. Сначала проверить food/fruit/meat senses и подачу plural веществ, затем pack/manifest/review registry и доступный Card Save. Граница: без изменения старых слов, ответов, хранилищ и 1000-verb прогресса. Готовность: все 15 targets разрешаются, нет дублей по источникам, оценённый `gostar de` сохраняет review и U49; word banks/плановые наборы 6/8/F-01 snapshot неизменны. Это разблокирует слова и SRS до изменения навигации.
2. **F-08.2 — взрослый экран.** После моста собрать три раздела по образцу семьи. Дать EverydayLesson controlled learn/check и onComplete, сохранив один state/controller конструктора и 5 проверок; UsagePractice — отдельный неизменный модуль из 2 заданий. Добавить краткие PT/RU-вступления фруктов/продуктов из готовых примеров; GOSTAR DE переиспользовать. Готовность: каждый шаг и возврат достижим, выбранные ответы/конструктор не сбрасываются при шагах/related back, результаты 6/8/5/2 раздельны.
3. **Совместимость и выпуск.** Все старые входы доступны; profile switch, источники, scoped/global SRS, потерянный ответ Save, JSON round-trip, reload и legacy completion проверены. `npm run check`, `npm run build:pages`, browser 390×844/1440×1000 и клавиатура. Публиковать только точный проверенный SHA, ждать Pages/Quality. Общий движок и остальные категории еды не входят в этот этап.

## Проверка карты

Код приложения и данные пользователя в этой задаче не изменялись. Чтением и загрузкой текущих реестров сверены 14 word/meaning IDs, source morphology, membership двух коллекций, 3 плановых шага, 7 exercise IDs/ответов, существующий `gostar de` и U49, отдельный `gostava de`, legacy `v0057` и отсутствие `gostar` в реестре тренажёра. Наличие 14 продуктов в упражнениях не приравнивается к готовности личных карточек.

На Node 22.23.2 прошли:

```sh
node --experimental-strip-types --test tests/food-vocabulary.test.ts tests/practice-plan.test.ts tests/learning-catalog-view.test.ts
npx --no-install vitest run tests/components/everyday-lesson.test.tsx tests/components/description-reading.test.tsx
```

Результат: 9 domain и 6 component tests. Это проверка текущих материалов, а не браузерная приёмка будущего флоу. Новый UI, build/deployment и независимая языковая редактура здесь не выполнялись.

Отдельная сверка таблицы Node прошла: 14 исходных word/meaning/morphology строк, отсутствие 14 предлагаемых targets, одна зарегистрированная цель U49, исходные наборы письма 6/8, 7 exercise/answer связей, существующий source likes и отсутствие двух новых sources. Все 10 относительных ссылок изменённых публичных планов разрешаются; `git diff --check` проходит. Consistency script сообщает 0 structural warnings, но часть его поисков ограничена отсутствующим `skills/`; ссылки и реестры поэтому проверены отдельно.
