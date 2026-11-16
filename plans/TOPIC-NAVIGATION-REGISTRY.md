# Единый реестр тем · взрослые разделы

2026-11-16. Первый блок выпущен в `1113cf7`: время, тело/здоровье, дом/расположение. Семья и еда подключены в `639c675`, чтение — в `0e16ab1`, сотрудничество — в `dfe5131`, одежда/цвета — в `f5dfa1d`. Следующий блок подключает знакомство поверх `213b805`. Словарная база `92a51f150567cf183aaa2afed18897b8d0ddab88` остаётся неизменной. Остальные разделы сохраняют прежние входы и структуру.

## Владелец навигации

[topic-navigation.ts](../features/content/topic-navigation.ts) задаёт единые названия, описание, готовый основной урок, старые тематические входы, школьные unit IDs, supplemental IDs и word-source references. Используются существующие навигационные IDs: root topics LearningCatalog, `topic:reading` и foundation IDs прежнего каталога:

| Topic ID | Название | Основной flow | Прежние школьные темы |
|---|---|---|---|
| foundation:hello | Знакомство и первые фразы | /learning/introduction | — |
| topic:vocabulary-clothing | Одежда и цвета | /learning/clothing | — |
| topic:vocabulary-cooperation | Сотрудничество и общение | /learning/plan/school?unit=cooperation | cooperation |
| topic:reading | Буквы и чтение | /learning/reading | letters, r-rr, s-ss, c-cedilla, s-z, g-gu, nasal, digraphs, x-sounds, clusters |
| topic:vocabulary-family | Моя семья и близкие | /learning/family | — |
| topic:food | Еда и предпочтения | /learning/food | — |
| topic:vocabulary-calendar | Время и мой день | /learning/time-day | hours, months, ordinals-first, ordinals-last, timeline |
| topic:vocabulary-body | Тело и здоровье | /learning/body | bones, organs, prevention, wellbeing |
| topic:vocabulary-house | Дом и расположение | /learning/home | — |

Реестр хранит только ссылки на существующий материал. LearningCatalog, lesson owners и словарные владельцы продолжают хранить учебные данные; источники, mastery, review rows и прогресс не переносятся в навигационный реестр.

## Подключённые экраны

- [Общий план](../features/learning/plan/GeneralPlan.tsx) получает все семь взрослых повседневных записей из реестра; детский план сохраняет пять. Девять supplemental упражнений и книжные ссылки сохранены; два ID семьи и четыре ID еды перечислены явно в реестре вместо поиска по подстроке. [Группы школьных уроков](../features/learning/plan/school-plan.ts) берут принадлежность выбранных unit IDs из того же реестра; все 20 старых уроков остаются доступны ровно по одному разу.
- Взрослый [каталог](../features/practice/VocabularyStudy.tsx) показывает по одной [карточке раздела](../features/practice/RegisteredTopicCard.tsx). Прежние упражнения доступны внутри «Материалов темы». Старые data-topic-id остаются прежними; семейный вход открывает режим family, сотрудничество — cooperation, продуктовый и одежда — cards. Остальные немигрированные разделы сохраняются. Детский каталог сохраняет прежние входы.
- [Слова и повторение](../features/learning/plan/PlanWords.tsx) получает девять ссылок из реестра. Существующий /learning/quick-words принимает необязательный query topic с существующим навигационным ID. Неизвестный ID открывает обычный каталог; topic scope применяется к взрослому представлению.
- Взрослый [каталог слов](../features/practice/QuickWords.tsx) использует [WordTopicSections](../features/practice/WordTopicSections.tsx). Классификация идёт по точным существующим ID/aliases, без поиска по переводу или переименования. При входе из конкретного урока source scope сохраняется. «Другие подборки» остаются доступны; это последующие этапы подключения.

Параллельный `word-collections.ts` группирует общий каталог слов. При входе через topic query заголовок и подборки берутся непосредственно из topic-navigation, поэтому раздел конкретной темы сохраняет название плана/урока. Общая группировка и детский каталог, изменённые параллельным этапом, сохраняются; это не перенос слов между источниками.

## Слова неизменны

Не редактировались word-learning-library, word-browse-sets, school-word-sets, quick-word-sets, enrichment, noun/verb/chunk data или карточные каталоги. Группировка сохраняет сами объекты подборок и порядок слов внутри них. Названия не используются для объединения наборов.

На принятой базе 87 взрослых подборок: знакомство — 5, одежда/цвета — 2, сотрудничество — 2, чтение — 1, семья — 1, еда — 10, время — 5, тело и здоровье — 8, дом и расположение — 14, другие — 39. Это количество прежних наборов, не новые словари и не подсчёт уникальных слов. Полный JSON-снимок обеих библиотек, обоих browse-каталогов и schoolWordSets совпал с родительской словарной базой; SHA256 `17bdfadd57b0c319068cd989fd455a4dc0d92d22fa16decd38502e6b4b294bae`.

## Знакомство и первые фразы

Первичный навигационный ID — прежний `foundation:hello`, дополнительный вход — `foundation:identity`. Взрослый каталог показывает одну карточку; внутри «Материалов темы» остаются Olá! и Quem sou? на прежних IDs. Детские отдельные карточки сохраняются. SER/ESTAR имеет отдельного владельца: из нового раздела дана ссылка, его задания/результаты не присваиваются знакомству.

Новый `/learning/introduction` в [Pages adapter](../features/practice/IntroductionTopic.tsx) и [Next entry](../app/learning/introduction/page.tsx) переиспользует FirstSteps topicStep 0/1, GreetingsLesson и IdentityLesson. Переключение вкладок сохраняет выбранные ответы внутри текущего посещения; возврат идёт к исходному экрану. Объяснения, переводы, ответы и ключи `greetings:*`, `identity:*`, `foundation:first-steps:*` не переписываются.

Пять прежних наборов: hello (13), polite (13), adult-small-talk (14), library:collection:pairs-introductions:0 (5), browse:deck:tempo:deck:phrases:social (8). Слова не объединялись и не удалялись. Другие материалы topic:vocabulary-lessons, общий словарь и словарь профессий внутри IdentityLesson сохраняют прежние входы; широкий технический контейнер не назначается целиком этой теме. Детский план и полная группировка слов совпадают с базой. Card Save/SRS/source metadata и схемы не меняются.

## Одежда и цвета

Существующий `topic:vocabulary-clothing` связан с `clothes-basic` (15 записей, aliases clothes-more/collection:clothing-basics) и `colors-basic` (12 записей, alias colors-more). Данные не объединялись заново. Прежний каталог и `image-clothing` продолжают использовать свои 10 clothing word IDs; все они входят в более широкую подборку одежды. Цвета не добавляются в это задание автоматически.

Новый `/learning/clothing` — [адаптер](../features/practice/ClothingTopic.tsx) прежнего VocabularyStudy, также доступный через [Next entry](../app/learning/clothing/page.tsx). Он открывает существующие карточки и режимы, даёт вход к обеим подборкам и возвращается к исходному плану/каталогу через navigation callback. Старый topic ID и data-topic-id остаются доступны в «Материалах темы». Новое объяснение PT/RU не создано; карточка раздела показывает «Слова · задания · повторение».

Детская карточка одежды, прежние пять повседневных пунктов детского плана и полная структура/порядок child word collections сохранены. Card Save, источники, SRS, wordSession и activity progress keys не мигрируются. Browser case проверяет оба входа к гардеробу, возврат в план, старый image-clothing результат и штатный JSON/reload; scoped word case сохраняет исходный setId цветов.

## Сотрудничество и общение

Существующий `topic:vocabulary-cooperation` объединяет навигацию к готовому уроку `unit=cooperation`, трём прежним занятиям CooperationLesson и двум наборам: `library:collection:cooperation-rules:0` (12 записей) и `school:words:cooperation` (4 записи). Это отдельные исходные наборы; они не сливаются и пересекающиеся слова не удаляются. Вежливость и small talk остаются в прежних разделах: это не расширение содержания курса.

В плане группа сохраняет своё место и название; прежняя ссылка урока «Общение и конфликты» остаётся основным входом. Взрослый каталог показывает одну реестровую карточку. «Материалы темы» открывают прежний topic ID в режиме cooperation, со всеми тремя шагами и переходом к чувствам. Повторная ссылка на тот же unit URL внутри карточки не выводится. Детская школьная кнопка и полная группировка слов, включая порядок, совпадают с базой до этого этапа.

Ключи `prep:cooperation` и `usage:cooperation:rules/feelings/solution` принадлежат прежним упражнениям; реестр их не мигрирует. Browser cases сохраняют старые prep/usage результаты через оба входа, reload и JSON; wordSession продолжает использовать исходный setId. Новых уроков, слов, карточек, source metadata и SRS-правил не добавлено.

## Буквы и чтение

Навигационный `topic:reading` уже использовался старым каталогом и не заменяет exercise IDs. Реестр ссылается на существующий `readingLessonIds`; school-plan больше не дублирует состав блока. В общем плане раздел остаётся в «Буквах и школьных темах», со ссылками на полный список и тематические слова; все десять прежних unit links сохраняются.

Новый адрес `/learning/reading` — тонкий [адаптер](../features/practice/ReadingLessons.tsx) существующего TestPreparation reading, доступный в Pages и [Next entry](../app/learning/reading/page.tsx). Он открывает все десять готовых уроков, не копирует содержание и не создаёт новые результаты. Взрослый каталог показывает одну реестровую карточку, старый `topic:reading` по-прежнему открывается через «Материалы темы» и resume; детская кнопка сохранена.

Подборка `school:words:reading` содержит прежние 89 записей. Её ID, aliases, порядок, label/translation и фонетические данные не изменяются. Взрослый общий каталог выделяет её в реестровый раздел; детский сохраняет её внутри прежней группы «Школа, друзья и игры». Поурочные word links остаются доступны через прежние `/learning/plan/school?unit=…&words=1`. Общий Card Save/SRS, wordSession и ключи `prep:phonics:*`/`prep:*` не мигрируются. Browser gate проверяет reading route, старую кнопку, исходный setId, reload/JSON и сохранность старого результата R/RR.

Семья выбирается по `topic:vocabulary-family`. Еда — по `topic:food`, `collection:expansion-food-meals` (у прежнего deck food нет topic alias) и `collection:pairs-verbs-food-shopping`. Семейный browse-набор уже объединён в словарном владельце; реестр не повторяет это объединение. GOSTAR DE/U49 и старые Card Save/SRS доступны через существующий food flow без изменения карточных данных.

Сохранённая wordSession продолжает ссылаться на старый setId и старые word IDs. Навигационный topicId не записывается вместо них. API, localStorage/IndexedDB schema, backup, scheduler, StudyItem/card IDs, source provenance и оценки не изменены.

## Проверки и границы

[Component tests](../tests/components/topic-navigation.test.tsx): существующие topic IDs, покрытие 20 школьных тем, supplemental IDs, одна карточка раздела, точный состав scoped words, идентичность исходных объектов и child/source совместимость. [Browser cases](../tests/browser/topic-navigation.spec.ts): plan → catalogue → words для девяти разделов, отсутствие автоматических записей, исходный setId, reload и штатный JSON round-trip отдельно для знакомства, одежды/цветов, сотрудничества, чтения, времени, семьи и еды на 390×844 и 1440×1000. Существующий SRS путь сохранён; таймауты/retries не увеличены.

Принятые параллельные изменения словарей, личной колоды и игр сохранены в родительских коммитах. Незакоммиченная параллельная работа исключена из изолированного проверяемого снимка. Точный SHA, результаты CI и публикации фиксируются в приватном каноническом roadmap. Новые уроки, слова, общая оценка освоения и сервер этим этапом не добавлялись.
