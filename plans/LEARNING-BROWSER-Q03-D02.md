# Q-03/D-02 · Повторяемый браузерный gate взрослого обучения

2026-11-14. База: `5c93d839033d5d844c25287db75c3a106d443175` (A02.2). Добавлены тесты и CI, без изменения runtime, контента, API, scheduler, формата backup или хранилищ.

## Запуск

Из корня публичного checkout, Node `22.23.2` из `.nvmrc`, установленные зависимости проекта и Chromium соответствующей версии Playwright:

```sh
npm run test:browser
```

Команда сначала собирает свежий `dist-pages`, затем запускает [отдельную конфигурацию](../playwright.learning.config.ts). Поднимается собственный `127.0.0.1:3103/tempo-react/` с `--strictPort`, без переиспользования чужого сервера и без URL production. Занятый порт означает ошибку запуска, а не разрешение закрывать чужой процесс. Каждый тест получает чистый browser context и создаёт взрослый локальный профиль через UI. Запись данных — только через интерфейс приложения, включая штатные JSON export/import. Хранилища реального браузера пользователя не используются.

Для разработки одного сценария после свежей Pages-сборки:

```sh
npm run build:pages
npx --no-install playwright test --config playwright.learning.config.ts --project adult-mobile --grep 'legacy JSON'
```

Если Chromium ещё не подготовлен, Playwright сообщит об отсутствующем браузере. Gate сам не устанавливает локальные пакеты/браузеры. В чистом CI окружение подготавливает `npx --no-install playwright install --with-deps chromium` с закреплённой проектом версией Playwright. Старые визуальные тесты `/ui` и `playwright.config.ts` остаются отдельными.

## Три сценария × два размера

[Тесты](../tests/browser/learning.spec.ts), [UI helpers](../tests/browser/learning.helpers.ts), [синтетический fixture](../tests/browser/fixtures/legacy-profile.ts). Два Chromium viewport: 390×844 и 1440×1000; один worker, автоматические retries выключены. Проверяются переполнение по горизонтали, отсутствие необработанных ошибок страницы и сетевых запросов `/api/`: Pages должен пользоваться своим локальным transport.

1. **Новый путь.** Короткое объяснение «Представиться» → правильный ответ → слово Olá! → Save → раздел «Карточки» → библиотека → общий SRS → оценка «Помню» → подтверждение → reload. Проверяются прежние `study:chunk:ola`, `saved:study:chunk:ola` и `lesson:a1-1:introduce-yourself`, один item/source/receipt, будущий срок, version/repetitions 1. После reload очередь пуста, весь learning JSON равен подтверждённому. Результат короткого урока хранится под прежним activity ID в browser learning; он не выдаётся за завершение Route LessonEngine. Ссылка на слова и возврат к объяснению доступны с клавиатуры, заголовок получает focus.
2. **Старые сохранения.** Штатный импорт fixture: 21 item с savedAt=123, 22 source rows (включая дополнительный scene/context), две ранее оценённые независимые Route/GA1 reviews и receipts, отдельный v0001 review, завершённый Route урок и event. Чтение/экспорт не создают missing rows. Подключение Olá! через библиотеку → оценка; затем все группы 5/2/4/6 и остальные 15 missing rows. Всего 18 reviews: все 17 legacy целей плюс прежний GA1. Старые rows, receipts, sources/contexts/types, dates, v-card, progress/events неизменны; новая оценка Olá! не сбрасывается при подключении остальных. После reload библиотека показывает 17 подключений.
3. **JSON и профили.** Экспорт после подключения/оценки → второй взрослый профиль с пустой очередью → импорт. Локальная identity второго профиля сохраняется, learning/browser данные равны экспортированным. Повторный импорт и более старый fixture не создают дублей и не откатывают оценку. Повреждённый JSON отклоняется, данные не изменяются. Подключение другой цели только во втором профиле не появляется в первом; переключение туда/обратно и reload сохраняют независимые данные.

Фиксируется только `Date.now` на синтетическую дату fixture: прежние future reviews не становятся просроченными с годами. Таймеры и запись работают по-настоящему. Ожидаемые IDs/группы заданы в тесте явно, не вычисляются из изменяемого production реестра. В fixtures нет персональных данных или production backup.

## CI и диагностика

[Quality / browser](../.github/workflows/quality.yml) запускается на push/PR, независимо от существующего `check`. Gate включает content/public-assets validation, Pages build и все шесть browser cases. Команда `npm run check` сохраняет прежний состав; перед выпуском требуются оба успешных job. Существующий Pages workflow выполняется отдельно: новый job сам по себе не блокирует автоматический deployment.

Локально: HTML report `playwright-report/learning/index.html`; screenshots `test-results/learning/`; при ошибке — trace и screenshot. Отчёт открыть командой `npx --no-install playwright show-report playwright-report/learning`. CI при ошибке загружает `learning-browser-failure` на семь дней. Все тестовые записи синтетические; каталоги результатов игнорируются Git.

## Граница доказательства

Это браузерная проверка Chromium и локального режима Pages, не приёмка реальных iOS/Android устройств, всех браузеров, серверного D1 или полного курса. Lost-response retry и смена профиля во время незавершённого запроса остаются в component tests A02.2. Детская презентация, полный accessibility аудит, lesson-engine resume и visual baselines вне текущих шести сценариев. Runtime и словари не изменены.

## Локальный результат

`npm run check`: lint/typecheck, 140 domain / 364 component / 20 server tests и production build прошли. `npm run test:browser`: финальные 6/6, 39,2 с, без retries; включая page-error/network guards. Финальный typecheck прошёл. Pages/public-assets validation: 87 referenced paths / 114 public files. Все 117 dist-файлов структурно и побайтно совпали с точной сборкой A02.2. Относительные ссылки проверены; consistency script сообщает девять прежних структурных предупреждений. Remote CI и точный SHA фиксируются в приватном каноническом roadmap после отправки коммита.
