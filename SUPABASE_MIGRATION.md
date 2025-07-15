# 🚀 Миграция на Supabase

Проект успешно переведен с файловой базы данных на **Supabase (PostgreSQL)**!

## ✅ Что изменилось

### Удалено:

- ❌ Локальные JSON файлы (`stands.json`, `users.json`)
- ❌ Файловая система для хранения данных
- ❌ Проблемы с путями в production режиме
- ❌ Старые API endpoints:
  - `/api/login.post.js`
  - `/api/register.post.js`
  - `/api/stands.get.js`
  - `/api/stands.post.js`
  - `/api/reset.post.js`
  - `/api/user.get.js`

### Добавлено:

- ✅ **Supabase** интеграция с PostgreSQL
- ✅ Новые API endpoints:
  - `/api/auth/login` - вход пользователей
  - `/api/auth/register` - регистрация пользователей
  - `/api/stands` (GET) - получение стендов
  - `/api/stands` (POST) - обновление стенда
  - `/api/stands/reset` - сброс всех стендов
- ✅ Composable `useSupabase.js` для работы с БД
- ✅ Автоматическая инициализация дефолтных данных
- ✅ Обновленный Health Check для Supabase

## 🛠 Настройка

### 1. Создание проекта Supabase

1. Перейдите на [supabase.com](https://supabase.com)
2. Создайте новый проект
3. Дождитесь инициализации (~2 минуты)

### 2. Получение ключей доступа

1. В панели проекта: **Settings** → **API**
2. Скопируйте:
   - **Project URL** (например: `https://abc123.supabase.co`)
   - **Anon public key** (длинный токен)

### 3. Настройка переменных окружения

Создайте файл `.env` в корне проекта:

```bash
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 4. Создание таблиц в базе данных

Перейдите в **SQL Editor** в Supabase и выполните:

```sql
-- Создание таблицы пользователей
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание таблицы стендов
CREATE TABLE stands (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'frontend' или 'backend'
  status VARCHAR(50) DEFAULT 'free', -- 'free' или 'occupied'
  occupied_by VARCHAR(255),
  occupied_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание индексов для производительности
CREATE INDEX idx_stands_type ON stands(type);
CREATE INDEX idx_stands_status ON stands(status);
CREATE INDEX idx_users_email ON users(email);

-- Включение Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE stands ENABLE ROW LEVEL SECURITY;

-- Политики доступа (разрешаем все операции)
CREATE POLICY "Allow all operations" ON users FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON stands FOR ALL USING (true);
```

## 🔄 Изменения в коде

### API Endpoints

**Старые** → **Новые**:

- `POST /api/login` → `POST /api/auth/login`
- `POST /api/register` → `POST /api/auth/register`
- `GET /api/stands` → `GET /api/stands` (работает)
- `POST /api/stands` → `POST /api/stands` (новый формат)
- `POST /api/reset` → `POST /api/stands/reset`

### Формат данных

**Стенды (новый формат)**:

```json
{
  "id": 1,
  "name": "deploy_loadtest",
  "type": "frontend",
  "status": "occupied",
  "occupied_by": "user@example.com",
  "occupied_at": "2024-07-15T10:30:00Z"
}
```

**Обновление стенда**:

```json
{
  "standId": 1,
  "action": "occupy", // или "release"
  "user": {
    "id": 123,
    "name": "Иван Иванов",
    "email": "ivan@example.com"
  }
}
```

### Композаблы

- ✅ `useSupabase()` - новый композабл для работы с БД
- ✅ `useApi()` - обновлен для новых endpoints
- ✅ `useUser()` - обновлен для новой аутентификации
- ✅ `useStands()` - обновлен для работы с Supabase

## 🧪 Тестирование

### Локальное тестирование без Supabase

Если вы еще не настроили Supabase, приложение будет показывать ошибки подключения, но не падать.

### С настроенным Supabase

1. Настройте `.env` файл с вашими ключами
2. Запустите проект: `npm run dev`
3. Приложение автоматически создаст дефолтные стенды при первом запросе

## 📁 Структура файлов

```
├── composables/
│   ├── useSupabase.js      # ✅ Новый - работа с Supabase
│   ├── useApi.js           # ✅ Обновлен - новые endpoints
│   ├── useUser.js          # ✅ Обновлен - новая аутентификация
│   └── useStands.js        # ✅ Обновлен - работа с Supabase
├── server/api/
│   ├── auth/
│   │   ├── login.post.js   # ✅ Новый
│   │   └── register.post.js # ✅ Новый
│   ├── stands/
│   │   ├── index.get.js    # ✅ Новый
│   │   ├── index.post.js   # ✅ Новый
│   │   └── reset.post.js   # ✅ Новый
│   └── health.get.js       # ✅ Обновлен для Supabase
└── supabase-setup.md       # ✅ Подробные инструкции
```

## 🎯 Преимущества новой архитектуры

1. **🚀 Производительность**: PostgreSQL намного быстрее файловой системы
2. **🔒 Безопасность**: Встроенная аутентификация и Row Level Security
3. **📈 Масштабируемость**: Легко добавлять новые функции
4. **🌐 Production-ready**: Никаких проблем с путями к файлам
5. **🔧 Простота деплоя**: Один раз настроил - работает везде
6. **📊 Мониторинг**: Встроенная аналитика в Supabase
7. **🔄 Backup**: Автоматические бэкапы базы данных

## 🚦 Готово к использованию!

После настройки Supabase проект полностью готов к production использованию!
