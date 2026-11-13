# F-01: карта переноса подготовки в постоянные уроки

Обновление F-02: [подключены все 10 языковых тем](READING-LESSONS-F02.md). Описание трёх локальных уроков ниже относится к проверке F-01; JSON и availability реестра теперь отражают подключённые десять. Другие поля совместимости сохранены.

Дата: 2026-11-13. Объём: инвентаризация 20/20 существующих тем и проверка локального блока чтения. Новые темы не подключаются; старый вход подготовки не удаляется. Дом урока ниже — план группировки, а не новый ID прогресса и не обещание уже работающего URL.

## Источники и совместимость

Исполняемый источник по-прежнему preparationUnits в `features/content/test-preparation.ts`. Реестр назначения — [preparation-migration.ts](../features/content/preparation-migration.ts). Полная проверяемая выгрузка — [preparation-migration-inventory.json](preparation-migration-inventory.json): точные word IDs всех 20 подборок, написания/переводы/группы фонетических банков, targets, primary activity IDs, бумажные листы и видимость короткой проверки.

Выгрузка закреплена file snapshot в `tests/components/preparation-migration.test.tsx`. При расхождении сначала выяснить причину; не обновлять snapshot автоматически, чтобы скрыть изменение ID. Дом и availability — только metadata F-01; UI их пока не читает. Названия будущих секций не создают новые lesson/activity IDs. Исходный unit ID остаётся идентификатором урока при переносе.

## Все 20 тем

| Unit ID | Урок | Постоянный дом | Текущие ключи основных результатов | Слов | Исходная связь target |
|---|---|---|---|---|---|
| letters | Алфавит | Буквы и чтение | `prep:phonics:letters:vowels`, `prep:phonics:letters:consonants` | 6 | — |
| r-rr | R или RR? | Буквы и чтение | `prep:phonics:r-rr` | 4 | — |
| s-ss | S или SS? | Буквы и чтение | `prep:phonics:s-ss` | 4 | — |
| c-cedilla | C и Ç | Буквы и чтение | `prep:phonics:c-cedilla` | 4 | — |
| s-z | Сочетания с S и Z | Буквы и чтение | `prep:phonics:s-z` | 4 | — |
| g-gu | GE/GI и GUE/GUI | Буквы и чтение | `prep:phonics:g-gu` | 4 | — |
| nasal | M и N | Буквы и чтение | `prep:phonics:nasal` | 4 | — |
| digraphs | NH, LH и CH | Буквы и чтение | `prep:phonics:digraphs` | 4 | — |
| x-sounds | Звуки X | Буквы и чтение | `prep:phonics:x-sounds` | 4 | — |
| clusters | Сочетания согласных | Буквы и чтение | `prep:phonics:clusters` | 4 | — |
| hours | Часы и сутки | Время и мой день | `prep:hours`, `clock:read`, `clock:set` | 4 | topicId=topic:vocabulary-calendar; mode=calendar; calendarLessonId=hours |
| months | Месяцы и дни | Время и мой день | `prep:months`, `prep:months:order`, `prep:months:days` | 12 | topicId=topic:vocabulary-calendar; mode=calendar; calendarLessonId=months-first |
| ordinals-first | С первого по десятый | Школьные уроки / порядковые | `prep:ordinals-first` | 4 | — |
| ordinals-last | До двадцатого | Школьные уроки / порядковые | `prep:ordinals-last` | 4 | — |
| cooperation | Общение и конфликты | Сотрудничество и общение | `prep:cooperation` | 4 | topicId=topic:vocabulary-cooperation; mode=cooperation |
| bones | Кости и мышцы | Тело | `prep:bones` | 4 | topicId=topic:vocabulary-body; collectionId=collection:expansion-body-inside; mode=cards |
| organs | Органы и функции | Тело | `prep:organs`, `image:image-body-inside` | 4 | topicId=topic:vocabulary-body; collectionId=collection:expansion-body-inside; mode=cards |
| prevention | Профилактика и лечение | Здоровье | `prep:prevention` | 4 | — |
| wellbeing | Полезные привычки | Здоровье | `prep:wellbeing` | 4 | topicId=topic:vocabulary-my-day; mode=cards; collectionId=collection:my-day-actions |
| timeline | Линия времени | Школьные уроки / линия времени | `prep:timeline` | 4 | — |

Первые три темы доступны через локальный `topic:reading` и прежнюю подготовку. Остальные 17 ещё доступны только через подготовку; среди них семь языковых тем будущего F-02. Нет отдельной оценки «тема освоена», общей для слов, фонетики и школьных знаний.

## Задания и словари

- Все 20 тем имеют слова из `preparation-support.ts / preparationKeywords`; порядок слов важен. Resolver выделен без изменения алгоритма в `preparation-words.ts` и используется прежним `PreparationWords`: совпадение label + русского значения возвращает прежний catalog word ID, иначе остаётся `prep-keyword:<unit>:<index>`. Не заменять это совпадением только португальского написания. Тест сравнивает все результаты с прежним алгоритмом.
- Пары сохраняют `pairs:prep-keywords:<unit>`; исходный block ID — `prep-keywords:<unit>`. Показ списка слов не создаёт отдельного результата и не добавляет карточки автоматически.
- Поиск сохраняет `wordActivityId("search", board.words.map(word => word.id))`, вычисленный прежним hash алгоритмом в `learning-rewards.ts`. `WordSearch` сначала фильтрует слова через `searchWords`, разбивает по 10 и строит board. Поэтому это зависимый от набора ключ, а не `prep:search:<unit>`. Сохранять входные word IDs, порядок/фильтрацию/банки; не заменять его новым ключом темы.
- У фонетических тем правило, примеры и вопросы находятся в preparationUnits, словарный банк — в preparationPhonics. Наличие questions в источнике не означает показ PrepQuiz: для subject=portuguese исполнитель показывает PreparationPhonics. Не приписывать ему `prep:<unit>` и не создавать фиктивный зачёт короткой проверки.
- hours: встроен ClockLesson, target hours сохранён как связь, хотя отдельная кнопка скрыта. months: встроен PreparationMonths; target months-first также остаётся связью. bones: картинки костей/мышц без отдельного completion, плюс школьный quiz. organs: полный insideBodyImage и его `image:image-body-inside`, плюс quiz; не урезать definition до словаря из четырёх keywords.
- cooperation и wellbeing открывают внешний тематический материал через исходные targets; результаты UsagePractice, карточек и других механизмов остаются у этих владельцев и не становятся результатом подготовки. bones/organs сохраняют collection:expansion-body-inside; wellbeing — collection:my-day-actions.
- Бумажные листы: cooperation=1, bones/organs=2, prevention/wellbeing=3. Их существующие приватные previews не переносить в публичные assets. Замечание об ошибке школьного источника для prevention сохраняется.

## Сохранение и старые входы

Владелец результатов: `ActivityCompletion → recordActivity → ProfileLearning.activities`, существующее хранилище профиля `tempo-react:github-pages:profile:<profileId>:v1`. Формат, scheduler, карточки, SRS и backup не меняются. `recordActivity` сохраняет лучший полный раунд: меньший total не заменяет больший; при равном total сохраняется лучший correct. Прежние неизвестные activity IDs не удалять.

`school:preparation`, `prepUnitId`, `returnToPrep`, `PrepTarget` и lastTopicId нужны до окончания F-03. Подготовка остаётся доступна; запись `topic:reading` корректно открывает нынешний подблок. Перенос в постоянные уроки не должен требовать новой колоды или миграции результатов. Изменение названия/домашнего раздела не меняет unitId, word ID или activity ID.

## Локальные «Буквы и чтение»

Проверяется существующий незакоммиченный блок: readingLessonIds = letters, r-rr, s-ss. Один TestPreparation с reading=true переиспользует те же источники и исполнитель; бумажные поручения/предметы скрыты. Старый режим подготовки сохраняет все 20 тем. Проверки кнопок озвучки не заменяют проверку произношения на слух.

Компонентные проверки: достижимость всех трёх уроков и возврат, общий ключ R/RR с подготовкой, худший повтор не стирает лучший, алфавит и S/SS записываются под прежними IDs в реальный profile store, remount читает подтверждённый результат, другой профиль не меняется. Это не обещает сохранение незаконченных ответов: локальный блок сохраняет результат завершённого задания; промежуточный выбор пропадает после выхода/reload.

## Проверка F-01 · 2026-11-13

- Полнота: 20/20 unit IDs без дублей; 10 назначены чтению, из них 3 реально подключены локально. JSON snapshot закрепляет word IDs, фонетические банки и targets; это не новый формат сохранений пользователя.
- Финальная команда `npx vitest run tests/components/reading-lessons.test.tsx tests/components/preparation-migration.test.tsx tests/components/cooperation.test.tsx tests/server`: 31/31 прошли. В чтении 5 сценариев, в карте 3. Проверяется в том числе лучший результат и сохранение другого профиля.
- Lint, TypeScript и 120 domain tests прошли в общем `npm run check`. Его component-этап имел 4 сбоя: таймауты в чтении/сотрудничестве и последующий сбой навигации после таймаута. В тесте чтения длинный цикл выбора ответов заменён синхронными fireEvent, без изменения сценария и лимитов; реальная клавиатура отдельно проверена в браузере. Все затронутые сценарии прошли финальную команду выше. Полный check после этой правки повторно не запускался; не считать весь проект прошедшим новый полный release gate.
- `npm run build` и `npm run build:pages` прошли. Guard: 87 referenced paths, 114 public files. У сборок остаются прежние предупреждения о chunks и статической классификации routes.
- Browser: 390×844 и 1440×1000, взрослый тестовый профиль. Алфавит пройден через Space, затем reload; R/RR — 3 раунда, результат 12/12, затем reload и переход в старую подготовку. В localStorage остались ровно прежние результаты `prep:phonics:letters:vowels` (1/1) и `prep:phonics:r-rr` (12/12). У старого входа по-прежнему 20 тем; R/RR открывается с тем же ID. Горизонтального переполнения нет. S/SS и профильная изоляция проверены компонентными тестами; аудио на слух и screen reader не проверялись.
- Локальные ссылки карты и `git diff --check` прошли. Consistency script запускался, но искал отсутствующий skills/; его сводка не заменяет ручную проверку ссылок. Скриншоты/логи сессии находятся во временном `/private/tmp/tempo-f01-*`; постоянные результаты — эта карта, JSON и тесты.
- Исходные незакоммиченные файлы чтения сохранены и проверены. Коммит, публикация, перенос данных, подключение API/D1 и расширение до 10 тем в F-01 не выполнялись.

## Следующая задача

F-02: расширить readingLessonIds с трёх до десяти языковых тем и сделать текст списка независимым от числа «три». Сначала пройти по реестру reading из этой карты, затем проверить каждые старые ID/банки/раунды и сохранение результатов. Не убирать подготовку, не включать математические и world-темы в подблок чтения. Полный перенос остальных тем и удаление пункта подготовки — F-03.
