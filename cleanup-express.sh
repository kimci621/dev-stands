#!/bin/bash

# Скрипт для удаления Express сервера и связанных файлов

echo "🧹 Удаление Express сервера..."

# Удаляем Express файлы
if [ -f "server/server.js" ]; then
    rm -f server/server.js
    echo "✅ Удален server/server.js"
fi

if [ -f "server/package.json" ]; then
    rm -f server/package.json
    echo "✅ Удален server/package.json"
fi

if [ -f "server/package-lock.json" ]; then
    rm -f server/package-lock.json
    echo "✅ Удален server/package-lock.json"
fi

if [ -d "server/node_modules" ]; then
    rm -rf server/node_modules
    echo "✅ Удалена папка server/node_modules"
fi

echo ""
echo "✅ Express сервер удален!"
echo "📁 Nuxt API routes остались в server/api/"
echo ""
echo "🚀 Теперь можно запускать проект командой: ./start-dev.sh" 