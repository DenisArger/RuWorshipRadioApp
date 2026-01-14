# RuWorshipRadioApp

Веб-приложение для прослушивания радиостанций поклонения через Telegram Web App.

## Описание

Это приложение позволяет пользователям слушать радиостанции прямо в Telegram через Web App интерфейс. Приложение развернуто на Netlify и использует Telegram Bot API для интеграции.

## Структура проекта

```
RuWorshipRadioApp/
├── netlify/
│   └── functions/
│       └── telegram-webhook.ts    # Обработчик webhook для бота
├── public/
│   ├── index.html                 # Главная страница Web App
│   ├── app.js                     # Логика плеера и Telegram API
│   └── styles.css                 # Стили приложения
├── src/
│   └── config/
│       └── stations.ts            # Конфигурация радиостанций
├── netlify.toml                   # Конфигурация Netlify
├── package.json                   # Зависимости проекта
└── tsconfig.json                  # TypeScript конфигурация
```

## Установка

1. Клонируйте репозиторий или создайте проект
2. Установите зависимости:
   ```bash
   yarn install
   ```

3. Создайте файл `.env` на основе `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Настройте переменные окружения в `.env`:
   - `TELEGRAM_BOT_TOKEN` - токен вашего Telegram бота (получите у @BotFather)
   - `WEB_APP_URL` - URL вашего развернутого приложения на Netlify

## Настройка радиостанций

Откройте файл `public/app.js` и найдите массив `stations`. Замените примеры на ваши реальные ссылки на радиостанции:

```javascript
const stations = [
    {
        id: 'station1',
        name: 'Название радиостанции',
        streamUrl: 'https://your-radio-stream-url.com/stream.mp3',
        description: 'Описание станции'
    },
    // Добавьте больше станций...
];
```

## Локальная разработка

Запустите локальный сервер разработки:

```bash
yarn netlify:dev
```

Или:

```bash
yarn dev
```

## Сборка

Соберите проект:

```bash
yarn build
```

## Деплой на Netlify

1. Убедитесь, что у вас установлен Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. Войдите в Netlify:
   ```bash
   netlify login
   ```

3. Инициализируйте проект (если еще не сделано):
   ```bash
   netlify init
   ```

4. Установите переменные окружения в Netlify Dashboard:
   - Перейдите в Settings → Environment variables
   - Добавьте `TELEGRAM_BOT_TOKEN` и `WEB_APP_URL`

5. Деплой:
   ```bash
   yarn deploy
   ```

6. После деплоя обновите `WEB_APP_URL` в переменных окружения на реальный URL вашего приложения

7. Настройте webhook для Telegram бота:
   - URL webhook: `https://your-app.netlify.app/.netlify/functions/telegram-webhook`
   - Используйте Telegram Bot API для установки webhook:
     ```bash
     curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://your-app.netlify.app/.netlify/functions/telegram-webhook"
     ```

## Использование

1. Откройте вашего Telegram бота
2. Отправьте команду `/start`
3. Нажмите кнопку "🎵 Открыть радио"
4. Выберите радиостанцию и начните прослушивание

## Особенности

- Поддержка темной и светлой темы Telegram
- Адаптивный дизайн для мобильных устройств
- Автоматическое определение темы из Telegram
- Обработка ошибок подключения
- Простой и интуитивный интерфейс

## Технологии

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Netlify Functions (TypeScript)
- **Telegram API**: Telegram Bot API, Telegram Web App API
- **Deployment**: Netlify

## Лицензия

MIT

