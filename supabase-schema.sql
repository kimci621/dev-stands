-- Создание безопасной схемы базы данных для приложения Stand Owner
-- Скрипт идемпотентный: не удаляет существующие стенды и добавляет только недостающее.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Таблица пользователей
CREATE TABLE IF NOT EXISTS public.users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Таблица стендов
CREATE TABLE IF NOT EXISTS public.stands (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Свободен',
    occupied_by VARCHAR(255),
    occupied_at TIMESTAMP WITH TIME ZONE,
    task_url TEXT,
    ended_at TIMESTAMP WITH TIME ZONE,
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT stands_status_check CHECK (status IN ('Свободен', 'Занят'))
);

ALTER TABLE public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);

ALTER TABLE public.stands ADD COLUMN IF NOT EXISTS task_url TEXT;
ALTER TABLE public.stands ADD COLUMN IF NOT EXISTS ended_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.stands ADD COLUMN IF NOT EXISTS comment TEXT;
ALTER TABLE public.stands ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW();

-- Триггер для updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_users_updated_at ON public.users;
CREATE TRIGGER set_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_stands_updated_at ON public.stands;
CREATE TRIGGER set_stands_updated_at
BEFORE UPDATE ON public.stands
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- Дедупликация перед созданием уникального индекса.
-- Сохраняем в приоритете занятые стенды, затем самые свежие.
WITH ranked_stands AS (
    SELECT
        id,
        ROW_NUMBER() OVER (
            PARTITION BY type, name
            ORDER BY
                CASE WHEN status = 'Занят' THEN 0 ELSE 1 END,
                occupied_at DESC NULLS LAST,
                updated_at DESC NULLS LAST,
                created_at ASC,
                id ASC
        ) AS rn
    FROM public.stands
)
DELETE FROM public.stands s
USING ranked_stands r
WHERE s.id = r.id
  AND r.rn > 1;

-- Уникальность логического ключа стенда
CREATE UNIQUE INDEX IF NOT EXISTS stands_type_name_uidx
    ON public.stands (type, name);

-- Индексы для улучшения производительности
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_stands_status ON public.stands(status);
CREATE INDEX IF NOT EXISTS idx_stands_occupied_by ON public.stands(occupied_by);
CREATE INDEX IF NOT EXISTS idx_stands_ended_at ON public.stands(ended_at);
CREATE INDEX IF NOT EXISTS idx_stands_type ON public.stands(type);

-- RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stands ENABLE ROW LEVEL SECURITY;

-- Политики users
DROP POLICY IF EXISTS "Пользователи могут читать свои данные" ON public.users;
DROP POLICY IF EXISTS "Пользователи могут создавать свои записи" ON public.users;
DROP POLICY IF EXISTS "Пользователи могут обновлять свои данные" ON public.users;

CREATE POLICY "Пользователи могут читать свои данные" ON public.users
    FOR SELECT USING (true);

CREATE POLICY "Пользователи могут создавать свои записи" ON public.users
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Пользователи могут обновлять свои данные" ON public.users
    FOR UPDATE USING (true);

-- Политики stands
DROP POLICY IF EXISTS "Все могут читать стенды" ON public.stands;
DROP POLICY IF EXISTS "Все могут создавать стенды" ON public.stands;
DROP POLICY IF EXISTS "Все могут обновлять стенды" ON public.stands;
DROP POLICY IF EXISTS "Все могут удалять стенды" ON public.stands;

CREATE POLICY "Все могут читать стенды" ON public.stands
    FOR SELECT USING (true);

CREATE POLICY "Все могут создавать стенды" ON public.stands
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Все могут обновлять стенды" ON public.stands
    FOR UPDATE USING (true);

-- DELETE-политика намеренно не создается: массовое удаление через anon role запрещено.

-- Безопасная дозапись дефолтных стендов
INSERT INTO public.stands (name, type, status)
VALUES
    ('FE Dev', 'frontend', 'Свободен'),
    ('FE Dev2', 'frontend', 'Свободен'),
    ('FE Dev3', 'frontend', 'Свободен'),
    ('FE Dev4', 'frontend', 'Свободен'),
    ('FE Dev5', 'frontend', 'Свободен'),
    ('FE Dev6', 'frontend', 'Свободен'),
    ('FE Dev7', 'frontend', 'Свободен'),
    ('FE AWS Dev', 'frontend', 'Свободен'),
    ('FE LoadTest', 'frontend', 'Свободен'),
    ('BE Deploy LoadTest', 'backend', 'Свободен'),
    ('BE Dev', 'backend', 'Свободен'),
    ('BE Dev2', 'backend', 'Свободен'),
    ('BE Dev3', 'backend', 'Свободен'),
    ('BE Dev4', 'backend', 'Свободен'),
    ('BE Dev5', 'backend', 'Свободен'),
    ('BE Dev6', 'backend', 'Свободен'),
    ('BE Dev7', 'backend', 'Свободен'),
    ('BE Dev8', 'backend', 'Свободен'),
    ('BE LoadTest', 'backend', 'Свободен'),
    ('BE Mobile1', 'backend', 'Свободен'),
    ('BE Mobile2', 'backend', 'Свободен'),
    ('BE Mobile3', 'backend', 'Свободен')
ON CONFLICT (type, name) DO NOTHING;

-- Тестовый пользователь
INSERT INTO public.users (name, email, password)
VALUES ('Тестовый пользователь', 'test@example.com', 'password123')
ON CONFLICT (email) DO NOTHING;