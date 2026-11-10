PIXEL ORBIT INFINITE v4.5 — КРУПНОЕ ОБНОВЛЕНИЕ

В ЭТОМ АРХИВЕ
- Полная веб-игра v4.5 на основе исходников v4.4 Friends & Co-op.
- 5 ветвей навыков, 24 навыка с описаниями, уровнями и условиями открытия.
- Атлас секторов: 10 миров, 30 точек экспедиции (ворота, тайники, сигналы), награды за исследование.
- Отдельная кооперативная арена Небулона: анимированный босс, общая полоса здоровья, присутствие пилотов, вклад и атаки через серверную RPC-функцию v4.4.
- Push-клиент, обработчики уведомлений в Service Worker, SQL-таблица подписок и Edge Function для уведомлений о запросе дружбы и победе над боссом.
- Существующие станция, профиль, сохранение, друзья, онлайн-статусы и рейтинги сохранены.

УСТАНОВКА НА GITHUB PAGES
1. Сделай резервную копию текущего сайта и локального сохранения.
2. Загрузи содержимое папки PixelOrbit в корень GitHub Pages (или /docs, если так настроено Pages).
3. Сохрани существующий Supabase URL и publishable key — они уже используются в online.js.
4. Убедись, что index.html, game.js, hub.js, online.js, raid.js, push-client.js, push-config.js, pwa.js, service-worker.js, style.css, manifest.webmanifest и PNG-иконки лежат рядом.
5. Открой сайт, обнови кэш/Service Worker. На телефоне закрой старую установленную PWA и установи обновлённую.

КОМАНДЫ / ПРОВЕРКИ
Синтаксис JS и JSON проверен локально. Полный браузерный тест на реальных двух аккаунтах и реальном Android не проводился.

КО-ОП БОСС
Используется уже существующая серверная схема v4.4: coop_raid_state, coop_raid_contributions, join_coop_raid(), attack_coop_boss(). Она должна быть установлена в Supabase. Арена v4.5 — отдельный визуальный экран, но здоровье босса, вклад и урон остаются общими и серверно-авторитетными. Игрокам нужно войти в Pixel Orbit Online; атака ограничена серверным cooldown.

PUSH-УВЕДОМЛЕНИЯ — НУЖНА ОДНОРАЗОВАЯ НАСТРОЙКА SUPABASE
Сейчас клиент и серверная функция подготовлены, но push нельзя активировать без VAPID-пары и публикации функции.
1. Сгенерируй VAPID-ключи на компьютере командой:
   npx web-push generate-vapid-keys
2. Открой push-config.js и замени PASTE_VAPID_PUBLIC_KEY_HERE на publicKey из вывода.
3. В Supabase SQL Editor выполни SUPABASE_SETUP_v4.5.sql.
4. Размести файл supabase/functions/pixel-orbit-push/index.ts в проекте и задеплой функцию с именем pixel-orbit-push:
   supabase functions deploy pixel-orbit-push
5. Добавь Edge Function Secrets (не в GitHub и не в JS):
   VAPID_PUBLIC_KEY = publicKey
   VAPID_PRIVATE_KEY = privateKey
   VAPID_SUBJECT = mailto:твой-адрес@example.com
   SUPABASE_SERVICE_ROLE_KEY = service_role key проекта
   SUPABASE_URL и SUPABASE_ANON_KEY обычно доступны функциям Supabase автоматически.
6. Опубликуй обновление сайта, войди в аккаунт на устройстве, открой Профиль → Настройки → ВКЛЮЧИТЬ PUSH-УВЕДОМЛЕНИЯ и разреши уведомления Android/браузеру.
7. Проверь входящий запрос дружбы с другого аккаунта и победу рейда.

ВАЖНО О СЕКРЕТАХ
- VAPID PRIVATE KEY и SUPABASE SERVICE ROLE KEY нельзя помещать в push-config.js, HTML, JS, GitHub Pages или этот публичный сайт.
- В push-config.js находится только VAPID PUBLIC KEY — его можно публиковать.
- Не передавай service_role key в чат и не коммить его в репозиторий.

СОХРАНЕНИЯ
Ключ localStorage pixelorbit_v4 не менялся. Старые локальные сохранения должны загружаться; новые mapMarks и skill IDs добавляются без сброса прогресса. Перед крупным обновлением всё равно экспортируй сохранение в Профиле.
