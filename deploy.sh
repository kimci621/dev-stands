#!/bin/bash

# Скрипт для автоматического развертывания на GitHub

echo "🚀 Подготовка к развертыванию..."

# Проверка что мы находимся в git репозитории
if [ ! -d ".git" ]; then
    echo "📦 Инициализация Git репозитория..."
    git init
    echo "✅ Git репозиторий инициализирован"
else
    echo "✅ Git репозиторий уже существует"
fi

# Добавление всех файлов
echo "📁 Добавление файлов в Git..."
git add .

# Создание коммита
echo "💾 Создание коммита..."
if git diff --cached --quiet; then
    echo "⚠️  Нет изменений для коммита"
else
    git commit -m "feat: добавлена система управления стендами

- Vue 3 + Nuxt 3 с Composition API
- PrimeVue UI компоненты
- Express.js API сервер
- Автосброс стендов в полночь
- Realtime синхронизация
- Минималистичный дизайн
- Готовность к развертыванию на Vercel"
    echo "✅ Коммит создан"
fi

# Запрос URL репозитория
echo ""
echo "🔗 Для публикации необходимо создать репозиторий на GitHub:"
echo "   1. Перейдите на https://github.com/new"
echo "   2. Укажите название: stand-manager"
echo "   3. Выберите Public"
echo "   4. НЕ инициализируйте с README, .gitignore или лицензией"
echo "   5. Нажмите 'Create repository'"
echo ""

read -p "Введите URL вашего GitHub репозитория (например: https://github.com/username/stand-manager.git): " REPO_URL

if [ -z "$REPO_URL" ]; then
    echo "❌ URL репозитория не указан. Завершение."
    exit 1
fi

# Добавление remote origin
echo "🔗 Подключение к GitHub репозиторию..."
git remote remove origin 2>/dev/null || true
git remote add origin "$REPO_URL"

# Переименование ветки в main
git branch -M main

# Отправка на GitHub
echo "📤 Отправка на GitHub..."
if git push -u origin main; then
    echo "✅ Код успешно отправлен на GitHub!"
    echo ""
    echo "🎉 Готово! Ваш код опубликован на GitHub"
    echo ""
    echo "🚀 Следующие шаги для развертывания:"
    echo ""
    echo "📋 VERCEL (Рекомендуется - проще всего):"
    echo "   1. Перейдите на https://vercel.com"
    echo "   2. Войдите через GitHub"
    echo "   3. Нажмите 'New Project'"
    echo "   4. Выберите репозиторий 'stand-manager'"
    echo "   5. Нажмите 'Deploy'"
    echo "   6. Ждите 2-3 минуты"
    echo "   7. Получите ссылку на приложение!"
    echo ""
    echo "🚂 RAILWAY (Альтернатива):"
    echo "   1. Перейдите на https://railway.app" 
    echo "   2. Войдите через GitHub"
    echo "   3. Нажмите 'New Project' → 'Deploy from GitHub repo'"
    echo "   4. Выберите репозиторий"
    echo "   5. Ждите развертывания"
    echo ""
    echo "📖 Подробные инструкции в файле DEPLOYMENT.md"
    echo ""
    echo "🌐 Ваш репозиторий: $REPO_URL"
else
    echo "❌ Ошибка при отправке на GitHub"
    echo "Проверьте:"
    echo "  - Правильность URL репозитория"
    echo "  - Права доступа к репозиторию"
    echo "  - Подключение к интернету"
    exit 1
fi 