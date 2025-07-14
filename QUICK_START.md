# 🚀 Быстрый запуск

## Автоматическая установка и запуск

```bash
# 1. Установка зависимостей
./setup.sh

# 2. Запуск в режиме разработки
./start-dev.sh
```

## Ручная установка и запуск

```bash
# 1. Установка зависимостей фронтенда
npm install

# 2. Установка зависимостей сервера
cd server
npm install
cd ..

# 3. Запуск сервера (в первом терминале)
npm run server

# 4. Запуск фронтенда (во втором терминале)
npm run dev
```

## Адреса

- **Фронтенд**: http://localhost:3000
- **API сервер**: http://localhost:3001

## Проверка работоспособности

```bash
# Проверка API
curl http://localhost:3001/api/health

# Ожидаемый ответ:
# {"status":"OK","timestamp":...,"uptime":...}
```

## Возможные проблемы

### Порт уже занят

```bash
# Найти процесс на порту 3000 или 3001
lsof -ti:3000
lsof -ti:3001

# Завершить процесс
kill -9 <PID>
```

### Ошибки зависимостей

```bash
# Очистка кэша npm
npm cache clean --force

# Переустановка зависимостей
rm -rf node_modules package-lock.json
npm install

# То же для сервера
cd server
rm -rf node_modules package-lock.json
npm install
```

### Проблемы с правами на macOS

```bash
# Если скрипты не запускаются
chmod +x setup.sh start-dev.sh
```

---

📖 Полная документация в [README.md](README.md)
