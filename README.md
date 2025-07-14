# 🏗️ Управление стендами разработки

Минималистичное веб-приложение для управления стендами разработки на Vue 3 + Nuxt 3 с использованием Composition API.

## 🚀 Особенности

- **Vue 3 + Nuxt 3** с Composition API
- **PrimeVue** - компоненты UI
- **Tailwind CSS** - стилизация
- **Express.js** - простейший бэкенд
- **Автосброс в полночь** - автоматическое освобождение стендов
- **Realtime синхронизация** - polling каждые 3 секунды
- **Минималистичный дизайн** - KISS принцип

## 📦 Технический стек

### Frontend

- **Framework**: Nuxt 3
- **Vue**: Vue 3 с Composition API
- **UI Library**: PrimeVue 4
- **Стили**: Tailwind CSS
- **TypeScript**: Поддержка TypeScript

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js
- **Данные**: In-memory хранение
- **CORS**: Поддержка cross-origin запросов

## 🏁 Быстрый старт

### 1. Установка зависимостей

```bash
# Установить зависимости фронтенда
npm install

# Установить зависимости сервера
cd server
npm install
cd ..
```

### 2. Запуск сервера

```bash
# В первом терминале - запуск Express сервера
npm run server
```

Сервер будет доступен по адресу: `http://localhost:3001`

### 3. Запуск фронтенда

```bash
# Во втором терминале - запуск Nuxt приложения
npm run dev
```

Приложение будет доступно по адресу: `http://localhost:3000`

## 📁 Структура проекта

```
/
├── server/                  # Express сервер
│   ├── server.js           # Основной файл сервера
│   └── package.json        # Зависимости сервера
├── components/             # Vue компоненты
│   ├── UserProfile.vue     # Профиль пользователя
│   ├── StandGroup.vue      # Группа стендов
│   ├── StandCard.vue       # Карточка стенда
│   └── AutoReleaseTimer.vue # Таймер автосброса
├── composables/            # Композаблы
│   ├── useUser.js          # Управление пользователем
│   ├── useStands.js        # Управление стендами
│   └── useApi.js           # API запросы
├── pages/                  # Страницы
│   └── index.vue           # Главная страница
├── nuxt.config.ts          # Конфигурация Nuxt
├── tailwind.config.js      # Конфигурация Tailwind
└── package.json            # Зависимости проекта
```

## 🎯 Функциональность

### Управление пользователем

- ✅ Ввод и изменение имени пользователя
- ✅ Сохранение в localStorage
- ✅ Валидация имени

### Управление стендами

- ✅ Занятие свободных стендов
- ✅ Освобождение занятых стендов
- ✅ Проверка прав доступа
- ✅ Отображение времени занятия

### Синхронизация

- ✅ Автоматическое обновление каждые 3 секунды
- ✅ Обработка конфликтов
- ✅ Toast уведомления

### Автосброс

- ✅ Автоматический сброс в полночь
- ✅ Таймер до следующего сброса
- ✅ Принудительный сброс

## 🎨 Дизайн

### Цветовая схема

- **Свободные стенды**: Зеленый (#22c55e)
- **Занятые стенды**: Красный (#ef4444)
- **Фон карточек**: Светло-серый (#f3f4f6)

### Адаптивность

- ✅ Поддержка мобильных устройств
- ✅ Адаптивная сетка стендов
- ✅ Оптимизированная типографика

## 🔧 Конфигурация

### Настройки сервера (server/server.js)

```javascript
const PORT = process.env.PORT || 3001; // Порт сервера
const POLLING_INTERVAL = 3000; // Интервал синхронизации (мс)
```

### Настройки фронтенда

```javascript
// composables/useStands.js
const POLLING_INTERVAL = 3000; // Интервал обновления (мс)

// composables/useApi.js
const baseUrl = "http://localhost:3001/api"; // URL API
```

## 🐛 Отладка

### Проверка работы сервера

```bash
curl http://localhost:3001/api/health
```

### Просмотр логов сервера

Логи выводятся в консоль при запуске сервера.

### Просмотр состояния в браузере

Откройте DevTools → Console для просмотра логов фронтенда.

## 📚 API Endpoints

### GET /api/stands

Получить все стенды

```json
{
  "stands": {
    "frontend": [...],
    "backend": [...]
  },
  "lastReset": 1234567890,
  "timestamp": 1234567890
}
```

### POST /api/stands

Обновить стенды

```json
{
  "stands": {
    "frontend": [...],
    "backend": [...]
  }
}
```

### POST /api/reset

Сбросить все стенды

```json
{
  "stands": {...},
  "lastReset": 1234567890,
  "message": "Все стенды успешно сброшены"
}
```

### GET /api/health

Проверка работоспособности

```json
{
  "status": "OK",
  "timestamp": 1234567890,
  "uptime": 123.45
}
```

## 🚀 Продакшн

### Сборка для продакшна

```bash
npm run build
npm run preview
```

### Docker (опционально)

```dockerfile
# Пример Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 Вклад в проект

1. Форкните репозиторий
2. Создайте ветку с новой функцией (`git checkout -b feature/new-feature`)
3. Зафиксируйте изменения (`git commit -am 'Add new feature'`)
4. Отправьте ветку (`git push origin feature/new-feature`)
5. Создайте Pull Request

## 📄 Лицензия

MIT License - см. файл [LICENSE](LICENSE) для деталей.

## 🎯 Планы развития

- [ ] Добавление ролей пользователей (admin/user)
- [ ] Интеграция с базой данных
- [ ] WebSocket для realtime обновлений
- [ ] Уведомления в браузере
- [ ] История использования стендов
- [ ] Темная тема
- [ ] Экспорт статистики

---

**Версия**: 1.0.0  
**Автор**: Stand Manager Team  
**Поддержка**: [GitHub Issues](https://github.com/yourname/stand-manager/issues)
