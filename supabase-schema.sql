-- Создание схемы базы данных для приложения Stand Owner

-- Таблица пользователей
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица стендов
CREATE TABLE IF NOT EXISTS stands (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL DEFAULT 'Обычный',
    status VARCHAR(50) NOT NULL DEFAULT 'Свободен',
    occupied_by VARCHAR(255),
    occupied_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание индексов для улучшения производительности
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_stands_status ON stands(status);
CREATE INDEX IF NOT EXISTS idx_stands_occupied_by ON stands(occupied_by);

-- Добавление политик безопасности Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE stands ENABLE ROW LEVEL SECURITY;
ALTER TABLE stands ADD COLUMN IF NOT EXISTS task_url TEXT;

-- Политики для таблицы users
CREATE POLICY "Пользователи могут читать свои данные" ON users
    FOR SELECT USING (true);

CREATE POLICY "Пользователи могут создавать свои записи" ON users
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Пользователи могут обновлять свои данные" ON users
    FOR UPDATE USING (true);

-- Политики для таблицы stands
CREATE POLICY "Все могут читать стенды" ON stands
    FOR SELECT USING (true);

CREATE POLICY "Все могут создавать стенды" ON stands
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Все могут обновлять стенды" ON stands
    FOR UPDATE USING (true);

CREATE POLICY "Все могут удалять стенды" ON stands
    FOR DELETE USING (true);

-- Вставка начальных данных для стендов
INSERT INTO stands (name, type, status) VALUES
-- FE стенды
('deploy_loadtest', 'FE', 'Свободен'),
('deploy_dev3', 'FE', 'Свободен'),
('deploy_dev', 'FE', 'Свободен'),
('deploy_dev2', 'FE', 'Свободен'),
('deploy_dev4', 'FE', 'Свободен'),
('deploy_dev5', 'FE', 'Свободен'),
('deploy_dev6', 'FE', 'Свободен'),
('deploy_dev7', 'FE', 'Свободен'),
('deploy_aws_dev', 'FE', 'Свободен'),

-- BE стенды
('deploy_loadtest', 'BE', 'Свободен'),
('deploy_dev3', 'BE', 'Свободен'),
('deploy_dev', 'BE', 'Свободен'),
('deploy_dev2', 'BE', 'Свободен'),
('deploy_dev4', 'BE', 'Свободен'),
('deploy_dev5', 'BE', 'Свободен'),
('deploy_dev6', 'BE', 'Свободен'),
('deploy_dev7', 'BE', 'Свободен'),
('deploy_aws_dev', 'BE', 'Свободен')
ON CONFLICT DO NOTHING;

-- Создание тестового пользователя
INSERT INTO users (name, email, password) VALUES
('Тестовый пользователь', 'test@example.com', 'password123')
ON CONFLICT (email) DO NOTHING; 