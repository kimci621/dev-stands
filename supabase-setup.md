# Настройка Supabase

## 1. Создание проекта

1. Зайдите на [supabase.com](https://supabase.com)
2. Создайте аккаунт или войдите
3. Создайте новый проект
4. Дождитесь завершения инициализации

## 2. Получение ключей

1. В панели проекта перейдите в **Settings** → **API**
2. Скопируйте:
   - **Project URL** (например: `https://your-project-ref.supabase.co`)
   - **Anon public key** (начинается с `eyJ...`)

## 3. Настройка переменных окружения

Создайте файл `.env` в корне проекта:

```bash
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
```

## 4. Создание таблиц

Перейдите в **SQL Editor** в панели Supabase и выполните следующий SQL:

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

-- Политики доступа (временно разрешаем всем)
CREATE POLICY "Allow all operations" ON users FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON stands FOR ALL USING (true);
```

## 5. Проверка

После выполнения SQL вы должны увидеть:

- Таблицу `users` с колонками: id, name, email, password, created_at
- Таблицу `stands` с колонками: id, name, type, status, occupied_by, occupied_at, created_at

## Готово!

Теперь можно запускать проект с Supabase интеграцией.
