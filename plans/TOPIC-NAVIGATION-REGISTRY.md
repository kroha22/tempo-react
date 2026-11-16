# Единый реестр тем · взрослые разделы

2026-11-16. Первый блок выпущен в `1113cf7`: время, тело/здоровье, дом/расположение. Следующий блок поверх него подключает семью и еду. Словарная база `92a51f150567cf183aaa2afed18897b8d0ddab88` остаётся неизменной. Остальные разделы сохраняют прежние входы и структуру.

## Владелец навигации

[topic-navigation.ts](../features/content/topic-navigation.ts) задаёт единые названия, описание, готовый основной урок, старые тематические входы, школьные unit IDs, supplemental IDs и word-source references. Используются существующие root topic IDs LearningCatalog:

| Topic ID | Название | Основной flow | Прежние школьные темы |
|---|---|---|---|
| topic:vocabulary-family | Моя семья и близкие | /learning/family | — |
| topic:food | Еда и предпочтения | /learning/food | — |
| topic:vocabulary-calendar | Время и мой день | /learning/time-day | hours, months, ordinals-first, ordinals-last, timeline |
| topic:vocabulary-body | Тело и здоровье | /learning/body | bones, organs, prevention, wellbeing |
| topic:vocabulary-house | Дом и расположение | /learning/home | — |

Реестр хранит только ссылки на существующий материал. LearningCatalog, lesson owners и словарные владельцы продолжают хранить учебные данные; источники, mastery, review rows и прогресс не переносятся в навигационный реестр.

## Подключённые экраны

- [Общий план](../features/learning/plan/GeneralPlan.tsx) получает все пять повседневных записей из реестра. Девять supplemental упражнений и книжные ссылки сохранены; два ID семьи и четыре ID еды теперь перечислены явно в реестре вместо поиска по подстроке. [Группы школьных уроков](../features/learning/plan/school-plan.ts) берут принадлежность выбранных unit IDs из того же реестра; все 20 старых уроков остаются доступны ровно по одному разу.
- Взрослый [каталог](../features/practice/VocabularyStudy.tsx) показывает по одной [карточке раздела](../features/practice/RegisteredTopicCard.tsx). Состояния, здоровье, календарь, распорядок, пространственные материалы, семейные и продуктовые упражнения доступны внутри «Материалов темы». Старые data-topic-id остаются прежними; семейный вход открывает прежний режим family, продуктовый — cards. Чтение и прочие немигрированные разделы сохраняются. Детский каталог сохраняет прежние входы семьи и еды.
- [Слова и повторение](../features/learning/plan/PlanWords.tsx) получает пять ссылок из реестра. Существующий /learning/quick-words принимает необязательный query topic с существующим root ID. Неизвестный ID открывает обычный каталог; child presentation сохраняет прежнюю подачу.
- Взрослый [каталог слов](../features/practice/QuickWords.tsx) использует [WordTopicSections](../features/practice/WordTopicSections.tsx). Классификация идёт по точным существующим ID/aliases, без поиска по переводу или переименования. При входе из конкретного урока source scope сохраняется. «Другие подборки» остаются доступны; это последующие этапы подключения.

## Слова неизменны

Не редактировались word-learning-library, word-browse-sets, school-word-sets, quick-word-sets, enrichment, noun/verb/chunk data или карточные каталоги. Группировка сохраняет сами объекты подборок и порядок слов внутри них. Названия не используются для объединения наборов.

На принятой базе 87 взрослых подборок: семья — 1, еда — 10, время — 5, тело и здоровье — 8, дом и расположение — 14, другие — 49. Это количество прежних наборов, не новые словари и не подсчёт уникальных слов. Полный JSON-снимок обеих библиотек, обоих browse-каталогов и schoolWordSets совпал с родительской словарной базой; SHA256 `17bdfadd57b0c319068cd989fd455a4dc0d92d22fa16decd38502e6b4b294bae`.

Семья выбирается по `topic:vocabulary-family`. Еда — по `topic:food`, `collection:expansion-food-meals` (у прежнего deck food нет topic alias) и `collection:pairs-verbs-food-shopping`. Семейный browse-набор уже объединён в словарном владельце; реестр не повторяет это объединение. GOSTAR DE/U49 и старые Card Save/SRS доступны через существующий food flow без изменения карточных данных.

Сохранённая wordSession продолжает ссылаться на старый setId и старые word IDs. Навигационный topicId не записывается вместо них. API, localStorage/IndexedDB schema, backup, scheduler, StudyItem/card IDs, source provenance и оценки не изменены.

## Проверки и границы

[Component tests](../tests/components/topic-navigation.test.tsx): существующие topic IDs, покрытие 20 школьных тем, supplemental IDs, одна карточка раздела, точный состав scoped words, идентичность исходных объектов и child/source совместимость. [Browser cases](../tests/browser/topic-navigation.spec.ts): plan → catalogue → words для пяти разделов, отсутствие автоматических записей, исходный setId, reload и штатный JSON round-trip отдельно для времени, семьи и еды на 390×844 и 1440×1000. Существующий SRS путь сохранён; таймауты/retries не увеличены.

Принятые параллельные изменения словарей, личной колоды и игр сохранены в родительских коммитах. Незакоммиченная параллельная работа исключена из изолированного проверяемого снимка. Точный SHA, результаты CI и публикации фиксируются в приватном каноническом roadmap. Новые уроки, слова, общая оценка освоения и сервер этим этапом не добавлялись.
